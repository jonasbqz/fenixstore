"use client";

import { useState } from "react";
import Link from "next/link";
import AccountModal, { type ModalAccount } from "./AccountModal";
import {
  Flame,
  Star,
  Camera,
  Globe,
  Lock,
  Unlock,
  Search,
  MessageSquare,
  PlusCircle,
} from "lucide-react";

type CatalogViewProps = {
  catalog: ModalAccount[];
  whatsappNumber: string;
};

function SafeCardImage({ src, alt }: { src?: string; alt: string }) {
  const [imageSrc, setImageSrc] = useState(src || "/lobby_fallback.png");

  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={() => {
        if (imageSrc !== "/lobby_fallback.png") {
          setImageSrc("/lobby_fallback.png");
        }
      }}
      className="h-full w-full object-contain p-0.5 transition-transform duration-500 group-hover/img:scale-105"
    />
  );
}

export default function CatalogView({ catalog, whatsappNumber }: CatalogViewProps) {
  const [selectedAccountModal, setSelectedAccountModal] = useState<ModalAccount | null>(null);

  if (catalog.length === 0) {
    const directWhatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      "Hola Fénix! Quisiera consultar sobre las cuentas disponibles en venta."
    )}`;

    return (
      <div className="rounded-3xl border border-[#1f2430] bg-[#090a0f] p-8 sm:p-12 text-center shadow-2xl space-y-4">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#f5b942]/10 border border-[#f5b942]/30 flex items-center justify-center text-[#f5b942]">
          <Search className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
            Catálogo listo para publicaciones reales
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-zinc-400 max-w-md mx-auto leading-relaxed">
            No hay publicaciones en este momento o podés consultar directamente al Administrador Oficial por WhatsApp para asesoramiento en vivo.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <a
            href={directWhatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="h-11 px-5 rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-xs font-black text-white shadow-lg transition uppercase tracking-wider flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Consultar Cuentas por WhatsApp</span>
          </a>

          <Link
            href="/admin"
            className="h-11 px-5 rounded-xl bg-[#131622] border border-[#2a2f42] hover:border-[#f5b942] text-xs font-black text-zinc-300 hover:text-white transition uppercase tracking-wider flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4 text-[#f5b942]" />
            <span>Publicar Cuentas (Panel Admin)</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* GRILLA ESTILO WALLAPOP / MARKETPLACE (2 COLUMNAS EN CELULARES, 3-4 EN DESKTOP) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
        {catalog.map((account) => {
          const photoCount = account.imageUrls?.length || 1;
          const mainWeaponItem = account.items?.find((i) => i.name.toLowerCase().includes("mítica") || i.name.toLowerCase().includes("leyenda"))?.name;
          
          const priceFormatted = `${account.publicPriceCents / 100} USDT / €`;
          const whatsappMessage = `Hola Fénix! Vengo a comprar la cuenta de CODM código ${account.publicCode} (${priceFormatted}). ¿Cómo coordinamos el pago?`;
          const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

          const isFullAccess = account.accessType === "FULL_ACCESS";

          return (
            <article
              key={account.id}
              onClick={() => setSelectedAccountModal(account)}
              className="overflow-hidden rounded-2xl bg-[#0d0f17] border border-[#1f2430] hover:border-[#f5b942]/70 transition-all duration-300 flex flex-col justify-between group shadow-xl cursor-pointer select-none"
            >
              {/* 1. IMAGEN PRINCIPAL (ESTILO WALLAPOP 4:3) */}
              <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden group/img">
                <SafeCardImage 
                  src={account.imageUrls[0]} 
                  alt={`Cuenta CODM ${account.publicCode}`} 
                />

                {/* OVERLAY DE INSIGNIAS SUPERIORES */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none z-10">
                  <span className="rounded-lg bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">
                    {account.publicCode}
                  </span>

                  {account.mythicsCount > 0 ? (
                    <span className="rounded-lg bg-[#ff2a40]/90 backdrop-blur-md border border-[#ff2a40]/40 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Flame className="h-3 w-3 fill-white" />
                      <span>{account.mythicsCount} Mít.</span>
                    </span>
                  ) : (
                    <span className="rounded-lg bg-[#ff9900]/90 backdrop-blur-md border border-[#ff9900]/40 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Star className="h-3 w-3 fill-white" />
                      <span>{account.legendariesCount} Leg.</span>
                    </span>
                  )}
                </div>

                {/* INSIGNIA PRECIO Y FOTOS */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
                  <span className="rounded-xl bg-black/90 backdrop-blur-md border border-[#f5b942]/50 px-2.5 py-1 text-xs font-black text-[#f5b942] shadow-lg">
                    {priceFormatted}
                  </span>

                  <span className="rounded-lg bg-black/70 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-zinc-300 flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    <span>{photoCount} fotos</span>
                  </span>
                </div>
              </div>

              {/* 2. CUERPO DE DETALLES RÁPIDOS */}
              <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-black text-white tracking-tight line-clamp-1 group-hover:text-[#f5b942] transition">
                    Cuenta CODM {account.publicCode}
                  </h3>
                  <p className="text-[11px] font-semibold text-zinc-400 line-clamp-1">
                    {mainWeaponItem || account.description.split("\n")[0]}
                  </p>
                </div>

                {/* CHIPS DE REGIÓN Y TIPO DE ACCESO */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="inline-flex items-center gap-1 rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-extrabold text-zinc-300">
                    <Globe className="h-3 w-3 text-emerald-400" />
                    <span>
                      {account.region === "LATAM_10CP"
                        ? "LATAM 10 CP"
                        : account.region === "INDIA_10CP"
                        ? "India 10 CP"
                        : account.region === "LATAM_GLOBAL"
                        ? "LATAM 20 CP"
                        : "USA/EU 30 CP"}
                    </span>
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-extrabold ${
                      isFullAccess
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {isFullAccess ? (
                      <Unlock className="h-3 w-3" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                    <span>{isFullAccess ? "Full Acceso" : "Acceso Parcial"}</span>
                  </span>
                </div>

                {/* BOTÓN COMPRAR EN CUADRO */}
                <div className="pt-1">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-9 rounded-xl bg-[#f5b942] hover:bg-[#e0a430] text-[11px] font-black text-[#0b0c0e] flex items-center justify-center gap-1.5 shadow-gold-glow transition uppercase tracking-wider cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5 fill-[#0b0c0e]" />
                    <span>Comprar Cuenta</span>
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <AccountModal
        account={selectedAccountModal}
        onClose={() => setSelectedAccountModal(null)}
        whatsappNumber={whatsappNumber}
      />
    </>
  );
}
