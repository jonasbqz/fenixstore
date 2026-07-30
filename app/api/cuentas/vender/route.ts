import { NextRequest, NextResponse } from "next/server";
import { getDb, isDbConnected } from "../../../../lib/db";
import { accounts, sellers } from "../../../../lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre_vendedor, whatsapp, juego, precio_vendedor, descripcion } = body || {};

    if (!nombre_vendedor || !whatsapp || !descripcion) {
      return NextResponse.json(
        { ok: false, error: "Datos incompletos para publicar la cuenta." },
        { status: 400 }
      );
    }

    if (!isDbConnected()) {
      return NextResponse.json({
        ok: true,
        message: "Solicitud de venta recibida en modo demostración.",
      });
    }

    const db = getDb();
    const priceCents = Math.round(Number(precio_vendedor || 0) * 100);

    // Insertar vendedor
    const [seller] = await db
      .insert(sellers)
      .values({
        id: crypto.randomUUID(),
        name: String(nombre_vendedor),
        whatsapp: String(whatsapp),
      })
      .returning();

    // Insertar cuenta en estado PENDIENTE
    const [account] = await db
      .insert(accounts)
      .values({
        id: crypto.randomUUID(),
        sellerId: seller.id,
        publicCode: `CODM-${Math.floor(100 + Math.random() * 900)}`,
        gameId: (juego as "CODM" | "FF" | "PUBG") || "CODM",
        publicPriceCents: priceCents,
        description: String(descripcion),
        imageUrls: [],
        status: "PENDIENTE",
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({ ok: true, data: account });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error al procesar la solicitud." },
      { status: 500 }
    );
  }
}
