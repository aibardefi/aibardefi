/**
 * Every tunable number for the hero lives here.
 *
 * Positions are percentages of the `.hero-stage` box, which mirrors the
 * background's own 1656x943 framing — so these values are read straight off
 * design/homepage-reference.webp and stay correct at any viewport size.
 */

export type Coin = {
  /** Stable id, also used as the React key and in-flight guard. */
  id: string;
  /** Path under /public. Filenames match the supplied assets exactly. */
  src: string;
  alt: string;
  /** Centre point, as % of the stage. */
  x: number;
  y: number;
  /** Diameter, as % of stage width. */
  size: number;
  /** Float cycle length in seconds. */
  duration: number;
  /** Float start offset in seconds. */
  delay: number;
  /** Float travel in stage-relative %. */
  amplitude: number;
  /** Hover glow colour. */
  glow: string;
};

/** Left to right, top to bottom, as arranged in the reference. */
export const COINS: Coin[] = [
  {
    id: "cashcat",
    src: "/assets/coin-cashcat.webp",
    alt: "CashCat memecoin",
    x: 57.3,
    y: 25.0,
    size: 8.4,
    duration: 3.4,
    delay: 0,
    amplitude: 1.5,
    glow: "rgba(168, 178, 190, 0.9)",
  },
  {
    id: "cashdog",
    src: "/assets/coin-cashdog.webp",
    alt: "CashDog memecoin",
    x: 52.5,
    y: 43.0,
    size: 8.8,
    duration: 4.1,
    delay: 0.55,
    amplitude: 1.8,
    glow: "rgba(150, 205, 45, 0.9)",
  },
  {
    id: "littlejohn",
    src: "/assets/coin-littlejohn.webp",
    alt: "Little John memecoin",
    x: 54.5,
    y: 62.0,
    size: 9.0,
    duration: 3.8,
    delay: 1.1,
    amplitude: 1.6,
    glow: "rgba(212, 168, 42, 0.9)",
  },
  {
    id: "tendies",
    src: "/assets/coin-tendies.webp",
    alt: "Tendies memecoin",
    x: 85.5,
    y: 26.0,
    size: 8.4,
    duration: 4.4,
    delay: 0.3,
    amplitude: 1.7,
    glow: "rgba(140, 200, 40, 0.9)",
  },
  {
    id: "ansemcat",
    src: "/assets/coin-ansemcat.webp",
    alt: "Ansem Cat memecoin",
    x: 88.5,
    y: 46.0,
    size: 8.8,
    duration: 3.6,
    delay: 0.85,
    amplitude: 1.9,
    glow: "rgba(150, 90, 220, 0.9)",
  },
];

/**
 * Bear placement within the stage. `bottom` keeps his feet planted on the
 * courtyard paving regardless of viewport height.
 */
export const BEAR = {
  /** Centre of the bear box, as % of stage width. */
  x: 70.6,
  /**
   * Distance from stage bottom to the box bottom, as % of stage height.
   * Negative because bear.webp carries ~21% empty space below the soles;
   * letting that overhang the stage bottom plants his feet on the paving.
   */
  bottom: -6,
  /** Box width as % of stage width. */
  width: 24,
  /** Intrinsic pixel size of bear.webp, for next/image sizing. */
  intrinsic: { width: 1024, height: 1536 },
} as const;

/**
 * The $SB medallion's centre within bear.webp, as % of that image.
 * Doubles as the coin flight target and the anchor for "+ MEME POWER".
 */
export const MEDALLION = {
  x: 45.9,
  y: 46.6,
  /** Diameter as % of the bear box width. */
  size: 11.5,
} as const;

/**
 * Eye overlay placement within the bear box.
 *
 * bear-eyes-open.webp / bear-eyes-closed.webp are supplied on their own canvas.
 * If that canvas matches bear.webp, `fitsBearCanvas` stays true and the layers
 * drop in at inset-0. If they turn out to be framed differently, set it to
 * false and the bear falls back to his baked-in expression — the brief is
 * explicit that a misaligned overlay is worse than no blink at all.
 */
// The supplied eye layers are centred on their own canvas at ~46% height,
// but the bear's eyes sit at ~18%, so the overlays land on his chest, not his
// face. Per the brief — use them "only if they align" and "do not distort the
// face" — the overlays are disabled and the bear keeps his baked-in eyes.
// Re-exporting the eyes registered to bear.webp's canvas re-enables blink and
// tracking by flipping this back to true.
export const EYES = {
  fitsBearCanvas: false,
  /** Max pupil travel in px at the reference bear size. Kept small on purpose. */
  trackingRadius: 5,
  blink: { minMs: 4000, maxMs: 7000, holdMs: 130, fadeMs: 70 },
} as const;

/** Decorative dots from the reference. Positions are % of the stage. */
export const DOTS = [
  { x: 64.2, y: 15.4, r: 5, color: "var(--dot-red)" },
  { x: 75.1, y: 12.9, r: 4, color: "var(--dot-green)" },
  { x: 88.9, y: 16.5, r: 4, color: "var(--dot-green)" },
  { x: 51.6, y: 22.5, r: 5, color: "var(--dot-orange)" },
  { x: 95.5, y: 26.5, r: 4, color: "var(--dot-blue)" },
  { x: 43.5, y: 33.0, r: 5, color: "var(--dot-blue)" },
  { x: 57.9, y: 30.6, r: 4, color: "var(--dot-red)" },
  { x: 93.4, y: 37.0, r: 5, color: "var(--dot-yellow)" },
  { x: 41.6, y: 50.5, r: 4, color: "var(--dot-yellow)" },
  { x: 55.2, y: 55.5, r: 4, color: "var(--dot-blue)" },
  { x: 89.5, y: 57.5, r: 5, color: "var(--dot-red)" },
] as const;

/** Placeholder destinations until the real ones exist. */
export const LINKS = {
  borrow: "#",
  buy: "#",
} as const;

export const FLIGHT = {
  durationMs: 650,
  /** Coin scale on arrival at the medallion. */
  endScale: 0.35,
  memePowerMs: 1000,
} as const;
