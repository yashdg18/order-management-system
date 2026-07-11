import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { validateLogin } from "@/lib/validators";
import { ok, withErrorHandling, ApiError } from "@/lib/apiResponse";
import { toPublicUser, issueTokens, REFRESH_COOKIE_OPTIONS } from "@/lib/authHelpers";
import { rateLimit } from "@/lib/rateLimit";

async function handler(request) {
  rateLimit(request);
  await connectDB();
  const body = await request.json();
  const input = validateLogin(body);

  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  const { accessToken, refreshToken } = issueTokens(user);

  const response = ok("Logged in successfully", { user: toPublicUser(user), accessToken });
  response.cookies.set("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  return response;
}

export const POST = withErrorHandling(handler);
