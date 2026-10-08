import Link from "next/link";
import { ArrowUpRight, Plus, Building2, Settings } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
const shortcuts = [
  { href: "/admin/novo-imovel", title: "Novo imóvel", description: "Cadastre um novo imóvel no seu portfólio.", icon: Plus },
  { href: "/admin/imoveis", title: "Imóveis cadastrados", description: "Consulte, edite e organize seus imóveis.", icon: Building2 },
  { href: "/admin/configuracoes", title: "Configurações", description: "Gerencie seus dados e a segurança da conta.", icon: Settings },
];
export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const total = await prisma.property.count();
  return <div className="space-y-12">
    <section className="border-b border-white/10 pb-10">
      <p className="text-sm text-white/50">Total de imóveis cadastrados</p>
      <p className="mt-3 font-serif text-6xl text-[#D6A84F]">{total}</p>
    </section>
    <section><h2 className="mb-3 text-sm uppercase tracking-widest text-white/40">Acesso rápido</h2>
      <div className="divide-y divide-white/10">{shortcuts.map(({ href, title, description, icon: Icon }) => <Link key={href} href={href} className="group flex items-center gap-4 py-6 transition hover:text-[#D6A84F]">
        <Icon size={22} strokeWidth={1.5} className="shrink-0 text-[#D6A84F]" />
        <div className="min-w-0 flex-1"><h3 className="text-lg font-medium">{title}</h3><p className="mt-1 text-sm text-white/50">{description}</p></div>
        <ArrowUpRight size={20} className="shrink-0 text-white/40 transition group-hover:text-[#D6A84F]" />
      </Link>)}</div>
    </section>
  </div>;
}
