import Link from "next/link";
import { logoutAdmin } from "../login/actions";
import { getStoreSettings, updateStoreSettingsAction } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <main className="min-h-screen bg-[#090a0f] p-4 sm:p-8 space-y-6">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* CABECERA */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#1f2430] bg-[#0d0f17] p-5 shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f5b942] animate-pulse" />
              <h1 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Configuración de WhatsApp</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#f5b942]/20 border border-[#f5b942]/40 text-[10px] font-black text-[#f5b942]">v0.1.1</span>
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Modificá el enlace del grupo oficial y el número de atención.</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="h-10 px-4 rounded-xl border border-[#1f2430] bg-[#131622] text-xs font-bold text-zinc-300 hover:text-white transition flex items-center justify-center cursor-pointer"
            >
              ← Volver al Panel
            </Link>
          </div>
        </header>

        {/* TARJETA DORADA DE CONFIGURACIÓN DE WHATSAPP */}
        <section className="rounded-3xl border border-[#f5b942]/40 bg-[#0d0f17] p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f2430] pb-3">
            <h2 className="text-sm font-black text-[#f5b942] uppercase tracking-wider flex items-center gap-2">
              ⚙️ Enlace del Grupo de WhatsApp y Teléfono Oficial
            </h2>
            <span className="text-[10px] font-bold text-emerald-400">✓ Actualización en tiempo real</span>
          </div>

          <form action={updateStoreSettingsAction} className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-white block" htmlFor="whatsappGroupUrl">
                Enlace del Grupo de WhatsApp Oficial
              </label>
              <input
                id="whatsappGroupUrl"
                name="whatsappGroupUrl"
                type="url"
                required
                defaultValue={settings.groupUrl}
                placeholder="https://chat.whatsapp.com/..."
                className="h-12 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-4 text-xs font-mono text-white outline-none focus:border-[#f5b942]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-white block" htmlFor="whatsappNumber">
                Número de WhatsApp Oficial (con código de país sin +)
              </label>
              <input
                id="whatsappNumber"
                name="whatsappNumber"
                type="text"
                required
                defaultValue={settings.phone}
                placeholder="351920331564"
                className="h-12 w-full rounded-xl border border-[#1f2430] bg-[#000000] px-4 text-xs font-mono text-white outline-none focus:border-[#f5b942]"
              />
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-[#f5b942] hover:bg-[#e0a430] text-xs font-black text-[#000000] uppercase tracking-wider transition cursor-pointer shadow-gold-glow mt-2"
            >
              💾 Guardar Nuevos Enlaces en Toda la Web
            </button>
          </form>
        </section>

      </div>
    </main>
  );
}
