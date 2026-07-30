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
import { ensureTablesExist, getStoreSettings } from "./admin/actions";

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

export const revalidate = 60;

function parseGame(val?: string): "CODM" | "FF" | "PUBG" | undefined {
  if (val === "CODM" || val === "FF" || val === "PUBG") return val;
  return undefined;
}

function parseRegion(
  val?: string,
): "LATAM_10CP" | "INDIA_10CP" | "LATAM_GLOBAL" | "USA_EU" | undefined {
  if (
    val === "LATAM_10CP" ||
    val === "INDIA_10CP" ||
    val === "LATAM_GLOBAL" ||
    val === "USA_EU"
  ) {
    return val;
  }
  return undefined;
}

function parseAccess(
  val?: string,
): "FULL_ACCESS" | "PARTIAL_ACCESS" | undefined {
  if (val === "FULL_ACCESS" || val === "PARTIAL_ACCESS") return val;
  return undefined;
}

function parseMaxPrice(val?: string): number | undefined {
  if (!val) return undefined;
  const num = Number(val);
  if (Number.isNaN(num) || num <= 0) return undefined;
  return Math.round(num * 100);
}

function formatPrice(cents: number) {
  const val = cents / 100;
  return Number.isInteger(val) ? `${val} USDT/€` : `${val.toFixed(2)} USDT/€`;
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
  region?: "LATAM_10CP" | "INDIA_10CP" | "LATAM_GLOBAL" | "USA_EU";
  accessType?: "FULL_ACCESS" | "PARTIAL_ACCESS";
  minMythics?: number;
}): Promise<ModalAccount[]> {
  if (!isDbConnected()) {
    let result = [...mockAccounts];
    if (filters.juego) {
      result = result.filter((acc) => acc.gameId === filters.juego);
    }
    if (filters.precioMaxCents) {
      result = result.filter((acc) => acc.publicPriceCents <= filters.precioMaxCents!);
    }
    if (filters.region) {
      result = result.filter((acc) => acc.region === filters.region);
    }
    if (filters.accessType) {
      result = result.filter((acc) => acc.accessType === filters.accessType);
    }
    if (filters.minMythics) {
      result = result.filter((acc) => acc.mythicsCount >= filters.minMythics!);
    }
    if (filters.tag) {
      const query = filters.tag.toLowerCase().trim();
      const mainKey = query.split(/\s+|-/)[0] || query;
      result = result.filter(
        (acc) =>
          acc.publicCode.toLowerCase().includes(query) ||
          acc.description.toLowerCase().includes(query) ||
          acc.description.toLowerCase().includes(mainKey) ||
          acc.items.some((item) => item.name.toLowerCase().includes(query) || item.name.toLowerCase().includes(mainKey))
      );
    }
    return result as ModalAccount[];
  }

  try {
    await ensureTablesExist();

    let tagCondition: SQL | undefined = undefined;
    if (filters.tag) {
      const cleanTag = filters.tag.trim();
      const mainKeyword = cleanTag.split(/\s+|-/)[0] || cleanTag;

      tagCondition = sql`(${accounts.description} ilike ${`%${cleanTag}%`} 
        or ${accounts.description} ilike ${`%${mainKeyword}%`} 
        or ${accounts.publicCode} ilike ${`%${cleanTag}%`} 
        or exists (
          select 1
          from account_items tag_items
          where tag_items."accountId" = ${accounts.id}
          and (tag_items."name" ilike ${`%${cleanTag}%`} or tag_items."name" ilike ${`%${mainKeyword}%`})
        ))`;
    }

    const where: SQL[] = [
      eq(accounts.status, "DISPONIBLE"),
      filters.juego ? eq(accounts.gameId, filters.juego) : undefined,
      filters.precioMaxCents ? lte(accounts.publicPriceCents, filters.precioMaxCents) : undefined,
      filters.region ? eq(accounts.region, filters.region as any) : undefined,
      filters.accessType ? eq(accounts.accessType, filters.accessType) : undefined,
      filters.minMythics ? gte(accounts.mythicsCount, filters.minMythics) : undefined,
      tagCondition,
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
          bindings: sql<{
            activision: "ENTREGADO";
            facebook: any;
            google: any;
            apple: any;
          }>`json_build_object(
            'activision', 'ENTREGADO',
            'facebook', ${accounts.bindingFacebook},
            'google', ${accounts.bindingGoogle},
            'apple', ${accounts.bindingApple}
          )`,
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

    return groupAccounts(rows as any);
  } catch (error) {
    console.error("Aviso: Base de datos no conectada en fase de compilación:", error);
    return [];
  }
}

async function getAllAccountsForTicker() {
  if (!isDbConnected()) {
    return mockAccounts.map((a) => ({
      publicCode: a.publicCode,
      status: a.status,
      publicPriceCents: a.publicPriceCents,
      mythicsCount: a.mythicsCount,
      description: a.description,
    }));
  }

  try {
    await ensureTablesExist();
    const db = getDb();
    const rows = await db
      .select({
        publicCode: accounts.publicCode,
        status: accounts.status,
        publicPriceCents: accounts.publicPriceCents,
        mythicsCount: accounts.mythicsCount,
        description: accounts.description,
      })
      .from(accounts)
      .orderBy(desc(accounts.createdAt))
      .limit(10);

    return rows;
  } catch (err) {
    console.error("Error al obtener cuentas para el ticker:", err);
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

  const settings = await getStoreSettings();
  const storeWhatsappNumber = settings.phone;
  const storeWhatsappGroupUrl = settings.groupUrl;

  let catalog: ModalAccount[] = [];
  let catalogError: string | null = null;
  let tickerAccounts: Array<{ publicCode: string; status: string; publicPriceCents: number; mythicsCount: number; description: string }> = [];

  try {
    catalog = await getAvailableAccounts({
      juego: selectedGame,
      precioMaxCents: parseMaxPrice(precioMax),
      tag,
      region: selectedRegion,
      accessType: selectedAccess,
      minMythics: minMiticas,
    });
    tickerAccounts = await getAllAccountsForTicker();
  } catch (error) {
    catalogError =
      error instanceof Error ? error.message : "Error al consultar base de datos.";
  }

  const rawTickerList = tickerAccounts.length > 0 ? tickerAccounts : [];
  const tickerList = rawTickerList.length > 0 ? [...rawTickerList, ...rawTickerList, ...rawTickerList] : [];

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

      {/* TICKER DINÁMICO DE ESTADO REAL DE CUENTAS EN VIVO */}
      <div className="w-full bg-[#07080b] border-b border-[#1f2430] py-2.5 overflow-hidden select-none whitespace-nowrap">
        <div className="relative w-full overflow-hidden flex items-center">
          <div className="animate-ticker flex gap-8 sm:gap-12 text-[11px] sm:text-xs font-black text-zinc-300 uppercase tracking-wider whitespace-nowrap">
            {tickerList.length === 0 ? (
              <span className="whitespace-nowrap flex items-center gap-2 text-[#f5b942]">
                ⚡ Fénix Store • Catálogo Oficial de Cuentas CODM • Compra 100% Segura y Garantizada
              </span>
            ) : (
              tickerList.map((item, idx) => {
                const isSold = item.status === "VENDIDA";
                return (
                  <span key={idx} className="whitespace-nowrap flex items-center gap-2">
                    {isSold ? (
                      <span className="text-amber-400 font-black">✅ VENDIDA:</span>
                    ) : (
                      <span className="text-emerald-400 font-black">⚡ DISPONIBLE:</span>
                    )}
                    <span className="text-white font-extrabold">{item.publicCode}</span>
                    <span className="text-[#ff2a40] font-black">
                      ( {item.mythicsCount > 0 ? `${item.mythicsCount} MÍTICAS` : "EDICIÓN ESPECIAL"} )
                    </span>
                    <span className="text-[#f5b942] font-black">POR {formatPrice(item.publicPriceCents)}</span>
                    <span className="text-zinc-600 font-bold ml-2">•</span>
                  </span>
                );
              })
            )}
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
          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-center text-red-200">
            <p className="text-sm font-semibold">{catalogError}</p>
          </div>
        ) : (
          <CatalogView
            catalog={catalog}
            whatsappNumber={storeWhatsappNumber}
          />
        )}
      </section>

      {/* BOTÓN FLOTANTE WHATSAPP */}
      <FloatingWhatsappButton
        whatsappNumber={storeWhatsappNumber}
        groupUrl={storeWhatsappGroupUrl}
      />

      <Footer />
    </main>
  );
}