"use client";

import { useEffect, useState } from "react";

/**
 * True once the page has scrolled past `threshold` px. Used to fade a subtle
 * backdrop under the fixed header. The listener is passive and rAF-throttled so
 * it never blocks scrolling, and it seeds its value on mount so a mid-page
 * refresh doesn't start in the wrong state.
 */
export function useScrolled(threshold = 40): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return scrolled;
}
