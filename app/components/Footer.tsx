"use client";

import Link from "next/link";
import {
  Globe,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  FileText,
  Headphones,
  Lock,
} from "lucide-react";

const storeWhatsappNumber =
  process.env.NEXT_PUBLIC_STORE_WHATSAPP_NUMBER?.replace(/[^\d]/g, "") ||
  "351920331564";

const storeWhatsappGroupUrl =
  process.env.NEXT_PUBLIC_STORE_WHATSAPP_GROUP_URL ||
  "https://chat.whatsapp.com/F78McLwEexSFFpIhuQ7OSm?s=cl&p=i&mlu=0&ilr=0&amv=1";

export default function Footer() {
  const directWhatsappAdminUrl = `https://wa.me/${storeWhatsappNumber}?text=${encodeURIComponent(
    "Hola Fénix! Tengo una consulta sobre el catálogo de cuentas de CODM."
  )}`;

  return (
    <footer className="w-full border-t border-[#1f2430] bg-[#07080b] pt-8 pb-12 text-zinc-400 select-none">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. BARRA SUPERIOR: MÉTODOS DE PAGO REALES Y SELECTOR DE MONEDA */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1f2430]/80 pb-6">
          
          {/* BADGES DE MÉTODOS DE PAGO REALES */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-300">
            
            {/* BINANCE PAY */}
            <div className="h-7 px-2.5 rounded-lg bg-[#f0b90b]/15 border border-[#f0b90b]/40 text-[#f0b90b] flex items-center gap-1.5 font-black text-[10px] shadow-sm">
              <span className="h-3.5 w-3.5 rounded-full bg-[#f0b90b] text-black font-black flex items-center justify-center text-[8px]">
                ⯠
              </span>
              <span>Binance Pay</span>
            </div>

            {/* CRYPTO USDT TRC-20 */}
            <div className="h-7 px-2.5 rounded-lg bg-[#26a17b]/15 border border-[#26a17b]/40 text-[#26a17b] flex items-center gap-1.5 font-black text-[10px] shadow-sm">
              <span className="h-3.5 w-3.5 rounded-full bg-[#26a17b] text-white font-black flex items-center justify-center text-[8px]">
                ₮
              </span>
              <span>USDT (TRC-20)</span>
            </div>

            {/* PIX BRASIL */}
            <div className="h-7 px-2.5 rounded-lg bg-[#32bcad]/15 border border-[#32bcad]/40 text-[#32bcad] flex items-center gap-1.5 font-black text-[10px] shadow-sm">
              <span className="font-black text-[10px]">❖</span>
              <span>Pix (Brasil / Reais)</span>
            </div>

            {/* TRANSFERENCIA MEXICO (MXN) */}
            <div className="h-7 px-2.5 rounded-lg bg-[#006847]/20 border border-[#006847]/50 text-emerald-400 flex items-center gap-1.5 font-black text-[10px] shadow-sm">
              <span>🇲🇽</span>
              <span>Transferencia MXN</span>
            </div>

            {/* EUROS / USD / BANCOS */}
            <div className="h-7 px-2.5 rounded-lg bg-[#131622] border border-[#2a2f42] text-white flex items-center gap-1.5 font-black text-[10px] shadow-sm">
              <span>🏦</span>
              <span className="text-zinc-200">Euros (€) / USD ($)</span>
            </div>

            <span className="text-[11px] font-bold text-zinc-500 ml-1">Pagos directos al Admin</span>
          </div>

          {/* SELECTOR DE IDIOMA Y MONEDA */}
          <div className="h-8.5 px-3.5 rounded-xl bg-[#131622] border border-[#2a2f42] text-zinc-200 text-xs font-black flex items-center gap-2 shadow-inner cursor-pointer hover:border-[#f5b942] transition">
            <Globe className="h-3.5 w-3.5 text-[#f5b942]" />
            <span>Español | USDT - € - MXN</span>
          </div>

        </div>

        {/* 2. GRILLA ESTRUCTURADA DE 3 COLUMNAS SIMPLIFICADAS Y ÚNICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          
          {/* COLUMNA 1: MARCA Y REDES SOCIALES */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo_clean.png"
                alt="Fénix Store"
                className="h-8 w-8 object-contain group-hover:scale-105 transition"
              />
              <span className="text-xl font-extrabold text-white tracking-tight">
                Fénix <span className="text-[#f5b942]">Store</span>
              </span>
            </Link>

            <p className="text-xs font-semibold text-zinc-400 leading-relaxed max-w-xs">
              ¡Tienda gamer oficial de cuentas de CODM activa desde 2023 con venta directa del Administrador sin intermediarios!
            </p>

            {/* BOTONES DIRECTOS DE REDES SOCIALES */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={storeWhatsappGroupUrl}
                target="_blank"
                rel="noreferrer"
                className="h-8.5 px-3 rounded-xl bg-[#25d366]/15 border border-[#25d366]/30 text-[#25d366] font-bold flex items-center gap-1.5 hover:bg-[#25d366] hover:text-black transition"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-[11px]">Grupo WhatsApp</span>
              </a>

              <a
                href={directWhatsappAdminUrl}
                target="_blank"
                rel="noreferrer"
                className="h-8.5 px-3 rounded-xl bg-[#131622] border border-[#2a2f42] text-zinc-300 font-bold flex items-center gap-1.5 hover:border-[#f5b942] hover:text-[#f5b942] transition"
              >
                <ShieldCheck className="h-4 w-4 text-[#f5b942]" />
                <span className="text-[11px]">Admin Directo</span>
              </a>
            </div>

            {/* BADGE DE VERIFICACIÓN */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#131622] border border-[#2a2f42] text-[10px] font-extrabold text-emerald-400">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>Tienda Oficial Verificada desde 2023 🛡️</span>
              </div>
            </div>
          </div>

          {/* COLUMNA 2: NAVEGACIÓN Y APARTADOS ÚNICOS */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Apartados del Sitio
            </h4>
            <ul className="space-y-2.5 font-bold text-zinc-400">
              <li>
                <Link href="/faq" className="hover:text-[#f5b942] transition flex items-center gap-2">
                  <HelpCircle className="h-3.5 w-3.5 text-[#f5b942]" />
                  <span>Preguntas Frecuentes</span>
                </Link>
              </li>
              <li>
                <Link href="/garantia" className="hover:text-[#f5b942] transition flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Garantía & Entrega Segura</span>
                </Link>
              </li>
              <li>
                <Link href="/normativas" className="hover:text-[#f5b942] transition flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-amber-400" />
                  <span>Normativas de la Comunidad</span>
                </Link>
              </li>
              <li>
                <Link href="/soporte" className="hover:text-[#f5b942] transition flex items-center gap-2">
                  <Headphones className="h-3.5 w-3.5 text-blue-400" />
                  <span>Soporte Directo 24/7</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMNA 3: ATENCIÓN AL CLIENTE Y ACCESO ADMIN */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Atención & Administración
            </h4>
            <ul className="space-y-2.5 font-bold text-zinc-400">
              <li>
                <a
                  href={directWhatsappAdminUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#25d366] transition flex items-center gap-2"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-[#25d366]" />
                  <span>Contacto Directo (+351 920 331 564)</span>
                </a>
              </li>
              <li>
                <a
                  href={storeWhatsappGroupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#f5b942] transition flex items-center gap-2"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-[#f5b942]" />
                  <span>Unirse a la Comunidad Oficial</span>
                </a>
              </li>
              <li className="pt-2 border-t border-[#1f2430]/60">
                <Link
                  href="/admin"
                  className="hover:text-[#f5b942] transition flex items-center gap-2 text-zinc-300 font-extrabold"
                >
                  <Lock className="h-3.5 w-3.5 text-[#f5b942]" />
                  <span>Acceso Panel Administrador</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* 3. DERECHOS RESERVADOS */}
        <div className="border-t border-[#1f2430]/80 pt-6 text-center text-[11px] font-semibold text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2023 - 2026 Fénix Store. Todos los derechos reservados. Venta directa respaldada por el Administrador (+351 920 331 564).</p>
          <div className="flex items-center gap-4 text-zinc-400 font-bold">
            <Link href="/garantia" className="hover:text-[#f5b942] transition">Privacidad</Link>
            <span>•</span>
            <Link href="/normativas" className="hover:text-[#f5b942] transition">Términos</Link>
            <span>•</span>
            <Link href="/soporte" className="hover:text-[#f5b942] transition">Soporte</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
