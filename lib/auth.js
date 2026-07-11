import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

function secrets() {
  return {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  };
}

export function signAccessToken(payload) {
  const s = secrets();
  return jwt.sign(payload, s.accessSecret, { expiresIn: s.accessExpiresIn });
}

export function signRefreshToken(payload) {
  const s = secrets();
  return jwt.sign(payload, s.refreshSecret, { expiresIn: s.refreshExpiresIn });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, secrets().accessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, secrets().refreshSecret);
}

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
