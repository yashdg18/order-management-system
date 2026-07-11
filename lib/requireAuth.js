import { verifyAccessToken } from "./auth.js";
import { ApiError } from "./apiResponse.js";

/**
 * Reads the access token from the Authorization header (preferred) or the
 * accessToken cookie, verifies it, and returns { userId, role, storeId }.
 * Throws ApiError(401) if missing/invalid.
 */
export function getAuthUser(request) {
  const header = request.headers.get("authorization");
  const tokenFromHeader = header && header.startsWith("Bearer ") ? header.slice(7) : null;
  const token = tokenFromHeader || request.cookies.get("accessToken")?.value;

  if (!token) {
    throw new ApiError(401, "Authentication required. No token provided.");
  }

  try {
    const payload = verifyAccessToken(token);
    return { userId: payload.userId, role: payload.role, storeId: payload.storeId || null };
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
}

/**
 * Same as getAuthUser, but also enforces that the user's role is one of
 * `allowedRoles` (skip the check by passing an empty array).
 */
export function requireRole(request, allowedRoles = []) {
  const user = getAuthUser(request);
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }
  return user;
}
