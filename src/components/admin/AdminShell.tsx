"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, Plus, Building2, Settings, LogOut, Menu, X, ArrowUpRight } from "lucide-react";

const navigation = [
  { href: "/admin", title: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/novo-imovel", title: "Novo imóvel", icon: Plus },
  { href: "/admin/imoveis", title: "Imóveis cadastrados", icon: Building2 },
  { href: "/admin/configuracoes", title: "Configurações", icon: Settings },
];

export function AdminShell({ name, children }: { name: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const drawer = useRef<HTMLDialogElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const title = navigation.find(item => item.href === pathname)?.title || "Painel administrativo";

  useEffect(() => {
    drawer.current?.close();
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) drawer.current?.close(); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  async function logout() {
    if (leaving) return;
    setLeaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      drawer.current?.close();
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError("Não foi possível sair. Tente novamente.");
      setLeaving(false);
    }
  }

  function sidebar(mobile = false) {
    return <div className="flex h-full flex-col px-5 py-7">
      <div className="flex items-center justify-between px-3">
        <Link href="/admin" onClick={() => drawer.current?.close()} className="font-serif text-3xl text-[#D6A84F]">CrisOn<span className="mt-2 block font-sans text-[10px] uppercase tracking-[0.28em] text-white/40">Painel administrativo</span></Link>
        {mobile && <button type="button" onClick={() => drawer.current?.close()} aria-label="Fechar menu" className="rounded-lg p-2 text-white/60 hover:bg-white/5"><X size={20} /></button>}
      </div>
      <nav aria-label="Navegação administrativa" className="mt-12 space-y-2">
        {navigation.map(({ href, title: label, icon: Icon }) => {
          const active = pathname === href;
          return <Link key={href} href={href} aria-current={active ? "page" : undefined} onClick={() => drawer.current?.close()} className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm transition ${active ? "bg-[#D6A84F]/10 font-medium text-[#D6A84F]" : "text-white/55 hover:bg-white/5 hover:text-white"}`}><Icon size={19} strokeWidth={1.6} /><span>{label}</span></Link>;
        })}
      </nav>
      <div className="mt-auto space-y-4 border-t border-white/10 pt-6">
        <p className="truncate px-4 text-sm text-white/40">{name}</p>
        <button type="button" disabled={leaving} onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/55 transition hover:bg-white/5 hover:text-white disabled:opacity-50"><LogOut size={19} strokeWidth={1.6} />{leaving ? "Saindo..." : "Sair"}</button>
        {error && <p role="alert" className="px-4 text-xs text-red-400">{error}</p>}
      </div>
    </div>;
  }

  return <div className="min-h-screen bg-[#080808] text-white">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-[#0c0c0c] lg:block">{sidebar()}</aside>
    <dialog ref={drawer} aria-label="Menu administrativo" onClick={event => { if (event.target === event.currentTarget) drawer.current?.close(); }} className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[85vw] border-r border-white/10 bg-[#0c0c0c] text-white backdrop:bg-black/70">{sidebar(true)}</dialog>
    <div className="min-w-0 lg:ml-64">
      <header className="flex items-center gap-4 border-b border-white/10 px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
        <button type="button" onClick={() => drawer.current?.showModal()} aria-label="Abrir menu" aria-haspopup="dialog" className="shrink-0 rounded-lg border border-white/10 p-2 text-white/70 lg:hidden"><Menu size={20} /></button>
        <h1 className="min-w-0 flex-1 font-serif text-2xl sm:text-3xl">{title}</h1>
        <Link href="/" className="flex shrink-0 items-center gap-2 text-sm text-white/50 transition hover:text-[#D6A84F]"><span className="hidden sm:inline">Ver site</span><ArrowUpRight size={18} /><span className="sr-only sm:hidden">Ver site</span></Link>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">{children}</main>
    </div>
  </div>;
}
