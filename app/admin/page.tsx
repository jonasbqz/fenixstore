import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb, isDbConnected } from "../../lib/db";
import { accounts, sellers } from "../../lib/db/schema";
import { mockAccounts } from "../../lib/db/mockData";
import { deleteAccount, toggleAccountStatus } from "./actions";
import { logoutAdmin } from "./login/actions";

export const dynamic = "force-dynamic";

function formatPrice(cents: number) {
  return `${cents / 100} USDT / €`;
}

async function getAdminAccounts() {
  if (!isDbConnected()) {
    return [...mockAccounts];
  }
  
  const db = getDb();
  return await db
    .select({
      id: accounts.id,
      publicCode: accounts.publicCode,
      gameId: accounts.gameId,
      publicPriceCents: accounts.publicPriceCents,
      description: accounts.description,
      status: accounts.status,
      region: accounts.region,
      accessType: accounts.accessType,
      imageUrls: accounts.imageUrls,
      level: accounts.level,
      rank: accounts.rank,
      mythicsCount: accounts.mythicsCount,
      legendariesCount: accounts.legendariesCount,
      epicsCount: accounts.epicsCount,
      createdAt: accounts.createdAt,
      sellerName: sellers.name,
      sellerWhatsapp: sellers.whatsapp,
    })
    .from(accounts)
    .leftJoin(sellers, eq(accounts.sellerId, sellers.id))
    .orderBy(desc(accounts.createdAt));
}

export default async function AdminDashboardPage() {
  const adminAccounts = await getAdminAccounts();
  
  const activeAccounts = adminAccounts.filter((a) => a.status !== "PENDIENTE");
  const totalAccounts = activeAccounts.length;
  const availableAccounts = activeAccounts.filter((a) => a.status === "DISPONIBLE").length;
  const soldAccounts = activeAccounts.filter((a) => a.status === "VENDIDA").length;

  return (
    <main className="min-h-screen bg-[#090a0f] p-4 sm:p-8 space-y-6">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* CABECERA 100% ADAPTADA A CELULARES ANDROID / IPHONE */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#1f2430] bg-[#0d0f17] p-5 shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f5b942] animate-pulse" />
              <h1 className="text-lg sm:text-2xl font-black text-white">Panel Administrador</h1>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Gestión sencilla de publicaciones en la web.</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/accounts/new"
              className="h-10 px-4 rounded-xl bg-[#f5b942] hover:bg-[#e0a430] text-xs font-black text-[#000000] shadow-gold-glow transition uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
            >
              <span>➕ Publicar Cuenta</span>
            </Link>
            
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="h-10 px-3.5 rounded-xl border border-[#1f2430] bg-[#131622] text-xs font-bold text-zinc-400 hover:text-white transition cursor-pointer"
              >
                Salir 🚪
              </button>
            </form>
          </div>
        </header>

        {/* RESUMEN DE INVENTARIO */}
        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[#1f2430] bg-[#0d0f17] p-3.5 text-center shadow-lg">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Total</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{totalAccounts}</p>
          </div>
          <div className="rounded-2xl border border-[#1f2430] bg-[#0d0f17] p-3.5 text-center shadow-lg">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Disponibles</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{availableAccounts}</p>
          </div>
          <div className="rounded-2xl border border-[#1f2430] bg-[#0d0f17] p-3.5 text-center shadow-lg">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Vendidas</p>
            <p className="text-xl sm:text-2xl font-black text-zinc-400 mt-0.5">{soldAccounts}</p>
          </div>
        </section>

        {/* LISTA DE PUBLICACIONES EN TARJETAS ADAPTADAS A CELULAR Y ESCRITORIO */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-white uppercase tracking-wider">
              Mis Publicaciones en Catálogo ({activeAccounts.length})
            </h2>
            <Link
              href="/"
              target="_blank"
              className="text-[11px] font-bold text-[#f5b942] hover:underline"
            >
              Ver Tienda Web ➔
            </Link>
          </div>

          <div className="space-y-3">
            {activeAccounts.map((account) => {
              const isAvailable = account.status === "DISPONIBLE";
              const photoCount = account.imageUrls?.length || 1;

              return (
                <div
                  key={account.id}
                  className="rounded-2xl border border-[#1f2430] bg-[#0d0f17] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={account.imageUrls?.[0] || "/lobby_fallback.png"}
                      alt={account.publicCode}
                      className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover border border-zinc-800 shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{account.publicCode}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                            isAvailable
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}
                        >
                          {isAvailable ? "DISPONIBLE" : "VENDIDA"}
                        </span>
                      </div>

                      <p className="text-[11px] font-bold text-zinc-400">
                        {account.region} • {account.accessType === "FULL_ACCESS" ? "Full Acceso" : "Parcial"} • {photoCount} fotos
                      </p>

                      <p className="text-xs font-black text-[#f5b942]">
                        {formatPrice(account.publicPriceCents)}
                      </p>
                    </div>
                  </div>

                  {/* ACCIONES RÁPIDAS EN CELULAR */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1f2430]">
                    <form action={toggleAccountStatus.bind(null, account.id, account.status as any)} className="flex-1 sm:flex-initial">
                      <button
                        type="submit"
                        className={`h-9 w-full sm:w-auto px-3.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
                          isAvailable
                            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                            : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                      >
                        {isAvailable ? "Marcar Vendida" : "Marcar Disponible"}
                      </button>
                    </form>

                    <form action={deleteAccount.bind(null, account.id)}>
                      <button
                        type="submit"
                        className="h-9 px-3 rounded-xl border border-red-950/60 bg-red-950/20 text-red-400 text-[11px] font-bold hover:bg-red-950/40 transition cursor-pointer"
                        title="Eliminar publicación"
                      >
                        Eliminar 🗑️
                      </button>
                    </form>
                  </div>

                </div>
              );
            })}
          </div>

        </section>

      </div>
    </main>
  );
}
