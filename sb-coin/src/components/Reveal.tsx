"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Extra delay in seconds, for lightly staggering stacked blocks. */
  delay?: number;
};

/**
 * Fades a block up into view once (opacity 0→1, translateY 40→0) as the section
 * settles in. Transform/opacity only, ~800ms on the shared premium easing, and
 * a no-op under prefers-reduced-motion so content simply appears.
 */
export function Reveal({ children, className, style, delay = 0 }: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={style}
      initial={reduced ? false : { opacity: 0, y: 40 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
