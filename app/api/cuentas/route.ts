import { NextRequest, NextResponse } from "next/server";
import { GameId, Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";

const PUBLIC_ACCOUNT_SELECT = {
  id: true,
  publicCode: true,
  gameId: true,
  publicPriceCents: true,
  description: true,
  status: true,
  imageUrls: true,
  createdAt: true,
  items: {
    select: {
      id: true,
      name: true,
      type: true,
    },
    orderBy: {
      name: "asc" as const,
    },
  },
} satisfies Prisma.AccountSelect;

function parseGame(value: string | null) {
  if (!value) return null;

  const normalized = value.trim().toUpperCase();
  return Object.values(GameId).includes(normalized as GameId)
    ? (normalized as GameId)
    : null;
}

function parsePositiveMoneyToCents(value: string | null) {
  if (!value) return null;

  const normalized = value.trim().replace(",", ".");
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("precio_maximo debe ser un numero positivo.");
  }

  return Math.round(amount * 100);
}

function parseTags(values: string[]) {
  return values
    .flatMap((value) => value.split(","))
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = parseGame(searchParams.get("juego"));
    const maxPriceCents = parsePositiveMoneyToCents(
      searchParams.get("precio_maximo"),
    );
    const tags = parseTags(searchParams.getAll("tags"));

    if (searchParams.get("juego") && !game) {
      return NextResponse.json(
        { error: "Juego no valido. Usa CODM, FF o PUBG." },
        { status: 400 },
      );
    }

    const where: Prisma.AccountWhereInput = {
      status: "DISPONIBLE",
      ...(game ? { gameId: game } : {}),
      ...(maxPriceCents ? { publicPriceCents: { lte: maxPriceCents } } : {}),
      ...(tags.length
        ? {
            AND: tags.map((tag) => ({
              items: {
                some: {
                  name: {
                    contains: tag,
                    mode: "insensitive",
                  },
                },
              },
            })),
          }
        : {}),
    };

    const accounts = await prisma.account.findMany({
      where,
      select: PUBLIC_ACCOUNT_SELECT,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: accounts });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudieron obtener las cuentas.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
