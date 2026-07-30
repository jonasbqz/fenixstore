import Link from "next/link";
import { and, desc, eq, lte, gte, sql, type SQL } from "drizzle-orm";
import { ShieldCheck, Lock, Globe, Users } from "lucide-react";
import { getDb, isDbConnected } from "../lib/db";
import {
  accountItems,
  accounts,
} from "../lib/db/schema";
import { mockAccounts } from "../lib/db/mockData";
import {
  CODM_MYTHIC_WEAPONS,
  CODM_MYTHIC_OPERATORS,
  CODM_LEGENDARY_OPERATORS,
  CODM_PRESTIGE_WEAPONS,
  CODM_LEGENDARY_WEAPONS,
} from "../lib/constants/codmWeapons";
import CustomFilters from "./components/CustomFilters";
import CatalogView from "./components/CatalogView";
import FloatingWhatsappButton from "./components/FloatingWhatsappButton";
import HeaderGroupButton from "./components/HeaderGroupButton";
import HeaderCpButton from "./components/HeaderCpButton";
import ThemeToggle from "./components/ThemeToggle";
import Footer from "./components/Footer";
import { type ModalAccount } from "./components/AccountModal";

type PageProps = {
  searchParams?: Promise<{
    juego?: string;
    precio_max?: string;
    tag?: string;
    region?: string;
    acceso?: string;
    min_miticas?: string;
  }>;
};

const storeWhatsappNumber =
  process.env.NEXT_PUBLIC_STORE_WHATSAPP_NUMBER?.replace(/[^\d]/g, "") ||
  "351920331564";

const storeWhatsappGroupUrl =
  process.env.NEXT_PUBLIC_STORE_WHATSAPP_GROUP_URL ||
  "https://chat.whatsapp.com/F78McLwEexSFFpIhuQ7OSm?s=cl&p=i&mlu=0&ilr=0&amv=1";

export const revalidate = 60;

function parseGame(value?: string) {
  const normalized = value?.trim().toUpperCase();
  if (normalized === "CODM" || normalized === "FF" || normalized === "PUBG") {
    return normalized as "CODM" | "FF" | "PUBG";
  }
  return "CODM";
}

function parseRegion(value?: string) {
  const normalized = value?.trim().toUpperCase();
  if (
    normalized === "LATAM_10CP" ||
    normalized === "INDIA_10CP" ||
    normalized === "LATAM_GLOBAL" ||
    normalized === "USA_EU" ||
    normalized === "INDIA"
  ) {
    return normalized;
  }
  return undefined;
}

function parseAccess(value?: string) {
  const normalized = value?.trim().toUpperCase();
  if (normalized === "FULL_ACCESS" || normalized === "PARTIAL_ACCESS") {
    return normalized as "FULL_ACCESS" | "PARTIAL_ACCESS";
  }
  return undefined;
}

function parseMaxPrice(value?: string) {
  if (!value) return undefined;
  const amount = Number(value.replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) {
    return undefined;
  }
  return Math.round(amount * 100);
}

function groupAccounts(
  rows: Array<{
    account: Omit<ModalAccount, "items">;
    item: NonNullable<ModalAccount["items"]>[number] | null;
  }>,
) {
  const grouped = new Map<string, ModalAccount>();
  for (const row of rows) {
    const current =
      grouped.get(row.account.id) ??
      ({
        ...row.account,
        items: [],
      } satisfies ModalAccount);

    if (row.item) {
      if (!current.items) current.items = [];
      current.items.push(row.item);
    }
    grouped.set(current.id, current);
  }
  return [...grouped.values()];
}

