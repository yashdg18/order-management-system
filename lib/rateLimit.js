import { ApiError } from "./apiResponse";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 30;

// In-memory per-process store. Fine for a single-instance deployment; for
// multi-instance production deployments this would need a shared store
// (e.g. MongoDB itself, since that's the only extra service in this stack).
const hits = new Map();

function getClientKey(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export function rateLimit(request, bucket = "auth") {
  const key = `${bucket}:${getClientKey(request)}`;
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(key, { windowStart: now, count: 1 });
    return;
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    throw new ApiError(429, "Too many attempts. Please try again in a few minutes.");
  }
}
