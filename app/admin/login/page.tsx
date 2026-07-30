"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAdmin } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, null);

  return (
    <main className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-brand-border bg-brand-card p-8 shadow-card glass">
        
        {/* LOGO E INDICACIONES */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block text-2xl font-black tracking-tight text-white hover:text-brand-gold transition">
            Fénix <span className="text-brand-gold">Store</span>
          </Link>
          <h1 className="text-lg font-bold text-zinc-300">Acceso del Administrador</h1>
          <p className="text-xs text-zinc-500">Ingresá la contraseña de seguridad para gestionar cuentas y CPs.</p>
        </div>

        {/* FORMULARIO */}
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider" htmlFor="password">
              Contraseña Táctica
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••••••"
              className="h-12 w-full rounded-xl border border-brand-border bg-brand-dark px-4 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-700 focus:border-brand-gold"
            />
          </div>

          {state?.error && (
            <div className="rounded-xl border border-red-950 bg-red-950/20 px-4 py-3 text-xs font-semibold text-red-400">
              ⚠️ {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="h-12 w-full rounded-xl bg-brand-gold text-sm font-black text-brand-dark transition hover:brightness-105 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Verificando..." : "Ingresar al Panel 🔑"}
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition">
            ← Volver al Catálogo Público
          </Link>
        </div>
      </div>
    </main>
  );
}
