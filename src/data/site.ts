export const siteConfig = {
  name: "CrisOn Imóveis",
  region: "Jundiaí e região",
  whatsapp: "11997460106",
  email: "contato@crisonimoveis.com.br",
};

export function createWhatsappLink(message: string) {
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}