import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "משקעים ניר אליהו",
  description: "נתוני הגשם של קיבוץ ניר אליהו",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#eef6fb",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className={rubik.variable}>
      <body className="min-h-dvh text-ink antialiased">{children}</body>
    </html>
  );
}
