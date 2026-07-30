import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0b0c0e",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://fenixstore.gg"),
  title: {
    default: "Fénix Store — Cuentas & Recargas de CODM 100% Verificadas",
    template: "%s | Fénix Store",
  },
  description:
    "La tienda líder de Call of Duty Mobile. Comprá y vendé cuentas con armas y operadores míticos con intermediación resguardada. Recargas inmediatas de CPs al mejor precio.",
  keywords: [
    "cuentas codm",
    "comprar cuentas call of duty mobile",
    "recargas cp codm",
    "cuentas miticas codm",
    "fenix store",
    "tienda de cuentas codm",
    "cp codm baratos",
    "vender cuenta codm",
    "intermediario codm seguro",
  ],
  authors: [{ name: "Fénix Store Team" }],
  creator: "Fénix Store",
  publisher: "Fénix Store",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/logo_clean.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/logo_clean.png",
    apple: "/logo_clean.png",
  },
  openGraph: {
    title: "Fénix Store — Cuentas & Recargas de CODM 100% Verificadas",
    description:
      "Marketplace oficial de Call of Duty Mobile. Cuentas con armas y personajes míticos verificados y recargas de CPs con entrega instantánea.",
    url: "https://fenixstore.gg",
    siteName: "Fénix Store",
    images: [
      {
        url: "/logo_clean.png",
        width: 800,
        height: 800,
        alt: "Fénix Store Logo Oficial CODM",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fénix Store — Cuentas & Recargas de CODM 100% Verificadas",
    description:
      "La tienda de confianza de Call of Duty Mobile. Cuentas míticas e intermediación 100% segura.",
    images: ["/logo_clean.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://fenixstore.gg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Fénix Store",
  image: "https://fenixstore.gg/logo_clean.png",
  description:
    "Marketplace verificado de compra y venta de cuentas de Call of Duty Mobile y recargas inmediatas de CP.",
  url: "https://fenixstore.gg",
  priceRange: "$$",
  currenciesAccepted: "USD, EUR, USDT",
  paymentAccepted: "Credit Card, Debit Card, Cryptocurrency, Apple Pay, Google Pay",
  sameAs: [
    "https://chat.whatsapp.com/F78McLwEexSFFpIhuQ7OSm",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo_clean.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo_clean.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Rajdhani:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-[#0b0c0e] text-zinc-100 selection:bg-[#f5b942] selection:text-[#0b0c0e]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
