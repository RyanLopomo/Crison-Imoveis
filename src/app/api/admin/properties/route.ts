import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const properties = await prisma.property.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    return NextResponse.json(properties, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ message: "Não foi possível carregar os imóveis." }, { status: 500 });
  }
}
