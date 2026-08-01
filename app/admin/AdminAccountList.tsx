"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Tag, DollarSign, CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";
import { deleteAccount, toggleAccountStatus } from "./actions";

type AdminAccount = {
  id: string;
  publicCode: string;
  gameId: string;
  publicPriceCents: number;
  description: string;
  status: string;
  region: string;
  accessType: string;
  imageUrls: string[];
  level: number;
  rank: string;
  mythicsCount: number;
  legendariesCount: number;
  epicsCount: number;
  createdAt: Date;
  sellerName?: string | null;
  sellerWhatsapp?: string | null;
};

function formatPrice(cents: number) {
  return `${cents / 100} USDT / €`;
}

export default function AdminAccountList({
  accounts,
  currentSettings,
}: {
  accounts: AdminAccount[];
  currentSettings?: { groupUrl: string; phone: string };
}) {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"TODAS" | "DISPONIBLE" | "VENDIDA">("TODAS");
  const [accountToDelete, setAccountToDelete] = useState<AdminAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [groupUrlInput, setGroupUrlInput] = useState(currentSettings?.groupUrl || "https://chat.whatsapp.com/FXVkcnxJsnsKkbcV7GVmPW");
  const [phoneInput, setPhoneInput] = useState(currentSettings?.phone || "351920331564");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch(`/api/settings?groupUrl=${encodeURIComponent(groupUrlInput)}&phone=${encodeURIComponent(phoneInput)}`);
      const data = await res.json();
      if (data.ok) {
        setSettingsSavedMsg(true);
        setTimeout(() => setSettingsSavedMsg(false), 3000);
      }
    } catch (err) {
      console.error("Error al guardar configuracion:", err);
    } finally {
      setIsSavingSettings(false);
    }
  }

  const filtered = accounts.filter((acc) => {
    const q = query.toLowerCase().trim();

    const matchesQuery =
      !q ||
      acc.publicCode.toLowerCase().includes(q) ||
      acc.description.toLowerCase().includes(q) ||
      formatPrice(acc.publicPriceCents).toLowerCase().includes(q);

    const matchesStatus =
      filterStatus === "TODAS" || acc.status === filterStatus;

    return matchesQuery && matchesStatus;
  });

  async function handleConfirmDelete() {
    if (!accountToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAccount(accountToDelete.id);
      setAccountToDelete(null);
    } catch (err) {
      console.error("Error al eliminar cuenta:", err);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* BARRA DE BÚSQUEDA Y FILTRO RÁPIDO PARA EL ADMIN */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Buscar por código (ej: CODM-106), precio, armas..."
            className="h-11 w-full rounded-2xl border border-[#1f2430] bg-[#090a0f] pl-10 pr-4 text-xs font-semibold text-white outline-none focus:border-[#f5b942] transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
            >
              ✕ Limpiar
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 bg-[#090a0f] p-1 rounded-2xl border border-[#1f2430]">
          <button
            onClick={() => setFilterStatus("TODAS")}
            className={`h-9 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
              filterStatus === "TODAS"
                ? "bg-[#f5b942] text-[#000000]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Todas ({accounts.length})
          </button>
          <button
            onClick={() => setFilterStatus("DISPONIBLE")}
            className={`h-9 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
              filterStatus === "DISPONIBLE"
                ? "bg-emerald-500 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Disponibles ({accounts.filter((a) => a.status === "DISPONIBLE").length})
          </button>
          <button
            onClick={() => setFilterStatus("VENDIDA")}
            className={`h-9 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
              filterStatus === "VENDIDA"
                ? "bg-amber-500 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Vendidas ({accounts.filter((a) => a.status === "VENDIDA").length})
          </button>
        </div>
      </div>

      {/* LISTADO RESULTANTE DE CUENTAS */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-[#1f2430] bg-[#0d0f17] p-8 text-center space-y-3">
          <p className="text-sm font-bold text-zinc-400">
            No se encontraron publicaciones con esos criterios de búsqueda.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((account) => {
            const isAvailable = account.status === "DISPONIBLE";
            const mainPhoto = account.imageUrls[0] || "/lobby_fallback.png";

            return (
              <div
                key={account.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#1f2430] bg-[#0d0f17] p-4 hover:border-[#f5b942]/50 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-black border border-zinc-800">
                    <img
                      src={mainPhoto}
                      alt={account.publicCode}
                      onError={(e) => {
                        if (e.currentTarget.src !== "/lobby_fallback.png") {
                          e.currentTarget.src = "/lobby_fallback.png";
                        }
                      }}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{account.publicCode}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          isAvailable
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                            : "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                        }`}
                      >
                        {account.status}
                      </span>
                      {account.sellerName && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-[10px] font-bold text-purple-400">
                          👤 {account.sellerName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-black text-[#f5b942]">
                      {formatPrice(account.publicPriceCents)}
                    </p>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-md">
                      {account.description.split("\n")[0]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/accounts/${account.id}/edit`}
                    className="h-9 px-3.5 rounded-xl border border-[#f5b942]/40 bg-[#f5b942]/10 text-xs font-black text-[#f5b942] hover:bg-[#f5b942] hover:text-[#000000] transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    ✏️ Editar
                  </Link>

                  <form
                    action={async () => {
                      await toggleAccountStatus(account.id, account.status as any);
                    }}
                  >
                    <button
                      type="submit"
                      className="h-9 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-black text-white hover:bg-zinc-800 transition cursor-pointer"
                    >
                      {isAvailable ? "Marcar Vendida" : "Marcar Disponible"}
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => setAccountToDelete(account)}
                    className="h-9 px-3 rounded-xl border border-red-500/30 bg-red-950/20 text-xs font-black text-red-400 hover:bg-red-900/40 transition cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-[#0d0f17] p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-base font-black uppercase tracking-wider">Confirmar Eliminación</h3>
              </div>
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="h-8 w-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-zinc-300">
                ¿Estás seguro de que querés eliminar la publicación <strong className="text-white font-black">{accountToDelete.publicCode}</strong>?
              </p>
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/20 text-[11px] font-mono text-red-300">
                ⚠️ Esta acción borrará la cuenta y sus fotos permanentemente de la base de datos.
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="h-10 flex-1 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-bold text-zinc-300 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="h-10 flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-black text-white uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {isDeleting ? "Eliminando..." : "🗑️ Sí, Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
