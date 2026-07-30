"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import {
  Flame,
  Star,
  ShieldCheck,
  Globe,
  MessageSquare,
  X,
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
  region?: string;
  accessType?: "FULL_ACCESS" | "PARTIAL_ACCESS";
  bindings?: AccessBindings;
  level?: number;
  rank?: string;
  mythicsCount: number;
  mythicsMaxCount?: number;
  legendariesCount: number;
  epicsCount: number;
  items?: Array<{
    id: string;
    name: string;
    type: "ARMA" | "PERSONAJE" | "PASE" | "SKIN" | "OTRO";
  }>;
};

type AccountModalProps = {
  account: ModalAccount | null;
  onClose: () => void;
  whatsappNumber: string;
};

function renderStatusBadge(status?: BindingStatus) {
  switch (status) {
    case "ENTREGADO":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black text-emerald-400">
          ✓ Entregado
        </span>
      );
    case "ELIMINADO":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black text-amber-400">
          ⚠️ Eliminado
        </span>
      );
    case "INACCESIBLE":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[10px] font-black text-red-400">
          ❌ Inaccesible
        </span>
      );
    case "LIBRE":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-black text-blue-400">
          🔓 Libre
        </span>
      );
  }
}

export default function AccountModal({
  account,
  onClose,
  whatsappNumber,
}: AccountModalProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!account) return null;

  const priceFormatted = `${account.publicPriceCents / 100} USDT / €`;

  const isPartial = account.accessType === "PARTIAL_ACCESS";
  const photos = account.imageUrls && account.imageUrls.length > 0
    ? account.imageUrls
    : ["/lobby_fallback.png"];

  const buyMessage = `Hola Fénix! Me interesa la cuenta de CODM código ${account.publicCode} (${priceFormatted}). ¿Cómo coordinamos el pago?`;
  const buyWhatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buyMessage)}`;

  return (
    <Dialog.Root open={!!account} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: "-48%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-48%" }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-xl max-h-[92vh] rounded-3xl border border-[#1f2430] bg-[#0d0f17] p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col space-y-4 outline-none overflow-hidden text-white select-none"
          >
            {/* CABECERA CON CÓDIGO Y BOTÓN CERRAR */}
            <div className="flex items-center justify-between border-b border-[#1f2430] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-[#f5b942]/15 border border-[#f5b942]/30 px-3 py-1 text-xs font-black text-[#f5b942] uppercase tracking-wider">
                  {account.publicCode}
                </span>
                <Dialog.Title className="text-sm sm:text-base font-black text-white">
                  Cuenta CODM {account.publicCode}
                </Dialog.Title>
              </div>

              <Dialog.Close asChild>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* CONTENIDO SCROLLABLE DE LA PUBLICACIÓN */}
            <div className="overflow-y-auto custom-scrollbar space-y-4 pr-1 flex-1">
              
              {/* GALERÍA DE FOTOS (CON INSPECCIÓN DE FOTO ENTERA COMPLETA UNCROPPED) */}
              <div className="space-y-2">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black border border-[#1f2430] group flex items-center justify-center">
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

                  <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-zinc-300 border border-white/10">
                    Foto {selectedPhotoIndex + 1} de {photos.length}
                  </div>
                </div>

                {/* THUMBNAILS MÚLTIPLES */}
                {photos.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                    {photos.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPhotoIndex(idx)}
                        className={`relative h-14 w-20 rounded-xl overflow-hidden border shrink-0 transition ${
                          selectedPhotoIndex === idx
                            ? "border-[#f5b942] ring-2 ring-[#f5b942]/30 scale-105"
                            : "border-[#1f2430] opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* BANNER DE PRECIO Y MÍTICAS */}
              <div className="rounded-2xl border border-[#f5b942]/30 bg-[#f5b942]/10 p-3.5 flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase block">Precio de la cuenta</span>
                  <span className="text-xl sm:text-2xl font-black text-[#f5b942] tracking-tight">
                    {priceFormatted}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {account.mythicsCount > 0 && (
                    <div className="rounded-xl bg-[#ff2a40]/20 border border-[#ff2a40]/40 px-3 py-1.5 text-center">
                      <span className="text-[9px] font-extrabold text-red-300 uppercase block">Armas Míticas</span>
                      <span className="text-xs font-black text-[#ff2a40] flex items-center justify-center gap-1">
                        <Flame className="h-3.5 w-3.5 fill-[#ff2a40]" />
                        <span>{account.mythicsCount}</span>
                      </span>
                    </div>
                  )}

                  {account.legendariesCount > 0 && (
                    <div className="rounded-xl bg-[#ff9900]/20 border border-[#ff9900]/40 px-3 py-1.5 text-center">
                      <span className="text-[9px] font-extrabold text-amber-300 uppercase block">Legendarias</span>
                      <span className="text-xs font-black text-[#ff9900] flex items-center justify-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-[#ff9900]" />
                        <span>{account.legendariesCount}</span>
                      </span>
                    </div>
                  )}
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
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block">Tipo de Acceso</span>
                  <span className="text-xs font-black text-white">
                    {isPartial ? "🔓 Acceso Parcial" : "🔒 Full Acceso"}
                  </span>
                </div>
              </div>

              {/* DETALLES Y DESCRIPCIÓN UNICA DE LA CUENTA */}
              <div className="space-y-1.5 bg-[#000000] p-4 rounded-2xl border border-[#1f2430] text-xs">
                <h4 className="font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#f5b942]" />
                  <span>Publicación Oficial & Descripción</span>
                </h4>
                <p className="text-zinc-300 leading-relaxed font-semibold whitespace-pre-line text-xs font-mono bg-[#090a0f] p-3 rounded-xl border border-[#1f2430]">
                  {account.description || "Cuenta de Call of Duty Mobile con vinculación de Activision verificada y garantizada por Fénix Store."}
                </p>
              </div>

            </div>

            {/* BOTONES DE COMPRA DIRECTA POR WHATSAPP */}
            <div className="border-t border-[#1f2430] pt-3.5 space-y-2 shrink-0">
              <a
                href={buyWhatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="h-12 w-full rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-xs font-black text-white shadow-lg transition duration-200 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4.5 w-4.5" />
                <span>Comprar Cuenta por WhatsApp</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
