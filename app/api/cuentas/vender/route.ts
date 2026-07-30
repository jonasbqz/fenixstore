import { NextRequest, NextResponse } from "next/server";
import { GameId, ItemType, Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";

type SellAccountBody = {
  vendedor?: {
    nombre?: unknown;
    whatsapp?: unknown;
  };
  nombre_vendedor?: unknown;
  whatsapp?: unknown;
  juego?: unknown;
  precio_vendedor?: unknown;
  descripcion?: unknown;
  imagenes?: unknown;
  items?: unknown;
  tags?: unknown;
};

type ParsedItem = {
  name: string;
  type: ItemType;
};

function parseRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} es obligatorio.`);
  }

  return value.trim();
}

function parseWhatsapp(value: unknown) {
  const whatsapp = parseRequiredString(value, "whatsapp");
  const normalized = whatsapp.replace(/[^\d+]/g, "");

  if (normalized.length < 8) {
    throw new Error("whatsapp no parece valido.");
  }

  return normalized;
}

function parseGame(value: unknown) {
  const game = parseRequiredString(value, "juego").toUpperCase();

  if (!Object.values(GameId).includes(game as GameId)) {
    throw new Error("Juego no valido. Usa CODM, FF o PUBG.");
  }

  return game as GameId;
}

function parseMoneyToCents(value: unknown, fieldName: string) {
  const amount =
    typeof value === "number"
      ? value
      : Number(parseRequiredString(value, fieldName).replace(",", "."));

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`${fieldName} debe ser un numero positivo.`);
  }

  return Math.round(amount * 100);
}

function parseImageUrls(value: unknown) {
  if (value === undefined || value === null) return [];

  if (!Array.isArray(value)) {
    throw new Error("imagenes debe ser un array de URLs.");
  }

  return value.map((url) => parseRequiredString(url, "imagen URL"));
}

function parseItemType(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "OTRO";

  const normalized = value.trim().toUpperCase();
  const aliases: Record<string, ItemType> = {
    ARMA: "ARMA",
    WEAPON: "ARMA",
    PERSONAJE: "PERSONAJE",
    CHARACTER: "PERSONAJE",
    PASE: "PASE",
    PASS: "PASE",
    SKIN: "SKIN",
    OTRO: "OTRO",
    OTHER: "OTRO",
  };

  if (!aliases[normalized]) {
    throw new Error(`Tipo de item no valido: ${value}.`);
  }

  return aliases[normalized];
}

function parseItems(body: SellAccountBody): ParsedItem[] {
  const rawItems = Array.isArray(body.items) ? body.items : [];
  const rawTags = Array.isArray(body.tags) ? body.tags : [];

  const parsedItems = rawItems.map((item) => {
    if (typeof item === "string") {
      return { name: parseRequiredString(item, "item"), type: "OTRO" as ItemType };
    }

    if (!item || typeof item !== "object") {
      throw new Error("Cada item debe ser texto o un objeto con nombre y tipo.");
    }

    const itemRecord = item as Record<string, unknown>;

    return {
      name: parseRequiredString(
        itemRecord.nombre ?? itemRecord.name,
        "item.nombre",
      ),
      type: parseItemType(itemRecord.tipo ?? itemRecord.type),
    };
  });

  const parsedTags = rawTags.map((tag) => ({
    name: parseRequiredString(tag, "tag"),
    type: "OTRO" as ItemType,
  }));

  const byName = new Map<string, ParsedItem>();

  for (const item of [...parsedItems, ...parsedTags]) {
    byName.set(item.name.toLowerCase(), item);
  }

  return [...byName.values()];
}

function calculatePublicPriceCents(sellerPriceCents: number) {
  const commissionPercent = Number(
    process.env.MARKETPLACE_COMMISSION_PERCENT ?? 15,
  );

  if (!Number.isFinite(commissionPercent) || commissionPercent < 0) {
    throw new Error("MARKETPLACE_COMMISSION_PERCENT no es valido.");
  }

  return Math.round(sellerPriceCents * (1 + commissionPercent / 100));
}

async function nextPublicCode(tx: Prisma.TransactionClient, gameId: GameId) {
  const counter = await tx.gameCounter.upsert({
    where: { gameId },
    create: {
      gameId,
      lastNumber: 101,
    },
    update: {
      lastNumber: {
        increment: 1,
      },
    },
  });

  return `${gameId}-${counter.lastNumber}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SellAccountBody;
    const sellerName = parseRequiredString(
      body.vendedor?.nombre ?? body.nombre_vendedor,
      "nombre_vendedor",
    );
    const whatsapp = parseWhatsapp(body.vendedor?.whatsapp ?? body.whatsapp);
    const gameId = parseGame(body.juego);
    const sellerPriceCents = parseMoneyToCents(
      body.precio_vendedor,
      "precio_vendedor",
    );
    const description = parseRequiredString(body.descripcion, "descripcion");
    const imageUrls = parseImageUrls(body.imagenes);
    const items = parseItems(body);
    const publicPriceCents = calculatePublicPriceCents(sellerPriceCents);

    const account = await prisma.$transaction(async (tx) => {
      const seller = await tx.seller.upsert({
        where: { whatsapp },
        create: {
          name: sellerName,
          whatsapp,
          status: "ACTIVO",
        },
        update: {
          name: sellerName,
        },
      });

      if (seller.status === "BANEADO") {
        throw new Error("Este vendedor no puede publicar cuentas.");
      }

      const publicCode = await nextPublicCode(tx, gameId);

      return tx.account.create({
        data: {
          publicCode,
          gameId,
          sellerPriceCents,
          publicPriceCents,
          description,
          status: "PENDIENTE",
          imageUrls,
          sellerId: seller.id,
          items: {
            create: items,
          },
        },
        select: {
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
          },
        },
      });
    });

    return NextResponse.json(
      {
        data: account,
        message: "Cuenta recibida y pendiente de revision.",
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo registrar la cuenta.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
