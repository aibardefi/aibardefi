"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import type { Coin } from "@/lib/heroConfig";

type Props = {
  coin: Coin;
  /** True while this coin is mid-flight; it stays hidden and unclickable. */
  hidden: boolean;
  onFeed: (coin: Coin, el: HTMLElement) => void;
};

export function FloatingCoin({ coin, hidden, onFeed }: Props) {
  const reduced = useReducedMotion();
  const controls = useAnimationControls();
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  // Float pauses on hover. Resuming eases back to the origin first, otherwise
  // the keyframe loop restarts from 0 and the coin visibly jumps.
  useEffect(() => {
    if (reduced || hidden) {
      controls.stop();
      return;
    }
    if (hovered) {
      controls.stop();
      return;
    }

    let cancelled = false;
    (async () => {
      await controls.start({ y: 0, transition: { duration: 0.25, ease: "easeOut" } });
      if (cancelled) return;
      controls.start({
        y: [0, -coin.amplitude * 8, 0],
        transition: {
          duration: coin.duration,
          delay: coin.delay,
          repeat: Infinity,
          ease: "easeInOut",
        },
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [hovered, hidden, reduced, controls, coin.amplitude, coin.duration, coin.delay]);

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={`Feed ${coin.alt} to the bear`}
      onClick={(e) => onFeed(coin, e.currentTarget)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={controls}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="pointer-events-auto absolute cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy"
      style={{
        left: `${coin.x}%`,
        top: `${coin.y}%`,
        width: `${coin.size}%`,
        aspectRatio: "1 / 1",
        transform: "translate(-50%, -50%)",
        opacity: hidden ? 0 : 1,
        visibility: hidden ? "hidden" : "visible",
      }}
    >
      {/* Glow is a blurred sibling animating opacity. Animating a drop-shadow
          filter instead would repaint on every frame. */}
      <span
        aria-hidden
        className="absolute -inset-[22%] rounded-full blur-[14px] transition-opacity duration-300"
        style={{ background: coin.glow, opacity: hovered ? 0.75 : 0.25 }}
      />
      <Image
        src={coin.src}
        alt={coin.alt}
        width={512}
        height={512}
        className="relative h-full w-full select-none object-contain"
      />
    </motion.button>
  );
}
