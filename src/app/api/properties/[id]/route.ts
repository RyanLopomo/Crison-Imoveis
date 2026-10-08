import { jsonBody, mutationError, requireAdminMutation } from "@/lib/security";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAllowedImageUrl, propertySchema } from "@/lib/property-validation";

type Params = { params: Promise<{ id: string }> };
const idSchema = /^[a-zA-Z0-9_-]{1,64}$/;

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  if (!idSchema.test(id)) return NextResponse.json({ message: "Imóvel não encontrado." }, { status: 404 });
  try {
    const property = await prisma.property.findFirst({ where: { id, status: "Disponível" } });
    if (!property) return NextResponse.json({ message: "Imóvel não encontrado." }, { status: 404 });
    return NextResponse.json(property);
  } catch {
    return NextResponse.json({ message: "Erro ao buscar imóvel." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  if (!idSchema.test(id)) return NextResponse.json({ message: "Imóvel não encontrado." }, { status: 404 });
  try {
    await requireAdminMutation(request, "properties");
    const parsed = propertySchema.safeParse(await jsonBody(request, 16384));
    if (!parsed.success || !isAllowedImageUrl(parsed.data.imageUrl)) {
      return NextResponse.json({ message: "Confira os dados e a imagem do imóvel." }, { status: 400 });
    }
    const result = await prisma.property.updateMany({ where: { id }, data: parsed.data });
    if (result.count === 0) return NextResponse.json({ message: "Imóvel não encontrado." }, { status: 404 });
    const property = await prisma.property.findUnique({ where: { id } });
    return NextResponse.json(property);
  } catch (error) {
    return mutationError(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  if (!idSchema.test(id)) return NextResponse.json({ message: "Imóvel não encontrado." }, { status: 404 });
  try {
    await requireAdminMutation(request, "properties");
    const result = await prisma.property.deleteMany({ where: { id } });
    if (result.count === 0) return NextResponse.json({ message: "Imóvel não encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return mutationError(error);
  }
}
