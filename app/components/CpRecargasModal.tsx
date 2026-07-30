"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import {
  Zap,
  X,
  MessageSquare,
  Lock,
  Clock,
  ShieldCheck,
} from "lucide-react";

type CpRecargasModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  whatsappNumber: string;
};

interface CpPackage {
  id: string;
  name: string;
  cpAmount: number;
  priceUsdt: number;
}

const CP_PACKAGES: CpPackage[] = [
  { id: "2400_cp", name: "2.400 CPs", cpAmount: 2400, priceUsdt: 24 },
  { id: "5000_cp", name: "5.000 CPs", cpAmount: 5000, priceUsdt: 46 },
  { id: "10800_cp", name: "10.800 CPs", cpAmount: 10800, priceUsdt: 84 },
];

export default function CpRecargasModal({
  open,
  onOpenChange,
  whatsappNumber,
}: CpRecargasModalProps) {
  const [selectedPkg, setSelectedPkg] = useState<CpPackage>(CP_PACKAGES[0]);

  function handleOrder() {
    const message = `Hola Fénix! Quisiera solicitar una recarga de CPs para mi cuenta de Activision:\n• Paquete: ${selectedPkg.name} (${selectedPkg.priceUsdt} USDT/€)\n• Método de Acceso: Únicamente cuenta de Activision\n\nEntiendo que el tiempo de carga toma de 1 a 48 horas. ¿Cómo coordinamos el pago y los accesos?`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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

        {/* Modal Centrado 100% */}
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: "-48%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-48%" }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-lg max-h-[90vh] rounded-3xl border border-[#f5b942]/40 bg-[#0d0f17] p-4 sm:p-6 shadow-[0_0_60px_rgba(245,185,66,0.15)] flex flex-col space-y-4 outline-none overflow-hidden text-white select-none"
          >
            {/* CABECERA CON ICONO Y BOTÓN CERRAR */}
            <div className="flex items-center justify-between border-b border-[#1f2430] pb-3.5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#f5b942]/15 border border-[#f5b942]/30 flex items-center justify-center text-[#f5b942] shadow-sm">
                  <Zap className="h-5 w-5 fill-[#f5b942]" />
                </div>
                <div>
                  <Dialog.Title className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                    Recargas Oficiales de CPs
                  </Dialog.Title>
                  <Dialog.Description className="text-xs font-semibold text-zinc-400">
                    Exclusivo vía Acceso de Activision • Fénix Store
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

            {/* CONTENIDO PRINCIPAL DEL MODAL */}
            <div className="overflow-y-auto custom-scrollbar space-y-4 pr-1 flex-1 text-xs">
              
              {/* SELECCIÓN DE LOS 3 PAQUETES DE CP */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[#f5b942] fill-[#f5b942]" />
                  <span>Seleccioná el paquete de CPs:</span>
                </label>

                <div className="grid grid-cols-3 gap-2.5">
                  {CP_PACKAGES.map((pkg) => {
                    const isSelected = selectedPkg.id === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPkg(pkg)}
                        className={`p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                          isSelected
                            ? "border-[#f5b942] bg-[#f5b942]/20 shadow-lg scale-[1.02]"
                            : "border-[#1f2430] bg-[#090a0f] hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-1 text-sm font-black text-white">
                          <Zap className="h-4 w-4 fill-[#f5b942] text-[#f5b942]" />
                          <span>{pkg.name}</span>
                        </div>

                        <div className="text-xs font-black text-[#f5b942] pt-0.5">
                          {pkg.priceUsdt} USDT / €
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AVISO EXPLICITO 1: ACCESO EXCLUSIVO DE ACTIVISION */}
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3.5 space-y-1 text-blue-200">
                <p className="font-extrabold text-[11px] flex items-center gap-1.5 text-blue-400">
                  <Lock className="h-4 w-4 text-blue-400" />
                  <span>Requisito Obligatorio: Acceso de Activision</span>
                </p>
                <p className="text-[10px] font-semibold leading-relaxed text-zinc-300">
                  Únicamente realizamos recargas ingresando por **Acceso de Activision** (correo y contraseña). No aceptamos vinculaciones de Facebook, Apple ID ni ningún otro tipo de login.
                </p>
              </div>

              {/* AVISO EXPLICITO 2: TIEMPO DE CARGA DE 1 A 48 HORAS */}
              <div className="rounded-2xl border border-[#f5b942]/30 bg-[#f5b942]/10 p-3.5 space-y-1 text-amber-300">
                <p className="font-extrabold text-[11px] flex items-center gap-1.5 text-[#f5b942]">
                  <Clock className="h-4 w-4 text-[#f5b942]" />
                  <span>Tiempo de Carga: De 1 a 48 Horas Hábiles</span>
                </p>
                <p className="text-[10px] font-semibold leading-relaxed text-zinc-300">
                  Una vez realizado el pago y entregado el acceso de Activision por WhatsApp, el tiempo de procesamiento toma de **1 a 48 horas**.
                </p>
              </div>

            </div>

            {/* RESUMEN Y BOTÓN SOLICITAR RECARGA */}
            <div className="border-t border-[#1f2430] pt-3.5 space-y-3 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-zinc-400">Total a pagar:</span>
                <span className="text-lg font-black text-[#f5b942]">
                  {selectedPkg.priceUsdt} USDT / €
                </span>
              </div>

              <button
                type="button"
                onClick={handleOrder}
                className="h-12 w-full rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-xs font-black text-white shadow-lg transition duration-200 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4.5 w-4.5" />
                <span>Solicitar Recarga por WhatsApp</span>
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
