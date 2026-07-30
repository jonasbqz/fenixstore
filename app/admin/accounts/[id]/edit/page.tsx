import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, isDbConnected } from "../../../../../lib/db";
import { accounts } from "../../../../../lib/db/schema";
import { mockAccounts } from "../../../../../lib/db/mockData";
import { updateAccountAction, ensureTablesExist } from "../../../actions";
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
      bindingFacebook: acc.bindings?.facebook || "LIBRE",
      bindingGoogle: acc.bindings?.google || "LIBRE",
      bindingApple: acc.bindings?.apple || "LIBRE",
    };
  }

  try {
    await ensureTablesExist();
    const db = getDb();
    const rows = await db
      .select({
        account: accounts,
      })
      .from(accounts)
      .where(eq(accounts.id, id));

    if (!rows || rows.length === 0) return null;

    return {
      ...rows[0].account,
      bindingFacebook: rows[0].account.bindingFacebook || "LIBRE",
      bindingGoogle: rows[0].account.bindingGoogle || "LIBRE",
      bindingApple: rows[0].account.bindingApple || "LIBRE",
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
            Actualizá las fotos, precio, accesos y descripción de la cuenta publicada.
          </p>
        </div>

        {/* FORMULARIO DE EDICIÓN */}
        <form action={updateAccountAction} className="space-y-5">
          <input type="hidden" name="accountId" value={account.id} />
          <input type="hidden" name="gameId" value={account.gameId} />
          <input type="hidden" name="weapons" value="" />

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

          {/* 5. ESTADO EXACTO DE VINCULACIONES POR RED */}
          <div className="space-y-3 bg-[#000000] p-4 rounded-2xl border border-[#1f2430]">
            <label className="text-xs font-black text-[#f5b942] uppercase tracking-wider block">
              5. Estado Exacto de cada Red / Vinculación
            </label>

            {/* Activision */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#090a0f] border border-emerald-500/30 text-xs">
              <span className="font-black text-white">🎮 Activision</span>
              <span className="font-black text-emerald-400">✓ Se Entrega Obligatorio</span>
            </div>

            {/* Facebook */}
            <div className="space-y-1 p-3 rounded-xl bg-[#090a0f] border border-[#1f2430]">
              <label className="text-xs font-black text-white block" htmlFor="binding_facebook">
                📘 Facebook
              </label>
              <select
                id="binding_facebook"
                name="binding_facebook"
                defaultValue={account.bindingFacebook || "LIBRE"}
                className="h-10 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-3 text-xs font-bold text-white outline-none focus:border-[#f5b942]"
              >
                <option value="LIBRE">🔓 Libre (Limpia para vincular)</option>
                <option value="ENTREGADO">✅ Se Entrega (Datos de Facebook incluidos)</option>
                <option value="ELIMINADO">🗑️ Eliminado / Desvinculado permanente</option>
                <option value="INACCESIBLE">❌ Inaccesible / Perdido</option>
              </select>
            </div>

            {/* Google */}
            <div className="space-y-1 p-3 rounded-xl bg-[#090a0f] border border-[#1f2430]">
              <label className="text-xs font-black text-white block" htmlFor="binding_google">
                🌐 Google / Gmail
              </label>
              <select
                id="binding_google"
                name="binding_google"
                defaultValue={account.bindingGoogle || "LIBRE"}
                className="h-10 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-3 text-xs font-bold text-white outline-none focus:border-[#f5b942]"
              >
                <option value="LIBRE">🔓 Libre (Limpia para vincular)</option>
                <option value="ENTREGADO">✅ Se Entrega (Datos de Google incluidos)</option>
                <option value="ELIMINADO">🗑️ Eliminado / Desvinculado permanente</option>
                <option value="INACCESIBLE">❌ Inaccesible / Perdido</option>
              </select>
            </div>

            {/* Apple ID */}
            <div className="space-y-1 p-3 rounded-xl bg-[#090a0f] border border-[#1f2430]">
              <label className="text-xs font-black text-white block" htmlFor="binding_apple">
                🍎 Apple ID
              </label>
              <select
                id="binding_apple"
                name="binding_apple"
                defaultValue={account.bindingApple || "LIBRE"}
                className="h-10 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-3 text-xs font-bold text-white outline-none focus:border-[#f5b942]"
              >
                <option value="LIBRE">🔓 Libre (Limpia para vincular)</option>
                <option value="ENTREGADO">✅ Se Entrega (Datos de Apple incluidos)</option>
                <option value="ELIMINADO">🗑️ Eliminado / Desvinculado permanente</option>
                <option value="INACCESIBLE">❌ Inaccesible / Perdido</option>
              </select>
            </div>

          </div>

          {/* CANTIDADES DE MÍTICAS Y LEGENDARIAS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block" htmlFor="mythicsCount">
                Armas Míticas
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
                Armas Legendarias
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
          </div>

          {/* DESCRIPCIÓN COMPLETA DE LA CUENTA */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-white uppercase tracking-wider block" htmlFor="description">
              Descripción Completa de la Publicación
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              required
              defaultValue={account.description}
              placeholder="Escribí los detalles clave de la cuenta..."
              className="w-full rounded-xl border border-[#1f2430] bg-[#000000] p-3.5 text-xs font-mono text-white outline-none focus:border-[#f5b942] leading-relaxed custom-scrollbar"
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
