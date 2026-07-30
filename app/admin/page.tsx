import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb, isDbConnected } from "../../lib/db";
import { accounts, sellers } from "../../lib/db/schema";
import { mockAccounts } from "../../lib/db/mockData";
import { logoutAdmin } from "./login/actions";
import AdminAccountList from "./AdminAccountList";

export const dynamic = "force-dynamic";

async function getAdminAccounts() {
  if (!isDbConnected()) {
    return [...mockAccounts];
  }
  
  try {
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
  } catch (error) {
    console.error("Aviso: Error al consultar la tabla accounts en PostgreSQL:", error);
    return [];
  }
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
                Cerrar Sesión
              </button>
            </form>
          </div>
        </header>

        {/* METRICAS RAPIDAS */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-[#1f2430] bg-[#0d0f17] p-4 text-center">
            <p className="text-[11px] font-black uppercase text-zinc-500">Publicadas</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">{totalAccounts}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
            <p className="text-[11px] font-black uppercase text-emerald-400">Disponibles</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{availableAccounts}</p>
          </div>
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-center">
            <p className="text-[11px] font-black uppercase text-amber-400">Vendidas</p>
            <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{soldAccounts}</p>
          </div>
        </div>

        {/* BUSCADOR Y LISTADO DE CUENTAS PUBLICADAS EN EL PANEL ADMIN */}
        <div className="rounded-3xl border border-[#1f2430] bg-[#0d0f17] p-4 sm:p-6 shadow-2xl space-y-4">
          <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
            Cuentas en el Catálogo ({adminAccounts.length})
          </h2>

          {adminAccounts.length === 0 ? (
            <div className="rounded-2xl border border-[#1f2430] bg-[#090a0f] p-8 text-center space-y-3">
              <p className="text-xs font-bold text-zinc-400">
                Aún no hay publicaciones en la base de datos de producción.
              </p>
              <Link
                href="/admin/accounts/new"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-[#f5b942] px-4 text-xs font-black text-[#000000] uppercase tracking-wider"
              >
                Publicar mi primera cuenta
              </Link>
            </div>
          ) : (
            <AdminAccountList accounts={adminAccounts} />
          )}
        </div>

      </div>
    </main>
  );
}
