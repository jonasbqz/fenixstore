import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, lte, sql, type SQL } from "drizzle-orm";
import { getDb, isDbConnected } from "../../../lib/db";
import { accounts, accountItems } from "../../../lib/db/schema";
import { mockAccounts } from "../../../lib/db/mockData";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get("juego")?.toUpperCase();
    const maxPrice = searchParams.get("precio_maximo");
    const tag = searchParams.get("tag")?.trim();

    if (!isDbConnected()) {
      let filtered = mockAccounts.filter((acc) => acc.status === "DISPONIBLE");
      if (game) {
        filtered = filtered.filter((acc) => acc.gameId === game);
      }
      return NextResponse.json({ ok: true, data: filtered });
    }

    const db = getDb();
    const whereConditions: SQL[] = [eq(accounts.status, "DISPONIBLE")];

    if (game === "CODM" || game === "FF" || game === "PUBG") {
      whereConditions.push(eq(accounts.gameId, game));
    }

    if (maxPrice) {
      const priceCents = Math.round(Number(maxPrice) * 100);
      if (Number.isFinite(priceCents)) {
        whereConditions.push(lte(accounts.publicPriceCents, priceCents));
      }
    }

    const rows = await db
      .select({
        account: accounts,
        item: accountItems,
      })
      .from(accounts)
      .leftJoin(accountItems, eq(accountItems.accountId, accounts.id))
      .where(and(...whereConditions))
      .orderBy(desc(accounts.createdAt));

    return NextResponse.json({ ok: true, data: rows });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error del servidor" },
      { status: 500 }
    );
  }
}
