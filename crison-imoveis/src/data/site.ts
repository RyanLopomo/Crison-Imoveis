export const siteConfig = {
  name: "CrisOn Imóveis",
  region: "Jundiaí e região",
  whatsapp: "5511999999999",
  email: "contato@crisonimoveis.com.br",
};

export function createWhatsappLink(message: string) {
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}