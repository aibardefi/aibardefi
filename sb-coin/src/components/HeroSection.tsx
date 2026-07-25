"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BearMascot } from "@/components/BearMascot";
import { FloatingCoin } from "@/components/FloatingCoin";
import { Header } from "@/components/Header";
import { ScrollPrompt } from "@/components/ScrollPrompt";
import { COINS, DOTS, FLIGHT, type Coin } from "@/lib/heroConfig";

type Flight = { coin: Coin; from: DOMRect; to: DOMRect };

export function HeroSection() {
  const reduced = useReducedMotion();
  const medallionRef = useRef<HTMLDivElement>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [pulseKey, setPulseKey] = useState(0);
  const [showMemePower, setShowMemePower] = useState(false);
  const memeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (memeTimer.current) clearTimeout(memeTimer.current);
    },
    []
  );

  const arrive = useCallback((id: string) => {
    setFlights((f) => f.filter((x) => x.coin.id !== id));
    setPulseKey((k) => k + 1);
    setShowMemePower(true);
    if (memeTimer.current) clearTimeout(memeTimer.current);
    memeTimer.current = setTimeout(
      () => setShowMemePower(false),
      FLIGHT.memePowerMs
    );
  }, []);

  const feed = useCallback(
    (coin: Coin, el: HTMLElement) => {
      // Guard against repeat clicks while this coin is already travelling.
      if (flights.some((f) => f.coin.id === coin.id)) return;
      const to = medallionRef.current?.getBoundingClientRect();
      if (!to) return;
      // Measure the zoomed image, not the button, so the flying clone matches
      // what's on screen pixel for pixel.
      const img = el.querySelector("img");
      const fromEl: Element = img ?? el;

      // Reduced motion keeps the interaction working — the coin simply
      // disappears and the medallion reacts, with no flight across the screen.
      if (reduced) {
        setFlights((f) => [...f, { coin, from: fromEl.getBoundingClientRect(), to }]);
        setTimeout(() => arrive(coin.id), 120);
        return;
      }

      setFlights((f) => [...f, { coin, from: fromEl.getBoundingClientRect(), to }]);
    },
    [flights, reduced, arrive]
  );

  const inFlight = new Set(flights.map((f) => f.coin.id));

  return (
    <>
      <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-cream lg:block">
        {/* Mobile keeps the full-bleed courtyard; desktop swaps it for the
            scenery vignette inside the stage (per the client mock). */}
        <div aria-hidden className="absolute inset-0 lg:hidden">
          <Image
            src="/assets/background.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-bottom"
          />
        </div>

        <Header />

        <div className="relative z-20 px-5 pt-10 sm:px-8 lg:absolute lg:top-1/2 lg:left-[4.5%] lg:max-w-[46%] lg:-translate-y-[54%] lg:px-0 lg:pt-0">
          <h1 className="text-[clamp(2.25rem,10.5vw,3.5rem)] leading-[1.02] font-extrabold tracking-[-0.02em] text-navy uppercase lg:text-[clamp(2.75rem,10svh,6.75rem)]">
            Lock <span className="text-orange">Memes.</span>
            <br />
            Borrow $SB.
          </h1>
        </div>

        {/* Stage keeps the bear and coins locked to the courtyard behind them. */}
        <div className="hero-stage relative z-10 mt-4 lg:mt-0">
          <div aria-hidden className="scenery hidden lg:block">
            <Image
              src="/assets/background.webp"
              alt=""
              width={1672}
              height={941}
              priority
              className="h-auto w-full select-none"
            />
          </div>
          {DOTS.map((d, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute hidden rounded-full lg:block"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                width: d.r * 2,
                height: d.r * 2,
                background: d.color,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}

          {COINS.map((coin) => (
            <FloatingCoin
              key={coin.id}
              coin={coin}
              hidden={inFlight.has(coin.id)}
              onFeed={feed}
            />
          ))}

          <BearMascot
            pulseKey={pulseKey}
            showMemePower={showMemePower}
            medallionRef={medallionRef}
          />

          {/* Above the bear so it reads as his label and invites the click. */}
          <div className="pointer-events-auto absolute top-[36%] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap lg:top-[31%] lg:left-[72.8%]">
            <ScrollPrompt />
          </div>
        </div>

        {/* Coins fly in a fixed overlay because the coin and the medallion sit
            in different subtrees; the original never moves, it just hides. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
        >
          <AnimatePresence>
            {!reduced &&
              flights.map(({ coin, from, to }) => (
                <motion.img
                  key={coin.id}
                  src={coin.src}
                  alt=""
                  initial={{
                    x: from.left,
                    y: from.top,
                    width: from.width,
                    height: from.height,
                    scale: 1,
                    opacity: 1,
                  }}
                  animate={{
                    x: to.left + to.width / 2 - from.width / 2,
                    y: to.top + to.height / 2 - from.height / 2,
                    scale: FLIGHT.endScale,
                    opacity: 0.9,
                  }}
                  transition={{
                    duration: FLIGHT.durationMs / 1000,
                    ease: [0.4, 0, 0.2, 1],
                    // Offsetting the vertical easing bends the path into an
                    // arc; a straight line reads as robotic.
                    y: {
                      duration: FLIGHT.durationMs / 1000,
                      ease: [0.7, 0, 0.3, 1],
                    },
                  }}
                  onAnimationComplete={() => arrive(coin.id)}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    willChange: "transform",
                  }}
                />
              ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Scroll target. Intentionally empty until the real section exists. */}
      <section id="story" aria-hidden className="h-[60svh] w-full bg-cream" />
    </>
  );
}
