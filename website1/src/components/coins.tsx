import type { ReactNode } from "react";

/**
 * The Robinhood Chain memecoins, as named by the client.
 *
 * Drawn flat with fat outlines to sit in the same world as the mascot. The
 * rendered 3D coin art elsewhere in the repo is a different style and reads as
 * a second website when placed next to him.
 *
 * Six distinct hues, none of them near the $SB lime — a coin that reads as
 * $SB defeats the whole lock-one-borrow-the-other point of the first two
 * screens. Eyes and details are punched out in the coin's own background
 * colour rather than drawn, so each glyph stays a single flat shape.
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
    ticker: "CASH DOG",
    bg: "#7fb3dd",
    glyphOn: "#12110c",
    glyph: (
      <>
        <path d="M22 32 q-15 8 -11 36 q3 15 16 8 z" />
        <path d="M78 32 q15 8 11 36 q-3 15 -16 8 z" />
        <ellipse cx="50" cy="56" rx="30" ry="28" />
        <circle cx="39" cy="52" r="5" fill="#7fb3dd" />
        <circle cx="61" cy="52" r="5" fill="#7fb3dd" />
        <ellipse cx="50" cy="70" rx="9" ry="6" fill="#7fb3dd" />
      </>
    ),
  },
  {
    // Robin Hood's man: the feathered cap does the work at coin size, where a
    // whole figure would collapse into a smudge.
    ticker: "LITTLE JOHN",
    bg: "#2f6f4f",
    glyphOn: "#f7edd9",
    glyph: (
      <>
        <path d="M16 62 q4 -30 34 -30 q30 0 34 30 q-34 10 -68 0 z" />
        <path d="M14 62 q36 12 72 0 l0 9 q-36 12 -72 0 z" />
        <path
          d="M70 34 q16 -14 20 -30 q-18 4 -26 20"
          fill="#f7edd9"
          stroke="#12110c"
          strokeWidth="4"
          strokeLinejoin="round"
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
    ticker: "YOLO",
    bg: "#c4392b",
    glyphOn: "#f7edd9",
    glyph: (
      <>
        <path d="M50 8 q18 18 18 44 l-36 0 q0 -26 18 -44 z" />
        <path d="M32 52 l-14 18 l14 4 z" />
        <path d="M68 52 l14 18 l-14 4 z" />
        <circle cx="50" cy="38" r="7" fill="#c4392b" />
        <path d="M40 76 q10 16 20 0 q-10 8 -20 0 z" />
      </>
    ),
  },
  {
    // The shades are the whole point — without them this is CASHCAT again.
    ticker: "ANSEMCAT",
    bg: "#8b6fd4",
    glyphOn: "#12110c",
    glyph: (
      <>
        <path d="M22 36 L15 10 L40 25 Z" />
        <path d="M78 36 L85 10 L60 25 Z" />
        <ellipse cx="50" cy="58" rx="32" ry="28" />
        <rect x="24" y="48" width="52" height="13" rx="5" fill="#f7edd9" />
        <path
          d="M50 48 v13"
          stroke="#8b6fd4"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M42 72 q8 6 16 0"
          stroke="#8b6fd4"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
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
