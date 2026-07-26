"use client";

import { motion } from "framer-motion";
import { LINKS } from "@/lib/heroConfig";
import { SbLogo } from "@/components/SbLogo";
import { useScrolled } from "@/hooks/useScrolled";

const BUTTON_BASE =
  "inline-flex items-center justify-center rounded-[10px] px-4 py-2.5 text-[11px] " +
  "font-extrabold uppercase tracking-[0.06em] text-white transition-shadow " +
  "sm:px-6 sm:py-3 sm:text-[13px] lg:px-7 lg:text-sm";

export function Header() {
  // Transparent at the top; a soft cream backdrop fades in past 40px so the
  // logo and buttons stay legible over the scenes without a hard divider.
  const scrolled = useScrolled(40);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex w-full items-center justify-between gap-3 px-5 py-4 transition-[background-color,box-shadow,backdrop-filter] duration-300 ease-out sm:px-8 sm:py-5 lg:px-10 ${
        scrolled
          ? "bg-cream/85 shadow-[0_6px_24px_-16px_rgba(20,36,63,0.55)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <a href="#" aria-label="$SB home" className="shrink-0">
        <SbLogo className="h-8 sm:h-9 lg:h-10" />
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
