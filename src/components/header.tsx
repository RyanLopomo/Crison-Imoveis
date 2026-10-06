import { Building2 } from "lucide-react";

export function Header() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-[#D6A84F]" />
          <div>
            <h1 className="font-serif text-2xl leading-none">CrisOn</h1>
            <p className="text-xs tracking-[0.35em] text-white/60">IMÓVEIS</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <a href="#inicio" className="hover:text-[#D6A84F]">Início</a>
          <a href="#imoveis" className="hover:text-[#D6A84F]">Imóveis</a>
          <a href="#tipos" className="hover:text-[#D6A84F]">Categorias</a>
          <a href="#sobre" className="hover:text-[#D6A84F]">Sobre</a>
          <a href="#contato" className="hover:text-[#D6A84F]">Contato</a>
        </nav>

        <a
          href="#contato"
          className="rounded-full border border-[#D6A84F]/60 px-5 py-3 text-sm font-medium text-[#D6A84F] transition hover:bg-[#D6A84F] hover:text-black"
        >
          Tenho Interesse
        </a>
      </div>
    </header>
  );
}