  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Video uploads (Vercel Blob)

  Videos are uploaded directly from an authenticated administrator browser to Vercel Blob using a short-lived, path- and type-constrained client token. The Vercel Function only issues that client token and receives Vercel's verified completion callback; it never receives the video bytes. The callback writes the resulting Blob URL and project metadata to Postgres.

  The upload utility is available at `src/app/lib/video-upload.ts` for a future protected admin interface. It is intentionally not wired into the public portfolio yet. MP4 (H.264/AAC) and WebM are the recommended playback formats. MOV is accepted by Blob, but browser playback depends on its codecs.

  Required server-only environment variables are documented in `.env.example`:

  - `BLOB_READ_WRITE_TOKEN` — added by Vercel when a Blob store is connected. Never expose it with a `VITE_` prefix.
  - `DATABASE_URL` — Neon/Postgres connection string used by the completion callback.
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and `AUTH_SECRET` — configure the owner-only session login. See the Admin authentication section below.

  To connect Blob: in Vercel, open the project’s **Storage** tab, create a **Blob** store with **Public** access (portfolio videos need browser playback), and connect it to the Production and Preview environments. Vercel creates `BLOB_READ_WRITE_TOKEN`; pull it locally with `vercel env pull` or set it in `.env.local`. For local callback testing, run a public HTTPS tunnel and set `VERCEL_BLOB_CALLBACK_URL` to that tunnel URL. Apply database migrations before testing uploads.

  ## Admin authentication

  `/admin` checks the server session and redirects to `/admin/login` when signed out. Login verifies `ADMIN_EMAIL` and the scrypt value in `ADMIN_PASSWORD_HASH`, then creates a signed 12-hour `HttpOnly`, `SameSite=Strict` session cookie (`Secure` in production). All admin API endpoints and Blob upload-token issuance call the same server-side guard and return `401` without that cookie.

  Create the password hash locally with Node’s built-in crypto (use a 12+ character password):

  ```powershell
  node scripts/generate-admin-password-hash.mjs
  ```

  Put the printed value in `ADMIN_PASSWORD_HASH`, set `ADMIN_EMAIL` to your owner email, and generate a unique 32+ character `AUTH_SECRET`. Do not put any of these values in `VITE_` variables or React code.
  
