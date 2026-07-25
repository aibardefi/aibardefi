"use client";

import { motion, useReducedMotion } from "framer-motion";

export function ScrollPrompt() {
  const reduced = useReducedMotion();

  const scrollToStory = () => {
    document.getElementById("story")?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToStory}
      aria-label="Feed the bear — scroll to the next section"
      className="group relative z-20 inline-flex cursor-pointer items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-navy/85 transition-colors hover:text-navy sm:text-xs"
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
