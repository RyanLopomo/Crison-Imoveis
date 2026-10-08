"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";


type Props = {
  onUpload: (url: string) => void;
};

export function ImageUpload({ onUpload }: Props) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  async function handleUpload(file: File) {
    if (loading) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 4 * 1024 * 1024) {
      setError("Use uma imagem JPG, PNG ou WebP de até 4 MB.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (!response.ok) throw new Error();
      const blob = await response.json();
      setPreview(blob.url);
      onUpload(blob.url);
    } catch {
      setError("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 p-6 text-white/60 hover:border-[#D6A84F]">
        <UploadCloud className="mb-2" />
        {loading ? "Enviando imagem..." : "Clique para enviar imagem"}

        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            if (!e.target.files?.[0]) return;
            handleUpload(e.target.files[0]);
          }}
        />
      </label>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      {preview && (
        <div
          className="h-40 rounded-xl bg-cover bg-center"
          style={{ backgroundImage: `url(${preview})` }}
        />
      )}
    </div>
  );
}
