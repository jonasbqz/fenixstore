export type MockItemType = "ARMA" | "PERSONAJE" | "PASE" | "SKIN" | "OTRO";

export interface MockAccountItem {
  id: string;
  name: string;
  type: MockItemType;
}

export type BindingStatus = "ENTREGADO" | "ELIMINADO" | "LIBRE" | "INACCESIBLE";

export interface AccessBindings {
  activision: "ENTREGADO";
  facebook: BindingStatus;
  google: BindingStatus;
  apple: BindingStatus;
}

export interface MockSeller {
  id: string;
  name: string;
  whatsapp: string;
  avatarColor: string;
  avatarIcon: string;
  telegram?: string;
  notes?: string;
  status: "ACTIVO" | "BANEADO";
}

export const mockSellers: MockSeller[] = [
  {
    id: "admin-1",
    name: "Admin Principal",
    whatsapp: "351920331564",
    avatarColor: "#f5b942",
    avatarIcon: "👑",
    status: "ACTIVO",
  },
  {
    id: "admin-2",
    name: "Admin Ventas 2",
    whatsapp: "351920331564",
    avatarColor: "#ef4444",
    avatarIcon: "🔥",
    status: "ACTIVO",
  },
  {
    id: "admin-3",
    name: "Admin Soporte 3",
    whatsapp: "351920331564",
    avatarColor: "#3b82f6",
    avatarIcon: "⚡",
    status: "ACTIVO",
  },
];

export interface MockAccount {
  id: string;
  publicCode: string;
  gameId: "CODM" | "FF" | "PUBG";
  publicPriceCents: number;
  description: string;
  imageUrls: string[];
  region: "LATAM_10CP" | "INDIA_10CP" | "LATAM_GLOBAL" | "USA_EU";
  accessType: "FULL_ACCESS" | "PARTIAL_ACCESS";
  bindings?: AccessBindings;
  status: "DISPONIBLE" | "VENDIDA" | "PENDIENTE";
  level: number;
  rank: "ROOKIE" | "VETERAN" | "ELITE" | "PRO" | "MASTER" | "GRANDMASTER" | "LEGENDARY";
  mythicsCount: number;
  mythicsMaxCount?: number;
  legendariesCount: number;
  epicsCount: number;
  items: MockAccountItem[];
  sellerId?: string;
  sellerName?: string;
  sellerWhatsapp?: string;
  createdAt: Date;
}

export interface MockCPPackage {
  id: string;
  amount: number;
  priceCents: number;
  bonusAmount: number;
  isPopular?: boolean;
}

export const mockCPPackages: MockCPPackage[] = [
  {
    id: "cp-2400",
    amount: 2400,
    priceCents: 2400,
    bonusAmount: 0,
    isPopular: false,
  },
  {
    id: "cp-5000",
    amount: 5000,
    priceCents: 4600,
    bonusAmount: 0,
    isPopular: true,
  },
  {
    id: "cp-10800",
    amount: 10800,
    priceCents: 8400,
    bonusAmount: 0,
    isPopular: false,
  },
];

// LISTADO DE CUENTAS VACÍO LISTO PARA PUBLICACIONES REALES EN PRODUCCIÓN
export const mockAccounts: MockAccount[] = [];
