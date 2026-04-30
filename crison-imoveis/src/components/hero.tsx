"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { createWhatsappLink } from "../data/site";
import { MagneticButton } from "@/components/animations/MagneticButton";

export function Hero() {
  const whatsappMessage =
    "Olá, tenho interesse em encontrar um imóvel com a CrisOn Imóveis.";

  return (
    <section
      id="inicio"
      className="relative min-h-screen overflow-hidden bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c')] bg-cover bg-center"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/70" />
      <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(214,168,79,0.18),transparent_35%)]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 pt-32 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-[#D6A84F] md:text-sm">
            <MapPin className="h-4 w-4" />
            Atendemos {`Jundiaí e região`}
          </div>

          <h2 className="max-w-3xl font-serif text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            Encontre o lugar ideal para viver.
          </h2>

          <p className="mt-8 max-w-xl text-base leading-8 text-white/70 md:text-lg">
            A CrisOn Imóveis conecta você às melhores oportunidades em casas,
            apartamentos, terrenos, fazendas, Minha Casa Minha Vida e imóveis de
            alto padrão.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <MagneticButton
              href="#imoveis"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#D6A84F] px-7 py-4 font-semibold text-black transition hover:bg-white"
            >
              Ver imóveis
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </MagneticButton>

            <MagneticButton
              href={createWhatsappLink(whatsappMessage)}
              target="_blank"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 font-semibold text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              Falar no WhatsApp
            </MagneticButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="rounded-[2rem] border border-white/10 bg-black/60 p-5 shadow-2xl backdrop-blur-xl md:p-7"
        >
          <h3 className="font-serif text-3xl">Fale com uma especialista</h3>
          <p className="mt-2 text-sm leading-6 text-white/60 md:text-base">
            Preencha seus dados e receba imóveis compatíveis com seu perfil.
          </p>

          <form className="mt-8 space-y-4">
            <input
              placeholder="Nome"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-white/40 focus:border-[#D6A84F]"
            />

            <input
              placeholder="Número / WhatsApp"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-white/40 focus:border-[#D6A84F]"
            />

            <select className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-[#D6A84F]">
              <option className="bg-black">Qual seu interesse?</option>
              <option className="bg-black">Comprar imóvel</option>
              <option className="bg-black">Vender imóvel</option>
              <option className="bg-black">Minha Casa Minha Vida</option>
              <option className="bg-black">Alto padrão</option>
              <option className="bg-black">Terrenos ou fazendas</option>
            </select>

            <a
              href={createWhatsappLink(whatsappMessage)}
              target="_blank"
              className="block w-full rounded-xl bg-[#D6A84F] px-5 py-4 text-center font-bold text-black transition hover:bg-white"
            >
              Enviar interesse
            </a>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
