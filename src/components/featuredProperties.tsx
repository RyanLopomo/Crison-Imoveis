"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { featuredProperties } from "@/data/properties";
import { createWhatsappLink } from "../data/site";

export function FeaturedProperties() {
  return (
    <section id="imoveis" className="bg-[#0D0D0D] px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-[#D6A84F]">
              Imóveis em destaque
            </p>
            <h2 className="font-serif text-4xl md:text-6xl">
              Oportunidades selecionadas.
            </h2>
          </div>

          <a
            href="#contato"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-[#D6A84F] hover:text-[#D6A84F]"
          >
            Quero receber opções
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {featuredProperties.map((property, index) => (
            <motion.article
              key={property.title}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group overflow-hidden rounded-[2rem] border border-white/10 bg-black transition hover:-translate-y-1 hover:border-[#D6A84F]/50"
            >
              <div
                className="h-72 bg-cover bg-center transition duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${property.image})` }}
              />

              <div className="p-7">
                <span className="rounded-full bg-[#D6A84F]/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#D6A84F]">
                  {property.category}
                </span>

                <h3 className="mt-5 font-serif text-3xl">{property.title}</h3>

                <div className="mt-4 flex items-center gap-2 text-white/60">
                  <MapPin className="h-4 w-4" />
                  {property.location}
                </div>

                <p className="mt-6 text-2xl font-semibold text-[#D6A84F]">
                  {property.price}
                </p>

                <a
                  href={createWhatsappLink(
                    `Olá, tenho interesse no imóvel: ${property.title}.`
                  )}
                  target="_blank"
                  className="mt-7 block w-full rounded-full bg-white px-5 py-4 text-center font-bold text-black transition hover:bg-[#D6A84F]"
                >
                  Tenho interesse
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}