import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "website1",
  description: "A new website.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Fill the whole screen and expose safe-area insets so fixed chrome can
  // clear the notch / Dynamic Island on modern phones.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
