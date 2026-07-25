"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * Page 3: the $SB Claim Station.
 *
 * Same scroll-triggered `.play3` pattern as the vault: the $SB coin flies into
 * the slot, the verification light goes green, the returned memecoin appears in
 * the tube, and the bear clerk's medallion glows. Positions are % of the claim
 * station / clerk boxes, measured from the approved page-3 mockup.
 */
export function ClaimSection() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });

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
    <section
      id="powers"
      ref={ref}
      className={`relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-cream lg:block ${play ? "play3" : ""}`}
    >
      <div className="c-copy relative z-20 px-5 pt-24 sm:px-8 sm:pt-28">
        <h2 className="text-[clamp(2rem,8.5vw,3rem)] leading-[1.04] font-extrabold tracking-[-0.02em] text-navy uppercase lg:text-[clamp(2.25rem,8svh,5rem)]">
          Repay <span className="text-orange">$SB.</span>
          <br />
          Take Your Meme Back.
        </h2>
        <p className="mt-4 max-w-[26ch] text-[clamp(0.95rem,4vw,1.15rem)] font-semibold text-navy/90 lg:text-[clamp(1rem,2.5svh,1.4rem)]">
          Return what you borrowed and reclaim your original memecoin.
        </p>
      </div>

      <div className="c-stage relative z-10 mt-2">
        <div className="station">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/claim-station.webp"
            alt="$SB claim station"
            className="h-full w-full object-contain select-none"
          />
          <span className="cs-streak" aria-hidden />
          <span className="cs-coin" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/sb-gold-coin.webp" alt="" />
          </span>
          <span className="cs-green" aria-hidden />
          <span className="cs-tube" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/returned-memecoin.webp" alt="" />
          </span>
        </div>

        <div className="clerk" aria-hidden>
          <motion.div
            className="breathe"
            animate={
              reduced
                ? undefined
                : {
                    scaleY: [1, 1.012, 1],
                    scaleX: [1, 1.008, 1],
                    y: [0, -3, 0],
                    // Gentle sway so the key and ticket move naturally with him.
                    rotate: [0, 0.7, 0, -0.7, 0],
                  }
            }
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
            style={{ transformOrigin: "bottom center" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/bear-claim-clerk.webp"
              alt="The $SB bear clerk holding a gold key and a claim ticket"
            />
            <span className="cs-med" />
          </motion.div>
        </div>

        {/* Cue above the station; clicking replays the claim sequence. */}
        <div className="c-cue">
          <button
            type="button"
            onClick={restart}
            aria-label="Replay: watch the memecoin claim"
            className="inline-flex cursor-pointer items-center gap-2.5 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.22em] text-navy/85 transition-colors hover:text-navy lg:text-[13px]"
          >
            Claim
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
  );
}
