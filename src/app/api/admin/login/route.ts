import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { createAdminSession, safeEqual } from "@/lib/auth";
import { requiredEnv } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return NextResponse.json({ message: "Requisição inválida." }, { status: 403 });
    }
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const validEmail = safeEqual(email, requiredEnv("crisonimov@gmail.com").toLowerCase());
    const validPassword = password.length <= 256 && await compare(password, requiredEnv("$2b$12$gwg/zqC6R1ggUuzHkpM5KuH9/VwgMPQ07QCH7yJ/hg1cKyzpAWyFS"));

    if (!validEmail || !validPassword) {
      return NextResponse.json({ message: "E-mail ou senha inválidos." }, { status: 401 });
    }

    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Não foi possível autenticar." }, { status: 500 });
  }
}
