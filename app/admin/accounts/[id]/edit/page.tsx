import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, isDbConnected } from "../../../../../lib/db";
import { accounts, accountItems } from "../../../../../lib/db/schema";
import { mockAccounts } from "../../../../../lib/db/mockData";
import { updateAccountAction } from "../../../actions";
import ImageUploader from "../../../../components/ImageUploader";

type EditAccountPageProps = {
  params: Promise<{ id: string }>;
};

async function getAccountForEdit(id: string) {
  if (!isDbConnected()) {
    const acc = mockAccounts.find((a) => a.id === id);
    if (!acc) return null;
    return {
      ...acc,
      weaponsString: acc.items.map((i) => i.name).join(", "),
    };
  }

  try {
    const db = getDb();
    const rows = await db
      .select({
        account: accounts,
        item: accountItems,
      })
      .from(accounts)
      .leftJoin(accountItems, eq(accountItems.accountId, accounts.id))
      .where(eq(accounts.id, id));

    if (!rows || rows.length === 0) return null;

    const mainAcc = rows[0].account;
    const items = rows.map((r) => r.item).filter(Boolean);
    const weaponsString = items.map((i) => i?.name).filter(Boolean).join(", ");

    return {
      ...mainAcc,
      weaponsString,
    };
  } catch (err) {
    console.error("Error obteniendo cuenta para edicion:", err);
    return null;
  }
}

export default async function EditAccountPage({ params }: EditAccountPageProps) {
  const { id } = await params;
  const account = await getAccountForEdit(id);

  if (!account) {
    notFound();
  }

  const priceValue = (account.publicPriceCents / 100).toFixed(2);

  return (
    <main className="min-h-screen bg-[#090a0f] p-4 sm:p-8">
      <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-[#1f2430] bg-[#0d0f17] p-5 sm:p-7 shadow-2xl">
        
        {/* CABECERA */}
        <div className="border-b border-[#1f2430] pb-4 space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              ✏️ Modificar Publicación ({account.publicCode})
            </h1>
            <Link
              href="/admin"
              className="text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl transition"
            >
              ← Cancelar
            </Link>
          </div>
          <p className="text-xs text-zinc-400">
            Actualizá las fotos, precio, descripción y armas de la cuenta publicada.
          </p>
        </div>

        {/* FORMULARIO DE EDICIÓN */}
        <form action={updateAccountAction} className="space-y-5">
          <input type="hidden" name="accountId" value={account.id} />
          <input type="hidden" name="gameId" value={account.gameId} />

          {/* 1. FOTOS CON SUBIDA DIRECTA */}
          <div className="space-y-2">
            <label className="text-xs font-black text-[#f5b942] uppercase tracking-wider block">
              1. Fotos de la Cuenta
            </label>
            <ImageUploader name="imageUrls" initialUrls={account.imageUrls} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 2. Precio */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-white uppercase tracking-wider block" htmlFor="publicPrice">
                2. Precio (USDT / €)
              </label>
              <input
                id="publicPrice"
                name="publicPrice"
                type="number"
                step="0.01"
                required
                defaultValue={priceValue}
                placeholder="Ej: 995"
                className="h-11 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-3.5 text-sm font-black text-[#f5b942] outline-none focus:border-[#f5b942]"
              />
            </div>

            {/* 3. Región */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-white uppercase tracking-wider block" htmlFor="region">
                3. Región
              </label>
              <select
                id="region"
                name="region"
                required
                defaultValue={account.region}
                className="h-11 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-3.5 text-xs font-bold text-white outline-none focus:border-[#f5b942]"
              >
                <option value="LATAM_10CP">LATAM (Ruleta 10 CP)</option>
                <option value="INDIA_10CP">India (Ruleta 10 CP)</option>
                <option value="LATAM_GLOBAL">LATAM / Global (Ruleta 20 CP)</option>
                <option value="USA_EU">USA / Europa (Ruleta 30 CP)</option>
              </select>
            </div>

            {/* 4. Tipo de Acceso General */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-black text-white uppercase tracking-wider block" htmlFor="accessType">
                4. Tipo de Acceso
              </label>
              <select
                id="accessType"
                name="accessType"
                required
                defaultValue={account.accessType}
                className="h-11 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-3.5 text-xs font-bold text-white outline-none focus:border-[#f5b942]"
              >
                <option value="FULL_ACCESS">🔒 Full Acceso</option>
                <option value="PARTIAL_ACCESS">🔓 Acceso Parcial</option>
              </select>
            </div>

          </div>

          {/* CANTIDADES DE MÍTICAS Y LEGENDARIAS */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block" htmlFor="mythicsCount">
                Míticas
              </label>
              <input
                id="mythicsCount"
                name="mythicsCount"
                type="number"
                min="0"
                defaultValue={account.mythicsCount}
                className="h-10 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-3 text-xs font-bold text-white outline-none focus:border-[#f5b942]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block" htmlFor="legendariesCount">
                Legendarias
              </label>
              <input
                id="legendariesCount"
                name="legendariesCount"
                type="number"
                min="0"
                defaultValue={account.legendariesCount}
                className="h-10 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-3 text-xs font-bold text-white outline-none focus:border-[#f5b942]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block" htmlFor="epicsCount">
                Épicas
              </label>
              <input
                id="epicsCount"
                name="epicsCount"
                type="number"
                min="0"
                defaultValue={account.epicsCount}
                className="h-10 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-3 text-xs font-bold text-white outline-none focus:border-[#f5b942]"
              />
            </div>
          </div>

          {/* LISTA DESTACADA DE ARMAS */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-white uppercase tracking-wider block" htmlFor="weapons">
              Armas y Skins Destacadas (Separadas por comas)
            </label>
            <input
              id="weapons"
              name="weapons"
              type="text"
              defaultValue={account.weaponsString}
              placeholder="Ej: AK-47 Radiance (Mítica MAX), Templar Mítico, DL Q33 Lotus Flame"
              className="h-11 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-3.5 text-xs font-semibold text-white outline-none focus:border-[#f5b942]"
            />
          </div>

          {/* DESCRIPCIÓN COMPLETA DE LA CUENTA */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-white uppercase tracking-wider block" htmlFor="description">
              Descripción Completa de la Cuenta
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              defaultValue={account.description}
              placeholder="Escribí los detalles clave de la cuenta..."
              className="w-full rounded-xl border border-[#1f2430] bg-[#000000] p-3.5 text-xs font-semibold text-white outline-none focus:border-[#f5b942] leading-relaxed custom-scrollbar"
            />
          </div>

          {/* BOTÓN GUARDAR CAMBIOS */}
          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-[#f5b942] hover:bg-[#e0a430] text-xs font-black text-[#000000] uppercase tracking-wider shadow-gold-glow transition cursor-pointer"
          >
            💾 Guardar Cambios en la Publicación
          </button>

        </form>

      </div>
    </main>
  );
}
