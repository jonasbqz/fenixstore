"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
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
  ZoomIn,
  ZoomOut,
  Maximize2,
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
  sellerId?: string;
  sellerName?: string;
  sellerWhatsapp?: string;
  sellerAvatarColor?: string;
  sellerAvatarIcon?: string;
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
          ✓ Se Entrega
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
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  if (!account) return null;

  const priceValue = account.publicPriceCents / 100;
  const priceFormatted = Number.isInteger(priceValue)
    ? `${priceValue} USDT / €`
    : `${priceValue.toFixed(2)} USDT / €`;

  const isPartial = account.accessType === "PARTIAL_ACCESS";
  const photos = account.imageUrls && account.imageUrls.length > 0
    ? account.imageUrls
    : ["/lobby_fallback.png"];

  const targetWhatsapp = account.sellerWhatsapp?.replace(/[^\d]/g, "") || whatsappNumber;
  const sellerGreeting = account.sellerName ? `Hola *${account.sellerName}*` : "Hola Fénix";
  const buyMessage = `${sellerGreeting}! Me interesa comprar la cuenta de CODM código ${account.publicCode} (${priceFormatted}). ¿Cómo coordinamos el pago?`;
  const buyWhatsappUrl = `https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(buyMessage)}`;

  function handleZoomIn() {
    setZoomScale((prev) => Math.min(prev + 0.5, 3.5));
  }

  function handleZoomOut() {
    setZoomScale((prev) => Math.max(prev - 0.5, 1));
  }

  return (
    <>
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
                
                {/* GALERÍA DE FOTOS CON BOTÓN DE ZOOM FULLSCREEN */}
                <div className="space-y-2">
                  <div 
                    onClick={() => {
                      setZoomScale(1);
                      setIsZoomOpen(true);
                    }}
                    className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black border border-[#1f2430] group flex items-center justify-center cursor-zoom-in"
                  >
                    <img
                      src={photos[selectedPhotoIndex] || photos[0]}
                      alt={`Foto ${selectedPhotoIndex + 1} de ${account.publicCode}`}
                      className="h-full w-full object-contain bg-black transition-all duration-300"
                    />
                    
                    {/* BOTÓN INDICADOR DE ZOOM PARA CELULARES */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomScale(1);
                        setIsZoomOpen(true);
                      }}
                      className="absolute top-2.5 right-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[10px] font-black text-white flex items-center gap-1.5 hover:bg-[#f5b942] hover:text-black transition shadow-lg z-20"
                    >
                      <Maximize2 className="h-3 w-3 text-[#f5b942]" />
                      <span>🔍 Tocar para Zoom / Pantalla Completa</span>
                    </button>

                    {photos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPhotoIndex((prev) =>
                              prev === 0 ? photos.length - 1 : prev - 1
                            );
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-[#f5b942] hover:text-black transition cursor-pointer z-10"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPhotoIndex((prev) =>
                              prev === photos.length - 1 ? 0 : prev + 1
                            );
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-[#f5b942] hover:text-black transition cursor-pointer z-10"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* THUMBNAILS DE FOTOS DE LA GALERÍA */}
                  {photos.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                      {photos.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPhotoIndex(idx)}
                          className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                            selectedPhotoIndex === idx
                              ? "border-[#f5b942] scale-105"
                              : "border-[#1f2430] opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Miniatura ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* PRECIO Y ESTADO DE ACCESO */}
                <div className="flex items-center justify-between rounded-2xl bg-zinc-900/60 border border-[#1f2430] p-3.5">
                  <div>
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                      Precio Oficial
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#f5b942]">
                      {priceFormatted}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                      Modalidad de Entrega
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black ${
                        isPartial
                          ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                          : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      }`}
                    >
                      {isPartial ? "🔓 Acceso Parcial" : "🔒 Full Acceso"}
                    </span>
                  </div>
                </div>

                {/* MÍTICAS Y LEGENDARIAS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#ff2a40]/30 bg-[#ff2a40]/10 p-3 text-center">
                    <span className="text-[10px] font-black uppercase text-[#ff2a40] tracking-wider block">
                      Armas Míticas
                    </span>
                    <span className="text-xl font-black text-white mt-0.5 block">
                      🔥 {account.mythicsCount}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-[#ff9900]/30 bg-[#ff9900]/10 p-3 text-center">
                    <span className="text-[10px] font-black uppercase text-[#ff9900] tracking-wider block">
                      Armas Legendarias
                    </span>
                    <span className="text-xl font-black text-white mt-0.5 block">
                      ⭐ {account.legendariesCount}
                    </span>
                  </div>
                </div>

                {/* DETALLE DE VINCULACIONES DE REDES SOCIALES */}
                <div className="rounded-2xl bg-zinc-900/60 border border-[#1f2430] p-3.5 space-y-2.5">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                    Vinculaciones de la Cuenta
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="flex flex-col gap-1 p-2 rounded-xl bg-black/40 border border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400">Activision</span>
                      {renderStatusBadge("ENTREGADO")}
                    </div>
                    <div className="flex flex-col gap-1 p-2 rounded-xl bg-black/40 border border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400">Facebook</span>
                      {renderStatusBadge(account.bindings?.facebook)}
                    </div>
                    <div className="flex flex-col gap-1 p-2 rounded-xl bg-black/40 border border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400">Google</span>
                      {renderStatusBadge(account.bindings?.google)}
                    </div>
                    <div className="flex flex-col gap-1 p-2 rounded-xl bg-black/40 border border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400">Apple ID</span>
                      {renderStatusBadge(account.bindings?.apple)}
                    </div>
                  </div>
                </div>

                {/* DESCRIPCIÓN COMPLETA */}
                <div className="space-y-1.5 rounded-2xl bg-zinc-900/60 border border-[#1f2430] p-3.5">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                    Descripción del Vendedor
                  </span>
                  <p className="text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed">
                    {account.description}
                  </p>
                </div>

              </div>

              {/* PIE DE PÁGINA CON BOTÓN DE COMPRAR EN WHATSAPP */}
              <div className="border-t border-[#1f2430] pt-3 shrink-0">
                <a
                  href={buyWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 w-full rounded-2xl bg-[#25d366] hover:bg-[#20bd5a] text-xs font-black text-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <MessageSquare className="h-5 w-5 fill-current" />
                  <span>Comprar Cuenta por WhatsApp</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* VISOR MODAL DE PANTALLA COMPLETA CON ZOOM PARA CELULARES */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-3 select-none touch-none"
          >
            {/* CABECERA VISOR ZOOM */}
            <div className="flex items-center justify-between z-10 px-2 py-1">
              <span className="text-xs font-black text-[#f5b942] uppercase tracking-wider">
                🔍 Visor Zoom ({selectedPhotoIndex + 1} / {photos.length})
              </span>

              {/* CONTROLES DE ZOOM */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="h-9 px-3 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-bold text-white flex items-center gap-1 hover:bg-zinc-700"
                >
                  <ZoomIn className="h-4 w-4 text-[#f5b942]" />
                  <span>Zoom +</span>
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="h-9 px-3 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-bold text-white flex items-center gap-1 hover:bg-zinc-700"
                >
                  <ZoomOut className="h-4 w-4 text-zinc-300" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(false)}
                  className="h-9 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-black text-white flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  <span>Cerrar</span>
                </button>
              </div>
            </div>

            {/* FOTO CON PINCH ZOOM / SCALE */}
            <div 
              className="relative flex-1 w-full overflow-auto flex items-center justify-center p-2 cursor-grab active:cursor-grabbing"
              onClick={handleZoomIn}
            >
              <motion.img
                src={photos[selectedPhotoIndex] || photos[0]}
                alt="Imagen Ampliada"
                style={{ scale: zoomScale }}
                className="max-h-[82vh] max-w-full object-contain transition-transform duration-200"
              />
            </div>

            {/* CONTROLES NAVEGACIÓN GALERÍA EN ZOOM */}
            <div className="flex items-center justify-between z-10 px-2 py-1">
              {photos.length > 1 ? (
                <div className="flex items-center justify-between w-full">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPhotoIndex((prev) =>
                        prev === 0 ? photos.length - 1 : prev - 1
                      )
                    }
                    className="h-10 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-white flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Anterior
                  </button>
                  <span className="text-xs font-mono text-zinc-400">
                    Pellizcá o tocá la foto para ampliar
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPhotoIndex((prev) =>
                        prev === photos.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="h-10 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-white flex items-center gap-1"
                  >
                    Siguiente <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full text-center text-xs font-mono text-zinc-400">
                  Tocá la imagen para ampliar hasta 3x
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
