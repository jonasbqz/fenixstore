"use client";

import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  UserCheck,
  MessageSquare,
  Users,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import HeaderGroupButton from "../components/HeaderGroupButton";
import Footer from "../components/Footer";

const storeWhatsappNumber =
  process.env.NEXT_PUBLIC_STORE_WHATSAPP_NUMBER?.replace(/[^\d]/g, "") ||
  "351920331564";

const storeWhatsappGroupUrl =
  process.env.NEXT_PUBLIC_STORE_WHATSAPP_GROUP_URL ||
  "https://chat.whatsapp.com/F78McLwEexSFFpIhuQ7OSm?s=cl&p=i&mlu=0&ilr=0&amv=1";

export default function NormativasPage() {
  const directWhatsappUrl = `https://wa.me/${storeWhatsappNumber}?text=${encodeURIComponent(
    "Hola Fénix! Tengo una consulta sobre las reglas del grupo de WhatsApp."
  )}`;

  const rules = [
    {
      icon: UserCheck,
      iconBg: "bg-[#f5b942]/10 border-[#f5b942]/30",
      iconColor: "text-[#f5b942]",
      title: "1. Exclusividad del Administrador",
      text: "En Fénix Store no hay revendedores ni intermediarios externos. El 100% de las cuentas publicadas pertenecen al Administrador Oficial (+351 920 331 564). Está estrictamente prohibido promocionar cuentas de terceros en la comunidad.",
    },
    {
      icon: ShieldCheck,
      iconBg: "bg-blue-500/10 border-blue-500/30",
      iconColor: "text-blue-400",
      title: "2. Prevención de Suplantación de Identidad",
      text: "Verificá siempre que estés hablando con el número autorizado (+351 920 331 564). Ningún miembro del equipo te escribirá por privado solicitando contraseñas o pagos ajenos a las cuentas oficiales de la tienda.",
    },
    {
      icon: AlertTriangle,
      iconBg: "bg-amber-500/10 border-amber-500/30",
      iconColor: "text-amber-400",
      title: "3. Respeto y Cero Spam en el Grupo",
      text: "Mantenemos una comunidad sana e informada. Prohibido enviar enlaces externos, publicidad ajena, contenido ofensivo o spam masivo. Quien incumpla esta regla será removido inmediatamente del grupo.",
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10 border-emerald-500/30",
      iconColor: "text-emerald-400",
      title: "4. Coordinación Directa de Compras",
      text: "Al elegir una cuenta en el catálogo web, tocá en 'Comprar Cuenta' para iniciar la conversación directamente con el Administrador. El proceso de pago y traspaso de datos se realiza en vivo con asistencia personalizada.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0b0c0e] text-white flex flex-col justify-between select-none">
      <div>
        {/* HEADER FIJO CON VOLVER, INTERRUPTOR DE TEMA Y GRUPO */}
        <header className="sticky top-0 z-40 bg-[#0b0c0e]/95 backdrop-blur-md border-b border-[#1f2430] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="mx-auto max-w-5xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="h-9 px-3 rounded-xl bg-[#090a0f] border border-[#1f2430] text-xs font-black text-zinc-300 hover:text-[#f5b942] hover:border-[#f5b942] transition flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-[#f5b942]" />
                <span className="hidden sm:inline">Catálogo</span>
              </Link>
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/logo_clean.png"
                  alt="Fénix Store"
                  className="h-7 w-7 object-contain"
                />
                <span className="text-base font-extrabold text-white tracking-tight hidden xs:inline">
                  Fénix <span className="text-[#f5b942]">Store</span>
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <HeaderGroupButton groupUrl={storeWhatsappGroupUrl} />
            </div>
          </div>
        </header>

        {/* HERO HEADER ADAPTATIVO */}
        <section className="relative border-b border-[#1f2430] bg-[#07080b] py-12 px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f5b942]/15 border border-[#f5b942]/40 text-[#f5b942] text-xs font-black uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5" />
              <span>Reglas Oficiales</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Normativas de la <span className="text-[#f5b942]">Comunidad</span>
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Reglas de convivencia en el Grupo de WhatsApp y normas de seguridad en la compra directa.
            </p>
          </div>
        </section>

        {/* LISTADO DE NORMATIVAS CON ICONOS VECTORIALES */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-4">
          {rules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-[#1f2430] bg-[#090a0f] p-5 sm:p-6 space-y-3 hover:border-[#f5b942]/60 hover:bg-[#0d0f17] transition-all duration-200 shadow-xl"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center ${rule.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${rule.iconColor}`} />
                  </div>
                  <h3 className="text-base font-black text-white tracking-tight">
                    {rule.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-zinc-300 leading-relaxed pl-2 sm:pl-13">
                  {rule.text}
                </p>
              </div>
            );
          })}

          {/* BANNER CTA FLOTANTE */}
          <div className="mt-8 rounded-3xl bg-[#090a0f] border border-[#f5b942]/30 p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <h3 className="text-lg sm:text-xl font-black text-white">
              ¿Querés formar parte del Grupo Oficial?
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Unite hoy a la comunidad oficial de WhatsApp con más de 1.000 clientes activos en compra y venta.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <a
                href={storeWhatsappGroupUrl}
                target="_blank"
                rel="noreferrer"
                className="h-11 px-5 rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-xs font-black text-white shadow-lg transition uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Users className="h-4 w-4" />
                <span>Unirse al Grupo Oficial</span>
              </a>
              <a
                href={directWhatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="h-11 px-5 rounded-xl bg-[#0d0f17] border border-[#1f2430] hover:border-[#f5b942] text-xs font-black text-zinc-300 hover:text-[#f5b942] transition uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-[#f5b942]" />
                <span>Hablar con el Admin</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
