"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * Section 2: memecoins lock into the vault, $SB comes out.
 *
 * The whole sequence is CSS-transition driven off a single `.play` class
 * (added when 35% of the section is in view, removed when it leaves, so the
 * animation replays on re-entry). Geometry follows the approved section mock;
 * positions are % of the same height-fit stage system the hero uses.
 */

const INSIDE = [
  { src: "/assets/coin-ansemcat.webp", x: 49.5, y: 45, size: 7.5, zoom: 234, d2: "0.85s" },
  { src: "/assets/coin-tendies.webp", x: 60.5, y: 45, size: 7.5, zoom: 202, d2: "1.1s" },
  { src: "/assets/coin-cashdog.webp", x: 49, y: 58, size: 7, zoom: 212, d2: "1.35s" },
  { src: "/assets/coin-cashcat.webp", x: 55, y: 60, size: 7, zoom: 190, d2: "1.6s" },
  { src: "/assets/coin-littlejohn.webp", x: 61, y: 58, size: 7, zoom: 182, d2: "1.85s" },
];

const TRAVEL = [
  { src: "/assets/coin-ansemcat.webp", zoom: 234, d: "0.15s", sx: 29, sy: 66, tsz: 4, msx: 6, msy: 36, mtsz: 8, trail: "rgba(150,90,220,.85)" },
  { src: "/assets/coin-tendies.webp", zoom: 202, d: "0.4s", sx: 33, sy: 61, tsz: 4, msx: 11, msy: 32, mtsz: 8, trail: "rgba(140,200,40,.85)" },
  { src: "/assets/coin-cashdog.webp", zoom: 212, d: "0.65s", sx: 30, sy: 64, tsz: 3.7, msx: 8, msy: 34, mtsz: 8, trail: "rgba(150,205,45,.85)" },
  { src: "/assets/coin-cashcat.webp", zoom: 190, d: "0.9s", sx: 36, sy: 59, tsz: 4, msx: 15, msy: 31, mtsz: 8.5, trail: "rgba(190,198,206,.8)" },
  { src: "/assets/coin-littlejohn.webp", zoom: 182, d: "1.15s", sx: 40, sy: 57, tsz: 4.3, msx: 22, msy: 29, mtsz: 9, trail: "rgba(212,168,42,.85)" },
];

