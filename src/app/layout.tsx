import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/i18n/LanguageContext";
import SolanaProviderDynamic from "@/providers/SolanaProviderDynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "AlphaDEX",
  description: "Decentralized perpetual trading on Solana",
  manifest: "/manifest.json",
  themeColor: "#0a0a0a",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
        <ThemeProvider>
          <LanguageProvider>
            <SolanaProviderDynamic>
              <Header />
              <main className="flex-1 flex flex-col">{children}</main>
            </SolanaProviderDynamic>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
