"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import {
  Flame,
  Star,
  Camera,
  X,
  ShieldCheck,
  MessageSquare,
  Crosshair,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Lock,
} from "lucide-react";
import { type AccessBindings, type BindingStatus } from "../../lib/db/mockData";

export type ModalAccount = {
  id: string;
  publicCode: string;
  gameId: "CODM" | "FF" | "PUBG";
  publicPriceCents: number;
  description: string;
  imageUrls: string[];
  region: "LATAM_10CP" | "INDIA_10CP" | "LATAM_GLOBAL" | "USA_EU";
  accessType: "FULL_ACCESS" | "PARTIAL_ACCESS";
  bindings?: AccessBindings;
  level: number;
  mythicsCount: number;
  mythicsMaxCount?: number;
  legendariesCount: number;
  epicsCount: number;
  items: Array<{
    id: string;
    name: string;
    type: string;
  }>;
};

type AccountModalProps = {
  account: ModalAccount | null;
  onClose: () => void;
  whatsappNumber: string;
};

export default function AccountModal({
  account,
  onClose,
  whatsappNumber,
}: AccountModalProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!account) return null;

  const priceFormatted = `${account.publicPriceCents / 100} USDT / €`;
  const whatsappMessage = `Hola Fénix! Vengo a comprar la cuenta de CODM código ${account.publicCode} (${priceFormatted}). ¿Cómo coordinamos el pago?`;
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const photos = account.imageUrls.length > 0
    ? account.imageUrls
    : ["/lobby_fallback.png"];

  const isPartial = account.accessType === "PARTIAL_ACCESS";

  function renderStatusBadge(status?: BindingStatus) {
    if (status === "ENTREGADO") {
      return <span className="text-[11px] font-black text-emerald-400 block mt-0.5">✅ Se Entrega</span>;
    }
    if (status === "ELIMINADO") {
      return <span className="text-[11px] font-black text-amber-400 block mt-0.5">🗑️ Eliminado</span>;
    }
    if (status === "INACCESIBLE") {
      return <span className="text-[11px] font-black text-red-400 block mt-0.5">❌ Inaccesible</span>;
    }
    return <span className="text-[11px] font-black text-zinc-400 block mt-0.5">🔓 Libre</span>;
  }

  return (
    <Dialog.Root open={Boolean(account)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        {/* Backdrop con Blur */}
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md"
          />
        </Dialog.Overlay>

        {/* Modal estilo Wallapop / Marketplace Centrado 100% */}
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: "-48%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-48%" }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-2xl max-h-[90vh] rounded-3xl border border-[#f5b942]/30 bg-[#090a0f] p-4 sm:p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col space-y-4 outline-none overflow-hidden"
          >
            {/* 1. CABECERA TIPO WALLAPOP */}
            <div className="flex items-center justify-between border-b border-[#1f2430] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-[#000000] border border-[#f5b942]/30 px-3 py-1 text-xs sm:text-sm font-black text-[#f5b942]">
                  {account.publicCode}
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-300">
                  Call of Duty Mobile
                </span>
              </div>

              <Dialog.Close asChild>
                <button
                  type="button"
                  className="h-8 w-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* CONTENIDO SCROLLABLE DE LA PUBLICACIÓN */}
            <div className="overflow-y-auto custom-scrollbar space-y-4 pr-1 flex-1">
              
              {/* GALERÍA DE FOTOS ESTILO MARKETPLACE CON MULTI-IMÁGENES */}
              <div className="space-y-2">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-950 border border-[#1f2430] group">
                  <img
                    src={photos[selectedPhotoIndex] || photos[0]}
                    alt={`Foto ${selectedPhotoIndex + 1} de ${account.publicCode}`}
                    className="h-full w-full object-contain bg-black transition-all duration-300"
                  />
                  
                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                        }}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/80 border border-white/10 text-white flex items-center justify-center hover:bg-black transition cursor-pointer"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/80 border border-white/10 text-white flex items-center justify-center hover:bg-black transition cursor-pointer"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/85 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-zinc-300" />
                    <span>Foto {selectedPhotoIndex + 1} de {photos.length}</span>
                  </div>
                </div>

                {/* MINIATURAS DESLIZABLES */}
                {photos.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar touch-pan-x">
                    {photos.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPhotoIndex(idx)}
                        className={`relative h-12 w-20 shrink-0 overflow-hidden rounded-xl border transition cursor-pointer ${
                          selectedPhotoIndex === idx
                            ? "border-[#f5b942] ring-2 ring-[#f5b942]/40"
                            : "border-[#1f2430] opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SECCIÓN PRECIO Y FICHA TÉCNICA */}
              <div className="bg-[#000000] p-4 rounded-2xl border border-[#1f2430] space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">Precio de la cuenta</span>
                    <span className="text-2xl sm:text-3xl font-black text-[#f5b942]">{priceFormatted}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Vendedor Verificado</span>
                  </div>
                </div>

                {/* FICHA DE CARACTERÍSTICAS PRINCIPALES */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1f2430]">
                  <div className="bg-[#090a0f] p-2.5 rounded-xl border border-[#1f2430] text-center">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase block">Región (Ruleta)</span>
                    <span className="text-xs font-black text-white">
                      {account.region === "LATAM_10CP" && "🌎 LATAM (10 CP)"}
                      {account.region === "INDIA_10CP" && "🇮🇳 India (10 CP)"}
                      {account.region === "LATAM_GLOBAL" && "🌎 LATAM (20 CP)"}
                      {account.region === "USA_EU" && "🇺🇸 USA/EU (30 CP)"}
                      {!account.region && "Global"}
                    </span>
                  </div>

                  <div className="bg-[#090a0f] p-2.5 rounded-xl border border-[#1f2430] text-center">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase block">Armas Míticas</span>
                    <span className="text-xs font-black text-[#ff2a40]">
                      {account.mythicsCount} Míticas {account.mythicsMaxCount ? `(${account.mythicsMaxCount} MAX)` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* LISTA ULTRA-CLARA DE VINCULACIONES */}
              <div className="bg-[#000000] p-4 rounded-2xl border border-[#1f2430] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-[#f5b942]" />
                    <span>Estado de Vinculaciones</span>
                  </h4>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                    isPartial
                      ? "bg-red-500/10 text-red-400 border border-red-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {isPartial ? "🔓 Acceso Parcial" : "🔒 Full Acceso"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {/* Activision */}
                  <div className="bg-[#090a0f] p-2.5 rounded-xl border border-emerald-500/30 text-center">
                    <span className="text-[9px] font-bold text-zinc-400 block">Activision</span>
                    <span className="text-[11px] font-black text-emerald-400 block mt-0.5">✅ Se Entrega</span>
                  </div>

                  {/* Facebook */}
                  <div className={`bg-[#090a0f] p-2.5 rounded-xl border text-center ${
                    account.bindings?.facebook === "ENTREGADO" 
                      ? "border-emerald-500/30" 
                      : account.bindings?.facebook === "ELIMINADO"
                      ? "border-amber-500/30 bg-amber-950/10"
                      : account.bindings?.facebook === "INACCESIBLE"
                      ? "border-red-500/30 bg-red-950/10"
                      : "border-[#1f2430]"
                  }`}>
                    <span className="text-[9px] font-bold text-zinc-400 block">Facebook</span>
                    {renderStatusBadge(account.bindings?.facebook)}
                  </div>

                  {/* Google */}
                  <div className={`bg-[#090a0f] p-2.5 rounded-xl border text-center ${
                    account.bindings?.google === "ENTREGADO" 
                      ? "border-emerald-500/30" 
                      : account.bindings?.google === "ELIMINADO"
                      ? "border-amber-500/30 bg-amber-950/10"
                      : account.bindings?.google === "INACCESIBLE"
                      ? "border-red-500/30 bg-red-950/10"
                      : "border-[#1f2430]"
                  }`}>
                    <span className="text-[9px] font-bold text-zinc-400 block">Google</span>
                    {renderStatusBadge(account.bindings?.google)}
                  </div>

                  {/* Apple */}
                  <div className={`bg-[#090a0f] p-2.5 rounded-xl border text-center ${
                    account.bindings?.apple === "ENTREGADO" 
                      ? "border-emerald-500/30" 
                      : account.bindings?.apple === "ELIMINADO"
                      ? "border-amber-500/30 bg-amber-950/10"
                      : account.bindings?.apple === "INACCESIBLE"
                      ? "border-red-500/30 bg-red-950/10"
                      : "border-[#1f2430]"
                  }`}>
                    <span className="text-[9px] font-bold text-zinc-400 block">Apple ID</span>
                    {renderStatusBadge(account.bindings?.apple)}
                  </div>
                </div>
              </div>

              {/* DETALLES EN FORMATO PUBLICACIÓN DE WHATSAPP */}
              <div className="space-y-1.5 bg-[#000000] p-4 rounded-2xl border border-[#1f2430] text-xs">
                <h4 className="font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#f5b942]" />
                  <span>Publicación Oficial & Descripción</span>
                </h4>
                <p className="text-zinc-300 leading-relaxed font-semibold whitespace-pre-line text-xs font-mono bg-[#090a0f] p-3 rounded-xl border border-[#1f2430]">
                  {account.description || "Cuenta de Call of Duty Mobile con vinculación de Activision verificada y garantizada por Fénix Store."}
                </p>
              </div>

              {/* INVENTARIO DE ARMAS Y SKINS */}
              {account.items && account.items.length > 0 && (
                <div className="space-y-2 bg-[#000000] p-4 rounded-2xl border border-[#1f2430]">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Crosshair className="h-4 w-4 text-[#f5b942]" />
                    <span>Inventario Destacado ({account.items.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {account.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl bg-[#090a0f] px-3 py-2 border border-[#1f2430] text-[11px] font-bold text-zinc-300"
                      >
                        <span className="flex items-center gap-2">
                          {item.name.toLowerCase().includes("mítica") ? (
                            <Flame className="h-3.5 w-3.5 text-[#ff2a40]" />
                          ) : item.name.toLowerCase().includes("legendaria") ? (
                            <Star className="h-3.5 w-3.5 text-[#ff9900]" />
                          ) : (
                            <Crosshair className="h-3.5 w-3.5 text-zinc-400" />
                          )}
                          <span>{item.name}</span>
                        </span>
                        <span className="text-[9px] font-black text-zinc-500 uppercase bg-[#000000] px-2 py-0.5 rounded border border-white/5">
                          {item.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* BOTÓN COMPRAR CUENTA */}
            <div className="pt-2 shrink-0">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-xs sm:text-sm font-black text-white shadow-[0_0_20px_rgba(37,211,102,0.3)] transition duration-200 uppercase tracking-wider gap-2 cursor-pointer"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Comprar Cuenta</span>
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </a>
            </div>

          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
