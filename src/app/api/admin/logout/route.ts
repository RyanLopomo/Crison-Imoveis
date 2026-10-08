import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 403 });
  }
  await destroyAdminSession();
  return NextResponse.json({ ok: true });
}
