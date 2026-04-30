export const propertyTypes = [
  {
    title: "Minha Casa Minha Vida",
    description: "Imóveis com condições facilitadas para realizar o sonho da casa própria.",
  },
  {
    title: "Médio Padrão",
    description: "Conforto, boa localização e excelente custo-benefício.",
  },
  {
    title: "Alto Padrão",
    description: "Imóveis exclusivos para quem busca sofisticação e privacidade.",
  },
  {
    title: "Casas",
    description: "Diversas opções de casas em Jundiaí e região.",
  },
  {
    title: "Apartamentos",
    description: "Praticidade, segurança e localização estratégica.",
  },
  {
    title: "Fazendas e Terrenos",
    description: "Áreas para investir, morar ou construir seu próximo projeto.",
  },
];

export const featuredProperties = [
  {
    title: "Casa Alto Padrão em Jundiaí",
    location: "Jundiaí - SP",
    price: "R$ 1.850.000",
    category: "Alto Padrão",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  },
  {
    title: "Apartamento Médio Padrão",
    location: "Várzea Paulista - SP",
    price: "R$ 420.000",
    category: "Apartamento",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
  },
  {
    title: "Terreno para Investimento",
    location: "Itupeva - SP",
    price: "R$ 280.000",
    category: "Terreno",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
  },
];

export type FeaturedProperty = (typeof featuredProperties)[number];

export type PropertyFilters = {
  type: string;
  city: string;
  price: string;
};
