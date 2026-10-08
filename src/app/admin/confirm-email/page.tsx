import Link from "next/link";
import { AccountForm } from "@/components/admin/AdminAccount";
export const metadata = { referrer: "no-referrer" };
export default async function ConfirmEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white"><div className="w-full max-w-md space-y-5">{token && /^[a-f0-9]{64}$/.test(token) ? <AccountForm action="confirm-email" title="Confirmar novo e-mail" button="Confirmar e-mail" token={token} fields={[]} /> : <p role="alert">Link inválido. Solicite uma nova confirmação no painel.</p>}<Link href="/admin/login" className="block text-[#D6A84F]">Voltar ao login</Link></div></main>;
}
