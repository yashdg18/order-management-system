import { signAccessToken, signRefreshToken } from "./auth";

export function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    storeId: user.storeId,
    createdAt: user.createdAt,
  };
}

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};

export function issueTokens(user) {
  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
    storeId: user.storeId?.toString() || null,
  });
  const refreshToken = signRefreshToken({ userId: user.id, version: user.refreshTokenVersion });
  return { accessToken, refreshToken };
}
