import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { boundedBody, mutationError, PublicError, requireAdminMutation } from "@/lib/security";
export const runtime = "nodejs";
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const types = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;
export async function POST(request: Request) {
  try {
    await requireAdminMutation(request, "upload");
    if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) throw new PublicError("Envie uma imagem válida.");
    const body = await boundedBody(request, MAX_IMAGE_SIZE + 65536);
    const form = await new Response(new Uint8Array(body), { headers: { "Content-Type": request.headers.get("content-type")! } }).formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size < 1 || file.size > MAX_IMAGE_SIZE || !/^[\p{L}\p{N}_ ()-]{1,120}\.(jpe?g|png|webp)$/iu.test(file.name)) throw new PublicError("Use uma imagem JPG, PNG ou WebP de até 4 MB.");
    const source = Buffer.from(await file.arrayBuffer());
    const detected = source.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "image/png"
      : source[0] === 255 && source[1] === 216 && source[2] === 255 ? "image/jpeg"
      : source.toString("ascii", 0, 4) === "RIFF" && source.toString("ascii", 8, 12) === "WEBP" ? "image/webp" : null;
    if (!detected || detected !== file.type) throw new PublicError("Imagem inválida.");
    const image = sharp(source, { limitInputPixels: 16000000, animated: false });
    const metadata = await image.metadata();
    const format = metadata.format;
    if (!format || !(format in types) || (metadata.pages ?? 1) > 1) throw new PublicError("Imagem inválida.");
    const contentType = types[format as keyof typeof types];
    const extension = format === "jpeg" ? "jpg" : format;
    if (file.type !== contentType || !file.name.toLowerCase().endsWith(`.${extension}`) && !(format === "jpeg" && file.name.toLowerCase().endsWith(".jpeg"))) throw new PublicError("O formato da imagem não corresponde ao arquivo.");
    // Decode and re-encode to reject executable/polyglot payloads and remove metadata.
    const normalized = await image.rotate().toFormat(format as keyof typeof types).toBuffer();
    if (normalized.byteLength > MAX_IMAGE_SIZE) throw new PublicError("Imagem maior que 4 MB.");
    const blob = await put(`properties/${randomUUID()}.${extension}`, normalized, { access: "public", contentType, addRandomSuffix: true });
    return NextResponse.json({ url: blob.url });
  } catch (error) { return mutationError(error); }
}
