"use client";

import { useCallback, useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/useEntrance";
import s from "./ScreenNav.module.css";

/**
 * A dot per screen, down the right edge.
 *
 * Seven mandatory-snap screens with only "Scroll ↓" to go on gave no sense of
 * how long the site is and no way back to a screen you had passed. The dots
 * answer both: they show the length at a glance and each one is a jump.
 *
 * It finds the screens by querying for them rather than by being handed ids,
 * so the seven section components stay untouched and adding an eighth screen
 * needs no change here.
 */
export function ScreenNav() {
  const [screens, setScreens] = useState<HTMLElement[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const found = Array.from(
      document.querySelectorAll<HTMLElement>("section.stage")
    );
    setScreens(found);
    if (!found.length || !("IntersectionObserver" in window)) return;

    // Half a screen visible is the threshold, because snap scrolling means one
    // section is nearly always past the midpoint — a lower value flickers
    // between two dots for the whole of a scroll.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = found.indexOf(e.target as HTMLElement);
          if (i >= 0) setActive(i);
        });
      },
      { threshold: 0.5 }
    );
    found.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = useCallback(
    (i: number) => {
      screens[i]?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    },
    [screens]
  );

  // Nothing to navigate before the sections have been found, and one screen is
  // not a set — rendering a lone dot would be noise.
  if (screens.length < 2) return null;

  return (
    <nav className={s.nav} aria-label="Screens">
      {screens.map((_, i) => (
        <button
          key={i}
          type="button"
          className={`${s.hit} ${i === active ? s.on : ""}`}
          aria-label={`Screen ${i + 1} of ${screens.length}`}
          aria-current={i === active ? "true" : undefined}
          onClick={() => go(i)}
        >
          <span className={s.dot} />
        </button>
      ))}
    </nav>
  );
}
