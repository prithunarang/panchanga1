import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/lib/SettingsContext";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Panchanga — Vedic Calendar",
  description: "A location-aware, astronomically calculated Hindu Panchanga and Vedic calendar.",
  applicationName: "Panchanga",
  keywords: ["panchanga", "hindu calendar", "vedic calendar", "ekadashi", "tithi", "nakshatra", "hindu festivals"],
  openGraph: {
    title: "Panchanga — Vedic Calendar",
    description: "A location-aware, astronomically calculated Hindu Panchanga and Vedic calendar.",
    type: "website",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon.ico" }],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ea" },
    { media: "(prefers-color-scheme: dark)", color: "#090a17" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${devanagari.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <SettingsProvider>
          <div id="app-shell" className="flex min-h-full flex-col">
            {children}
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
