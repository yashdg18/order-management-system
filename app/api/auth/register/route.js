import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { validateRegister } from "@/lib/validators";
import { created, withErrorHandling, ApiError } from "@/lib/apiResponse";
import { toPublicUser, issueTokens, REFRESH_COOKIE_OPTIONS } from "@/lib/authHelpers";
import { rateLimit } from "@/lib/rateLimit";

async function handler(request) {
  rateLimit(request);
  await connectDB();
  const body = await request.json();
  const input = validateRegister(body);

  const existing = await User.findOne({ email: input.email });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const user = await User.create(input);
  const { accessToken, refreshToken } = issueTokens(user);

  const response = created("Account created successfully", { user: toPublicUser(user), accessToken });
  response.cookies.set("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  return response;
}

export const POST = withErrorHandling(handler);
