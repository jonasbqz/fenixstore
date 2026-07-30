"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Flame,
  Globe,
  Lock,
  Unlock,
  ChevronDown,
  X,
  Crosshair,
  Check,
  Star,
  Sparkles,
} from "lucide-react";

type CustomFiltersProps = {
  selectedTag?: string;
  selectedMinMythics?: string;
  selectedRegion?: string;
  selectedAccess?: string;
  selectedMaxPrice?: string;
  mythicOperators: string[];
  legendaryOperators: string[];
  mythicWeapons: string[];
  prestigeWeapons: string[];
  legendaryWeapons: string[];
};

export default function CustomFilters({
  selectedTag = "",
  selectedMinMythics = "",
  selectedRegion = "",
  selectedAccess = "",
  selectedMaxPrice = "",
  mythicOperators,
  legendaryOperators,
  mythicWeapons,
  prestigeWeapons,
  legendaryWeapons,
}: CustomFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [openPopover, setOpenPopover] = useState<"tag" | "minMythics" | "region" | "acceso" | null>(null);

  const [tag, setTag] = useState(selectedTag);
  const [minMythics, setMinMythics] = useState(selectedMinMythics);
  const [region, setRegion] = useState(selectedRegion);
  const [acceso, setAcceso] = useState(selectedAccess);
  const [precioMax, setPrecioMax] = useState(selectedMaxPrice);

  const [weaponSearch, setWeaponSearch] = useState("");

  function applyFilters(newFilters: {
    tag?: string;
    minMythics?: string;
    region?: string;
    acceso?: string;
    precioMax?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    
    const nextTag = newFilters.tag !== undefined ? newFilters.tag : tag;
    const nextMinMythics = newFilters.minMythics !== undefined ? newFilters.minMythics : minMythics;
    const nextRegion = newFilters.region !== undefined ? newFilters.region : region;
    const nextAccess = newFilters.acceso !== undefined ? newFilters.acceso : acceso;
    const nextPrice = newFilters.precioMax !== undefined ? newFilters.precioMax : precioMax;

    if (nextTag) params.set("tag", nextTag); else params.delete("tag");
    if (nextMinMythics) params.set("min_miticas", nextMinMythics); else params.delete("min_miticas");
    if (nextRegion) params.set("region", nextRegion); else params.delete("region");
    if (nextAccess) params.set("acceso", nextAccess); else params.delete("acceso");
    if (nextPrice) params.set("precio_max", nextPrice); else params.delete("precio_max");

    router.push(`/?${params.toString()}`);
  }

  function handleSelectTag(val: string) {
    setTag(val);
    setOpenPopover(null);
    setWeaponSearch("");
    applyFilters({ tag: val });
  }

  function handleSelectMinMythics(val: string) {
    setMinMythics(val);
    setOpenPopover(null);
    applyFilters({ minMythics: val });
  }

  function handleSelectRegion(val: string) {
    setRegion(val);
    setOpenPopover(null);
    applyFilters({ region: val });
  }

  function handleSelectAccess(val: string) {
    setAcceso(val);
    setOpenPopover(null);
    applyFilters({ acceso: val });
  }

  function handleReset() {
    setTag("");
    setMinMythics("");
    setRegion("");
    setAcceso("");
    setPrecioMax("");
    setOpenPopover(null);
    setWeaponSearch("");
    router.push("/");
  }

  const isFiltered = Boolean(tag || minMythics || region || acceso || precioMax);

  const filteredMythicOperators = mythicOperators.filter((op) =>
    op.toLowerCase().includes(weaponSearch.toLowerCase())
  );
  const filteredMythicWeapons = mythicWeapons.filter((w) =>
    w.toLowerCase().includes(weaponSearch.toLowerCase())
  );
  const filteredPrestigeWeapons = prestigeWeapons.filter((w) =>
    w.toLowerCase().includes(weaponSearch.toLowerCase())
  );
  const filteredLegendaryWeapons = legendaryWeapons.filter((w) =>
    w.toLowerCase().includes(weaponSearch.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-[#1f2430] bg-[#090a0f] p-3 sm:p-4 space-y-3 shadow-2xl">
      
      {/* 1. BUSCADOR PRINCIPAL Y PRECIO */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyFilters({ tag, precioMax });
              }
            }}
            placeholder="Buscar arma, skin o código..."
            className="h-10.5 w-full rounded-xl border border-[#1f2430] bg-[#000000] pl-10 pr-3 text-xs font-bold text-white outline-none focus:border-[#f5b942] transition placeholder:text-zinc-500 shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyFilters({ tag, precioMax });
              }
            }}
            inputMode="decimal"
            placeholder="Max USDT/€"
            className={`h-10.5 w-26 sm:w-28 rounded-xl border text-xs px-3 text-center font-extrabold outline-none transition placeholder:text-zinc-500 ${
              precioMax
                ? "border-[#f5b942] bg-[#f5b942]/15 text-[#f5b942]"
                : "border-[#1f2430] bg-[#000000] text-white focus:border-[#f5b942]"
            }`}
          />

          <button
            type="button"
            onClick={() => applyFilters({ tag, precioMax })}
            className="h-10.5 px-4 rounded-xl bg-[#f5b942] hover:bg-[#e0a430] text-xs font-black text-[#000000] transition cursor-pointer uppercase tracking-wider flex items-center gap-1.5 shadow-gold-glow shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4 stroke-[2.5]" />
            <span>Filtrar</span>
          </button>

          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="h-10.5 w-10.5 rounded-xl border border-[#ff2a40]/40 bg-[#ff2a40]/10 text-[#ff2a40] hover:bg-[#ff2a40]/20 transition shrink-0 flex items-center justify-center cursor-pointer"
              title="Limpiar todos los filtros"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. CHIPS DE FILTROS EN FLEX WRAP */}
      <div className="flex flex-wrap items-center gap-2 w-full pt-0.5">
        
        {/* POPOVER: ARMAS Y SKINS */}
        <Popover.Root
          open={openPopover === "tag"}
          onOpenChange={(open) => setOpenPopover(open ? "tag" : null)}
        >
          <Popover.Trigger asChild>
            <button
              type="button"
              className={`h-9 px-3 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                tag
                  ? "border-[#f5b942] bg-[#f5b942]/15 text-[#f5b942]"
                  : "border-[#1f2430] bg-[#000000] text-zinc-300 hover:border-zinc-700"
              }`}
            >
              <Crosshair className="h-3.5 w-3.5 text-[#f5b942]" />
              <span className="truncate max-w-[120px]">
                {tag ? tag : "Armas / Skins"}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={6}
              className="z-50 w-[300px] sm:w-[340px] rounded-2xl border border-[#1f2430] bg-[#090a0f]/98 p-3 shadow-2xl backdrop-blur-xl text-white select-none space-y-3"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={weaponSearch}
                  onChange={(e) => setWeaponSearch(e.target.value)}
                  placeholder="Buscar arma o skin mítica..."
                  className="h-8.5 w-full rounded-xl border border-[#1f2430] bg-[#000000] pl-8 pr-3 text-xs font-semibold text-white outline-none focus:border-[#f5b942]"
                />
              </div>

              <div className="max-h-[260px] overflow-y-auto space-y-3 pr-1">
                {tag && (
                  <button
                    type="button"
                    onClick={() => handleSelectTag("")}
                    className="w-full py-1.5 px-2.5 rounded-lg border border-red-500/30 bg-red-950/20 text-xs font-bold text-red-400 hover:bg-red-900/30 flex items-center justify-between"
                  >
                    <span>Limpiar selección</span>
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* OPERADORES MÍTICOS */}
                {filteredMythicOperators.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-[#ff2a40] tracking-wider px-1 flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      <span>Operadores Míticos</span>
                    </div>
                    {filteredMythicOperators.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleSelectTag(item)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                          tag === item
                            ? "bg-[#ff2a40]/20 text-[#ff2a40] border border-[#ff2a40]/40"
                            : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                        }`}
                      >
                        <span>{item}</span>
                        {tag === item && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* ARMAS MÍTICAS */}
                {filteredMythicWeapons.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-[#ff2a40] tracking-wider px-1 flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      <span>Armas Míticas</span>
                    </div>
                    {filteredMythicWeapons.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleSelectTag(item)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                          tag === item
                            ? "bg-[#ff2a40]/20 text-[#ff2a40] border border-[#ff2a40]/40"
                            : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                        }`}
                      >
                        <span>{item}</span>
                        {tag === item && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* ARMAS PRESTIGIO */}
                {filteredPrestigeWeapons.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-[#f5b942] tracking-wider px-1 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>Armas Prestigio</span>
                    </div>
                    {filteredPrestigeWeapons.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleSelectTag(item)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                          tag === item
                            ? "bg-[#f5b942]/20 text-[#f5b942] border border-[#f5b942]/40"
                            : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                        }`}
                      >
                        <span>{item}</span>
                        {tag === item && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* ARMAS LEGENDARIAS */}
                {filteredLegendaryWeapons.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-[#ff9900] tracking-wider px-1 flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span>Armas Legendarias</span>
                    </div>
                    {filteredLegendaryWeapons.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleSelectTag(item)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                          tag === item
                            ? "bg-[#ff9900]/20 text-[#ff9900] border border-[#ff9900]/40"
                            : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                        }`}
                      >
                        <span>{item}</span>
                        {tag === item && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* POPOVER: CANTIDAD DE MÍTICAS */}
        <Popover.Root
          open={openPopover === "minMythics"}
          onOpenChange={(open) => setOpenPopover(open ? "minMythics" : null)}
        >
          <Popover.Trigger asChild>
            <button
              type="button"
              className={`h-9 px-3 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                minMythics
                  ? "border-[#ff2a40] bg-[#ff2a40]/15 text-[#ff2a40]"
                  : "border-[#1f2430] bg-[#000000] text-zinc-300 hover:border-zinc-700"
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-[#ff2a40]" />
              <span>
                {minMythics ? `${minMythics}+ Míticas` : "Míticas"}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={6}
              className="z-50 w-48 rounded-2xl border border-[#1f2430] bg-[#090a0f]/98 p-2 shadow-2xl backdrop-blur-xl text-white select-none space-y-1"
            >
              <div className="px-2 py-1 text-[10px] font-black uppercase text-zinc-400">
                Filtro por Míticas
              </div>
              {[
                { label: "Todas", val: "" },
                { label: "1+ Míticas", val: "1" },
                { label: "3+ Míticas", val: "3" },
                { label: "5+ Míticas", val: "5" },
                { label: "10+ Míticas", val: "10" },
                { label: "15+ Míticas", val: "15" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => handleSelectMinMythics(opt.val)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                    minMythics === opt.val
                      ? "bg-[#ff2a40]/20 text-[#ff2a40]"
                      : "text-zinc-300 hover:bg-zinc-800/60"
                  }`}
                >
                  <span>{opt.label}</span>
                  {minMythics === opt.val && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* POPOVER: REGIÓN / PRECIO RULETA */}
        <Popover.Root
          open={openPopover === "region"}
          onOpenChange={(open) => setOpenPopover(open ? "region" : null)}
        >
          <Popover.Trigger asChild>
            <button
              type="button"
              className={`h-9 px-3 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                region
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                  : "border-[#1f2430] bg-[#000000] text-zinc-300 hover:border-zinc-700"
              }`}
            >
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                {region === "LATAM_10CP"
                  ? "LATAM (10 CP)"
                  : region === "INDIA_10CP" || region === "INDIA"
                  ? "India (10 CP)"
                  : region === "LATAM_GLOBAL"
                  ? "LATAM (20 CP)"
                  : region === "USA_EU"
                  ? "USA / EU (30 CP)"
                  : "Región"}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={6}
              className="z-50 w-56 rounded-2xl border border-[#1f2430] bg-[#090a0f]/98 p-2 shadow-2xl backdrop-blur-xl text-white select-none space-y-1"
            >
              <div className="px-2 py-1 text-[10px] font-black uppercase text-zinc-400">
                Región de Ruleta
              </div>
              {[
                { label: "Todas las regiones", val: "" },
                { label: "LATAM (10 CP)", val: "LATAM_10CP" },
                { label: "India (10 CP)", val: "INDIA_10CP" },
                { label: "LATAM (20 CP)", val: "LATAM_GLOBAL" },
                { label: "USA / EU (30 CP)", val: "USA_EU" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => handleSelectRegion(opt.val)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                    region === opt.val
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-zinc-300 hover:bg-zinc-800/60"
                  }`}
                >
                  <span>{opt.label}</span>
                  {region === opt.val && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* POPOVER: ACCESO / VINCULACIÓN */}
        <Popover.Root
          open={openPopover === "acceso"}
          onOpenChange={(open) => setOpenPopover(open ? "acceso" : null)}
        >
          <Popover.Trigger asChild>
            <button
              type="button"
              className={`h-9 px-3 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                acceso
                  ? "border-blue-500 bg-blue-500/15 text-blue-400"
                  : "border-[#1f2430] bg-[#000000] text-zinc-300 hover:border-zinc-700"
              }`}
            >
              {acceso === "FULL_ACCESS" ? (
                <Unlock className="h-3.5 w-3.5 text-emerald-400" />
              ) : acceso === "PARTIAL_ACCESS" ? (
                <Lock className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Lock className="h-3.5 w-3.5 text-zinc-400" />
              )}
              <span>
                {acceso === "FULL_ACCESS"
                  ? "Full Acceso"
                  : acceso === "PARTIAL_ACCESS"
                  ? "Acceso Parcial"
                  : "Acceso"}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={6}
              className="z-50 w-52 rounded-2xl border border-[#1f2430] bg-[#090a0f]/98 p-2 shadow-2xl backdrop-blur-xl text-white select-none space-y-1"
            >
              <div className="px-2 py-1 text-[10px] font-black uppercase text-zinc-400">
                Tipo de Acceso
              </div>
              {[
                { label: "Todos los tipos", val: "" },
                { label: "Full Acceso (Libre)", val: "FULL_ACCESS" },
                { label: "Acceso Parcial", val: "PARTIAL_ACCESS" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => handleSelectAccess(opt.val)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                    acceso === opt.val
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-zinc-300 hover:bg-zinc-800/60"
                  }`}
                >
                  <span>{opt.label}</span>
                  {acceso === opt.val && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

      </div>
    </div>
  );
}
