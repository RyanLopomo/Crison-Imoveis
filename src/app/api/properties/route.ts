import { jsonBody, mutationError, requireAdminMutation } from "@/lib/security";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAllowedImageUrl, propertySchema } from "@/lib/property-validation";

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: { status: "Disponível" },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(properties, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ message: "Erro ao buscar imóveis." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminMutation(request, "properties");
    const input = await jsonBody(request, 16384);
    const parsed = propertySchema.safeParse(input);
    if (!parsed.success || !isAllowedImageUrl(parsed.data.imageUrl)) {
      return NextResponse.json({ message: "Confira os dados e a imagem do imóvel." }, { status: 400 });
    }
    const property = await prisma.property.create({ data: parsed.data });
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    return mutationError(error);
  }
}
