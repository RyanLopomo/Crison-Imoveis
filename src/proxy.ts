import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/properties") && request.method === "GET") return NextResponse.next();
  // Vercel Blob validates the provider signature before accepting completion callbacks.
  if (request.nextUrl.pathname === "/api/admin/upload" && request.method === "POST") {
    try { if ((await request.clone().json()).type === "blob.upload-completed") return NextResponse.next(); } catch { return redirectOrUnauthorized(request); }
  }
  if (!["GET", "HEAD"].includes(request.method) && request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 403 });
  }
  const token = request.cookies.get("crison_admin_session")?.value;
  if (!token) return redirectOrUnauthorized(request);
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret || secret.length < 32) return redirectOrUnauthorized(request);
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    if (payload.role !== "admin" || !payload.sub || typeof payload.version !== "number") return redirectOrUnauthorized(request);
    const admin = await prisma.admin.findUnique({ where: { id: payload.sub }, select: { sessionVersion: true } });
    if (!admin || admin.sessionVersion !== payload.version) return redirectOrUnauthorized(request);
    return NextResponse.next();
  } catch { return redirectOrUnauthorized(request); }
}
function redirectOrUnauthorized(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
export const config = { matcher: ["/admin", "/api/properties/:path*", "/api/admin/properties", "/api/admin/upload"] };