async function getAvailableAccounts(filters: {
  juego?: "CODM" | "FF" | "PUBG";
  precioMaxCents?: number;
  tag?: string;
  region?: string;
  accessType?: "FULL_ACCESS" | "PARTIAL_ACCESS";
  minMythics?: number;
}): Promise<ModalAccount[]> {
  
  if (!isDbConnected()) {
    let result = mockAccounts.filter((acc) => acc.status !== "PENDIENTE");
    
    if (filters.juego) {
      result = result.filter((acc) => acc.gameId === filters.juego);
    }
    if (filters.precioMaxCents) {
      result = result.filter((acc) => acc.publicPriceCents <= filters.precioMaxCents!);
    }
    if (filters.region) {
      result = result.filter((acc) => {
        if (filters.region === "INDIA_10CP") {
          return (acc.region as string) === "INDIA_10CP" || (acc.region as string) === "INDIA";
        }
        return acc.region === filters.region;
      });
    }
    if (filters.accessType) {
      result = result.filter((acc) => acc.accessType === filters.accessType);
    }
    if (filters.minMythics && filters.minMythics > 0) {
      result = result.filter((acc) => acc.mythicsCount >= filters.minMythics!);
    }
    if (filters.tag) {
      const query = filters.tag.toLowerCase();
      result = result.filter(
        (acc) =>
          acc.publicCode.toLowerCase().includes(query) ||
          acc.description.toLowerCase().includes(query) ||
          acc.items.some((item) => item.name.toLowerCase().includes(query))
      );
    }
    return result as ModalAccount[];
  }

  try {
    const where: SQL[] = [
      eq(accounts.status, "DISPONIBLE"),
      filters.juego ? eq(accounts.gameId, filters.juego) : undefined,
      filters.precioMaxCents ? lte(accounts.publicPriceCents, filters.precioMaxCents) : undefined,
      filters.region ? eq(accounts.region, filters.region as any) : undefined,
      filters.accessType ? eq(accounts.accessType, filters.accessType) : undefined,
      filters.minMythics ? gte(accounts.mythicsCount, filters.minMythics) : undefined,
      filters.tag
        ? sql`exists (
            select 1
            from account_items tag_items
            where tag_items."accountId" = ${accounts.id}
            and tag_items."name" ilike ${`%${filters.tag}%`}
          )`
        : undefined,
    ].filter((filter): filter is SQL => Boolean(filter));

    const rows = await getDb()
      .select({
        account: {
          id: accounts.id,
          publicCode: accounts.publicCode,
          gameId: accounts.gameId as any,
          publicPriceCents: accounts.publicPriceCents,
          description: accounts.description,
          imageUrls: accounts.imageUrls,
          region: accounts.region as any,
          accessType: accounts.accessType as any,
          level: accounts.level,
          mythicsCount: accounts.mythicsCount,
          legendariesCount: accounts.legendariesCount,
          epicsCount: accounts.epicsCount,
        },
        item: {
          id: accountItems.id,
          name: accountItems.name,
          type: accountItems.type,
        },
      })
      .from(accounts)
      .leftJoin(accountItems, eq(accountItems.accountId, accounts.id))
      .where(and(...where))
      .orderBy(desc(accounts.createdAt));

    return groupAccounts(rows);
  } catch (dbError) {
    // Si la base de datos no es accesible durante el build estático de Docker, retornamos []
    console.warn("Aviso: Base de datos no conectada en fase de compilación:", dbError);
    return [];
  }
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedGame = parseGame(params?.juego);
  const selectedRegion = parseRegion(params?.region);
  const selectedAccess = parseAccess(params?.acceso);
  const minMiticas = params?.min_miticas ? Number(params.min_miticas) : undefined;
  const precioMax = params?.precio_max?.trim() ?? "";
  const tag = params?.tag?.trim() ?? "";

  let catalog: ModalAccount[] = [];
  let catalogError: string | null = null;

  try {
    catalog = await getAvailableAccounts({
      juego: selectedGame,
      precioMaxCents: parseMaxPrice(precioMax),
      tag,
      region: selectedRegion,
      accessType: selectedAccess,
      minMythics: minMiticas,
    });
  } catch (error) {
    catalogError =
      error instanceof Error ? error.message : "Error al consultar base de datos.";
  }

  return (
    <main className="min-h-screen bg-[#0b0c0e]">
      {/* HEADER FIJO 100% RESPONSIVO PARA ANDROID Y PANTALLAS MÓVILES */}
      <header className="sticky top-0 z-40 bg-[#0b0c0e]/95 backdrop-blur-md border-b border-[#1f2430] px-2 sm:px-6 lg:px-8 py-2 sm:py-3 select-none">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-1">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-3 group shrink-0">
            <img src="/logo_clean.png" alt="Fénix Store Logo" className="h-7 w-7 sm:h-9 sm:w-9 object-contain group-hover:scale-105 transition duration-200" />
            <span className="text-base sm:text-xl font-extrabold text-white tracking-tight">
              Fénix <span className="text-[#f5b942]">Store</span>
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            <ThemeToggle />
            <HeaderCpButton whatsappNumber={storeWhatsappNumber} />
            <HeaderGroupButton groupUrl={storeWhatsappGroupUrl} />
          </div>
        </div>
      </header>

      {/* TICKER DE VENTAS RECIENTES DE CUENTAS */}
      <div className="w-full bg-[#07080b] border-b border-[#1f2430] py-2.5 overflow-hidden select-none whitespace-nowrap">
        <div className="relative w-full overflow-hidden flex items-center">
          <div className="animate-ticker flex gap-10 sm:gap-14 text-[11px] sm:text-xs font-black text-zinc-350 uppercase tracking-wider whitespace-nowrap">
            <span className="whitespace-nowrap flex items-center">✓ CODM-105 (<strong className="text-[#ff2a40] font-black mx-1">12 Míticas • Templar & Ghost Mítico</strong>) por 450 USDT/€</span>
            <span className="text-[#f5b942]">•</span>
            <span className="whitespace-nowrap flex items-center">✓ CODM-104 (<strong className="text-[#ff2a40] font-black mx-1">8 Míticas • M13 Morningstar</strong>) por 250 USDT/€</span>
            <span className="text-[#ff2a40]">•</span>
            <span className="whitespace-nowrap flex items-center">✓ CODM-102 (<strong className="text-[#ff2a40] font-black mx-1">5 Míticas • AK-47 Radiance</strong>) por 120 USDT/€</span>
            <span className="text-[#f5b942]">•</span>
            <span className="whitespace-nowrap flex items-center">✓ CODM-101 (<strong className="text-[#ff2a40] font-black mx-1">3 Míticas • Kilo Demonsong</strong>) por 85 USDT/€</span>
            <span className="text-[#ff2a40]">•</span>
            <span className="whitespace-nowrap flex items-center">✓ Venta directa respaldada por el Administrador Oficial Fénix Store</span>
          </div>
        </div>
      </div>

      {/* CATÁLOGO EXCLUSIVO DE CUENTAS */}
      <section className="mx-auto mt-4 max-w-6xl px-3 sm:px-6 lg:px-8 space-y-4 pb-12">
        
        <CustomFilters
          selectedTag={tag}
          selectedMinMythics={minMiticas ? String(minMiticas) : ""}
          selectedRegion={selectedRegion ?? ""}
          selectedAccess={selectedAccess ?? ""}
          selectedMaxPrice={precioMax}
          mythicOperators={CODM_MYTHIC_OPERATORS}
          legendaryOperators={CODM_LEGENDARY_OPERATORS}
          mythicWeapons={CODM_MYTHIC_WEAPONS}
          prestigeWeapons={CODM_PRESTIGE_WEAPONS}
          legendaryWeapons={CODM_LEGENDARY_WEAPONS}
        />

        {catalogError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-center text-xs font-bold text-red-400">
            {catalogError}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                Mostrando <strong className="text-[#f5b942] text-sm">{catalog.length}</strong> {catalog.length === 1 ? "cuenta disponible" : "cuentas disponibles"}
              </p>
            </div>

            <CatalogView catalog={catalog} whatsappNumber={storeWhatsappNumber} />
          </div>
        )}

      </section>

      {/* SECCIÓN DE GARANTÍAS DIRECTAS 1 A 1 CON EL ADMINISTRADOR */}
      <section className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 py-10 border-t border-[#1f2430]">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
            ¿Por qué comprar en Fénix Store?
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-zinc-400 max-w-xl mx-auto">
            Trato 100% directo con el Administrador Oficial. Sin intermediarios ni comisiones extra.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#1f2430] bg-[#090a0f] p-5 space-y-2 shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-[#f5b942]/10 border border-[#f5b942]/20 flex items-center justify-center text-[#f5b942]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-white">Venta Directa del Admin</h3>
            <p className="text-xs font-semibold text-zinc-400 leading-relaxed">
              Todas las cuentas pertenecen al dueño de la tienda. Todo trato se realiza directamente con el administrador autorizado (+351 920 331 564).
            </p>
          </div>

          <div className="rounded-2xl border border-[#1f2430] bg-[#090a0f] p-5 space-y-2 shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-white">Garantía y Entrega Segura</h3>
            <p className="text-xs font-semibold text-zinc-400 leading-relaxed">
              Verificación completa de datos de Activision y desvinculación garantizada antes de realizar la entrega oficial.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1f2430] bg-[#090a0f] p-5 space-y-2 shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-white">Precios Claras en USDT / €</h3>
            <p className="text-xs font-semibold text-zinc-400 leading-relaxed">
              Sin cargos sorpresa. Pagos rápidos por Binance Pay, Crypto o transferencia bancaria directa.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1f2430] bg-[#090a0f] p-5 space-y-2 shadow-lg">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-white">Comunidad Verificada</h3>
            <p className="text-xs font-semibold text-zinc-400 leading-relaxed">
              Únete a nuestro grupo oficial de WhatsApp con más de 1.000 clientes activos en compra y venta.
            </p>
          </div>
        </div>
      </section>

      {/* PIE DE PÁGINA COMPLETO AL ESTILO ELDORADO.GG */}
      <Footer />

      <FloatingWhatsappButton whatsappNumber={storeWhatsappNumber} groupUrl={storeWhatsappGroupUrl} />
    </main>
  );
}