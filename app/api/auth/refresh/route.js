import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyRefreshToken } from "@/lib/auth";
import { ok, withErrorHandling, ApiError } from "@/lib/apiResponse";
import { toPublicUser, issueTokens, REFRESH_COOKIE_OPTIONS } from "@/lib/authHelpers";
import { rateLimit } from "@/lib/rateLimit";

/**
 * Refresh token ROTATION: every call verifies the token's embedded version
 * against the user's current refreshTokenVersion, then bumps the version
 * and issues a brand new access + refresh token pair. Each refresh token
 * is therefore single-use — replaying an old one after rotation fails the
 * version check.
 */
async function handler(request) {
  rateLimit(request, "refresh");
  await connectDB();
  const token = request.cookies.get("refreshToken")?.value;
  if (!token) throw new ApiError(401, "No refresh token provided");

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(payload.userId);
  if (!user) throw new ApiError(401, "User no longer exists");

  if (payload.version !== user.refreshTokenVersion) {
    throw new ApiError(401, "Refresh token has already been used or was revoked. Please log in again.");
  }

  user.refreshTokenVersion += 1;
  await user.save();

  const { accessToken, refreshToken } = issueTokens(user);

  const response = ok("Token refreshed", { user: toPublicUser(user), accessToken });
  response.cookies.set("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  return response;
}

export const POST = withErrorHandling(handler);
