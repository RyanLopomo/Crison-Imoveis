import { BadgeCheck, ShieldCheck, Users } from "lucide-react";

export function AboutSection() {
  return (
    <section id="sobre" className="relative overflow-hidden bg-[#080808] px-6 py-28">
      <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d')] bg-cover bg-center opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/90 to-[#080808]/40" />

      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-[#D6A84F]">
            Sobre a CrisOn Imóveis
          </p>

          <h2 className="font-serif text-4xl leading-tight md:text-6xl">
            Mais que imóveis, realizamos sonhos.
          </h2>

          <p className="mt-8 text-lg leading-8 text-white/65">
            Com atendimento próximo, transparente e personalizado, a CrisOn
            Imóveis atua em Jundiaí e região conectando pessoas aos imóveis
            certos para cada fase da vida.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
            <Users className="mb-5 h-8 w-8 text-[#D6A84F]" />
            <h3 className="text-xl font-semibold">Atendimento humano</h3>
            <p className="mt-3 text-white/60">
              Acompanhamento consultivo em cada etapa da negociação.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
            <ShieldCheck className="mb-5 h-8 w-8 text-[#D6A84F]" />
            <h3 className="text-xl font-semibold">Segurança</h3>
            <p className="mt-3 text-white/60">
              Processo transparente para compra, venda ou investimento.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
            <BadgeCheck className="mb-5 h-8 w-8 text-[#D6A84F]" />
            <h3 className="text-xl font-semibold">Curadoria de imóveis</h3>
            <p className="mt-3 text-white/60">
              Seleção de oportunidades de acordo com seu perfil e objetivo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}