"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
type Field = { name: string; label: string; type?: string; value?: string };
export function AccountForm({ action, title, fields, token, button = "Salvar" }: { action: string; title: string; fields: Field[]; token?: string; button?: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = event.currentTarget;
    setLoading(true); setMessage(""); setError(false);
    try {
      const body = Object.fromEntries(new FormData(form));
      const response = await fetch(`/api/admin/account/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, ...(token ? { token } : {}) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Não foi possível concluir.");
      setMessage(data.message); form.reset(); router.refresh();
      if (action === "reset-password" || action === "confirm-email") setDone(true);
    } catch (cause) { setError(true); setMessage(cause instanceof Error ? cause.message : "Não foi possível concluir. Tente novamente."); }
    finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
    <h2 className="font-serif text-2xl">{title}</h2>
    {!done && <>{fields.map(field => <label key={field.name} className="block space-y-2 text-sm text-white/70"><span>{field.label}</span><input required name={field.name} type={field.type || "text"} defaultValue={field.value} maxLength={field.type === "password" ? 72 : 254} minLength={field.name === "newPassword" ? 12 : undefined} autoComplete={field.type === "password" ? field.name === "currentPassword" ? "current-password" : "new-password" : field.type === "email" ? "email" : "name"} className="admin-input" /></label>)}
    {fields.some(f => f.name === "newPassword") && <p className="text-xs text-white/50">Use pelo menos 12 caracteres, com maiúsculas, minúsculas, números e símbolos.</p>}
    <button disabled={loading} className="rounded-xl bg-[#D6A84F] px-5 py-3 font-bold text-black disabled:opacity-60">{loading ? "Enviando..." : button}</button></>}
    {message && <p role={error ? "alert" : "status"} className={`text-sm ${error ? "text-red-400" : "text-green-400"}`}>{message}</p>}
    {done && <Link href="/admin/login" className="block text-[#D6A84F]">Voltar ao login</Link>}
  </form>;
}
export function AdminAccount({ name, email }: { name: string; email: string }) {
  return <section className="space-y-6">
    <p className="text-white/70">E-mail atual: <span className="break-all">{email}</span></p>
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <AccountForm action="profile" title="Nome do administrador" fields={[{ name: "name", label: "Nome", value: name }]} />
      <AccountForm action="email" title="Alterar e-mail" button="Enviar confirmação" fields={[{ name: "email", label: "Novo e-mail", type: "email" }, { name: "currentPassword", label: "Senha atual", type: "password" }]} />
      <AccountForm action="password" title="Alterar senha" fields={[{ name: "currentPassword", label: "Senha atual", type: "password" }, { name: "newPassword", label: "Nova senha", type: "password" }, { name: "confirmPassword", label: "Confirmar nova senha", type: "password" }]} />
    </div><p className="text-sm text-white/50">Recuperação por SMS estará disponível futuramente.</p>
  </section>;
}
