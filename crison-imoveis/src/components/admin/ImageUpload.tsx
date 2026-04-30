"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

type Props = {
  onUpload: (url: string) => void;
};

export function ImageUpload({ onUpload }: Props) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");

  async function handleUpload(file: File) {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "crison_upload");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/SEU_CLOUD_NAME/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    setPreview(data.secure_url);
    onUpload(data.secure_url);

    setLoading(false);
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

      {preview && (
        <div
          className="h-40 rounded-xl bg-cover bg-center"
          style={{ backgroundImage: `url(${preview})` }}
        />
      )}
    </div>
  );
}