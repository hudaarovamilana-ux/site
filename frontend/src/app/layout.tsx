import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthHydrator } from "@/components/auth/AuthHydrator";
import { ProfileSyncNotice } from "@/components/profile/ProfileSyncNotice";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Женская консультация — ваш персональный гид по здоровью",
  description:
    "Беременность, планирование, профилактика. Напоминания, чеклисты и ответы ИИ — информационный гид, не медучреждение.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <AuthHydrator />
        <ProfileSyncNotice />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
