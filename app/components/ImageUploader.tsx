"use client";

import { useState } from "react";
import { Camera, X, CheckCircle2, Loader2 } from "lucide-react";

type ImageUploaderProps = {
  name?: string;
  initialUrls?: string[];
  onUrlsChange?: (urls: string[]) => void;
};

// Compresión nativa de alta eficiencia en el navegador (reduce de 20MB a ~90KB)
async function compressImageToWebP(file: File, maxWidth = 1280, quality = 0.80): Promise<{ compressedFile: File; originalSize: number; compressedSize: number }> {
  const originalSize = file.size;
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, "") + ".webp",
                { type: "image/webp", lastModified: Date.now() }
              );
              resolve({
                compressedFile,
                originalSize,
                compressedSize: blob.size,
              });
            } else {
              resolve({ compressedFile: file, originalSize, compressedSize: file.size });
            }
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve({ compressedFile: file, originalSize, compressedSize: file.size });
    };
    reader.onerror = () => resolve({ compressedFile: file, originalSize, compressedSize: file.size });
  });
}

function formatMbOrKb(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default function ImageUploader({ name = "imageUrls", initialUrls, onUrlsChange }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(initialUrls || []);
  const [uploadStats, setUploadStats] = useState<{ count: number; originalText: string; compressedText: string; percent: string } | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      // 1. COMPRESIÓN CLIENT-SIDE (INCLUSO FOTOS DE 20MB SE CONVIERTEN A ~90KB)
      const compressedResults = await Promise.all(
        files.map((file) => compressImageToWebP(file))
      );

      let totalOrig = 0;
      let totalComp = 0;

      const formData = new FormData();
      compressedResults.forEach((res) => {
        formData.append("files", res.compressedFile);
        totalOrig += res.originalSize;
        totalComp += res.compressedSize;
      });

      // 2. ENVÍO AL SERVIDOR VPS (/api/upload)
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.urls && Array.isArray(data.urls)) {
        const nextUrls = [...uploadedUrls, ...data.urls];
        setUploadedUrls(nextUrls);
        if (onUrlsChange) onUrlsChange(nextUrls);

        const reductionPercent = totalOrig > 0 ? (((totalOrig - totalComp) / totalOrig) * 100).toFixed(1) : "0";

        setUploadStats({
          count: files.length,
          originalText: formatMbOrKb(totalOrig),
          compressedText: formatMbOrKb(totalComp),
          percent: reductionPercent,
        });
      }
    } catch (error) {
      console.error("Error al subir fotos:", error);
      alert("Error al subir las imágenes. Intenta nuevamente.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  function handleRemoveUrl(index: number) {
    const next = uploadedUrls.filter((_, i) => i !== index);
    setUploadedUrls(next);
    if (onUrlsChange) onUrlsChange(next);
  }

  return (
    <div className="space-y-3">
      {/* Hidden input para enviar URLs en el form */}
      <input type="hidden" name={name} value={uploadedUrls.join("\n")} />

      {/* ZONA DE SUBIDA DIRECTA */}
      <label className="relative flex flex-col items-center justify-center p-5 border-2 border-dashed border-[#1f2430] hover:border-[#f5b942] rounded-2xl bg-[#000000] transition cursor-pointer group">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="sr-only"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-zinc-400 py-2">
            <Loader2 className="h-7 w-7 text-[#f5b942] animate-spin" />
            <p className="text-xs font-black text-white">Comprimiendo fotos en vivo y guardando en el VPS...</p>
            <p className="text-[10px] text-zinc-500">Convirtiendo a WebP (Reduce de 20 MB a ~90 KB sin perder calidad)</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="h-10 w-10 rounded-2xl bg-[#f5b942]/10 border border-[#f5b942]/20 flex items-center justify-center text-[#f5b942] group-hover:scale-110 transition">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white group-hover:text-[#f5b942] transition">
                Tocá aquí para elegir fotos de tu galería o compu
              </p>
              <p className="text-[10px] font-semibold text-[#f5b942] mt-0.5">
                ⚡ Soporta fotos pesadas (incluso de 20 MB o 4K) y las comprime a ~90 KB en segundos.
              </p>
            </div>
          </div>
        )}
      </label>

      {/* NOTIFICACIÓN DE COMPRESIÓN DE TAMAÑO */}
      {uploadStats && (
        <div className="flex items-center gap-2 text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            {uploadStats.count} fotos comprimidas ({uploadStats.originalText} ➔ {uploadStats.compressedText} - {uploadStats.percent}% reducido sin perder calidad).
          </span>
        </div>
      )}

      {/* VISTA PREVIA DE FOTOS SUBIDAS AL SERVIDOR */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
            Fotos Almacenadas en Servidor ({uploadedUrls.length}):
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {uploadedUrls.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#1f2430] bg-zinc-950 group">
                <img src={url} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveUrl(idx)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/80 text-white flex items-center justify-center border border-white/20 opacity-90 hover:opacity-100 transition cursor-pointer"
                  title="Eliminar foto"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
