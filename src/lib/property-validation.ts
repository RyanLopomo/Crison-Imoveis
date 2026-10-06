import { z } from "zod";

const text = (max: number) => z.string().trim().min(1).max(max);
const optionalNumber = z.union([z.number().int().min(0).max(10000), z.null()]).optional();

export const propertySchema = z.object({
  title: text(120),
  description: text(3000),
  price: z.preprocess((value) => typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value, z.number().int().min(1).max(2_000_000_000)),
  type: z.enum(["Casa", "Apartamento", "Terreno", "Fazenda"]),
  category: z.enum(["Minha Casa Minha Vida", "Médio Padrão", "Alto Padrão", "Terreno", "Fazenda"]),
  city: text(100),
  neighborhood: text(100),
  address: z.union([z.string().trim().max(200), z.null()]).optional(),
  bedrooms: optionalNumber,
  bathrooms: optionalNumber,
  parkingSpots: optionalNumber,
  area: optionalNumber,
  imageUrl: z.string().url().max(2048),
  status: z.enum(["Disponível", "Vendido", "Alugado"]).default("Disponível"),
  featured: z.boolean().default(false),
}).strict();

export function isAllowedImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}
