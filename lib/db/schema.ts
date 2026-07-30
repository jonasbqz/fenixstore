import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const gameIdEnum = pgEnum("GameId", ["CODM", "FF", "PUBG"]);
export const accountStatusEnum = pgEnum("AccountStatus", [
  "PENDIENTE",
  "DISPONIBLE",
  "VENDIDA",
]);
export const itemTypeEnum = pgEnum("ItemType", [
  "ARMA",
  "PERSONAJE",
  "PASE",
  "SKIN",
  "OTRO",
]);
export const regionEnum = pgEnum("Region", ["INDIA", "LATAM_GLOBAL", "USA_EU"]);
export const accessTypeEnum = pgEnum("AccessType", [
  "FULL_ACCESS",
  "PARTIAL_ACCESS",
]);
export const rankEnum = pgEnum("Rank", [
  "ROOKIE",
  "VETERAN",
  "ELITE",
  "PRO",
  "MASTER",
  "GRANDMASTER",
  "LEGENDARY",
]);

export const sellerStatusEnum = pgEnum("SellerStatus", ["ACTIVO", "BANEADO"]);

export const sellers = pgTable("sellers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  whatsapp: text("whatsapp").unique().notNull(),
  status: sellerStatusEnum("status").default("ACTIVO").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: false }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  publicCode: text("publicCode").notNull(),
  gameId: gameIdEnum("gameId").notNull(),
  publicPriceCents: integer("publicPriceCents").notNull(),
  description: text("description").notNull(),
  status: accountStatusEnum("status").notNull(),
  imageUrls: text("imageUrls").array().notNull(),
  region: regionEnum("region").default("LATAM_GLOBAL").notNull(),
  accessType: accessTypeEnum("accessType").default("FULL_ACCESS").notNull(),
  sellerId: text("sellerId").notNull(),
  level: integer("level").default(150).notNull(),
  rank: rankEnum("rank").default("LEGENDARY").notNull(),
  mythicsCount: integer("mythicsCount").default(0).notNull(),
  legendariesCount: integer("legendariesCount").default(0).notNull(),
  epicsCount: integer("epicsCount").default(0).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: false }).notNull(),
});

export const accountItems = pgTable("account_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: itemTypeEnum("type").notNull(),
  accountId: text("accountId").notNull(),
});

export const gameCounters = pgTable("game_counters", {
  gameId: gameIdEnum("gameId").primaryKey(),
  lastNumber: integer("lastNumber").default(100).notNull(),
});

export type GameId = (typeof gameIdEnum.enumValues)[number];
export type AccountItemType = (typeof itemTypeEnum.enumValues)[number];
