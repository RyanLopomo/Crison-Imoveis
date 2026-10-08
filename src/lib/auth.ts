import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { requiredEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
const COOKIE_NAME = "crison_admin_session";
function secretKey() {
  const secret = requiredEnv("AUTH_SECRET");
  if (secret.length < 32) throw new Error("Invalid secret");
  return new TextEncoder().encode(secret);
}
export async function createAdminSession(admin: { id: string; sessionVersion: number }) {
  const token = await new SignJWT({ role: "admin", version: admin.sessionVersion }).setSubject(admin.id).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(secretKey());
  (await cookies()).set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 28800 });
}
export async function destroyAdminSession() { (await cookies()).delete(COOKIE_NAME); }
export async function getAdminSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (payload.role !== "admin" || !payload.sub || typeof payload.version !== "number") return null;
    const admin = await prisma.admin.findUnique({ where: { id: payload.sub }, select: { id: true, name: true, email: true, sessionVersion: true } });
    return admin?.sessionVersion === payload.version ? admin : null;
  } catch { return null; }
}
export async function isAdminAuthenticated() { return !!(await getAdminSession()); }
