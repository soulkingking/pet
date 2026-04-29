import type { Metadata } from "next";
import { Nunito_Sans, Varela_Round } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { MobileNav } from "@/components/mobile-nav";
import { getCurrentUserProfile } from "@/lib/queries";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const varelaRound = Varela_Round({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Petly 宠物社区",
  description: "记录宠物日常，认识附近同好。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentUserProfile();

  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body className={`${nunitoSans.variable} ${varelaRound.variable}`}>
        <SiteHeader profile={profile} />
        <main className="mx-auto min-h-[calc(100vh-72px)] w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
