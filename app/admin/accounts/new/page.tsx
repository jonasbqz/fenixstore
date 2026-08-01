import Link from "next/link";
import { createAccountAction, getAdminProfiles, getActiveAdminProfileId } from "../../actions";
import ImageUploader from "../../../components/ImageUploader";

export default async function NewAccountPage() {
  const profiles = await getAdminProfiles();
  const activeProfileId = await getActiveAdminProfileId();

  return (
    <main className="min-h-screen bg-[#090a0f] p-4 sm:p-8">
      <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-[#1f2430] bg-[#0d0f17] p-5 sm:p-7 shadow-2xl">
        
        {/* CABECERA */}
        <div className="border-b border-[#1f2430] pb-4 space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              📸 Publicar Cuenta en el Catálogo
            </h1>
            <Link
              href="/admin"
              className="text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl transition"
            >
              ← Volver
            </Link>
          </div>
          <p className="text-xs text-zinc-400">
            Formulario directo. Los clientes te contactarán directamente a tu WhatsApp personal al publicarla.
          </p>
        </div>

        {/* FORMULARIO */}
        <form action={createAccountAction} className="space-y-5">
          
          {/* SELECTOR DE ADMINISTRADOR PUBLICADOR */}
          <div className="space-y-1.5 bg-[#000000] p-4 rounded-2xl border border-[#f5b942]/30">
            <label className="text-xs font-black text-[#f5b942] uppercase tracking-wider block" htmlFor="sellerId">
              👤 Administrador / Vendedor Responsable
            </label>
            <select
              id="sellerId"
              name="sellerId"
              defaultValue={activeProfileId}
              required
              className="h-11 w-full rounded-xl border border-[#1f2430] bg-[#090a0f] px-3 text-xs font-bold text-white outline-none focus:border-[#f5b942]"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.avatarIcon} {p.name} (+{p.whatsapp})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-400">
              El botón "Comprar por WhatsApp" dirigirá al cliente al número de este administrador.
            </p>
          </div>

          {/* 1. FOTOS CON COMPRESIÓN CLIENT-SIDE Y ALMACENAMIENTO VPS */}
          <div className="space-y-2">
            <label className="text-xs font-black text-[#f5b942] uppercase tracking-wider block">
              1. Fotos de la Cuenta (Subida Directa)
            </label>
            <ImageUploader name="imageUrls" />
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
                placeholder="Ej: 995"
                className="h-11 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-3.5 text-sm font-black text-[#f5b942] outline-none focus:border-[#f5b942]"
              />
            </div>

            {/* 3. Región */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-white uppercase tracking-wider block" htmlFor="region">
                3. Región (Ruleta Inicial)
              </label>
              <select
                id="region"
                name="region"
                required
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
                4. Tipo de Acceso General
              </label>
              <select
                id="accessType"
                name="accessType"
                required
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
                className="h-10 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-3 text-xs font-bold text-white outline-none focus:border-[#f5b942]"
              >
                <option value="LIBRE">🔓 Libre (Limpia para vincular)</option>
                <option value="ELIMINADO">🗑️ Eliminado / Desvinculado permanente</option>
                <option value="ENTREGADO">✅ Se Entrega (Datos de Facebook incluidos)</option>
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
                className="h-10 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-3 text-xs font-bold text-white outline-none focus:border-[#f5b942]"
              >
                <option value="LIBRE">🔓 Libre (Limpia para vincular)</option>
                <option value="ENTREGADO">✅ Se Entrega (Datos de Apple incluidos)</option>
                <option value="ELIMINADO">🗑️ Eliminado / Desvinculado permanente</option>
                <option value="INACCESIBLE">❌ Inaccesible / Perdido</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 6. Míticas */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-red-400 uppercase tracking-wider block" htmlFor="mythicsCount">
                6. Armas Míticas
              </label>
              <input
                id="mythicsCount"
                name="mythicsCount"
                type="number"
                min="0"
                defaultValue="0"
                required
                className="h-11 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-3.5 text-sm font-black text-red-400 outline-none focus:border-[#f5b942]"
              />
            </div>

            {/* 7. Legendarias */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-amber-400 uppercase tracking-wider block" htmlFor="legendariesCount">
                7. Armas Legendarias
              </label>
              <input
                id="legendariesCount"
                name="legendariesCount"
                type="number"
                min="0"
                defaultValue="0"
                required
                className="h-11 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-3.5 text-sm font-black text-amber-400 outline-none focus:border-[#f5b942]"
              />
            </div>
          </div>

          <input type="hidden" name="gameId" value="CODM" />
          <input type="hidden" name="rank" value="LEGENDARY" />
          <input type="hidden" name="epicsCount" value="50" />
          <input type="hidden" name="level" value="400" />
          <input type="hidden" name="weapons" value="" />

          {/* 8. Descripción completa de la publicación */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-white uppercase tracking-wider block" htmlFor="description">
              8. Texto de la Publicación y Descripción
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              placeholder="SOLO VENTA&#10;🔥 FULL MÍTICAS Y PERSONAJES AL MAX 🔥&#10;&#10;💰 Precio: 995 USDT (5100 reais) 20000 mxn&#10;🔐 Accesos: FULL Activision y Facebook eliminado resto libre&#10;♦️ Armas míticas: 23/ 12 al máximo&#10;🟡 Armas legendarias: 51"
              className="w-full rounded-xl border border-[#1f2430] bg-[#000000] p-3.5 text-xs font-mono text-white outline-none focus:border-[#f5b942] resize-none leading-relaxed"
            />
          </div>

          {/* BOTÓN PUBLICAR */}
          <div className="pt-3 border-t border-[#1f2430]">
            <button
              type="submit"
              className="h-12 w-full rounded-2xl bg-[#f5b942] hover:bg-[#e0a430] text-xs font-black text-[#000000] transition duration-200 uppercase tracking-wider cursor-pointer shadow-gold-glow flex items-center justify-center gap-2"
            >
              <span>🚀 Publicar en el Catálogo Web</span>
            </button>
          </div>

        </form>

      </div>
    </main>
  );
}
