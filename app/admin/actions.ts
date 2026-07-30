"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, isDbConnected } from "../../lib/db";
import { accounts, accountItems, gameCounters, sellers } from "../../lib/db/schema";
import { mockAccounts, type AccessBindings, type BindingStatus } from "../../lib/db/mockData";

const storeWhatsappNumber =
  process.env.NEXT_PUBLIC_STORE_WHATSAPP_NUMBER?.replace(/[^\d]/g, "") ||
  "351920331564";

async function ensureTablesExist() {
  if (!isDbConnected()) return;
  try {
    const db = getDb();
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

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "sellers" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "whatsapp" text UNIQUE NOT NULL,
        "status" "SellerStatus" DEFAULT 'ACTIVO' NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL
      );
    `);

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

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "account_items" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "type" "ItemType" NOT NULL,
        "accountId" text NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "game_counters" (
        "gameId" "GameId" PRIMARY KEY,
        "lastNumber" integer DEFAULT 100 NOT NULL
      );
    `);
  } catch (err) {
    console.warn("Aviso al verificar tablas:", err);
  }
}

export async function toggleAccountStatus(accountId: string, currentStatus: "DISPONIBLE" | "VENDIDA" | "PENDIENTE") {
  const newStatus = currentStatus === "DISPONIBLE" ? "VENDIDA" : "DISPONIBLE";

  if (!isDbConnected()) {
    const acc = mockAccounts.find((a) => a.id === accountId);
    if (acc) {
      acc.status = newStatus;
    }
  } else {
    await ensureTablesExist();
    const db = getDb();
    await db
      .update(accounts)
      .set({ status: newStatus })
      .where(eq(accounts.id, accountId));
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function approveAccount(accountId: string) {
  if (!isDbConnected()) {
    const acc = mockAccounts.find((a) => a.id === accountId);
    if (acc) {
      acc.status = "DISPONIBLE";
    }
  } else {
    await ensureTablesExist();
    const db = getDb();
    await db
      .update(accounts)
      .set({ status: "DISPONIBLE" })
      .where(eq(accounts.id, accountId));
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteAccount(accountId: string) {
  if (!isDbConnected()) {
    const index = mockAccounts.findIndex((a) => a.id === accountId);
    if (index !== -1) {
      mockAccounts.splice(index, 1);
    }
  } else {
    await ensureTablesExist();
    const db = getDb();
    await db.delete(accountItems).where(eq(accountItems.accountId, accountId));
    await db.delete(accounts).where(eq(accounts.id, accountId));
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

// Carga directa del Administrador (Fotos, Región e Indicador de Redes)
export async function createAccountAction(formData: FormData) {
  const gameId = (formData.get("gameId") as "CODM" | "FF" | "PUBG") || "CODM";
  const publicPriceCents = Math.round(Number(formData.get("publicPrice")) * 100);
  const description = (formData.get("description") as string) || "";
  
  const rawImageUrls = (formData.get("imageUrls") as string) || (formData.get("imageUrl") as string) || "";
  const imageUrls = rawImageUrls
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter((url) => url.length > 5);

  const region = (formData.get("region") as "LATAM_10CP" | "INDIA_10CP" | "LATAM_GLOBAL" | "USA_EU") || "LATAM_10CP";
  const accessType = (formData.get("accessType") as "FULL_ACCESS" | "PARTIAL_ACCESS") || "FULL_ACCESS";

  const bindings: AccessBindings = {
    activision: "ENTREGADO",
    facebook: (formData.get("binding_facebook") as BindingStatus) || "LIBRE",
    google: (formData.get("binding_google") as BindingStatus) || "LIBRE",
    apple: (formData.get("binding_apple") as BindingStatus) || "LIBRE",
  };

  const weaponsString = (formData.get("weapons") as string) || "";
  const level = Number(formData.get("level") || 400);
  const rank = (formData.get("rank") as "ROOKIE" | "VETERAN" | "ELITE" | "PRO" | "MASTER" | "GRANDMASTER" | "LEGENDARY") || "LEGENDARY";
  const mythicsCount = Number(formData.get("mythicsCount") || 0);
  const legendariesCount = Number(formData.get("legendariesCount") || 0);
  const epicsCount = Number(formData.get("epicsCount") || 0);

  const items = weaponsString
    ? weaponsString
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean)
        .map((name, i) => ({
          id: `item-${Date.now()}-${i}`,
          name,
          type: "ARMA" as const,
        }))
    : [];

  const id = `acc-${Date.now()}`;
  let publicCode = `${gameId}-TEMP`;

  if (!isDbConnected()) {
    const count = mockAccounts.filter((a) => a.gameId === gameId).length;
    publicCode = `${gameId}-${106 + count}`;

    mockAccounts.push({
      id,
      publicCode,
      gameId,
      publicPriceCents,
      description,
      imageUrls: imageUrls.length > 0 ? imageUrls : ["/lobby_fallback.png"],
      region,
      accessType,
      bindings,
      status: "DISPONIBLE",
      level,
      rank,
      mythicsCount,
      legendariesCount,
      epicsCount,
      createdAt: new Date(),
      items,
    });
  } else {
    await ensureTablesExist();
    const db = getDb();
    
    try {
      const defaultSeller = await db.select().from(sellers).where(eq(sellers.id, "default-seller"));
      if (!defaultSeller[0]) {
        await db.insert(sellers).values({
          id: "default-seller",
          name: "Fénix Directo",
          whatsapp: storeWhatsappNumber,
          status: "ACTIVO",
          createdAt: new Date(),
        });
      }

      let nextNum = 106;
      const counter = await db.select().from(gameCounters).where(eq(gameCounters.gameId, gameId));
      if (counter[0]) {
        nextNum = counter[0].lastNumber + 1;
        await db
          .update(gameCounters)
          .set({ lastNumber: nextNum })
          .where(eq(gameCounters.gameId, gameId));
      } else {
        await db.insert(gameCounters).values({ gameId, lastNumber: nextNum });
      }
      publicCode = `${gameId}-${nextNum}`;

      const safeRegion = (region === "LATAM_10CP" || region === "INDIA_10CP" ? "INDIA" : region) as any;

      await db.insert(accounts).values({
        id,
        publicCode,
        gameId,
        publicPriceCents,
        description,
        status: "DISPONIBLE",
        imageUrls: imageUrls.length > 0 ? imageUrls : ["/lobby_fallback.png"],
        region: safeRegion,
        accessType,
        sellerId: "default-seller",
        level,
        rank,
        mythicsCount,
        legendariesCount,
        epicsCount,
        createdAt: new Date(),
      });

      if (items.length > 0) {
        for (const item of items) {
          await db.insert(accountItems).values({
            id: item.id,
            name: item.name,
            type: "ARMA",
            accountId: id,
          });
        }
      }
    } catch (dbErr) {
      console.error("Error al guardar cuenta en la base de datos de producción:", dbErr);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

// Modificación / Edición directa de una cuenta ya publicada
export async function updateAccountAction(formData: FormData) {
  const accountId = (formData.get("accountId") as string) || "";
  if (!accountId) redirect("/admin");

  const gameId = (formData.get("gameId") as "CODM" | "FF" | "PUBG") || "CODM";
  const publicPriceCents = Math.round(Number(formData.get("publicPrice")) * 100);
  const description = (formData.get("description") as string) || "";

  const rawImageUrls = (formData.get("imageUrls") as string) || (formData.get("imageUrl") as string) || "";
  const imageUrls = rawImageUrls
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter((url) => url.length > 5);

  const region = (formData.get("region") as "LATAM_10CP" | "INDIA_10CP" | "LATAM_GLOBAL" | "USA_EU") || "LATAM_10CP";
  const accessType = (formData.get("accessType") as "FULL_ACCESS" | "PARTIAL_ACCESS") || "FULL_ACCESS";

  const weaponsString = (formData.get("weapons") as string) || "";
  const level = Number(formData.get("level") || 400);
  const rank = (formData.get("rank") as "ROOKIE" | "VETERAN" | "ELITE" | "PRO" | "MASTER" | "GRANDMASTER" | "LEGENDARY") || "LEGENDARY";
  const mythicsCount = Number(formData.get("mythicsCount") || 0);
  const legendariesCount = Number(formData.get("legendariesCount") || 0);
  const epicsCount = Number(formData.get("epicsCount") || 0);

  const items = weaponsString
    ? weaponsString
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean)
        .map((name, i) => ({
          id: `item-${Date.now()}-${i}`,
          name,
          type: "ARMA" as const,
        }))
    : [];

  if (!isDbConnected()) {
    const acc = mockAccounts.find((a) => a.id === accountId);
    if (acc) {
      acc.publicPriceCents = publicPriceCents;
      acc.description = description;
      if (imageUrls.length > 0) acc.imageUrls = imageUrls;
      acc.region = region;
      acc.accessType = accessType;
      acc.level = level;
      acc.rank = rank;
      acc.mythicsCount = mythicsCount;
      acc.legendariesCount = legendariesCount;
      acc.epicsCount = epicsCount;
      acc.items = items;
    }
  } else {
    await ensureTablesExist();
    const db = getDb();

    try {
      const safeRegion = (region === "LATAM_10CP" || region === "INDIA_10CP" ? "INDIA" : region) as any;

      await db
        .update(accounts)
        .set({
          gameId,
          publicPriceCents,
          description,
          imageUrls: imageUrls.length > 0 ? imageUrls : ["/lobby_fallback.png"],
          region: safeRegion,
          accessType,
          level,
          rank,
          mythicsCount,
          legendariesCount,
          epicsCount,
        })
        .where(eq(accounts.id, accountId));

      if (items.length > 0) {
        await db.delete(accountItems).where(eq(accountItems.accountId, accountId));
        for (const item of items) {
          await db.insert(accountItems).values({
            id: item.id,
            name: item.name,
            type: "ARMA",
            accountId,
          });
        }
      }
    } catch (err) {
      console.error("Error al actualizar cuenta en PostgreSQL:", err);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}
