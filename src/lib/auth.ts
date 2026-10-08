import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { requiredEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
const COOKIE_NAME = "crison_admin_session";
const sessionHash = (id: string) => createHash("sha256").update(id).digest("hex");
function secretKey() {
  const secret = requiredEnv("AUTH_SECRET");
  if (secret.length < 32) throw new Error("Invalid secret");
  return new TextEncoder().encode(secret);
}
export async function createAdminSession(admin: { id: string; sessionVersion: number }) {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 28800000);
  const token = await new SignJWT({ role: "admin", version: admin.sessionVersion }).setSubject(admin.id).setJti(id).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(Math.floor(expiresAt.getTime() / 1000)).sign(secretKey());
  await prisma.$transaction(async tx => {
    await tx.adminSession.deleteMany({ where: { expiresAt: { lte: new Date() } } });
    await tx.adminSession.create({ data: { id: sessionHash(id), adminId: admin.id, expiresAt } });
  });
  (await cookies()).set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 28800 });
}
export async function destroyAdminSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    let id: string | undefined;
    try { id = (await jwtVerify(token, secretKey(), { algorithms: ["HS256"] })).payload.jti; } catch { /* Invalid cookies cannot authorize a session. */ }
    if (id) await prisma.adminSession.deleteMany({ where: { id: sessionHash(id) } });
  }
  store.delete(COOKIE_NAME);
}
export async function verifyAdminToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"], requiredClaims: ["sub", "jti", "iat", "exp"], maxTokenAge: "8h" });
    if (payload.role !== "admin" || !payload.sub || !payload.jti || typeof payload.version !== "number") return null;
    const session = await prisma.adminSession.findUnique({ where: { id: sessionHash(payload.jti) }, select: { adminId: true, expiresAt: true } });
    if (!session || session.adminId !== payload.sub || session.expiresAt <= new Date()) return null;
    const admin = await prisma.admin.findUnique({ where: { id: payload.sub }, select: { id: true, name: true, email: true, sessionVersion: true } });
    return admin?.sessionVersion === payload.version ? admin : null;
  } catch { return null; }
}
export async function isAdminAuthenticated() { return !!(await getAdminSession()); }
export async function getAdminSession() { return verifyAdminToken((await cookies()).get(COOKIE_NAME)?.value); }
