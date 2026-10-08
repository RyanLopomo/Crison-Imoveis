import Link from "next/link";
import { AccountForm } from "@/components/admin/AdminAccount";
export const metadata = { referrer: "no-referrer" };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white"><div className="w-full max-w-md space-y-5">{token && /^[a-f0-9]{64}$/.test(token) ? <AccountForm action="reset-password" title="Redefinir senha" button="Alterar senha" token={token} fields={[{ name: "newPassword", label: "Nova senha", type: "password" }, { name: "confirmPassword", label: "Confirmar nova senha", type: "password" }]} /> : <p role="alert">Link inválido. Solicite um novo link.</p>}<Link href="/admin/forgot-password" className="block text-[#D6A84F]">Solicitar novo link</Link><Link href="/admin/login" className="block text-[#D6A84F]">Voltar ao login</Link></div></main>;
}
