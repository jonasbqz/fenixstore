"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDb, isDbConnected } from "../../lib/db";
import { accounts, accountItems, gameCounters, sellers, storeSettings } from "../../lib/db/schema";
import { mockAccounts, mockSellers, type AccessBindings, type BindingStatus, type MockSeller } from "../../lib/db/mockData";

const storeWhatsappNumber =
  process.env.NEXT_PUBLIC_STORE_WHATSAPP_NUMBER?.replace(/[^\d]/g, "") ||
  "351920331564";

let tablesExistInitialized = false;

export async function ensureTablesExist() {
  if (!isDbConnected() || tablesExistInitialized) return;
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
        CREATE TYPE "Region" AS ENUM ('LATAM_10CP', 'INDIA_10CP', 'LATAM_GLOBAL', 'USA_EU');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        ALTER TYPE "Region" ADD VALUE IF NOT EXISTS 'LATAM_10CP';
        ALTER TYPE "Region" ADD VALUE IF NOT EXISTS 'INDIA_10CP';
        ALTER TYPE "Region" ADD VALUE IF NOT EXISTS 'LATAM_GLOBAL';
        ALTER TYPE "Region" ADD VALUE IF NOT EXISTS 'USA_EU';
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "AccessType" AS ENUM ('FULL_ACCESS', 'PARTIAL_ACCESS');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE "BindingStatus" AS ENUM ('ENTREGADO', 'ELIMINADO', 'LIBRE', 'INACCESIBLE');
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
        "whatsapp" text NOT NULL,
        "avatarColor" text DEFAULT '#f5b942' NOT NULL,
        "avatarIcon" text DEFAULT '👑' NOT NULL,
        "telegram" text,
        "notes" text,
        "status" "SellerStatus" DEFAULT 'ACTIVO' NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      ALTER TABLE "sellers" ADD COLUMN IF NOT EXISTS "avatarColor" text DEFAULT '#f5b942' NOT NULL;
      ALTER TABLE "sellers" ADD COLUMN IF NOT EXISTS "avatarIcon" text DEFAULT '👑' NOT NULL;
      ALTER TABLE "sellers" ADD COLUMN IF NOT EXISTS "telegram" text;
      ALTER TABLE "sellers" ADD COLUMN IF NOT EXISTS "notes" text;
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
        "bindingFacebook" "BindingStatus" DEFAULT 'LIBRE' NOT NULL,
        "bindingGoogle" "BindingStatus" DEFAULT 'LIBRE' NOT NULL,
        "bindingApple" "BindingStatus" DEFAULT 'LIBRE' NOT NULL,
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
      ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "bindingFacebook" "BindingStatus" DEFAULT 'LIBRE' NOT NULL;
      ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "bindingGoogle" "BindingStatus" DEFAULT 'LIBRE' NOT NULL;
      ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "bindingApple" "BindingStatus" DEFAULT 'LIBRE' NOT NULL;
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
      CREATE TABLE IF NOT EXISTS "store_settings" (
        "key" text PRIMARY KEY,
        "value" text NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      );
    `);

    const newOfficialGroup = "https://chat.whatsapp.com/FXVkcnxJsnsKkbcV7GVmPW";
    await db
      .insert(storeSettings)
      .values({ key: "whatsappGroupUrl", value: newOfficialGroup })
      .onConflictDoNothing();

    // Sembrar vendedores iniciales si no hay ninguno
    const existingSellers = await db.select().from(sellers);
    if (existingSellers.length === 0) {
      await db.insert(sellers).values([
        {
          id: "admin-1",
          name: "Admin Principal",
          whatsapp: storeWhatsappNumber,
          avatarColor: "#f5b942",
          avatarIcon: "👑",
          status: "ACTIVO",
          createdAt: new Date(),
        },
        {
          id: "admin-2",
          name: "Admin Ventas 2",
          whatsapp: storeWhatsappNumber,
          avatarColor: "#ef4444",
          avatarIcon: "🔥",
          status: "ACTIVO",
          createdAt: new Date(),
        },
        {
          id: "admin-3",
          name: "Admin Soporte 3",
          whatsapp: storeWhatsappNumber,
          avatarColor: "#3b82f6",
          avatarIcon: "⚡",
          status: "ACTIVO",
          createdAt: new Date(),
        },
      ]);
    }

    tablesExistInitialized = true;
  } catch (err) {
    console.warn("Aviso al verificar tablas:", err);
  }
}

export async function updateStoreSettingsAction(formData: FormData) {
  const groupUrl = (formData.get("whatsappGroupUrl") as string || "").trim();
  const phone = (formData.get("whatsappNumber") as string || "").trim();

  if (isDbConnected()) {
    try {
      await ensureTablesExist();
      const db = getDb();
      if (groupUrl) {
        await db
          .insert(storeSettings)
          .values({ key: "whatsappGroupUrl", value: groupUrl })
          .onConflictDoUpdate({
            target: storeSettings.key,
            set: { value: groupUrl, updatedAt: new Date() },
          });
      }
      if (phone) {
        await db
          .insert(storeSettings)
          .values({ key: "whatsappNumber", value: phone })
          .onConflictDoUpdate({
            target: storeSettings.key,
            set: { value: phone, updatedAt: new Date() },
          });
      }
    } catch (err) {
      console.error("Error guardando configuracion de tienda:", err);
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  redirect("/admin");
}

// -------------------------------------------------------------
// GESTIÓN DE PERFILES DE ADMINISTRADORES ("ESTILO NETFLIX")
// -------------------------------------------------------------

export async function getAdminProfiles(): Promise<MockSeller[]> {
  if (!isDbConnected()) {
    return mockSellers;
  }
  try {
    await ensureTablesExist();
    const db = getDb();
    const dbSellers = await db.select().from(sellers).where(eq(sellers.status, "ACTIVO"));
    if (dbSellers.length === 0) return mockSellers;

    return dbSellers.map((s) => ({
      id: s.id,
      name: s.name,
      whatsapp: s.whatsapp,
      avatarColor: s.avatarColor || "#f5b942",
      avatarIcon: s.avatarIcon || "👑",
      telegram: s.telegram || undefined,
      notes: s.notes || undefined,
      status: s.status as "ACTIVO" | "BANEADO",
    }));
  } catch (err) {
    console.error("Error cargando perfiles de admin:", err);
    return mockSellers;
  }
}

export async function setActiveAdminProfileCookie(profileId: string) {
  const cookieStore = await cookies();
  cookieStore.set("fenix_active_admin_id", profileId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/admin");
}

export async function getActiveAdminProfileId(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const activeId = cookieStore.get("fenix_active_admin_id")?.value;
    if (activeId) return activeId;
  } catch {}

  return "";
}

export async function createAdminProfileAction(formData: FormData) {
  const name = (formData.get("name") as string || "").trim();
  const rawWhatsapp = (formData.get("whatsapp") as string || "").trim();
  const whatsapp = rawWhatsapp.replace(/[^\d]/g, "") || storeWhatsappNumber;
  const avatarColor = (formData.get("avatarColor") as string) || "#f5b942";
  const avatarIcon = (formData.get("avatarIcon") as string) || "👑";
  const telegram = (formData.get("telegram") as string || "").trim();
  const notes = (formData.get("notes") as string || "").trim();

  if (!name) redirect("/admin");

  const id = `admin-${Date.now()}`;

  if (!isDbConnected()) {
    mockSellers.push({
      id,
      name,
      whatsapp,
      avatarColor,
      avatarIcon,
      telegram: telegram || undefined,
      notes: notes || undefined,
      status: "ACTIVO",
    });
  } else {
    await ensureTablesExist();
    const db = getDb();
    await db.insert(sellers).values({
      id,
      name,
      whatsapp,
      avatarColor,
      avatarIcon,
      telegram: telegram || null,
      notes: notes || null,
      status: "ACTIVO",
      createdAt: new Date(),
    });
  }

  await setActiveAdminProfileCookie(id);
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function updateAdminProfileAction(formData: FormData) {
  const id = (formData.get("id") as string || "").trim();
  const name = (formData.get("name") as string || "").trim();
  const rawWhatsapp = (formData.get("whatsapp") as string || "").trim();
  const whatsapp = rawWhatsapp.replace(/[^\d]/g, "") || storeWhatsappNumber;
  const avatarColor = (formData.get("avatarColor") as string) || "#f5b942";
  const avatarIcon = (formData.get("avatarIcon") as string) || "👑";
  const telegram = (formData.get("telegram") as string || "").trim();
  const notes = (formData.get("notes") as string || "").trim();

  if (!id || !name) redirect("/admin");

  if (!isDbConnected()) {
    const s = mockSellers.find((seller) => seller.id === id);
    if (s) {
      s.name = name;
      s.whatsapp = whatsapp;
      s.avatarColor = avatarColor;
      s.avatarIcon = avatarIcon;
      s.telegram = telegram || undefined;
      s.notes = notes || undefined;
    }
  } else {
    await ensureTablesExist();
    const db = getDb();
    await db
      .update(sellers)
      .set({
        name,
        whatsapp,
        avatarColor,
        avatarIcon,
        telegram: telegram || null,
        notes: notes || null,
      })
      .where(eq(sellers.id, id));
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function deleteAdminProfileAction(profileId: string) {
  if (!profileId) return;

  if (!isDbConnected()) {
    const idx = mockSellers.findIndex((s) => s.id === profileId);
    if (idx !== -1 && mockSellers.length > 1) {
      mockSellers.splice(idx, 1);
    }
  } else {
    await ensureTablesExist();
    const db = getDb();
    const all = await db.select().from(sellers);
    if (all.length > 1) {
      await db.delete(sellers).where(eq(sellers.id, profileId));
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

export async function getStoreSettings() {
  const defaultGroup = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || "https://chat.whatsapp.com/FXVkcnxJsnsKkbcV7GVmPW";
  const defaultPhone = process.env.NEXT_PUBLIC_STORE_WHATSAPP_NUMBER?.replace(/[^\d]/g, "") || "351920331564";

  if (!isDbConnected()) {
    return { groupUrl: defaultGroup, phone: defaultPhone };
  }

  try {
    await ensureTablesExist();
    const db = getDb();
    const rows = await db.select().from(storeSettings);
    const map = new Map(rows.map((r) => [r.key, r.value]));

    let groupUrl = map.get("whatsappGroupUrl") || defaultGroup;
    if (!groupUrl || groupUrl.includes("G5y19F9vM0lD32N5v5z2")) {
      groupUrl = "https://chat.whatsapp.com/FXVkcnxJsnsKkbcV7GVmPW";
    }

    return {
      groupUrl,
      phone: map.get("whatsappNumber") || defaultPhone,
    };
  } catch (err) {
    return { groupUrl: defaultGroup, phone: defaultPhone };
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
  const rawPrice = Number(formData.get("publicPrice"));
  const publicPriceCents = Math.round(rawPrice * 100);
  const description = (formData.get("description") as string) || "";
  
  const rawImageUrls = (formData.get("imageUrls") as string) || (formData.get("imageUrl") as string) || "";
  const imageUrls = rawImageUrls
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter((url) => url.length > 5);

  const region = (formData.get("region") as "LATAM_10CP" | "INDIA_10CP" | "LATAM_GLOBAL" | "USA_EU") || "LATAM_10CP";
  const accessType = (formData.get("accessType") as "FULL_ACCESS" | "PARTIAL_ACCESS") || "FULL_ACCESS";

  const activeSellerId = await getActiveAdminProfileId();
  const sellerId = (formData.get("sellerId") as string) || activeSellerId;

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
      sellerId,
      createdAt: new Date(),
      items,
    });
  } else {
    await ensureTablesExist();
    const db = getDb();
    
    try {
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

      await db.insert(accounts).values({
        id,
        publicCode,
        gameId,
        publicPriceCents,
        description,
        status: "DISPONIBLE",
        imageUrls: imageUrls.length > 0 ? imageUrls : ["/lobby_fallback.png"],
        region: region as any,
        accessType,
        bindingFacebook: bindings.facebook,
        bindingGoogle: bindings.google,
        bindingApple: bindings.apple,
        sellerId,
        level,
        rank,
        mythicsCount,
        legendariesCount,
        epicsCount,
        createdAt: new Date(),
      });

      const autoDetectedWeapons: string[] = [];
      const searchLower = description.toLowerCase();
      const knownKeys = [
        "krm", "krm-262", "by15", "hs0405", "r9-0", "jak-12", "dl q33",
        "m13", "ak-47", "ak117", "fennec", "qq9", "holger", "locus",
        "kilo 141", "switchblade", "oden", "cbr4", "grau", "type 19",
        "templar", "ghost", "siren", "sophia", "spectre"
      ];

      for (const key of knownKeys) {
        if (searchLower.includes(key)) {
          autoDetectedWeapons.push(key.toUpperCase());
        }
      }

      const finalItems = items.length > 0 ? items : autoDetectedWeapons.map((name, i) => ({
        id: `item-${Date.now()}-${i}`,
        name,
        type: "ARMA" as const,
      }));

      if (finalItems.length > 0) {
        for (const item of finalItems) {
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
  const rawPrice = Number(formData.get("publicPrice"));
  const publicPriceCents = Math.round(rawPrice * 100);
  const description = (formData.get("description") as string) || "";

  const rawImageUrls = (formData.get("imageUrls") as string) || (formData.get("imageUrl") as string) || "";
  const imageUrls = rawImageUrls
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter((url) => url.length > 5);

  const region = (formData.get("region") as "LATAM_10CP" | "INDIA_10CP" | "LATAM_GLOBAL" | "USA_EU") || "LATAM_10CP";
  const accessType = (formData.get("accessType") as "FULL_ACCESS" | "PARTIAL_ACCESS") || "FULL_ACCESS";

  const sellerId = formData.get("sellerId") as string;

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

  if (!isDbConnected()) {
    const acc = mockAccounts.find((a) => a.id === accountId);
    if (acc) {
      acc.publicPriceCents = publicPriceCents;
      acc.description = description;
      if (imageUrls.length > 0) acc.imageUrls = imageUrls;
      acc.region = region;
      acc.accessType = accessType;
      acc.bindings = bindings;
      acc.level = level;
      acc.rank = rank;
      acc.mythicsCount = mythicsCount;
      acc.legendariesCount = legendariesCount;
      acc.epicsCount = epicsCount;
      acc.items = items;
      if (sellerId) acc.sellerId = sellerId;
    }
  } else {
    await ensureTablesExist();
    const db = getDb();

    try {
      const updatePayload: Record<string, any> = {
        gameId,
        publicPriceCents,
        description,
        imageUrls: imageUrls.length > 0 ? imageUrls : ["/lobby_fallback.png"],
        region: region as any,
        accessType,
        bindingFacebook: bindings.facebook,
        bindingGoogle: bindings.google,
        bindingApple: bindings.apple,
        level,
        rank,
        mythicsCount,
        legendariesCount,
        epicsCount,
      };

      if (sellerId) {
        updatePayload.sellerId = sellerId;
      }

      await db
        .update(accounts)
        .set(updatePayload)
        .where(eq(accounts.id, accountId));

      const autoDetectedWeapons: string[] = [];
      const searchLower = description.toLowerCase();
      const knownKeys = [
        "krm", "krm-262", "by15", "hs0405", "r9-0", "jak-12", "dl q33",
        "m13", "ak-47", "ak117", "fennec", "qq9", "holger", "locus",
        "kilo 141", "switchblade", "oden", "cbr4", "grau", "type 19",
        "templar", "ghost", "siren", "sophia", "spectre"
      ];

      for (const key of knownKeys) {
        if (searchLower.includes(key)) {
          autoDetectedWeapons.push(key.toUpperCase());
        }
      }

      const finalItems = items.length > 0 ? items : autoDetectedWeapons.map((name, i) => ({
        id: `item-${Date.now()}-${i}`,
        name,
        type: "ARMA" as const,
      }));

      await db.delete(accountItems).where(eq(accountItems.accountId, accountId));
      if (finalItems.length > 0) {
        for (const item of finalItems) {
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
