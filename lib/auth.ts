import { randomBytes } from "crypto";
import type { NextResponse } from "next/server";

export const SESSION_COOKIE = "mathweb_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function createSessionToken() {
  return randomBytes(32).toString("hex");
}

export function getSessionExpiresAt() {
  return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
}

export function setSessionCookie(
  response: NextResponse,
  token: string,
  expires: Date,
) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}
