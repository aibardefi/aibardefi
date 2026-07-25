"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  /** Feeds every coin to the bear, one by one. */
  onFeedAll: () => void;
};

export function ScrollPrompt({ onFeedAll }: Props) {
  const reduced = useReducedMotion();

  return (
    <button
      type="button"
      onClick={onFeedAll}
      aria-label="Feed the bear — send every coin to his medallion"
      className="group relative z-20 inline-flex cursor-pointer items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-navy/85 transition-colors hover:text-navy sm:text-xs lg:text-[13px]"
    >
      Feed the Bear
      <motion.span
        aria-hidden
        animate={reduced ? undefined : { y: [0, 5, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="text-base leading-none"
      >
        ↓
      </motion.span>
    </button>
  );
}
