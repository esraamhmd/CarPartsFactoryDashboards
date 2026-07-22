import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider }  from "@/lib/theme";
import { I18nProvider }   from "@/i18n";
import { ToastProvider }  from "@/components/ui/Toast";
import { SearchProvider } from "@/lib/search";
import { AuthProvider }   from "@/lib/auth";
import AppLayout          from "@/components/layout/AppLayout";

const BASE = 'https://motorsync.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: { default: "MotorSync — Car Parts Factory ERP", template: "%s | MotorSync ERP" },
  description: "MotorSync is a complete ERP dashboard for car parts manufacturing. Manage employees, machines, inventory, orders, production, finance and quality in real-time.",
  keywords: ["car parts ERP","factory management","manufacturing dashboard","inventory","production","قطع غيار","مصنع"],
  authors: [{ name: "MotorSync", url: BASE }],
  creator: "MotorSync",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website", locale: "en_US", url: BASE, siteName: "MotorSync ERP",
    title: "MotorSync — Car Parts Factory ERP Dashboard",
    description: "Complete ERP system for car parts manufacturing.",
  },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }], apple: '/favicon.svg' },
  manifest: '/manifest.json',
  alternates: { canonical: BASE },
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0b0f1a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="canonical" href={BASE} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <I18nProvider>
              <SearchProvider>
                <ToastProvider>
                  <AppLayout>{children}</AppLayout>
                </ToastProvider>
              </SearchProvider>
            </I18nProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}