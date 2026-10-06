import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/properties") && request.method === "GET") {
    return NextResponse.next();
  }
  const token = request.cookies.get("crison_admin_session")?.value;
  if (!token) return redirectOrUnauthorized(request);

  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret || secret.length < 32) return redirectOrUnauthorized(request);
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    if (payload.role !== "admin") return redirectOrUnauthorized(request);
    return NextResponse.next();
  } catch {
    return redirectOrUnauthorized(request);
  }
}

function redirectOrUnauthorized(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin", "/api/properties/:path*", "/api/admin/properties", "/api/admin/upload"],
};
