"use client";

import Image from "next/image";
import { RefObject, useEffect, useRef } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { BEAR, EYES, MEDALLION } from "@/lib/heroConfig";
import { useBlink } from "@/hooks/useBlink";
import { useFinePointer } from "@/hooks/useFinePointer";

type Props = {
  /** Increments on each coin arrival to retrigger the pulse and glow. */
  pulseKey: number;
  showMemePower: boolean;
  medallionRef: RefObject<HTMLDivElement | null>;
};

export function BearMascot({ pulseKey, showMemePower, medallionRef }: Props) {
  const reduced = useReducedMotion();
  const finePointer = useFinePointer();

  // Only overlay the eye layers when they're known to register with bear.webp.
  // A misaligned overlay distorts his face, which is worse than not blinking.
  const eyesUsable = EYES.fitsBearCanvas;
  const blinking = useBlink(Boolean(eyesUsable && !reduced));
  const tracking = eyesUsable && finePointer && !reduced;

  const boxRef = useRef<HTMLDivElement>(null);

  // Motion values, not state — state on mousemove re-renders the whole hero
  // on every pointer move.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pupilX = useSpring(rawX, { stiffness: 120, damping: 18 });
  const pupilY = useSpring(rawY, { stiffness: 120, damping: 18 });

  useEffect(() => {
    if (!tracking) {
      rawX.set(0);
      rawY.set(0);
      return;
    }

    let frame = 0;
    const onMove = (e: MouseEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const box = boxRef.current?.getBoundingClientRect();
        if (!box) return;
        // Normalise the cursor against the bear's head, then clamp so the
        // pupils never travel outside their sockets.
        const dx = (e.clientX - (box.left + box.width / 2)) / (box.width / 2);
        const dy = (e.clientY - (box.top + box.height * 0.28)) / (box.height / 2);
        const clamp = (v: number) => Math.max(-1, Math.min(1, v));
        rawX.set(clamp(dx) * EYES.trackingRadius);
        rawY.set(clamp(dy) * EYES.trackingRadius * 0.6);
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [tracking, rawX, rawY]);

  return (
    <div
      ref={boxRef}
      className="bear-pos pointer-events-none absolute"
      style={
        {
          "--bx": `${BEAR.x}%`,
          "--bw": `${BEAR.width}%`,
          "--bb": `${BEAR.bottom}%`,
          "--mbx": `${BEAR.mobile.x}%`,
          "--mbw": `${BEAR.mobile.width}%`,
          "--mbb": `${BEAR.mobile.bottom}%`,
          transform: "translateX(-50%)",
        } as React.CSSProperties
      }
    >
      {/* Outer wrapper owns the feed pulse; inner owns breathing. Sharing one
          scale value would make the two animations fight. */}
      <motion.div
        key={pulseKey}
        animate={reduced ? undefined : { scale: [1, 1.035, 1] }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ transformOrigin: "bottom center" }}
      >
        <motion.div
          animate={
            reduced
              ? undefined
              : { scaleY: [1, 1.012, 1], scaleX: [1, 1.008, 1], y: [0, -3, 0] }
          }
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "bottom center" }}
          className="relative"
        >
          <Image
            src="/assets/bear.webp"
            alt="The $SB bear, wearing a bucket hat and a gold $SB medallion"
            width={BEAR.intrinsic.width}
            height={BEAR.intrinsic.height}
            priority
            className="h-auto w-full select-none"
          />

          {eyesUsable && (
            <>
              <motion.div
                aria-hidden
                className="absolute inset-0"
                style={{ x: pupilX, y: pupilY }}
              >
                <Image
                  src="/assets/bear-eyes-open.webp"
                  alt=""
                  width={BEAR.intrinsic.width}
                  height={BEAR.intrinsic.height}
                  priority
                  className="h-auto w-full select-none"
                />
              </motion.div>

              <motion.div
                aria-hidden
                className="absolute inset-0"
                animate={{ opacity: blinking ? 1 : 0 }}
                transition={{ duration: EYES.blink.fadeMs / 1000 }}
              >
                <Image
                  src="/assets/bear-eyes-closed.webp"
                  alt=""
                  width={BEAR.intrinsic.width}
                  height={BEAR.intrinsic.height}
                  className="h-auto w-full select-none"
                />
              </motion.div>
            </>
          )}

          {/* Flight target for coins, and anchor for the glow and badge. */}
          <div
            ref={medallionRef}
            className="absolute"
            style={{
              left: `${MEDALLION.x}%`,
              top: `${MEDALLION.y}%`,
              width: `${MEDALLION.size}%`,
              aspectRatio: "1 / 1",
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.div
              key={`glow-${pulseKey}`}
              aria-hidden
              className="absolute -inset-[70%] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,208,64,0.95) 0%, rgba(255,184,28,0.45) 42%, rgba(255,184,28,0) 72%)",
              }}
              initial={{ opacity: 0, scale: 1 }}
              animate={
                pulseKey === 0
                  ? { opacity: 0 }
                  : { opacity: [0, 1, 0], scale: [1, 1.35, 1] }
              }
              transition={{ duration: 0.7, ease: "easeOut" }}
            />

            <AnimatePresence>
              {showMemePower && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: -8 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 whitespace-nowrap text-[clamp(0.6rem,1vw,0.9rem)] font-extrabold uppercase tracking-[0.08em] text-orange drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
                >
                  + Meme Power
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
