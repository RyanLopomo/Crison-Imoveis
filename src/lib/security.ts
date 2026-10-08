import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export class PublicError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function assertSameOrigin(request: Request) {
  let valid = false;
  try {
    const expected = new URL(request.url);
    const origin = new URL(request.headers.get("origin") || "");
    // NextURL canonicalizes loopback addresses to localhost.
    const host = (url: URL) => ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ? "localhost" : url.hostname;
    valid = !origin.username && !origin.password && origin.pathname === "/" && !origin.search && !origin.hash && origin.protocol === expected.protocol && origin.port === expected.port && host(origin) === host(expected);
  } catch { /* Missing and malformed origins are rejected. */ }
  if (!valid || request.headers.get("sec-fetch-site") === "cross-site") throw new PublicError("Requisição inválida.", 403);
}
export async function boundedBody(request: Request, maximum: number) {
  const length = request.headers.get("content-length");
  if (length && Number(length) > maximum) throw new PublicError("Dados muito grandes.", 413);
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) { await reader.cancel(); throw new PublicError("Dados muito grandes.", 413); }
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  } finally { reader.releaseLock(); }
}
export async function jsonBody(request: Request, maximum = 4096): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new PublicError("Dados inválidos.", 400);
  const raw = await boundedBody(request, maximum);
  try { return JSON.parse(raw.toString("utf8")); } catch { throw new PublicError("Dados inválidos."); }
}
export async function rateLimit(key: string, maximum: number) {
  const window = 15 * 60 * 1000;
  const bucket = Math.floor(Date.now() / window);
  const hashedKey = createHash("sha256").update(`${key}:${bucket}`).digest("hex");
  const entry = await prisma.authRateLimit.upsert({ where: { key: hashedKey }, create: { key: hashedKey, expiresAt: new Date((bucket + 1) * window) }, update: { count: { increment: 1 } } });
  if (entry.count > maximum) throw new PublicError("Muitas tentativas. Aguarde alguns minutos.", 429);
  if (randomBytes(1)[0] < 4) await prisma.authRateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
export async function requireAdminMutation(request: Request, operation: string) {
  assertSameOrigin(request);
  const admin = await getAdminSession();
  if (!admin) throw new PublicError("Acesso negado.", 401);
  await rateLimit(`mutation:${operation}:${admin.id}`, 30);
  return admin;
}
export function mutationError(error: unknown) {
  return NextResponse.json({ message: error instanceof PublicError ? error.message : "Não foi possível concluir a operação." }, { status: error instanceof PublicError ? error.status : 400 });
}
