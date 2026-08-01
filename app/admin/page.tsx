import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb, isDbConnected } from "../../lib/db";
import { accounts, sellers } from "../../lib/db/schema";
import { mockAccounts } from "../../lib/db/mockData";
import { logoutAdmin } from "./login/actions";
import { ensureTablesExist, getStoreSettings, getAdminProfiles, getActiveAdminProfileId } from "./actions";
import AdminAccountList from "./AdminAccountList";
import AdminProfileSelector from "./AdminProfileSelector";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

async function getAdminAccounts() {
  if (!isDbConnected()) {
    return [...mockAccounts];
  }
  
  try {
    await ensureTablesExist();
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
        sellerId: accounts.sellerId,
        sellerName: sellers.name,
        sellerWhatsapp: sellers.whatsapp,
        sellerAvatarColor: sellers.avatarColor,
        sellerAvatarIcon: sellers.avatarIcon,
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
  const settings = await getStoreSettings();
  const profiles = await getAdminProfiles();
  const activeProfileId = await getActiveAdminProfileId();
  
  const activeAccounts = adminAccounts.filter((a) => a.status !== "PENDIENTE");
  const totalAccounts = activeAccounts.length;
  const availableAccounts = activeAccounts.filter((a) => a.status === "DISPONIBLE").length;
  const soldAccounts = activeAccounts.filter((a) => a.status === "VENDIDA").length;

  return (
    <main className="min-h-screen bg-[#090a0f] p-4 sm:p-8 space-y-6">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* CABECERA 100% ADAPTADA Y ELEGANTE */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#1f2430] bg-[#0d0f17] p-5 shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f5b942] animate-pulse" />
              <h1 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Panel Administrador</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#f5b942]/20 border border-[#f5b942]/40 text-[10px] font-black text-[#f5b942]">v0.2.0</span>
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Gestión unificada de publicaciones y perfiles de administradores.</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings"
              className="h-10 px-3.5 rounded-xl border border-[#f5b942]/40 bg-[#f5b942]/10 text-xs font-bold text-[#f5b942] hover:bg-[#f5b942] hover:text-[#000000] transition flex items-center justify-center gap-1 cursor-pointer"
            >
              ⚙️ Grupo WhatsApp
            </Link>

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

        {/* SELECTOR DE PERFILES ESTILO NETFLIX */}
        <AdminProfileSelector profiles={profiles} activeProfileId={activeProfileId} />

        {/* METRICAS RAPIDAS */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="rounded-2xl border border-[#1f2430] bg-[#0d0f17] p-3 sm:p-4 text-center shadow-lg">
            <p className="text-[10px] sm:text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Publicadas</p>
            <p className="text-lg sm:text-2xl font-black text-white mt-1">{totalAccounts}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-3 sm:p-4 text-center shadow-lg">
            <p className="text-[10px] sm:text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Disponibles</p>
            <p className="text-lg sm:text-2xl font-black text-emerald-400 mt-1">{availableAccounts}</p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-3 sm:p-4 text-center shadow-lg">
            <p className="text-[10px] sm:text-xs font-extrabold text-amber-400 uppercase tracking-wider">Vendidas</p>
            <p className="text-lg sm:text-2xl font-black text-amber-400 mt-1">{soldAccounts}</p>
          </div>
        </div>

        {/* COMPONENTE CLIENTE DE LISTADO DE CUENTAS */}
        <AdminAccountList accounts={adminAccounts} currentSettings={settings} />

      </div>
    </main>
  );
}
