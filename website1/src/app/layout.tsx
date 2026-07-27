import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const sb = Geist({
  variable: "--font-sb",
  subsets: ["latin"],
});

/**
 * Where this copy of the site lives, absolutely.
 *
 * A crawler resolves og:image against nothing — it needs a full URL, so a
 * relative "/og.png" silently produces a link with no preview at all. Reading
 * from the environment means the same source yields the right absolute URL on
 * GitHub Pages (a sub-path) and on Vercel (a domain root), and the fallback is
 * the public address so a plain `npm run build` still emits something valid.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://aibardefi.github.io/aibardefi/website1";

const TITLE = "$SB — Capybara Blyatovich";
const DESCRIPTION =
  "Lock memes. Borrow the meme. A lending protocol run by one tired capybara.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Capybara Blyatovich · Lending Co.",
    locale: "en_US",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        // Width and height are declared so the crawler can reserve the right
        // shape before the image arrives, which is what stops the card
        // collapsing to a small square in some clients.
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Capybara Blyatovich in his suka blyat ushanka, beside the words: lock memes, borrow the meme.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
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
