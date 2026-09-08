import { listPublishedVideos } from "../../database/videos.js";
import { drivePlaybackUrl, drivePreviewUrl } from "../../google-drive.js";

import { withErrorHandling } from "../../errors.js";

export default { fetch: withErrorHandling(async (request) => {
  if (request.method !== "GET") return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "GET" } });
  const videos = await listPublishedVideos();
  // Drive-backed records are playable even if they were created by an earlier
  // completion version that did not populate video_url.
  const publicVideos = videos.map((video) => ({
    ...video,
    videoUrl: video.googleDriveFileId
      ? drivePlaybackUrl(video.googleDriveFileId)
      : video.videoUrl,
    // Google Drive's download endpoint is not a dependable <video> source.
    // Send its preview-player URL separately so the client can use the
    // provider-supported embedded player for Drive-backed uploads.
    videoEmbedUrl: video.googleDriveFileId
      ? drivePreviewUrl(video.googleDriveFileId)
      : null,
  }));
  return Response.json(publicVideos, { headers: { "Cache-Control": "public, max-age=0, s-maxage=10, stale-while-revalidate=30" } });
}) };
