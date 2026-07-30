"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type GameId = "CODM" | "FF" | "PUBG";

type AccountItem = {
  id: string;
  name: string;
  type: string;
};

export type CatalogAccount = {
  id: string;
  publicCode: string;
  gameId: GameId;
  publicPriceCents: number;
  description: string;
  imageUrls: string[];
  items: AccountItem[];
  rarityTags?: string[];
};

type CatalogResponse = {
  data: CatalogAccount[];
};

const GAMES: Array<{ id: GameId; label: string }> = [
  { id: "CODM", label: "CODM" },
  { id: "FF", label: "Free Fire" },
  { id: "PUBG", label: "PUBG" },
];

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_STORE_WHATSAPP_NUMBER?.replace(/[^\d]/g, "") ||
  "TUNUMERO";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function gameLabel(gameId: GameId) {
  return GAMES.find((game) => game.id === gameId)?.label ?? gameId;
}

function buildWhatsAppUrl(account: CatalogAccount) {
  const price = formatPrice(account.publicPriceCents);
  const message = `Hola Fénix Store, me interesa la cuenta de ${gameLabel(
    account.gameId,
  )} con el código ${account.publicCode} que vi en la web por ${price}.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function getFeaturedTags(account: CatalogAccount) {
  if (account.rarityTags?.length) {
    return account.rarityTags.slice(0, 3);
  }

  return account.items.slice(0, 3).map((item) => item.name);
}

export default function CatalogoCuentas() {
  const [selectedGame, setSelectedGame] = useState<GameId | "">("");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [accounts, setAccounts] = useState<CatalogAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();

    if (selectedGame) params.set("juego", selectedGame);
    if (submittedSearch.trim()) params.set("tags", submittedSearch.trim());

    return params.toString();
  }, [selectedGame, submittedSearch]);

  useEffect(() => {
    let isActive = true;

    async function loadAccounts() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/cuentas${query ? `?${query}` : ""}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No pudimos cargar el catalogo.");
        }

        const payload = (await response.json()) as CatalogResponse;

        if (isActive) {
          setAccounts(payload.data);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No pudimos cargar el catalogo.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadAccounts();

    return () => {
      isActive = false;
    };
  }, [query]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSearch(search);
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <div className="sticky top-0 z-20 -mx-4 border-b border-black/5 bg-[#f6f7f9]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-normal text-brand-ink">
                Fénix Store
              </h1>
              <p className="text-sm font-medium text-zinc-500">
                Cuentas verificadas listas para comprar
              </p>
            </div>
            <span className="rounded-full bg-brand-green/10 px-3 py-1 text-xs font-bold text-emerald-700">
              WhatsApp
            </span>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedGame("")}
              className={`h-10 shrink-0 rounded-full px-4 text-sm font-bold transition ${
                selectedGame === ""
                  ? "bg-brand-ink text-white"
                  : "bg-white text-zinc-700 ring-1 ring-black/10"
              }`}
            >
              Todos
            </button>
            {GAMES.map((game) => (
              <button
                key={game.id}
                type="button"
                onClick={() => setSelectedGame(game.id)}
                className={`h-10 shrink-0 rounded-full px-4 text-sm font-bold transition ${
                  selectedGame === game.id
                    ? "bg-brand-ink text-white"
                    : "bg-white text-zinc-700 ring-1 ring-black/10"
                }`}
              >
                {game.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="mt-3 flex gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar arma o skin, ej: AK-47"
              className="h-12 min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 text-base font-medium text-brand-ink outline-none transition placeholder:text-zinc-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/20"
            />
            <button
              type="submit"
              className="h-12 rounded-xl bg-brand-gold px-5 text-sm font-black text-brand-ink shadow-sm transition hover:brightness-95"
            >
              Buscar
            </button>
          </form>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[420px] animate-pulse rounded-xl bg-white shadow-card"
                />
              ))
            : accounts.map((account) => (
                <article
                  key={account.id}
                  className="overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-black/5"
                >
                  <div className="relative aspect-[4/3] bg-zinc-200">
                    {account.imageUrls[0] ? (
                      <img
                        src={account.imageUrls[0]}
                        alt={`Cuenta ${account.publicCode}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-brand-ink text-3xl font-black text-white">
                        {account.publicCode}
                      </div>
                    )}
                    <div className="absolute left-3 top-3 rounded-lg bg-black/75 px-3 py-2 text-xs font-black text-white backdrop-blur">
                      {gameLabel(account.gameId)}
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase text-zinc-500">
                          ID de cuenta
                        </p>
                        <h2 className="truncate text-3xl font-black tracking-normal text-brand-ink">
                          {account.publicCode}
                        </h2>
                      </div>
                      <p className="shrink-0 rounded-xl bg-brand-gold px-3 py-2 text-lg font-black text-brand-ink">
                        {formatPrice(account.publicPriceCents)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {getFeaturedTags(account).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-extrabold text-zinc-800 ring-1 ring-black/5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-zinc-600">
                      {account.description}
                    </p>

                    <a
                      href={buildWhatsAppUrl(account)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-12 w-full items-center justify-center rounded-xl bg-brand-green text-sm font-black text-white shadow-sm transition hover:brightness-95"
                    >
                      Comprar por WhatsApp
                    </a>
                  </div>
                </article>
              ))}
        </div>

        {!isLoading && accounts.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-base font-black text-brand-ink">
              No hay cuentas con esos filtros.
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-500">
              Prueba otro juego o busca una skin diferente.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
