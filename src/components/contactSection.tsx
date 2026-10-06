"use client";

import { useState } from "react";
import { createWhatsappLink } from "@/data/site";

export function ContactSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("Comprar imóvel");

  const message = `Olá, meu nome é ${name || "Cliente"}. Tenho interesse em: ${interest}. Meu WhatsApp é: ${phone || "não informado"}.`;

  return (
    <section id="contato" className="bg-[#0D0D0D] px-6 py-28">
      <div className="mx-auto grid max-w-7xl gap-10 rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 md:grid-cols-2 md:p-14">
        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-[#D6A84F]">
            Contato
          </p>

          <h2 className="font-serif text-4xl leading-tight md:text-6xl">
            Quer encontrar o imóvel ideal?
          </h2>

          <p className="mt-6 text-lg leading-8 text-white/60">
            Envie seu interesse e a CrisOn Imóveis entrará em contato para
            apresentar as melhores opções em Jundiaí e região.
          </p>
        </div>

        <form className="space-y-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome completo"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-5 py-4 outline-none placeholder:text-white/40 focus:border-[#D6A84F]"
          />

          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="WhatsApp"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-5 py-4 outline-none placeholder:text-white/40 focus:border-[#D6A84F]"
          />

          <select
            value={interest}
            onChange={(event) => setInterest(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/50 px-5 py-4 outline-none focus:border-[#D6A84F]"
          >
            <option>Comprar imóvel</option>
            <option>Vender meu imóvel</option>
            <option>Minha Casa Minha Vida</option>
            <option>Casa</option>
            <option>Apartamento</option>
            <option>Terreno</option>
            <option>Fazenda</option>
            <option>Alto padrão</option>
          </select>

          <a
            href={createWhatsappLink(message)}
            target="_blank"
            className="block w-full rounded-xl bg-[#D6A84F] px-5 py-4 text-center font-bold text-black transition hover:bg-white"
          >
            Enviar pelo WhatsApp
          </a>
        </form>
      </div>
    </section>
  );
}