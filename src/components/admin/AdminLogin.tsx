"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Falha ao entrar.");
      router.replace("/admin");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao entrar.");
    } finally {
      setLoading(false);
    }
  }

  return <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
    <div><p className="text-sm uppercase tracking-[0.3em] text-[#D6A84F]">CrisOn Admin</p><h1 className="mt-3 font-serif text-4xl">Acessar painel</h1></div>
    <input required type="email" name="email" autoComplete="username" placeholder="E-mail" className="admin-input" />
    <input required type="password" name="password" autoComplete="current-password" placeholder="Senha" className="admin-input" />
    {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
    <button disabled={loading} className="w-full rounded-xl bg-[#D6A84F] px-5 py-4 font-bold text-black disabled:opacity-60">{loading ? "Entrando..." : "Entrar"}</button>
  </form>;
}
