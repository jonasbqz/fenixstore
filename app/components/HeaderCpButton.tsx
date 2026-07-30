"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import CpRecargasModal from "./CpRecargasModal";

export default function HeaderCpButton({ whatsappNumber }: { whatsappNumber: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-8 px-2 sm:h-9 sm:px-4 rounded-xl bg-[#f5b942]/15 border border-[#f5b942]/50 text-[#f5b942] font-black text-[10px] sm:text-xs hover:bg-[#f5b942] hover:text-[#0b0c0e] transition flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(245,185,66,0.2)] shrink-0"
        title="Solicitar Recarga Oficial de CPs en CODM"
      >
        <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-[#f5b942] shrink-0" />
        <span className="font-extrabold uppercase tracking-wider">
          Recargar <span className="hidden xs:inline">CPs</span>
        </span>
      </button>

      <CpRecargasModal
        open={open}
        onOpenChange={setOpen}
        whatsappNumber={whatsappNumber}
      />
    </>
  );
}
