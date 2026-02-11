import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google"; // Corrected import
import "@/app/globals.css";
// import { i18n } from "@/i18n-config"; // params.lang removal
import ToastProvider from "@/components/providers/ToastProvider";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider"; // New provider
import { getDictionary } from "@/get-dictionary"; // We might need a client-side friendly version or initial load

// New Layout Components
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { OnboardingModal } from "@/components/auth/OnboardingModal";

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
    themeColor: "#ffffff", // Changed to white as requested
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Default to English for SSR/Initial Load
    const dict = await getDictionary('en');

    return (
        <html lang="en">
            <meta name="theme-color" content="#ffffff" />
            <body className={`${outfit.variable} antialiased bg-gray-50 text-gray-900`}>
                <SmoothScrollProvider>
                    <AuthProvider>
                        <LanguageProvider initialDictionary={dict}>
                            <ToastProvider>
                                <Navbar />
                                <main className="flex-1 min-h-screen pb-16 md:pb-0"> {/* Add padding for mobile nav */}
                                    {children}
                                </main>
                                <OnboardingModal />
                                <Footer />
                                <MobileNav />
                            </ToastProvider>
                        </LanguageProvider>
                    </AuthProvider>
                </SmoothScrollProvider>
            </body>
        </html>
    );
}
