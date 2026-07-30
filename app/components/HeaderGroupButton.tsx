"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import GroupRulesModal from "./GroupRulesModal";

export default function HeaderGroupButton({ groupUrl }: { groupUrl: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-8 px-2 sm:h-9 sm:px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[10px] sm:text-xs font-black text-white flex items-center gap-1 sm:gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition duration-200 uppercase tracking-wider cursor-pointer shrink-0"
      >
        <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
        <span>Grupo</span>
      </button>

      <GroupRulesModal open={open} groupUrl={groupUrl} onOpenChange={setOpen} />
    </>
  );
}
