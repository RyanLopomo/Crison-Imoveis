import Link from "next/link";
import { AccountForm } from "@/components/admin/AdminAccount";
export default function ForgotPasswordPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white"><div className="w-full max-w-md space-y-5"><AccountForm action="forgot-password" title="Esqueci minha senha" button="Enviar instruções" fields={[{ name: "email", label: "E-mail", type: "email" }]} /><Link href="/admin/login" className="block text-[#D6A84F]">Voltar ao login</Link></div></main>;
}
