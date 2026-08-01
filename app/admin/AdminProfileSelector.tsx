"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { UserCheck, Plus, Settings, X, Check, Phone, ShieldCheck, Sparkles, Send } from "lucide-react";
import { type MockSeller } from "../../lib/db/mockData";
import { createAdminProfileAction, updateAdminProfileAction, setActiveAdminProfileCookie } from "./actions";

type AdminProfileSelectorProps = {
  profiles: MockSeller[];
  activeProfileId: string;
};

const AVATAR_COLORS = ["#f5b942", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f97316"];
const AVATAR_ICONS = ["👑", "🔥", "⚡", "🎮", "🛡️", "🚀", "🎯", "💎"];

export default function AdminProfileSelector({ profiles, activeProfileId }: AdminProfileSelectorProps) {
  const [isOpen, setIsOpen] = useState(!activeProfileId || activeProfileId === "default");
  const [editingProfile, setEditingProfile] = useState<MockSeller | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || {
    id: "admin-1",
    name: "Admin Principal",
    whatsapp: "351920331564",
    avatarColor: "#f5b942",
    avatarIcon: "👑",
    status: "ACTIVO",
  };

  const handleSelectProfile = async (id: string) => {
    await setActiveAdminProfileCookie(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* BARRA DE PERFIL ACTIVO (ESTILO PREMIUM NETFLIX) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-[#f5b942]/40 bg-gradient-to-r from-[#131622] via-[#0d0f17] to-[#171a29] p-3 sm:p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: activeProfile.avatarColor }}
            className="h-11 w-11 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg ring-2 ring-white/10 shrink-0"
          >
            {activeProfile.avatarIcon}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">{activeProfile.name}</span>
              <span className="px-2 py-0.5 rounded-md bg-[#f5b942]/20 border border-[#f5b942]/40 text-[10px] font-black text-[#f5b942]">
                Perfil Activo
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
              <Phone className="h-3 w-3 text-emerald-400" />
              <span>+{activeProfile.whatsapp}</span>
              {activeProfile.telegram && (
                <span className="text-sky-400 ml-1">(@{activeProfile.telegram})</span>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-10 px-4 rounded-xl bg-[#f5b942] hover:bg-[#e0a430] text-xs font-black text-[#000000] shadow-gold-glow transition uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          <span>Cambiar / Crear Perfil Admin</span>
        </button>
      </div>

      {/* MODAL DE SELECCIÓN DE PERFIL (ESTILO NETFLIX) */}
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-2xl translate-x-[-50%] translate-y-[-50%] rounded-3xl border border-[#1f2430] bg-[#0d0f17] p-5 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* CABECERA */}
            <div className="flex items-center justify-between border-b border-[#1f2430] pb-4">
              <div>
                <Dialog.Title className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>🎭 ¿Quién está publicando hoy?</span>
                </Dialog.Title>
                <Dialog.Description className="text-xs text-zinc-400 mt-1">
                  Seleccioná tu perfil de Administrador. Cada cuenta que publiques usará tu número de WhatsApp para contacto directo con clientes.
                </Dialog.Description>
              </div>

              <Dialog.Close className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-white transition cursor-pointer">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            {/* SI ESTÁ CREANDO O EDITANDO */}
            {isCreating || editingProfile ? (
              <form
                action={editingProfile ? updateAdminProfileAction : createAdminProfileAction}
                className="space-y-4 bg-[#000000]/60 p-4 sm:p-5 rounded-2xl border border-[#1f2430]"
              >
                <div className="flex items-center justify-between border-b border-[#1f2430] pb-3">
                  <h3 className="text-xs font-black text-[#f5b942] uppercase tracking-wider">
                    {editingProfile ? `✏️ Editar Perfil de ${editingProfile.name}` : "➕ Crear Nuevo Perfil de Admin"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingProfile(null);
                    }}
                    className="text-xs font-bold text-zinc-400 hover:text-white"
                  >
                    ← Volver
                  </button>
                </div>

                {editingProfile && <input type="hidden" name="id" value={editingProfile.id} />}

                {/* Nombre */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-white block">Nombre del Admin / Vendedor</label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editingProfile?.name || ""}
                    placeholder="Ej: Admin Carlos"
                    className="h-10 w-full rounded-xl border border-[#1f2430] bg-[#090a0f] px-3 text-xs font-bold text-white outline-none focus:border-[#f5b942]"
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-white block">Número de WhatsApp (con código de país sin +)</label>
                  <input
                    name="whatsapp"
                    type="text"
                    required
                    defaultValue={editingProfile?.whatsapp || "351920331564"}
                    placeholder="Ej: 351920331564"
                    className="h-10 w-full rounded-xl border border-[#1f2430] bg-[#090a0f] px-3 text-xs font-mono text-white outline-none focus:border-[#f5b942]"
                  />
                </div>

                {/* Telegram opcional */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-white block">Usuario Telegram (Opcional)</label>
                  <input
                    name="telegram"
                    type="text"
                    defaultValue={editingProfile?.telegram || ""}
                    placeholder="Ej: admin_fenix"
                    className="h-10 w-full rounded-xl border border-[#1f2430] bg-[#090a0f] px-3 text-xs font-mono text-white outline-none focus:border-[#f5b942]"
                  />
                </div>

                {/* Selector de Icono y Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Iconos */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-white block">Icono Avatar</label>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_ICONS.map((icon) => (
                        <label key={icon} className="cursor-pointer">
                          <input
                            type="radio"
                            name="avatarIcon"
                            value={icon}
                            defaultChecked={editingProfile ? editingProfile.avatarIcon === icon : icon === "👑"}
                            className="peer sr-only"
                          />
                          <span className="h-9 w-9 rounded-xl border border-[#1f2430] bg-[#090a0f] flex items-center justify-center text-base peer-checked:border-[#f5b942] peer-checked:bg-[#f5b942]/20 transition">
                            {icon}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Colores */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-white block">Color Avatar</label>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_COLORS.map((color) => (
                        <label key={color} className="cursor-pointer">
                          <input
                            type="radio"
                            name="avatarColor"
                            value={color}
                            defaultChecked={editingProfile ? editingProfile.avatarColor === color : color === "#f5b942"}
                            className="peer sr-only"
                          />
                          <span
                            style={{ backgroundColor: color }}
                            className="h-9 w-9 rounded-xl border-2 border-transparent peer-checked:border-white peer-checked:scale-110 shadow-md flex items-center justify-center transition"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-[#f5b942] hover:bg-[#e0a430] text-xs font-black text-[#000000] uppercase tracking-wider transition cursor-pointer shadow-gold-glow"
                  >
                    💾 {editingProfile ? "Guardar Cambios de Perfil" : "Crear Perfil y Seleccionar"}
                  </button>
                </div>
              </form>
            ) : (
              /* GRILLA ESTILO NETFLIX DE PERFILES DE ADMIN */
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {profiles.map((profile) => {
                    const isSelected = profile.id === activeProfileId;

                    return (
                      <div
                        key={profile.id}
                        className={`group relative flex flex-col items-center justify-between rounded-2xl border p-4 text-center transition duration-300 ${
                          isSelected
                            ? "border-[#f5b942] bg-[#f5b942]/10 ring-2 ring-[#f5b942]/40 shadow-gold-glow"
                            : "border-[#1f2430] bg-[#090a0f] hover:border-zinc-700 hover:bg-[#131622]"
                        }`}
                      >
                        {/* Avatar */}
                        <button
                          type="button"
                          onClick={() => handleSelectProfile(profile.id)}
                          className="w-full flex flex-col items-center space-y-2 cursor-pointer"
                        >
                          <div
                            style={{ backgroundColor: profile.avatarColor }}
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl flex items-center justify-center text-3xl font-black shadow-2xl transition transform group-hover:scale-105"
                          >
                            {profile.avatarIcon}
                          </div>

                          <span className="text-xs sm:text-sm font-black text-white group-hover:text-[#f5b942] transition">
                            {profile.name}
                          </span>

                          <span className="text-[10px] font-mono text-zinc-400">
                            +{profile.whatsapp}
                          </span>
                        </button>

                        {/* Botón Editar / Indicador */}
                        <div className="mt-3 w-full flex items-center justify-between border-t border-[#1f2430] pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingProfile(profile)}
                            className="text-[10px] font-bold text-zinc-400 hover:text-white flex items-center gap-1"
                          >
                            <Settings className="h-3 w-3" />
                            <span>Editar</span>
                          </button>

                          {isSelected ? (
                            <span className="text-[10px] font-black text-[#f5b942] flex items-center gap-0.5">
                              <Check className="h-3 w-3" /> Activo
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSelectProfile(profile.id)}
                              className="text-[10px] font-black text-emerald-400 hover:underline"
                            >
                              Usar Perfil
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* BOTÓN CREAR NUEVO PERFIL */}
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="h-12 w-full rounded-2xl border border-dashed border-[#f5b942]/40 bg-[#f5b942]/5 hover:bg-[#f5b942]/10 text-xs font-black text-[#f5b942] transition uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Añadir Otro Perfil de Administrador</span>
                </button>
              </div>
            )}

          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
