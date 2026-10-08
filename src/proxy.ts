import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";
export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.blob.vercel-storage.com",
    "font-src 'self' data:",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'",
  ].join("; ");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  function finish(response: NextResponse) {
    response.headers.set("Content-Security-Policy", csp);
    if (request.nextUrl.pathname.startsWith("/admin")) response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
  const pathname = request.nextUrl.pathname;
  const publicAccountPage = ["/admin/login", "/admin/forgot-password", "/admin/reset-password", "/admin/confirm-email"].includes(pathname);
  const protectedPage = (pathname === "/admin" || pathname.startsWith("/admin/")) && !publicAccountPage;
  const protectedAPI = (pathname.startsWith("/api/properties") && !["GET", "HEAD"].includes(request.method)) || ["/api/admin/properties", "/api/admin/upload"].includes(pathname);
  if (protectedPage || protectedAPI) {
    if (!["GET", "HEAD"].includes(request.method)) {
      try { assertSameOrigin(request); }
      catch { return finish(NextResponse.json({ message: "Requisição inválida." }, { status: 403 })); }
    }
    if (!await verifyAdminToken(request.cookies.get("crison_admin_session")?.value)) {
      return finish(pathname.startsWith("/api/") ? NextResponse.json({ message: "Acesso negado." }, { status: 401 }) : NextResponse.redirect(new URL("/admin/login", request.url)));
    }
  }
  return finish(NextResponse.next({ request: { headers } }));
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
