import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { Resend } from "resend";
import { z } from "zod";
import { after, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminSession, destroyAdminSession, getAdminSession } from "@/lib/auth";
const generic = "Se existir uma conta associada a este e-mail, enviaremos as instruções de recuperação.";
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const emailSchema = z.string().trim().toLowerCase().email().max(254);
const dummyPasswordHash = hash(randomBytes(32).toString("hex"), 12);
const currentPassword = z.string().min(1).max(72);
const newPassword = z.string().min(12, "Use pelo menos 12 caracteres.").max(72).refine(v => Buffer.byteLength(v, "utf8") <= 72 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /[0-9]/.test(v) && /[^a-zA-Z0-9]/.test(v), "Use maiúsculas, minúsculas, números e símbolos (máximo 72 bytes).");
const passwordFields = { newPassword, confirmPassword: z.string() };
const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/);
class PublicError extends Error { constructor(message: string, public status = 400) { super(message); } }
async function limit(key: string, maximum: number) {
  const window = 15 * 60 * 1000;
  const bucket = Math.floor(Date.now() / window);
  const entry = await prisma.authRateLimit.upsert({ where: { key: digest(`${key}:${bucket}`) }, create: { key: digest(`${key}:${bucket}`), expiresAt: new Date((bucket + 1) * window) }, update: { count: { increment: 1 } } });
  if (entry.count > maximum) throw new PublicError("Muitas tentativas. Aguarde alguns minutos.", 429);
  if (randomBytes(1)[0] < 4) await prisma.authRateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
async function bootstrap() {
  const email = emailSchema.safeParse(process.env.ADMIN_EMAIL);
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!email.success || !passwordHash || !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(passwordHash)) return;
  // Serialize first-account creation; environment changes never modify existing accounts.
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(43892017)`;
    if (await tx.admin.findFirst({ select: { id: true } })) return;
    await tx.admin.create({ data: { id: "initial-admin", email: email.data, passwordHash } });
  });
}
export interface RecoveryDelivery { send(to: string, link: string, purpose: "reset" | "email"): Promise<void> }
const emailDelivery: RecoveryDelivery = { async send(to, link, purpose) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error("Email configuration missing");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [to],
    subject: purpose === "reset" ? "Redefinir senha - CrisOn" : "Confirmar novo e-mail - CrisOn",
    text: `Acesse o link para ${purpose === "reset" ? "redefinir sua senha" : "confirmar seu novo e-mail"}:\n${link}\n\nEste link expira em 20 minutos e só pode ser utilizado uma vez. Se você não solicitou, ignore esta mensagem.`,
  });
  if (error || !data) throw new Error("Email delivery failed");
} };
function appURL() {
  const url = new URL(process.env.NEXT_PUBLIC_APP_URL || "");
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") throw new Error("Invalid application URL");
  return url.origin;
}
export async function accountAction(request: Request, action: string) {
  try {
    if (!["login", "forgot-password", "reset-password", "confirm-email", "profile", "password", "email"].includes(action)) throw new PublicError("Requisição inválida.", 404);
    if (request.headers.get("origin") !== new URL(request.url).origin || !request.headers.get("content-type")?.startsWith("application/json")) throw new PublicError("Requisição inválida.", 403);
    const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown" : "local";
    await limit(`ip:${action}:${ip}`, action === "login" ? 20 : 10);
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 4096) throw new PublicError("Dados inválidos.");
    let body: unknown;
    try { body = JSON.parse(raw); } catch { throw new PublicError("Dados inválidos."); }
    if (action === "login" || action === "forgot-password") {
      const data = (action === "login" ? z.object({ email: emailSchema, password: currentPassword }) : z.object({ email: emailSchema })).parse(body);
      if (action === "forgot-password") {
        after(async () => {
          try {
            await bootstrap();
            const normalizedEmail = data.email.trim().toLowerCase();
            const admin = await prisma.admin.findFirst({
              where: { email: { equals: normalizedEmail, mode: "insensitive" } },
              select: { id: true, email: true },
            });
            await limit(`recovery:${normalizedEmail}`, 3);
            if (admin) await issueToken(admin.id, "reset", admin.email);
          } catch { /* Keep the public response identical for every account. */ }
        });
        return NextResponse.json({ message: generic });
      }
      await limit(`login:${data.email}`, 8);
      await bootstrap();
      const admin = await prisma.admin.findFirst({ where: { email: { equals: data.email, mode: "insensitive" } } });
      const valid = await compare(z.object({ password: currentPassword }).parse(body).password, admin?.passwordHash || await dummyPasswordHash);
      if (!admin || !valid) throw new PublicError("E-mail ou senha inválidos.", 401);
      await createAdminSession(admin);
      return NextResponse.json({ ok: true });
    }
    if (action === "reset-password" || action === "confirm-email") {
      const data = (action === "reset-password" ? z.object({ token: tokenSchema, ...passwordFields }).refine(v => v.newPassword === v.confirmPassword, "As senhas não coincidem.") : z.object({ token: tokenSchema })).parse(body);
      const tokenHash = digest(data.token);
      const passwordHash = action === "reset-password" ? await hash(z.object(passwordFields).parse(body).newPassword, 12) : undefined;
      await prisma.$transaction(async tx => {
        const token = await tx.accountToken.findUnique({ where: { tokenHash } });
        if (!token || token.purpose !== (action === "reset-password" ? "reset" : "email") || token.usedAt) throw new PublicError("Link inválido ou já utilizado.");
        await tx.$queryRaw`SELECT id FROM "Admin" WHERE id = ${token.adminId} FOR UPDATE`;
        if (token.expiresAt <= new Date()) throw new PublicError("Link expirado. Solicite um novo link.");
        const consumed = await tx.accountToken.updateMany({ where: { id: token.id, usedAt: null, expiresAt: { gt: new Date() } }, data: { usedAt: new Date() } });
        if (consumed.count !== 1) throw new PublicError("Link inválido ou já utilizado.");
        await tx.admin.update({ where: { id: token.adminId }, data: passwordHash ? { passwordHash, sessionVersion: { increment: 1 } } : { email: token.newEmail!, emailVerified: true, sessionVersion: { increment: 1 } } });
        await tx.accountToken.updateMany({ where: { adminId: token.adminId, usedAt: null }, data: { usedAt: new Date() } });
      });
      await destroyAdminSession();
      return NextResponse.json({ message: action === "reset-password" ? "Senha alterada. Volte ao login." : "E-mail confirmado. Entre com o novo e-mail." });
    }
    const session = await getAdminSession();
    if (!session) throw new PublicError("Entre novamente para continuar.", 401);
    await limit(`account:${action}:${session.id}`, 5);
    if (action === "profile") {
      const data = z.object({ name: z.string().trim().min(2).max(100) }).strict().parse(body);
      const updated = await prisma.admin.updateMany({ where: { id: session.id, sessionVersion: session.sessionVersion }, data });
      if (updated.count !== 1) throw new PublicError("Entre novamente para continuar.", 401);
      return NextResponse.json({ message: "Nome atualizado." });
    }
    if (action !== "password" && action !== "email") throw new PublicError("Requisição inválida.", 404);
    const data = (action === "password" ? z.object({ currentPassword, ...passwordFields }).refine(v => v.newPassword === v.confirmPassword, "As senhas não coincidem.") : z.object({ currentPassword, email: emailSchema })).parse(body);
    if (action === "email") {
      await issueToken(session.id, "email", (data as { email: string }).email, data.currentPassword, session.sessionVersion);
      return NextResponse.json({ message: "Confirmação enviada para o novo e-mail. A alteração ocorrerá após confirmar o link." });
    }
    const passwordHash = await hash((data as { newPassword: string }).newPassword, 12);
    const updated = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Admin" WHERE id = ${session.id} FOR UPDATE`;
      const admin = await tx.admin.findUniqueOrThrow({ where: { id: session.id } });
      if (admin.sessionVersion !== session.sessionVersion || !await compare(data.currentPassword, admin.passwordHash)) throw new PublicError("Senha atual inválida.");
      const result = await tx.admin.update({ where: { id: admin.id }, data: { passwordHash, sessionVersion: { increment: 1 } } });
      await tx.accountToken.updateMany({ where: { adminId: admin.id, usedAt: null }, data: { usedAt: new Date() } });
      return result;
    });
    await createAdminSession(updated);
    return NextResponse.json({ message: "Senha alterada. As outras sessões foram encerradas." });
  } catch (error) {
    if (error instanceof PublicError) return NextResponse.json({ message: error.message }, { status: error.status });
    if (error instanceof z.ZodError) return NextResponse.json({ message: error.issues[0]?.message.startsWith("Use ") || error.issues[0]?.message.startsWith("As senhas") ? error.issues[0].message : "Confira os dados informados." }, { status: 400 });
    return NextResponse.json({ message: "Não foi possível concluir. Tente novamente mais tarde." }, { status: 500 });
  }
}
async function issueToken(adminId: string, purpose: "reset" | "email", recipient: string, password?: string, version?: number) {
  const token = randomBytes(32).toString("hex");
  const link = `${appURL()}/admin/${purpose === "reset" ? "reset-password" : "confirm-email"}?token=${token}`;
  const tokenHash = digest(token);
  const issued = await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "Admin" WHERE id = ${adminId} FOR UPDATE`;
    const admin = await tx.admin.findUniqueOrThrow({ where: { id: adminId } });
    if (purpose === "reset" && admin.email !== recipient) return;
    if (purpose === "email") {
      if (admin.sessionVersion !== version || !password || !await compare(password, admin.passwordHash)) throw new PublicError("Senha atual inválida.");
      if (admin.email === recipient || await tx.admin.findUnique({ where: { email: recipient } })) throw new PublicError("Não foi possível usar este e-mail.");
    }
    await tx.accountToken.deleteMany({ where: { adminId, purpose } });
    await tx.accountToken.create({ data: { adminId, purpose, newEmail: purpose === "email" ? recipient : null, tokenHash, expiresAt: new Date(Date.now() + 20 * 60 * 1000) } });
    return true;
  });
  if (!issued) return;
  try { await emailDelivery.send(recipient, link, purpose); }
  catch (error) { await prisma.accountToken.deleteMany({ where: { tokenHash } }); throw error; }
}
