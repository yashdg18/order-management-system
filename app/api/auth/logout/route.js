import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getAuthUser } from "@/lib/requireAuth";
import { ok, withErrorHandling } from "@/lib/apiResponse";

async function handler(request) {
  await connectDB();
  const authUser = getAuthUser(request);
  // Bumping refreshTokenVersion instantly invalidates any outstanding
  // refresh token for this user, not just the cookie on this device.
  await User.findByIdAndUpdate(authUser.userId, { $inc: { refreshTokenVersion: 1 } });

  const response = ok("Logged out successfully", null);
  response.cookies.set("refreshToken", "", { path: "/", maxAge: 0 });
  return response;
}

export const POST = withErrorHandling(handler);
