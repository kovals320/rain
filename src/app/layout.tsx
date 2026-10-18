import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import { InstallPrompt } from "@/components/InstallPrompt";
import "./globals.css";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  display: "swap",
});

// Pages show who is signed in (admin links), so render per request; the rain data itself is cached (src/lib/rain.ts).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "משקעים ניר אליהו",
  description: "נתוני הגשם של קיבוץ ניר אליהו",
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: "/icons/favicon-32.png", sizes: "32x32" }, { url: "/icons/icon-192.png", sizes: "192x192" }],
    apple: "/icons/apple-touch-icon.png",
  },
  // iPhone home-screen app: full screen, its own name under the icon.
  appleWebApp: { capable: true, title: "משקעים", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#eef6fb",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className={rubik.variable}>
      <body className="min-h-dvh text-ink antialiased">
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
