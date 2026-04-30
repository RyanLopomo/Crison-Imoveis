import { Building, Gem, Home, Landmark, Leaf, Map } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";
import { propertyTypes } from "@/data/properties";

const icons = [Home, Building, Gem, Landmark, Building, Leaf];

export function PropertyTypes() {
  return (
    <section id="tipos" className="bg-[#080808] px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 grid gap-8 md:grid-cols-2">
          <Reveal>
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.35em] text-[#D6A84F]">
                Tipos de imóveis
              </p>
              <h2 className="font-serif text-4xl leading-tight md:text-6xl">
                Imóveis para cada momento da sua vida.
              </h2>
            </div>
          </Reveal>

          <p className="max-w-xl self-end text-lg leading-8 text-white/60">
            Trabalhamos com diferentes perfis de imóveis em Jundiaí e região,
            desde programas habitacionais até imóveis de alto padrão.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {propertyTypes.map((item, index) => {
            const Icon = icons[index] ?? Map;

            return (
              <Reveal key={item.title} delay={index * 0.08}>
                <div className="group rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 transition hover:-translate-y-1 hover:border-[#D6A84F]/50 hover:bg-white/[0.06]">
                  <Icon className="mb-8 h-9 w-9 text-[#D6A84F] transition group-hover:scale-110" />
                  <h3 className="font-serif text-3xl">{item.title}</h3>
                  <p className="mt-4 leading-7 text-white/60">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
