import health from "../src/server/api/health.js";
import analytics from "../src/server/api/admin/analytics.js";
import contactRequestById from "../src/server/api/admin/contact-requests/[id].js";
import adminContactRequests from "../src/server/api/admin/contact-requests/index.js";
import videoById from "../src/server/api/admin/videos/[id].js";
import adminVideos from "../src/server/api/admin/videos/index.js";
import login from "../src/server/api/auth/login.js";
import logout from "../src/server/api/auth/logout.js";
import session from "../src/server/api/auth/session.js";
import contactRequests from "../src/server/api/contact-requests/index.js";
import completeVideoUpload from "../src/server/api/videos/complete.js";
import publicVideos from "../src/server/api/videos/index.js";
import uploadSession from "../src/server/api/videos/upload-session.js";
import thumbnailUpload from "../src/server/api/videos/upload.js";

type ApiHandler = { fetch: (request: Request) => Response | Promise<Response> };

const exactRoutes: Record<string, ApiHandler> = {
  health,
  "admin/analytics": analytics,
  "admin/contact-requests": adminContactRequests,
  "admin/videos": adminVideos,
  "auth/login": login,
  "auth/logout": logout,
  "auth/session": session,
  "contact-requests": contactRequests,
  "videos": publicVideos,
  "videos/complete": completeVideoUpload,
  "videos/upload": thumbnailUpload,
  "videos/upload-session": uploadSession,
};

/**
 * This single catch-all function keeps the public API URLs unchanged while
 * avoiding one Vercel Function per endpoint on plans with a function cap.
 */
export default {
  async fetch(request: Request): Promise<Response> {
    const path = new URL(request.url).pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
    const handler = exactRoutes[path]
      ?? (/^admin\/videos\/[^/]+$/.test(path) ? videoById : undefined)
      ?? (/^admin\/contact-requests\/[^/]+$/.test(path) ? contactRequestById : undefined);

    return handler
      ? handler.fetch(request)
      : Response.json(
        { error: { code: "NOT_FOUND", message: "API endpoint not found." } },
        { status: 404 },
      );
  },
};
