"use client";

import { useCallback, useRef, useState } from "react";
import { useEntrance, prefersReducedMotion } from "@/lib/useEntrance";
import s from "./WakeSection.module.css";

const MAX = 4;

const STAGES = [
  { say: "five more minutes.", line: "still asleep" },
  { say: "no. go away.",       line: "stirring" },
  { say: "what time is it.",   line: "one eye open" },
  { say: "i have no money.",   line: "sitting up" },
  { say: "",                   line: "awake. dangerous." },
];

export function WakeSection() {
  const ref = useEntrance<HTMLElement>();
  const bubbleRef = useRef<HTMLDivElement>(null);
  const bubbleTimer = useRef<number | undefined>(undefined);
  const clockRef = useRef<SVGGElement>(null);
  const sceneRef = useRef<SVGSVGElement>(null);

  const [stage, setStage] = useState(0);

  const ringing = stage < MAX;
  const dead = stage >= MAX;

  const say = useCallback((text: string) => {
    const el = bubbleRef.current;
    if (!el) return;
    if (!text) {
      el.classList.remove("show");
      return;
    }
    el.textContent = text;
    el.classList.add("show");
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(
      () => el.classList.remove("show"),
      1900
    );
  }, []);

  const hit = useCallback(() => {
    setStage((prev) => {
      if (prev >= MAX) return prev;
      const next = prev + 1;

      if (!prefersReducedMotion()) {
        clockRef.current?.animate(
          [
            { transform: "translateY(0) scale(1)" },
            { transform: "translateY(9px) scaleY(0.86) scaleX(1.1)" },
            { transform: "translateY(0) scale(1)" },
          ],
          { duration: 260, easing: "ease-out" }
        );
        sceneRef.current?.animate(
          [
            { transform: "translate(0,0)" },
            { transform: "translate(-3px,2px)" },
            { transform: "translate(3px,-1px)" },
            { transform: "translate(0,0)" },
          ],
          { duration: 160, easing: "steps(2, end)" }
        );
      }

      say(STAGES[next].say);
      return next;
    });
  }, [say]);

  const onHitKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        hit();
      }
    },
    [hit]
  );

  return (
    <section
      className={`stage ${s[`s${stage}`]} ${ringing ? s.ringing : ""} ${dead ? s.dead : ""}`}
      ref={ref}
    >
      <div className="top" data-ent="fade" data-ent-delay="0">
        <div className="eyebrow">Kapibara Blyatovich · Lending Co.</div>
        <div className="count">04 / 07</div>
      </div>

      <div className="head" data-ent="up" data-ent-delay="90">
        <h1 className="sticker" data-text="Why $SB exists.">
          Why $SB exists.
        </h1>
      </div>

      <div className={`middle ${s.mid}`} data-ent="up" data-ent-delay="240">
        <div className={s.room}>
          <div className={`bubble ${s.bub}`} ref={bubbleRef}>
            five more minutes.
          </div>

          <div
            className={`${s.verdict} sticker`}
            data-text="Enough. I want a different life."
          >
            Enough. I want a different life.
          </div>

          <svg
            className={s.roomSvg}
            viewBox="0 196 700 292"
            ref={sceneRef}
            role="img"
            aria-label="Kapibara Blyatovich asleep, an alarm clock ringing beside him"
          >
            <g stroke="var(--ink)" strokeWidth="6" strokeLinejoin="round">
              {/* A bedside lamp, not a pendant. Hanging from the ceiling left
                  a bare cord across an empty third of the frame and read as a
                  plant pot; standing beside the bed also fills the right side,
                  balancing the clock on the left. */}
              <rect
                x="622"
                y="442"
                width="60"
                height="18"
                rx="7"
                fill="var(--fur-dark)"
              />
              <path d="M652 442 v-96" fill="none" />
              <path
                d="M618 292 L686 292 L678 346 L626 346 Z"
                fill="var(--fur-dark)"
              />
              <path
                className={s.lampGlow}
                d="M626 348 L678 348 L700 456 L446 456 Z"
                fill="var(--gold)"
                opacity="0"
                stroke="none"
              />
            </g>

            <g fontWeight="900" fontSize="34" fill="var(--cream)">
              <text className={s.zzz} x="516" y="372">
                z
              </text>
              <text className={s.zzz} x="516" y="372">
                z
              </text>
              <text className={s.zzz} x="516" y="372">
                z
              </text>
            </g>

            <g
              stroke="var(--ink)"
              strokeWidth="7"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <rect
                x="286"
                y="404"
                width="330"
                height="54"
                rx="14"
                fill="var(--fur-dark)"
              />
              <rect
                x="270"
                y="330"
                width="42"
                height="128"
                rx="12"
                fill="var(--fur)"
              />
            </g>

            <g className={s.him}>
              <g className="breathe">
                <image
                  href="/assets/kapibara.webp"
                  x="340"
                  y="212"
                  width="200"
                  height="254"
                  preserveAspectRatio="xMidYMax meet"
                />
                <g
                  className={s.lids}
                  stroke="var(--ink)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                >
                  <path d="M396 336 q14 8 28 0" />
                  <path d="M452 336 q14 8 28 0" />
                </g>
              </g>
            </g>

            <path
              className={s.blanket}
              d="M300 420 q130 -34 300 -8 l0 46 l-300 0 z"
              fill="var(--cream)"
              stroke="var(--ink)"
              strokeWidth="7"
              strokeLinejoin="round"
            />

            <g ref={clockRef}>
              <g
                stroke="var(--gold)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              >
                <path className={s.wave} d="M62 264 q-22 34 0 68" />
                <path className={s.wave} d="M52 254 q-30 44 0 88" />
                <path className={s.wave} d="M42 244 q-38 54 0 108" />
              </g>

              <g
                className={s.clockBody}
                stroke="var(--ink)"
                strokeWidth="7"
                strokeLinejoin="round"
                strokeLinecap="round"
              >
                <rect
                  x="86"
                  y="386"
                  width="84"
                  height="16"
                  rx="6"
                  fill="var(--fur-dark)"
                />
                <path d="M96 402 v46 M160 402 v46" fill="none" />
                <circle
                  className={s.bell}
                  cx="96"
                  cy="256"
                  r="20"
                  fill="var(--stamp)"
                />
                <circle
                  className={s.bell}
                  cx="160"
                  cy="256"
                  r="20"
                  fill="var(--stamp)"
                />
                <circle cx="128" cy="310" r="66" fill="var(--cream)" />
                <circle
                  cx="128"
                  cy="310"
                  r="50"
                  fill="#efe2c8"
                  stroke="none"
                />
                <path d="M128 310 v-30 M128 310 l24 16" strokeWidth="7" />
                <circle
                  cx="128"
                  cy="310"
                  r="6"
                  fill="var(--ink)"
                  stroke="none"
                />
                <path d="M92 366 l-14 22 M164 366 l14 22" fill="none" />
              </g>

              <rect
                className={s.clockHit}
                x="34"
                y="226"
                width="188"
                height="232"
                rx="14"
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label="Hit the alarm clock"
                onClick={hit}
                onKeyDown={onHitKey}
              />
            </g>
          </svg>
        </div>
      </div>

      <div className="bottom">
        <div className="hint" data-ent="up" data-ent-delay="430">
          {dead
            ? "That is the whole reason."
            : stage === 0
              ? "Hit the clock"
              : "Again"}
        </div>
        <div className={s.hitline} data-ent="up" data-ent-delay="470">
          {STAGES[stage].line}
        </div>
        <div className="cue" data-ent="up" data-ent-delay="540">
          <span>Scroll ↓</span>
        </div>
      </div>
    </section>
  );
}
