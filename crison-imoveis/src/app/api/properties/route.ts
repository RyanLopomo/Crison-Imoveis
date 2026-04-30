import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(properties);
  } catch {
    return NextResponse.json(
      { message: "Erro ao buscar imóveis." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const property = await prisma.property.create({
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
        status: body.status || "Disponível",
        featured: Boolean(body.featured),
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Erro ao cadastrar imóvel." },
      { status: 500 }
    );
  }
}