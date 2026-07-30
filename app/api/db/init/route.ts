import { NextResponse } from "next/server";
import { getDb, isDbConnected } from "../../../../lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  if (!isDbConnected()) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL no configurada." }, { status: 400 });
  }

  try {
    const db = getDb();

    // Crear tipos Enum si no existen
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "GameId" AS ENUM ('CODM', 'FF', 'PUBG');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "AccountStatus" AS ENUM ('PENDIENTE', 'DISPONIBLE', 'VENDIDA');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "ItemType" AS ENUM ('ARMA', 'PERSONAJE', 'PASE', 'SKIN', 'OTRO');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "Region" AS ENUM ('INDIA', 'LATAM_GLOBAL', 'USA_EU', 'LATAM_10CP', 'INDIA_10CP');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "AccessType" AS ENUM ('FULL_ACCESS', 'PARTIAL_ACCESS');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "Rank" AS ENUM ('ROOKIE', 'VETERAN', 'ELITE', 'PRO', 'MASTER', 'GRANDMASTER', 'LEGENDARY');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "SellerStatus" AS ENUM ('ACTIVO', 'BANEADO');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // Crear Tabla Sellers
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "sellers" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "whatsapp" text UNIQUE NOT NULL,
        "status" "SellerStatus" DEFAULT 'ACTIVO' NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Crear Tabla Accounts
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" text PRIMARY KEY,
        "publicCode" text NOT NULL,
        "gameId" "GameId" NOT NULL,
        "publicPriceCents" integer NOT NULL,
        "description" text NOT NULL,
        "status" "AccountStatus" NOT NULL,
        "imageUrls" text[] NOT NULL,
        "region" "Region" DEFAULT 'LATAM_GLOBAL' NOT NULL,
        "accessType" "AccessType" DEFAULT 'FULL_ACCESS' NOT NULL,
        "sellerId" text NOT NULL,
        "level" integer DEFAULT 150 NOT NULL,
        "rank" "Rank" DEFAULT 'LEGENDARY' NOT NULL,
        "mythicsCount" integer DEFAULT 0 NOT NULL,
        "legendariesCount" integer DEFAULT 0 NOT NULL,
        "epicsCount" integer DEFAULT 0 NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Crear Tabla Account Items
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "account_items" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "type" "ItemType" NOT NULL,
        "accountId" text NOT NULL
      );
    `);

    // Crear Tabla Game Counters
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "game_counters" (
        "gameId" "GameId" PRIMARY KEY,
        "lastNumber" integer DEFAULT 100 NOT NULL
      );
    `);

    return NextResponse.json({ ok: true, message: "Tablas de PostgreSQL creadas exitosamente." });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error al inicializar tablas." },
      { status: 500 }
    );
  }
}
