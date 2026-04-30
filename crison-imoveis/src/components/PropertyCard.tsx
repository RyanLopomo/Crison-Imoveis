"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { createWhatsappLink } from "@/data/site";

export function PropertyCard({ property }: any) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-black transition hover:border-[#D6A84F]/50"
    >
      <div className="relative h-64 overflow-hidden">
        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${property.imageUrl || property.image})` }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        <span className="absolute left-4 top-4 rounded-full bg-black/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#D6A84F] backdrop-blur">
          {property.category}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold">{property.title}</h3>

        <div className="mt-2 flex items-center gap-2 text-white/60">
          <MapPin size={16} />
          {property.city
            ? `${property.city} - ${property.neighborhood}`
            : property.location}
        </div>

        <p className="mt-4 text-lg font-bold text-[#D6A84F]">
          {typeof property.price === "number"
            ? `R$ ${property.price.toLocaleString("pt-BR")}`
            : property.price}
        </p>

        <motion.a
          whileTap={{ scale: 0.95 }}
          href={createWhatsappLink(
            `Olá, tenho interesse no imóvel: ${property.title}`
          )}
          target="_blank"
          className="mt-5 block w-full rounded-full bg-white p-3 text-center font-bold text-black transition hover:bg-[#D6A84F]"
        >
          Tenho interesse
        </motion.a>
      </div>
    </motion.article>
  );
}