export function VaultSection() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  // Swap in the real art the moment the files exist in /assets — until then
  // the vault shows a labelled slot and $SB is the bear's medallion, cropped.
  const [hasVault, setHasVault] = useState(true);
  const [hasSbCoin, setHasSbCoin] = useState(true);

  // `.play` drives the whole CSS sequence. Cycling it off→on restarts every
  // animation from zero, so the section replays both on scroll-into-view and
  // when the cue is clicked.
  const [play, setPlay] = useState(false);
  const rafs = useRef<number[]>([]);
  const restart = useCallback(() => {
    rafs.current.forEach(cancelAnimationFrame);
    setPlay(false);
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => setPlay(true));
      rafs.current.push(r2);
    });
    rafs.current.push(r1);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (inView) restart();
      else setPlay(false);
    });
    return () => cancelAnimationFrame(id);
  }, [inView, restart]);

  useEffect(() => () => rafs.current.forEach(cancelAnimationFrame), []);

  return (
    <>
      <section
        id="story"
        ref={ref}
        className={`relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-cream lg:block ${play ? "play" : ""}`}
      >
        <div className="v-copy relative z-20 px-5 pt-24 sm:px-8 sm:pt-28">
          <h2 className="text-[clamp(2rem,9vw,3rem)] leading-[1.04] font-extrabold tracking-[-0.02em] text-navy uppercase lg:text-[clamp(2.25rem,8.5svh,5.5rem)]">
            Lock Memes.
            <br />
            Unlock <span className="text-orange">$SB.</span>
          </h2>
          <p className="mt-4 max-w-[26ch] text-[clamp(0.95rem,4vw,1.15rem)] font-semibold text-navy/90 lg:text-[clamp(1rem,2.6svh,1.45rem)]">
            Keep your memecoins and get $SB without selling them.
          </p>
        </div>

        <div className="v-stage relative z-10 mt-2">
          <div className="vault">
            <div className="vault-glow" aria-hidden />
            {hasVault ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/assets/vault.webp"
                alt="Stone vault holding locked memecoins"
                className="h-full w-full object-contain select-none"
                onError={() => setHasVault(false)}
              />
            ) : (
              <div className="vault-ph">Vault art</div>
            )}
            {INSIDE.map((c) => (
              <span
                key={`${c.src}-in`}
                aria-hidden
                className={`icoin ${c.d2 ? "arrive" : ""}`}
                style={
                  {
                    left: `${c.x}%`,
                    top: `${c.y}%`,
                    width: `${c.size}%`,
                    "--zoom": `${c.zoom}%`,
                    "--d2": c.d2 ?? undefined,
                  } as React.CSSProperties
                }
              >
                <Image src={c.src} alt="" width={1536} height={1024} />
              </span>
            ))}
          </div>

          {TRAVEL.map((c) => (
            <span
              key={`${c.src}-t`}
              aria-hidden
              className="tcoin"
              style={
                {
                  "--sx": `${c.sx}%`,
                  "--sy": `${c.sy}%`,
                  "--tsz": `${c.tsz}%`,
                  "--gx": "55%",
                  "--gy": "51.5%",
                  "--msx": `${c.msx}%`,
                  "--msy": `${c.msy}%`,
                  "--mtsz": `${c.mtsz}%`,
                  "--mgx": "55%",
                  "--mgy": "30%",
                  "--d": c.d,
                  "--zoom": `${c.zoom}%`,
                  "--trail": c.trail,
                } as React.CSSProperties
              }
            >
              <Image src={c.src} alt="" width={1536} height={1024} />
            </span>
          ))}

          {/* The glowing $SB coin that leaves the vault. */}
          <span className="sbout" aria-hidden>
            <span className="sbbeam" />
            <span className="sbburst" />
            <span className="halo" />
            <span className="disc">
              {hasSbCoin ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/assets/sb-gold-coin.webp"
                  alt=""
                  className="select-none"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "455%",
                    height: "auto",
                  }}
                  onError={() => setHasSbCoin(false)}
                />
              ) : (
                // Fallback: the bear's own medallion, cropped from bear.webp.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/assets/bear.webp"
                  alt=""
                  style={{ width: "870%", left: "-349%", top: "-558%" }}
                />
              )}
            </span>
          </span>

          <div className="bear2" aria-hidden>
            <motion.div
              animate={
                reduced
                  ? undefined
                  : { scaleY: [1, 1.012, 1], scaleX: [1, 1.008, 1], y: [0, -3, 0] }
              }
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
              style={{ transformOrigin: "bottom center" }}
              className="relative"
            >
              <Image
                src="/assets/bear.webp"
                alt=""
                width={1024}
                height={1536}
                className="h-auto w-full select-none"
              />
              <div className="medspot">
                <div className="med-glow2" />
              </div>
            </motion.div>
          </div>

          {/* Cue sits above the vault, like FEED THE BEAR sits above the bear. */}
          <div className="v-cue">
            <button
              type="button"
              onClick={restart}
              aria-label="Replay: watch the memecoins lock into the vault"
              className="inline-flex cursor-pointer items-center gap-2.5 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.22em] text-navy/85 transition-colors hover:text-navy lg:text-[13px]"
            >
              See What Powers $SB
              <motion.span
                aria-hidden
                animate={reduced ? undefined : { y: [0, 5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="text-base leading-none"
              >
                ↓
              </motion.span>
            </button>
          </div>
        </div>
      </section>

      {/* Scroll target for the cue. Intentionally empty until section 3 exists. */}
      <section id="powers" aria-hidden className="h-[60svh] w-full bg-cream" />
    </>
  );
}
