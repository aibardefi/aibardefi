import type { ReactNode } from "react";

/**
 * The five biggest Robinhood Chain memecoins by market cap.
 *
 * Drawn flat with fat outlines to sit in the same world as the mascot. The
 * rendered 3D coin art elsewhere in the repo is a different style and reads as
 * a second website when placed next to him.
 *
 * This ecosystem launched in July 2026 and the rankings move fast — worth
 * re-checking against a live source before launch.
 */
export type Coin = {
  ticker: string;
  bg: string;
  glyphOn: string;
  glyph: ReactNode;
};

export const COINS: Coin[] = [
  {
    ticker: "CASHCAT",
    bg: "#b9b3a6",
    glyphOn: "#12110c",
    glyph: (
      <>
        <path d="M24 38 L17 11 L41 26 Z" />
        <path d="M76 38 L83 11 L59 26 Z" />
        <ellipse cx="50" cy="58" rx="33" ry="29" />
        <circle cx="38" cy="54" r="5" fill="#b9b3a6" />
        <circle cx="62" cy="54" r="5" fill="#b9b3a6" />
        <path
          d="M42 70 q8 7 16 0"
          stroke="#b9b3a6"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    ticker: "CASHDOG",
    bg: "#a8c24e",
    glyphOn: "#12110c",
    glyph: (
      <>
        <path d="M22 32 q-15 8 -11 36 q3 15 16 8 z" />
        <path d="M78 32 q15 8 11 36 q-3 15 -16 8 z" />
        <ellipse cx="50" cy="56" rx="30" ry="28" />
        <circle cx="39" cy="52" r="5" fill="#a8c24e" />
        <circle cx="61" cy="52" r="5" fill="#a8c24e" />
        <ellipse cx="50" cy="70" rx="9" ry="6" fill="#a8c24e" />
      </>
    ),
  },
  {
    ticker: "HOODRAT",
    bg: "#7a6a5b",
    glyphOn: "#f7edd9",
    glyph: (
      <>
        <circle cx="36" cy="30" r="14" />
        <path d="M18 58 q10 -22 40 -20 q26 2 28 20 q2 18 -26 20 q-34 2 -42 -20 z" />
        <circle cx="60" cy="56" r="4.5" fill="#7a6a5b" />
        <circle cx="85" cy="72" r="3.5" />
        <path
          d="M84 74 q12 8 4 18"
          stroke="#f7edd9"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    ticker: "TENDIES",
    bg: "#e0a33c",
    glyphOn: "#12110c",
    glyph: (
      <>
        <path d="M26 48 q-6 -24 22 -27 q28 -3 34 17 q9 24 -11 34 q-26 14 -40 -3 q-8 -10 -5 -21 z" />
        <circle cx="44" cy="46" r="4" fill="#e0a33c" />
        <circle cx="62" cy="58" r="4" fill="#e0a33c" />
        <circle cx="48" cy="68" r="3.5" fill="#e0a33c" />
      </>
    ),
  },
  {
    ticker: "WEN LAMBO",
    bg: "#c4392b",
    glyphOn: "#f7edd9",
    glyph: (
      <>
        <path d="M8 66 L26 44 L58 39 L82 52 L92 57 L92 68 L8 68 Z" />
        <path d="M31 49 L54 46 L70 54 L33 56 Z" fill="#c4392b" />
        <circle cx="30" cy="70" r="9" />
        <circle cx="72" cy="70" r="9" />
        <circle cx="30" cy="70" r="3.5" fill="#c4392b" />
        <circle cx="72" cy="70" r="3.5" fill="#c4392b" />
      </>
    ),
  },
];

export function CoinGlyph({ coin }: { coin: Coin }) {
  return (
    <svg viewBox="0 0 100 100" fill={coin.glyphOn} aria-hidden="true">
      {coin.glyph}
    </svg>
  );
}
