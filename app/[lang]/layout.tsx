import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "@/app/globals.css";
import { i18n } from "@/i18n-config";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GharGo - Hyperlocal Service Marketplace",
  description: "Connect with trusted local service providers for everyday household needs in Guwahati.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#4338ca",
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>
}>) {
  const { lang } = await params;
  return (
    <html lang={lang}>
      <body
        className={`${outfit.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
