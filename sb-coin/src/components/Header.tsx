"use client";

import { motion } from "framer-motion";
import { LINKS } from "@/lib/heroConfig";
import { SbLogo } from "@/components/SbLogo";

const BUTTON_BASE =
  "inline-flex items-center justify-center rounded-[10px] px-4 py-2.5 text-[11px] " +
  "font-extrabold uppercase tracking-[0.06em] text-white transition-shadow " +
  "sm:px-6 sm:py-3 sm:text-[13px] lg:px-7 lg:text-sm";

export function Header() {
  return (
    <header className="relative z-30 flex w-full items-center justify-between gap-3 px-5 pt-5 sm:px-8 sm:pt-7 lg:absolute lg:inset-x-0 lg:top-0 lg:px-10 lg:pt-8">
      <a href="#" aria-label="$SB home" className="shrink-0">
        <SbLogo className="w-[92px] sm:w-[112px] lg:w-[132px]" />
      </a>

      <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
        <motion.a
          href={LINKS.borrow}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className={`${BUTTON_BASE} bg-navy hover:shadow-[0_10px_24px_-8px_rgba(20,36,63,0.55)]`}
        >
          Borrow $SB
        </motion.a>
        <motion.a
          href={LINKS.buy}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className={`${BUTTON_BASE} bg-orange hover:shadow-[0_10px_24px_-8px_rgba(244,88,30,0.6)]`}
        >
          Buy $SB
        </motion.a>
      </nav>
    </header>
  );
}
