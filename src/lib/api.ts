import { prisma } from "@/lib/prisma";

export async function getProperties() {
  return prisma.property.findMany({
    where: { status: "Disponível" },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });
}
