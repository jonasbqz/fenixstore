"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Tag, DollarSign, CheckCircle2, XCircle } from "lucide-react";
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

export default function AdminAccountList({ accounts }: { accounts: AdminAccount[] }) {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"TODAS" | "DISPONIBLE" | "VENDIDA">("TODAS");

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

      {/* LISTADO DE CUENTAS */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#1f2430] bg-[#090a0f] p-8 text-center space-y-2">
          <p className="text-xs font-bold text-zinc-400">
            No se encontraron publicaciones que coincidan con &quot;{query}&quot;.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((account) => {
            const isAvailable = account.status === "DISPONIBLE";

            return (
              <div
                key={account.id}
                className="rounded-2xl border border-[#1f2430] bg-[#090a0f] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-[#1f2430]/80 shadow-lg"
              >
                <div className="flex items-center gap-3.5">
                  {/* IMAGEN DE VISTA PREVIA COMPLETA (FOTO COMPLETA UNCROPPED) */}
                  <div className="h-16 w-24 rounded-xl bg-black border border-[#1f2430] overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={account.imageUrls[0] || "/lobby_fallback.png"}
                      alt={account.publicCode}
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

                  <form
                    action={async () => {
                      await deleteAccount(account.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="h-9 px-3 rounded-xl border border-red-500/30 bg-red-950/20 text-xs font-black text-red-400 hover:bg-red-900/40 transition cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
