import { isAdminAuthenticated } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ message: "Acesso negado." }, { status: 401 });
  try {
    const properties = await prisma.property.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    return NextResponse.json(properties, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ message: "NÃ£o foi possÃ­vel carregar os imÃ³veis." }, { status: 500 });
  }
}
