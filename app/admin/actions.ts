"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, isDbConnected } from "../../lib/db";
import { accounts, accountItems, gameCounters, sellers } from "../../lib/db/schema";
import { mockAccounts, type AccessBindings, type BindingStatus } from "../../lib/db/mockData";

const storeWhatsappNumber =
  process.env.NEXT_PUBLIC_STORE_WHATSAPP_NUMBER?.replace(/[^\d]/g, "") ||
  "351920331564";

export async function toggleAccountStatus(accountId: string, currentStatus: "DISPONIBLE" | "VENDIDA" | "PENDIENTE") {
  const newStatus = currentStatus === "DISPONIBLE" ? "VENDIDA" : "DISPONIBLE";

  if (!isDbConnected()) {
    const acc = mockAccounts.find((a) => a.id === accountId);
    if (acc) {
      acc.status = newStatus;
    }
  } else {
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
      imageUrls: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop"],
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
    const db = getDb();
    
    const defaultSeller = await db.select().from(sellers).where(eq(sellers.id, "default-seller"));
    if (!defaultSeller[0]) {
      await db.insert(sellers).values({
        id: "default-seller",
        name: "Fénix Directo",
        whatsapp: storeWhatsappNumber,
        status: "ACTIVO",
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

    await db.insert(accounts).values({
      id,
      publicCode,
      gameId,
      publicPriceCents,
      description,
      status: "DISPONIBLE",
      imageUrls: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop"],
      region: (region === "LATAM_10CP" || region === "INDIA_10CP" ? "INDIA" : region) as any,
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
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}
