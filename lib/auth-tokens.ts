import { randomBytes } from "crypto";

export function createOpaqueToken() {
  return randomBytes(32).toString("hex");
}

export function getTokenExpiresAt(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
