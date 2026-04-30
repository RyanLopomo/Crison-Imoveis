import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return NextResponse.json(
        { message: "Imóvel não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch {
    return NextResponse.json(
      { message: "Erro ao buscar imóvel." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const property = await prisma.property.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        price: Number(body.price),
        type: body.type,
        category: body.category,
        city: body.city,
        neighborhood: body.neighborhood,
        address: body.address || null,
        bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
        bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
        parkingSpots: body.parkingSpots ? Number(body.parkingSpots) : null,
        area: body.area ? Number(body.area) : null,
        imageUrl: body.imageUrl,
        status: body.status,
        featured: Boolean(body.featured),
      },
    });

    return NextResponse.json(property);
  } catch {
    return NextResponse.json(
      { message: "Erro ao atualizar imóvel." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Imóvel deletado com sucesso.",
    });
  } catch {
    return NextResponse.json(
      { message: "Erro ao deletar imóvel." },
      { status: 500 }
    );
  }
}