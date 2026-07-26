import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "$SB — Lock Memes. Borrow The Meme.",
  description: "Lock your memecoins, borrow $SB.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Let the page fill the whole screen and expose safe-area insets so the
  // fixed header can clear the notch / Dynamic Island on modern phones.
  viewportFit: "cover",
  themeColor: "#f6eddf",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="bg-cream text-navy antialiased">
        {/* Baseline suppression of transform animations for reduced-motion
            users; components handle their own loops on top of this. */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
