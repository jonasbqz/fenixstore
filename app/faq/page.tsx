"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Search,
  ChevronDown,
  PackageCheck,
  CreditCard,
  ShieldCheck,
  Target,
  LockKeyhole,
  MessageSquare,
  Users,
  ArrowLeft,
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

interface FAQItem {
  id: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  question: string;
  answer: string;
  category: "entrega" | "pagos" | "seguridad" | "regiones" | "accesos";
}

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>("entrega");
  const [searchQuery, setSearchQuery] = useState("");

  const directWhatsappUrl = `https://wa.me/${storeWhatsappNumber}?text=${encodeURIComponent(
    "Hola Fénix! Tengo una consulta sobre el funcionamiento de la tienda."
  )}`;

  const faqs: FAQItem[] = [
    {
      id: "entrega",
      icon: PackageCheck,
      iconBg: "bg-emerald-500/10 border-emerald-500/30",
      iconColor: "text-emerald-400",
      question: "¿Cómo se realiza la entrega de una cuenta?",
      answer:
        "Todas las cuentas del catálogo pertenecen 100% al dueño y administrador oficial de Fénix Store. Una vez realizado el pago, coordinamos por WhatsApp la entrega inmediata del correo de Activision y la contraseña. Te guiamos paso a paso en vivo para que cambies los accesos y asegures tu cuenta al 100%.",
      category: "entrega",
    },
    {
      id: "pagos",
      icon: CreditCard,
      iconBg: "bg-[#f5b942]/10 border-[#f5b942]/30",
      iconColor: "text-[#f5b942]",
      question: "¿Cuáles son los métodos de pago aceptados?",
      answer:
        "Aceptamos Binance Pay (USDT), Criptomonedas, Pix / Reais (Brasil), Zelle, Transferencias en Pesos Mexicanos (MXN), Euros (€), Dólares (USD) y múltiples medios de pago locales en LATAM. Si deseás abonar en tu moneda local, consultanos directamente por WhatsApp y coordinamos tu pago al instante.",
      category: "pagos",
    },
    {
      id: "seguridad",
      icon: ShieldCheck,
      iconBg: "bg-blue-500/10 border-blue-500/30",
      iconColor: "text-blue-400",
      question: "¿Es seguro comprar en Fénix Store?",
      answer:
        "Totalmente seguro. No trabajamos con vendedores externos ni intermediarios desconocidos: el 100% de las publicaciones pertenecen al Administrador Oficial. La transacción se realiza de persona a persona con respaldo total antes, durante y después de la entrega.",
      category: "seguridad",
    },
    {
      id: "regiones",
      icon: Target,
      iconBg: "bg-amber-500/10 border-amber-500/30",
      iconColor: "text-amber-400",
      question: "¿Qué significa la región de la cuenta (10 CP, 20 CP, 30 CP)?",
      answer:
        "Es el costo de la primera tirada de ruleta dentro de Call of Duty Mobile. Las cuentas con Ruleta de 10 CP (India o LATAM 10 CP) son las más cotizadas porque te permiten tirar ruletas completas y pases de batalla a una fracción del costo habitual.",
      category: "regiones",
    },
    {
      id: "accesos",
      icon: LockKeyhole,
      iconBg: "bg-purple-500/10 border-purple-500/30",
      iconColor: "text-purple-400",
      question: "¿Qué significa Full Acceso y Acceso Parcial?",
      answer:
        "En cuentas Full Acceso tenés control total: se entrega Activision completo y la gran mayoría o la totalidad del resto de redes (Facebook, Google, Apple ID) están 100% libres o bajo tu dominio. En cuentas de Acceso Parcial, la cuenta siempre posee alguna vinculación eliminada, inaccesible o perdida (ej. Facebook o Apple inactivo), pero con el acceso principal de Activision entregado y garantizado a un precio mucho más económico.",
      category: "accesos",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function toggleAccordion(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <main className="min-h-screen bg-[#0b0c0e] text-white flex flex-col justify-between">
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

        {/* HERO HEADER CON ADAPTACIÓN PERFECTA A MODO CLARO Y OSCURO */}
        <section className="relative border-b border-[#1f2430] bg-[#07080b] py-12 px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f5b942]/15 border border-[#f5b942]/40 text-[#f5b942] text-xs font-black uppercase tracking-wider">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Centro de Respuestas</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Preguntas <span className="text-[#f5b942]">Frecuentes</span>
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Resolvemos todas tus dudas sobre la entrega inmediata de cuentas, vinculaciones y métodos de pago oficiales.
            </p>

            {/* BARRA DE BÚSQUEDA INTERACTIVA */}
            <div className="pt-2 max-w-md mx-auto relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar duda (ej. ruleta, pago, acceso...)"
                className="h-11 w-full rounded-2xl border border-[#1f2430] bg-[#0d0f17] pl-10 pr-4 text-xs font-bold text-white outline-none focus:border-[#f5b942] transition placeholder:text-zinc-500 shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* LISTADO DE ACCORDEON INTERACTIVO CON ANIMACIONES */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-3xl border border-[#1f2430] bg-[#0d0f17] p-8 text-center space-y-3">
              <HelpCircle className="h-8 w-8 text-zinc-500 mx-auto" />
              <h3 className="text-sm font-black text-white">No encontramos preguntas sobre ese tema</h3>
              <p className="text-xs text-zinc-400">
                Probá buscando con otra palabra o consultá directamente al Administrador Oficial.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const Icon = faq.icon;
              const isOpen = openId === faq.id;

              return (
                <div
                  key={faq.id}
                  className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                    isOpen
                      ? "border-[#f5b942]/60 bg-[#0d0f17] shadow-xl"
                      : "border-[#1f2430] bg-[#090a0f] hover:border-[#1f2430]/90 hover:bg-[#0d0f17]/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center ${faq.iconBg}`}
                      >
                        <Icon className={`h-5 w-5 ${faq.iconColor}`} />
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                        {faq.question}
                      </h3>
                    </div>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 h-8 w-8 rounded-lg bg-[#090a0f] border border-[#1f2430] flex items-center justify-center text-zinc-400"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-4 pb-5 pt-1 sm:px-5 sm:pb-6 text-xs sm:text-sm font-semibold text-zinc-300 leading-relaxed border-t border-[#1f2430]/60 pl-4 sm:pl-16">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}

          {/* BANNER CTA FLOTANTE AL FINAL DE FAQ - CON ADAPTACIÓN PERFECTA DE COLOR */}
          <div className="mt-8 rounded-3xl bg-[#090a0f] border border-[#f5b942]/30 p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <h3 className="text-lg sm:text-xl font-black text-white">
              ¿Tenés otra duda específica sobre una cuenta?
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Hablá de forma directa con el Administrador Oficial para atención personalizada 1 a 1 en vivo por WhatsApp.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <a
                href={directWhatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="h-11 px-5 rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-xs font-black text-white shadow-lg transition uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Hablar con el Admin</span>
              </a>
              <a
                href={storeWhatsappGroupUrl}
                target="_blank"
                rel="noreferrer"
                className="h-11 px-5 rounded-xl bg-[#0d0f17] border border-[#1f2430] hover:border-[#f5b942] text-xs font-black text-zinc-300 hover:text-[#f5b942] transition uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Users className="h-4 w-4 text-[#f5b942]" />
                <span>Unirse al Grupo</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
