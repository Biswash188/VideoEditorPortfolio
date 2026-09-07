# Google Drive portfolio video setup

## Architecture

The video payload does **not** travel through Vercel:

```text
Admin browser -> Vercel /api/videos/upload-session (metadata only)
Admin browser -> Google Drive resumable URL (8 MiB video chunks)
Admin browser -> Vercel /api/videos/complete (file ID only)
```

This avoids Vercel's normal serverless request-body limit. Vercel handles only authentication, a Drive upload-session request, and database metadata.

## Node runtime

This project is pinned to Node 22 LTS through `package.json` and `.nvmrc`. Use Node 22 locally before running `vercel dev`. In the Vercel dashboard, set **Project Settings → General → Node.js Version** to 22.x, then run `vercel pull` if you use its local project settings. This avoids a Windows Node 24/libuv shutdown race seen around native `fetch()` calls in local dev workers.

## Google Cloud

1. Create or select a Google Cloud project and enable the **Google Drive API**.
2. Configure the OAuth consent screen. Add the Google account that owns the portfolio Drive folder as a test user while the app is in testing.
3. Create an OAuth 2.0 **Web application** client. Add a temporary redirect URI you control (for example the OAuth Playground callback) solely to obtain a refresh token.
4. Obtain an offline refresh token with the `https://www.googleapis.com/auth/drive` scope. The server exchanges this refresh token for short-lived access tokens; neither token reaches the browser.
5. Create a dedicated Google Drive folder and copy its ID from its URL. The account associated with the refresh token must own or have editor access to it.
6. Add these server-only variables locally in `.env.local` and in Vercel Project Settings → Environment Variables:

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_DRIVE_FOLDER_ID=
MAX_VIDEO_SIZE_BYTES=5368709120
```

`MAX_VIDEO_SIZE_BYTES` is optional and defaults to 5 GiB. Also configure the existing `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and `AUTH_SECRET` variables.

7. Apply the Drizzle migration with `npm run db:migrate`, then run `npm run dev` (or deploy to Vercel).
8. Log in at `/admin`, upload a small MP4, and confirm it appears in the Drive folder and at `/portfolio`. Then verify edit and delete.

## Access and security

On successful completion, the server grants each portfolio file `anyone` / `reader` with discovery disabled. This is the minimum permission needed for a public portfolio video, but it means anyone with the resulting link can view it. Do not upload confidential footage. The Drive folder itself is not made writable or public.

The resumable session URL is a short-lived upload capability returned only after the existing server-side administrator cookie is verified. It is not stored in the database. The completion endpoint also requires a one-time random completion token, the same admin identity, and server-side verification of Drive file MIME type and size.

## Troubleshooting and limits

- `GOOGLE_AUTH_FAILED`: recreate the refresh token, ensure Drive API is enabled, and check the OAuth client credentials.
- `GOOGLE_UPLOAD_SESSION_FAILED`: verify the folder ID and that the OAuth account can add files to it.
- `GOOGLE_PERMISSION_FAILED`: the account or Shared Drive policy does not allow public reader permissions.
- Browser uploads use 8 MiB `File.slice()` chunks, so the full video is never read into browser memory. Individual network failures retry with exponential backoff; Google `308 Resume Incomplete` responses advance only to the acknowledged byte.
- Refreshing closes the selected `File` handle in most browsers, so a refreshed upload needs a newly selected file and session. A completed Drive upload whose final database call fails is not published; the UI error preserves the failure reason, and the Drive file can be located in the dedicated folder for manual recovery. A future admin retry should use the same completion token only while that browser session remains open.
- Google Drive quotas, browser/network duration, Drive file playback behavior, and OAuth-token revocation remain external constraints. Test a file larger than 4.5 MB after deployment to confirm the Vercel bypass in your environment.
