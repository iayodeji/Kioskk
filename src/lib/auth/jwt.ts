import "server-only";

import jwt from "jsonwebtoken";

import { getServerEnv } from "@/lib/env";

export type OwnerTokenClaims = {
  businessId: string;
  slug: string;
};

export function signOwnerToken(claims: OwnerTokenClaims): string {
  const { jwtSecret } = getServerEnv();
  return jwt.sign(claims, jwtSecret, { expiresIn: "7d" });
}

export function verifyOwnerToken(token: string): OwnerTokenClaims {
  const { jwtSecret } = getServerEnv();
  const payload = jwt.verify(token, jwtSecret);
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid token payload.");
  }

  const businessId = (payload as { businessId?: unknown }).businessId;
  const slug = (payload as { slug?: unknown }).slug;
  if (typeof businessId !== "string" || typeof slug !== "string") {
    throw new Error("Invalid token claims.");
  }

  return { businessId, slug };
}

