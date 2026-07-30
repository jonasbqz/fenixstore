"use client";

import Link from "next/link";
import {
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Headphones,
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

export default function SoportePage() {
  const directWhatsappUrl = `https://wa.me/${storeWhatsappNumber}?text=${encodeURIComponent(
    "Hola Fénix! Necesito soporte directo del Administrador."
  )}`;

  const features = [
    {
      icon: MessageSquare,
      iconBg: "bg-emerald-500/10 border-emerald-500/30",
      iconColor: "text-emerald-400",
      title: "Atención Directa 1 a 1 por WhatsApp",
      text: "Sin bots ni sistemas automáticos. Hablás directamente con el Administrador Oficial (+351 920 331 564) para resolver dudas de compras, datos o asesoramiento.",
    },
    {
      icon: Clock,
      iconBg: "bg-[#f5b942]/10 border-[#f5b942]/30",
      iconColor: "text-[#f5b942]",
      title: "Respuesta Rápida y Personalizada",
      text: "Atendemos consultas todos los días en horario continuo para acompañarte en el proceso de elección y entrega en vivo de tu cuenta de CODM.",
    },
    {
      icon: ShieldCheck,
      iconBg: "bg-blue-500/10 border-blue-500/30",
      iconColor: "text-blue-400",
      title: "Asistencia de Configuración y Seguridad",
      text: "Te guiamos paso a paso para vincular tu propio correo electrónico a la cuenta de Activision, cambiar la contraseña y verificar los ítems dentro del juego.",
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <Headphones className="h-3.5 w-3.5" />
              <span>Soporte Directo 24/7</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Soporte al <span className="text-[#f5b942]">Cliente</span>
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Atención 100% personalizada con el Administrador Oficial para asesoramiento de compras y entrega de credenciales.
            </p>
          </div>
        </section>

        {/* TARJETAS DE SERVICIO DE SOPORTE */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-4">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-[#1f2430] bg-[#090a0f] p-5 sm:p-6 space-y-3 hover:border-[#f5b942]/60 hover:bg-[#0d0f17] transition-all duration-200 shadow-xl"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center ${item.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <h3 className="text-base font-black text-white tracking-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-zinc-300 leading-relaxed pl-2 sm:pl-13">
                  {item.text}
                </p>
              </div>
            );
          })}

          {/* BANNER CTA DIRECTO DE SOPORTE */}
          <div className="mt-8 rounded-3xl bg-[#090a0f] border border-[#f5b942]/30 p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <h3 className="text-lg sm:text-xl font-black text-white">
              ¿Querés comunicarte de inmediato con el Admin?
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Hacé clic abajo para abrir un chat directo por WhatsApp con el número oficial (+351 920 331 564).
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <a
                href={directWhatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="h-12 px-6 rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-xs font-black text-white shadow-lg transition uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4.5 w-4.5" />
                <span>Hablar con el Administrador 💬</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
