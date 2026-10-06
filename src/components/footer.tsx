import { Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080808] px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-[#D6A84F]" />
          <div>
            <h2 className="font-serif text-2xl">CrisOn</h2>
            <p className="text-xs tracking-[0.35em] text-white/50">IMÓVEIS</p>
          </div>
        </div>

        <div className="text-sm leading-7 text-white/50">
          <p>Atendemos Jundiaí e região</p>
          <p>© 2026 CrisOn Imóveis. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}