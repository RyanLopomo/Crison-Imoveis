import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.property.deleteMany();

  await prisma.property.createMany({
    data: [
      {
        title: "Casa Alto Padrão em Jundiaí",
        description:
          "Casa sofisticada com ambientes amplos, acabamento premium e localização privilegiada.",
        price: 1850000,
        type: "Casa",
        category: "Alto Padrão",
        city: "Jundiaí",
        neighborhood: "Jardim Samambaia",
        bedrooms: 4,
        bathrooms: 5,
        parkingSpots: 4,
        area: 320,
        imageUrl:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
        featured: true,
      },
      {
        title: "Apartamento Médio Padrão",
        description:
          "Apartamento moderno com excelente localização e ótimo custo-benefício.",
        price: 420000,
        type: "Apartamento",
        category: "Médio Padrão",
        city: "Várzea Paulista",
        neighborhood: "Centro",
        bedrooms: 2,
        bathrooms: 2,
        parkingSpots: 1,
        area: 72,
        imageUrl:
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
        featured: true,
      },
      {
        title: "Terreno para Investimento",
        description:
          "Terreno ideal para construção, investimento ou valorização patrimonial.",
        price: 280000,
        type: "Terreno",
        category: "Terreno",
        city: "Itupeva",
        neighborhood: "Residencial dos Lagos",
        bedrooms: 0,
        bathrooms: 0,
        parkingSpots: 0,
        area: 450,
        imageUrl:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
        featured: true,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed concluído com sucesso.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
