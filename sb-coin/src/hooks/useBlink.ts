"use client";

import { useEffect, useState } from "react";
import { EYES } from "@/lib/heroConfig";

/**
 * Drives the bear's blink on a randomised 4-7s cycle.
 *
 * Pauses while the tab is hidden: without that, a backgrounded tab queues up
 * timers and the bear blinks several times in a row on return.
 */
export function useBlink(enabled: boolean): boolean {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let openTimer: ReturnType<typeof setTimeout>;
    let closeTimer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const { minMs, maxMs, holdMs } = EYES.blink;
      const wait = minMs + Math.random() * (maxMs - minMs);
      closeTimer = setTimeout(() => {
        setBlinking(true);
        openTimer = setTimeout(() => {
          setBlinking(false);
          schedule();
        }, holdMs);
      }, wait);
    };

    const onVisibility = () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      setBlinking(false);
      if (document.visibilityState === "visible") schedule();
    };

    schedule();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  // Derived rather than reset inside the effect, so disabling never triggers
  // a cascading render.
  return enabled && blinking;
}
