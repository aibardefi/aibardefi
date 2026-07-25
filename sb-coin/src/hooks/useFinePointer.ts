"use client";

import { useEffect, useState } from "react";

/**
 * True only for devices with a real hovering cursor.
 *
 * Gating on pointer capability rather than viewport width is what correctly
 * excludes touch devices — a 1280px-wide tablet is still a touch device.
 * Starts false so server and first client render agree.
 */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return fine;
}
