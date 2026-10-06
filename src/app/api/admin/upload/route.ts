import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        let size: number;
        try {
          const payload = JSON.parse(clientPayload ?? "null");
          size = Number(payload?.size);
          if (!Number.isInteger(size) || size < 1 || size > MAX_IMAGE_SIZE) throw new Error();
        } catch {
          throw new Error("Imagem inválida ou maior que 5 MB.");
        }

        return {
          allowedContentTypes: allowedTypes,
          maximumSizeInBytes: MAX_IMAGE_SIZE,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ size }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        const contentType = blob.contentType?.toLowerCase();
        if (!contentType || !allowedTypes.includes(contentType)) {
          throw new Error("Tipo de arquivo inválido.");
        }
      },
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Não foi possível enviar a imagem." }, { status: 400 });
  }
}
