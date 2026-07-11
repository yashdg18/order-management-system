import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getAuthUser } from "@/lib/requireAuth";
import { ok, withErrorHandling, ApiError } from "@/lib/apiResponse";
import { toPublicUser } from "@/lib/authHelpers";

async function handler(request) {
  await connectDB();
  const authUser = getAuthUser(request);
  const user = await User.findById(authUser.userId);
  if (!user) throw new ApiError(404, "User not found");
  return ok("Current user fetched", toPublicUser(user));
}

export const GET = withErrorHandling(handler);
