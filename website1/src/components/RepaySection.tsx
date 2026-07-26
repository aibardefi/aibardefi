"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MASCOT_SRC } from "./Mascot";
import { COINS } from "./coins";
import { useEntrance, prefersReducedMotion } from "@/lib/useEntrance";
import { useReplay } from "@/lib/useReplay";
import s from "./RepaySection.module.css";

const TOTAL = 42000;

/**
 * Where the locked memes sit inside the vault. Same shared roster as the other
 * screens — these are the very coins the machine swallowed one screen earlier,
 * so they cannot be a different five.
 */
const INSIDE_AT = [
  { x: 206, y: 226 },
  { x: 292, y: 210 },
  { x: 378, y: 226 },
  { x: 216, y: 316 },
  { x: 300, y: 330 },
  { x: 386, y: 316 },
];

export function RepaySection() {
  const ref = useEntrance<HTMLElement>();
  const sliderRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const insideRef = useRef<SVGGElement>(null);
  const doorLRef = useRef<SVGRectElement>(null);
  const doorRRef = useRef<SVGRectElement>(null);
  const bubbleTimer = useRef<number | undefined>(undefined);
  const releaseTimers = useRef<number[]>([]);
  const dragging = useRef(false);

  const [p, setP] = useState(0);
  const [freed, setFreed] = useState(false);
  const [snap, setSnap] = useState(false);
  const [nope, setNope] = useState(false);
  const [hint, setHint] = useState("Drag the handle right to repay");

  const say = useCallback((text: string) => {
    const el = bubbleRef.current;
    if (!el) return;
    el.textContent = text;
    el.classList.add("show");
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(
      () => el.classList.remove("show"),
      2000
    );
  }, []);

  const free = useCallback(() => {
    setFreed(true);
    setHint("Unlocked. They are yours again.");
    say("we are square.");

    const reduced = prefersReducedMotion();
    const dl = doorLRef.current;
    const dr = doorRRef.current;

    if (reduced) {
      if (dl) dl.style.transform = "translateX(-190px)";
      if (dr) dr.style.transform = "translateX(190px)";
      insideRef.current?.querySelectorAll(`.${s.memeOut}`).forEach((m) => {
        (m as SVGGElement).style.opacity = "0";
      });
      return;
    }

    dl?.animate(
      [{ transform: "none" }, { transform: "translateX(-196px) skewY(-2deg)" }],
      { duration: 950, easing: "cubic-bezier(.3,.8,.3,1)", fill: "forwards" }
    );
    dr?.animate(
      [{ transform: "none" }, { transform: "translateX(196px) skewY(2deg)" }],
      { duration: 950, easing: "cubic-bezier(.3,.8,.3,1)", fill: "forwards" }
    );

    insideRef.current?.querySelectorAll(`.${s.memeOut}`).forEach((m, i) => {
      releaseTimers.current.push(window.setTimeout(() => {
        (m as SVGGElement).animate(
          [
            { transform: "translateY(0) scale(1)", opacity: 1 },
            { transform: "translateY(-40px) scale(1.12)", opacity: 1, offset: 0.4 },
            { transform: "translateY(-230px) scale(0.6)", opacity: 0 },
          ],
          { duration: 1200, easing: "cubic-bezier(.4,0,.6,1)", fill: "forwards" }
        );
      }, 760 + i * 150));
    });
  }, [say]);

  const commit = useCallback(
    (v: number) => {
      const next = Math.max(0, Math.min(1, v));
      setP(next);
      if (next >= 1 && !freed) free();
      return next;
    },
    [free, freed]
  );

  const travel = () => {
    const w = sliderRef.current?.clientWidth ?? 0;
    const k = knobRef.current?.offsetWidth ?? 0;
    return Math.max(1, w - k);
  };

  const pointerP = (clientX: number) => {
    const r = sliderRef.current?.getBoundingClientRect();
    if (!r) return 0;
    const k = knobRef.current?.offsetWidth ?? 0;
    return (clientX - r.left - k / 2) / travel();
  };

  const release = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    if (freed) return;

    // Short of the end: springs back, and he tells you so.
    setSnap(true);
    setP((was) => {
      if (was > 0.06) {
        setNope(true);
        window.setTimeout(() => setNope(false), 300);
        say(was > 0.75 ? "so close." : "not enough.");
        setHint("All of it, or nothing comes out.");
      }
      return 0;
    });
  }, [freed, say]);

  useEffect(() => {
    if (freed) return;
    setHint((h) =>
      h === "All of it, or nothing comes out."
        ? h
        : p === 0
          ? "Drag the handle right to repay"
          : p < 0.35
            ? `${Math.round(p * 100)}% repaid — the lock is lifting`
            : p < 0.8
              ? `${Math.round(p * 100)}% repaid — keep going`
              : p < 1
                ? `${Math.round(p * 100)}% — almost off`
                : "Paid in full."
    );
  }, [p, freed]);

  useEffect(
    () => () => {
      window.clearTimeout(bubbleTimer.current);
      releaseTimers.current.forEach(clearTimeout);
    },
    []
  );

  // Cancelling the door and meme animations is what actually rebuilds the
  // vault — the state alone would leave it standing open and empty.
  const rearm = useCallback(() => {
    releaseTimers.current.forEach(clearTimeout);
    releaseTimers.current = [];
    window.clearTimeout(bubbleTimer.current);
    [doorLRef.current, doorRRef.current].forEach((d) =>
      d?.getAnimations().forEach((a) => a.cancel())
    );
    insideRef.current?.querySelectorAll(`.${s.memeOut}`).forEach((m) => {
      const el = m as SVGGElement;
      el.getAnimations().forEach((a) => a.cancel());
      el.style.opacity = "";
    });
    if (doorLRef.current) doorLRef.current.style.transform = "";
    if (doorRRef.current) doorRRef.current.style.transform = "";
    bubbleRef.current?.classList.remove("show");
    setFreed(false);
    setSnap(false);
    setP(0);
    setHint("Drag the handle right to repay");
  }, []);

  useReplay(ref, rearm, () => dragging.current);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (freed) return;
    const step = e.shiftKey ? 0.25 : 0.08;
    const keys: Record<string, number> = {
      ArrowRight: p + step,
      ArrowUp: p + step,
      ArrowLeft: p - step,
      ArrowDown: p - step,
      End: 1,
      Home: 0,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    setSnap(true);
    commit(keys[e.key]);
  };

  const x = p * travel();
  const owed = Math.round(TOTAL * (1 - p));

  return (
    <section className={`stage ${freed ? s.freed : ""}`} ref={ref}>
      <div className="top" data-ent="fade" data-ent-delay="0">
        <div className="eyebrow">Kapibara Blyatovich · Lending Co.</div>
        <div className="count">03 / 07</div>
      </div>

      <div className="head" data-ent="up" data-ent-delay="90">
        <h1 className="sticker">
          Repay $SB. Take them back.
        </h1>
      </div>

      <div className={`middle ${s.middle}`} data-ent="up" data-ent-delay="240">
        <div className={s.readout}>
          <div className={s.label}>Left to repay</div>
          <div className={s.value}>{owed.toLocaleString("en-US")}</div>
        </div>

        <div className={s.wrap}>
          <div className={`bubble ${s.bubble}`} ref={bubbleRef}>
            all of it.
          </div>

          <svg
            className={`${s.svg} ${nope ? s.nope : ""}`}
            viewBox="0 0 620 520"
            role="img"
            aria-label="A vault holding your locked memecoins"
          >
            <g stroke="var(--ink)" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round">
              <rect x="86" y="96" width="448" height="330" rx="26" fill="var(--safe)" />
              <rect x="122" y="130" width="376" height="262" rx="16" fill="var(--safe-deep)" />

              <g ref={insideRef}>
                {/* Outer group holds the place in the vault, inner one flies.
                    On one element the animation replaced the attribute and every
                    meme took off from the top-left corner instead of from where
                    it was sitting. */}
                {COINS.map((coin, i) => (
                  <g
                    key={coin.ticker}
                    transform={`translate(${INSIDE_AT[i].x} ${INSIDE_AT[i].y})`}
                  >
                    <g className={s.memeOut}>
                      <circle r="30" fill={coin.bg} stroke="var(--ink)" strokeWidth="6" />
                      <g transform="scale(0.46) translate(-50 -50)" fill={coin.glyphOn}>
                        {coin.glyph}
                      </g>
                    </g>
                  </g>
                ))}
              </g>

              <rect
                ref={doorLRef}
                className={s.doorL}
                x="122"
                y="130"
                width="188"
                height="262"
                fill="var(--safe-dark)"
              />
              <rect
                ref={doorRRef}
                className={s.doorR}
                x="310"
                y="130"
                width="188"
                height="262"
                fill="var(--safe-dark)"
              />

              <rect x="104" y="160" width="20" height="40" rx="6" fill="var(--gold)" />
              <rect x="104" y="322" width="20" height="40" rx="6" fill="var(--gold)" />
              <rect x="496" y="160" width="20" height="40" rx="6" fill="var(--gold)" />
              <rect x="496" y="322" width="20" height="40" rx="6" fill="var(--gold)" />

              <rect x="112" y="426" width="66" height="34" rx="12" fill="var(--safe-deep)" />
              <rect x="442" y="426" width="66" height="34" rx="12" fill="var(--safe-deep)" />
            </g>

            {/* The shackle lifts out of the lock body in step with your drag. */}
            <g stroke="var(--ink)" strokeWidth="8" strokeLinejoin="round">
              <path
                className={`${s.shackle} ${freed ? s.shackleGone : ""}`}
                d="M284 258 v-26 a26 26 0 0 1 52 0 v26"
                fill="none"
                style={{ transform: `translateY(${(-30 * p).toFixed(1)}px)` }}
              />
              <g className={s.lockBody}>
                <rect x="270" y="254" width="80" height="64" rx="13" fill="var(--gold)" />
                <circle cx="310" cy="280" r="8" fill="var(--ink)" stroke="none" />
                <path d="M310 286 v13" strokeWidth="6" strokeLinecap="round" />
              </g>
            </g>

            <image
              className="breathe grounded"
              href={MASCOT_SRC}
              x="428"
              y="222"
              width="184"
              height="234"
              preserveAspectRatio="xMidYMax meet"
            />
          </svg>
        </div>
      </div>

      <div className="bottom">
        <div className="hint">{hint}</div>

        <div
          ref={sliderRef}
          className={`${s.slider} ${freed ? s.done : ""}`}
          tabIndex={0}
          role="slider"
          aria-label="Repay $SB"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(p * 100)}
          onKeyDown={onKeyDown}
          /* One set of handlers on the whole slider, with the capture taken
             here rather than on the knob. Previously a press on the track set
             the dragging flag but left the move handler on the knob, so the
             only draggable thing was the 62px knob itself — and a stray
             timeout released that drag after 460ms regardless, which is what
             made it feel like the handle kept slipping out of your hand. */
          onPointerDown={(e) => {
            if (freed) return;
            // Deliberately no preventDefault: cancelling pointerdown leaves
            // activeElement on <body>, so this slider never took focus by being
            // used and its arrow-key handler was unreachable without tabbing.
            e.currentTarget.focus();
            dragging.current = true;
            setSnap(false);
            e.currentTarget.setPointerCapture(e.pointerId);
            commit(pointerP(e.clientX));
          }}
          onPointerMove={(e) => {
            if (!dragging.current || freed) return;
            commit(pointerP(e.clientX));
          }}
          onPointerUp={release}
          onPointerCancel={release}
        >
          <div className={s.track}>
            <div className={s.fill} style={{ width: `${(p * 100).toFixed(2)}%` }} />
          </div>
          <div
            ref={knobRef}
            className={`${s.knob} ${snap ? s.snap : ""}`}
            style={{ left: `${x}px` }}
          >
            <svg viewBox="0 0 100 100" fill="var(--ink)" aria-hidden="true">
              <path d="M38 22 L66 50 L38 78 Z" />
              <rect x="20" y="44" width="14" height="12" rx="3" />
            </svg>
          </div>
        </div>

        <div className="cue">
          <span>Scroll ↓</span>
        </div>
      </div>
    </section>
  );
}
