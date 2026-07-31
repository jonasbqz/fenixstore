"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import {
  Shield,
  MessageSquare,
  X,
  CheckCircle2,
  AlertTriangle,
  Ban,
  ArrowRight,
} from "lucide-react";

type GroupRulesModalProps = {
  open: boolean;
  groupUrl: string;
  onOpenChange: (open: boolean) => void;
};

export default function GroupRulesModal({
  open,
  groupUrl,
  onOpenChange,
}: GroupRulesModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop con Blur y Fade-In */}
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
          />
        </Dialog.Overlay>

        {/* Contenido del Modal Centrado 100% en Pantalla */}
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: "-48%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-48%" }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-lg max-h-[85vh] rounded-3xl border border-[#f5b942]/30 bg-[#0d0f17] p-4 sm:p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col space-y-4 outline-none overflow-hidden"
          >
            {/* CABECERA CON BOTÓN CERRAR */}
            <div className="flex items-center justify-between border-b border-[#1f2430] pb-3.5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <Dialog.Title className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                    Reglas del Grupo Oficial
                  </Dialog.Title>
                  <Dialog.Description className="text-xs font-semibold text-zinc-400">
                    Leé las normas antes de unirte a la comunidad
                  </Dialog.Description>
                </div>
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

            {/* CONTENIDO DE NORMAS DEL GRUPO CON SCROLL INTERNO LIMPIO */}
            <div className="overflow-y-auto custom-scrollbar space-y-3.5 pr-1 flex-1 text-xs text-zinc-200 leading-relaxed">
              
              {/* NORMAS OBLIGATORIAS */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2.5">
                <p className="font-black text-emerald-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>NORMAS OBLIGATORIAS DEL GRUPO</span>
                </p>

                <ul className="space-y-2 text-[11px] font-semibold text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Solo se permite publicar cuentas de tu propia propiedad.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Todos los tratos deben realizarse únicamente con administradores del staff oficial.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Límite de publicación: 1 publicación diaria si posees más de una cuenta (máx. 2 por hora, 1 vez al día por cuenta).</span>
                  </li>
                </ul>
              </div>

              {/* PROHIBICIONES */}
              <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 space-y-2.5">
                <p className="font-black text-red-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Ban className="h-4 w-4" />
                  <span>PROHIBIDO EN EL GRUPO:</span>
                </p>

                <ul className="space-y-2 text-[11px] font-semibold text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">▸</span>
                    <span><strong className="text-white">Admins externos:</strong> Si alguien te ofrece un admin por privado, repórtalo de inmediato (intento de estafa).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">▸</span>
                    <span><strong className="text-white">Contenido prohibido:</strong> Prohibido contenido explícito o stickers inapropiados.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">▸</span>
                    <span><strong className="text-white">Spam:</strong> Prohibido enviar links o publicidad de otros grupos ajenos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">▸</span>
                    <span><strong className="text-white">Respeto:</strong> Insultos o faltas de respeto conllevan expulsión directa.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">▸</span>
                    <span><strong className="text-white">Recomendaciones:</strong> Prohibido pedir referencias fuera del staff oficial.</span>
                  </li>
                </ul>
              </div>

              {/* DESCARGO DE RESPONSABILIDAD */}
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-3 flex items-start gap-2 text-[11px] font-extrabold text-amber-300">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Recuerda: solo los administradores oficiales son confiables para tener tu dinero y resguardar tu trato. Fénix Store no se hace cargo de tratos realizados fuera del staff.
                </p>
              </div>

            </div>

            {/* BOTÓN IR AL GRUPO */}
            {(() => {
              const finalGroupUrl = (!groupUrl || groupUrl.includes("G5y19F9vM0lD32N5v5z2"))
                ? "https://chat.whatsapp.com/FXVkcnxJsnsKkbcV7GVmPW"
                : groupUrl;
              return (
                <div className="pt-2 shrink-0">
                  <a
                    href={finalGroupUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-black text-white shadow-lg transition duration-200 uppercase tracking-wider gap-2 cursor-pointer"
                  >
                    <MessageSquare className="h-4.5 w-4.5" />
                    <span>Acepto las Reglas e Ir al Grupo</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              );
            })()}

          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
