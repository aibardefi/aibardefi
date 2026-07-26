import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const sb = Geist({
  variable: "--font-sb",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "$SB — Kapibara Blyatovich",
  description: "Lock memes. Borrow the meme.",
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
    <html lang="en" className={sb.variable}>
      {/* Ground and colour come from globals.css, which owns the shared
          palette; the old Tailwind colour classes no longer resolve. */}
      <body>
        {children}
      </body>
    </html>
  );
}
