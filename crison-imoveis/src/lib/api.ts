import { prisma } from "@/lib/prisma";

export async function getProperties() {
  return prisma.property.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}
