"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MASCOT_SRC } from "./Mascot";
import { useEntrance, prefersReducedMotion } from "@/lib/useEntrance";
import s from "./VaultSection.module.css";

const TOTAL = 42000;
const SVGNS = "http://www.w3.org/2000/svg";

/** The five waiting memecoins, drawn flat to match the mascot's outline art. */
const FEED = [
  { x: 232, y: 24, bg: "#b9b3a6" },
  { x: 276, y: 10, bg: "#a8c24e" },
  { x: 320, y: 20, bg: "#7a6a5b" },
  { x: 364, y: 8, bg: "#e0a33c" },
  { x: 408, y: 22, bg: "#c4392b" },
];

const SPEND_LINE: Record<string, string> = {
  lambo: "gone.",
  pizza: "worth it.",
  memes: "again? fine.",
};

export function VaultSection() {
  const ref = useEntrance<HTMLElement>();
  const stageRef = useRef<HTMLElement | null>(null);
  const payoutRef = useRef<SVGGElement>(null);
  const feedRef = useRef<SVGGElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const busy = useRef(false);

  const [pulled, setPulled] = useState(false);
  const [borrowed, setBorrowed] = useState(0);
  const [hint, setHint] = useState("Pull the lever");
  const [spendOpen, setSpendOpen] = useState(false);
  const [spent, setSpent] = useState(false);
  const [jolt, setJolt] = useState(false);

  const setRefs = useCallback(
    (el: HTMLElement | null) => {
      stageRef.current = el;
      ref.current = el;
    },
    [ref]
  );

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(
      window.setTimeout(fn, prefersReducedMotion() ? 0 : ms)
    );
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const say = useCallback((text: string) => {
    const el = bubbleRef.current;
    if (!el) return;
    el.textContent = text;
    el.classList.add("show");
  }, []);

  const dropCoins = useCallback(() => {
    const coins = feedRef.current?.querySelectorAll(`.${s.feedcoin}`);
    coins?.forEach((c, i) => {
      after(150 + i * 80, () => {
        const el = c as SVGGElement;
        if (prefersReducedMotion()) {
          el.style.opacity = "0";
          return;
        }
        el.animate(
          [
            { transform: "translateY(0) scale(1)", opacity: 1 },
            { transform: "translateY(150px) scale(0.8)", opacity: 1, offset: 0.7 },
            { transform: "translateY(210px) scaleY(0.55) scaleX(1.2)", opacity: 0 },
          ],
          { duration: 460, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" }
        );
      });
    });
  }, [after]);

  /** Gold spraying out of the chute and piling in two tiers on the floor. */
  const payOut = useCallback(() => {
    for (let i = 0; i < 12; i++) {
      after(1400 + i * 55, () => {
        const host = payoutRef.current;
        if (!host) return;

        const g = document.createElementNS(SVGNS, "g");
        const c = document.createElementNS(SVGNS, "circle");
        c.setAttribute("r", "17");
        c.setAttribute("fill", "#9df907");
        c.setAttribute("stroke", "#12110c");
        c.setAttribute("stroke-width", "5");
        const t = document.createElementNS(SVGNS, "text");
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("y", "4.5");
        t.setAttribute("font-size", "12");
        t.setAttribute("font-weight", "900");
        t.setAttribute("letter-spacing", "-0.4");
        t.setAttribute("fill", "#12110c");
        t.textContent = "$SB";
        g.append(c, t);

        // Two tiers, tightened and dropped clear of the feet. Wider spacing put
        // the heap up over the machine's own legs, so the payout read as coins
        // strewn across the cabinet rather than as a pile on the floor.
        const tier = i % 2;
        const lane = Math.floor(i / 2) - 2.5;
        const lx = 330 + lane * 38 + tier * 19;
        const ly = 528 - tier * 24;
        g.setAttribute("transform", `translate(330 400)`);
        host.appendChild(g);

        if (prefersReducedMotion()) {
          g.setAttribute("transform", `translate(${lx} ${ly})`);
          return;
        }
        g.animate(
          [
            { transform: "translate(330px,400px) rotate(0deg)" },
            {
              transform: `translate(${330 + lane * 14}px,${ly - 90}px) rotate(${lane * 60}deg)`,
              offset: 0.45,
            },
            // Lands near-upright. Spinning them to a random resting angle was
            // fine when the face was a blank disc, but now it carries a ticker
            // and a coin lying on its side cannot be read.
            { transform: `translate(${lx}px,${ly}px) rotate(${lane * 5}deg)` },
          ],
          { duration: 700, easing: "cubic-bezier(.3,.7,.4,1)", fill: "forwards" }
        );
      });
    }
  }, [after]);

  const rollCounter = useCallback(() => {
    if (prefersReducedMotion()) {
      setBorrowed(TOTAL);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 1100);
      setBorrowed(Math.round(TOTAL * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  const reset = useCallback(
    (silent: boolean) => {
      clearTimers();
      setPulled(false);
      setJolt(false);
      setBorrowed(0);
      setSpendOpen(false);
      setSpent(false);
      if (payoutRef.current) payoutRef.current.innerHTML = "";
      bubbleRef.current?.classList.remove("show");
      feedRef.current?.querySelectorAll(`.${s.feedcoin}`).forEach((c) => {
        const el = c as SVGGElement;
        el.getAnimations().forEach((a) => a.cancel());
        el.style.opacity = "";
      });
      if (!silent) {
        setHint("Pull the lever");
        busy.current = false;
      }
    },
    [clearTimers]
  );

  const pull = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    reset(true);

    setPulled(true);
    setHint("");
    dropCoins();

    // The jolt lands with the padlock, not the door — that's the heavy beat.
    after(800, () => {
      if (prefersReducedMotion()) return;
      setJolt(true);
      after(320, () => setJolt(false));
    });

    payOut();
    after(1400, rollCounter);

    after(2000, () => say("not my problem now."));

    after(2400, () => {
      setSpendOpen(true);
      setHint("Now go spend it.");
      busy.current = false;
    });
  }, [after, dropCoins, payOut, reset, rollCounter, say]);

  const spendOn = useCallback(
    (kind: string) => {
      if (!spendOpen || spent) return;
      const coins = payoutRef.current?.querySelectorAll("g");
      if (!coins?.length) return;
      setSpent(true);

      coins.forEach((g, i) => {
        window.setTimeout(() => {
          if (prefersReducedMotion()) {
            g.remove();
            return;
          }
          g.animate(
            [
              { opacity: 1 },
              { transform: "translate(0px,-260px) scale(0.2)", opacity: 0 },
            ],
            { duration: 520, easing: "cubic-bezier(.5,0,.9,.4)", fill: "forwards" }
          ).onfinish = () => g.remove();
        }, i * 35);
      });

      window.setTimeout(() => {
        say(SPEND_LINE[kind]);
        setHint(kind === "memes" ? "And now you owe him." : "That was fast.");
        // MORE MEMES is the joke and the hand-off into page 3: back to the top.
        if (kind === "memes") window.setTimeout(() => reset(false), 1400);
      }, 600);
    },
    [reset, say, spendOpen, spent]
  );

  // Rearm when the section scrolls away, so coming back gives a fresh machine.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting && !busy.current) reset(false);
        });
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reset]);

  const idle = !pulled;

  return (
    <section
      className={`stage ${pulled ? s.pulled : ""} ${jolt ? s.jolt : ""}`}
      ref={setRefs}
    >
      <div className="top" data-ent="fade" data-ent-delay="0">
        <div className="eyebrow">Kapibara Blyatovich · Lending Co.</div>
        <div className="count">02 / 07</div>
      </div>

      <div className="head" data-ent="up" data-ent-delay="90">
        <h1 className="sticker" data-text="Lock them. Borrow $SB.">
          Lock them. Borrow $SB.
        </h1>
      </div>

      <div className={`middle ${s.middle}`} data-ent="up" data-ent-delay="240">
        <div className={s.readout}>
          <div className={s.label}>$SB borrowed</div>
          <div className={s.value}>{borrowed.toLocaleString("en-US")}</div>
        </div>

        <div className={s.wrap}>
          <div className={`bubble ${s.bubble}`} ref={bubbleRef}>
            not my problem now.
          </div>

          <svg
            className={s.svg}
            viewBox="0 0 660 560"
            role="img"
            aria-label="A machine that locks memecoins and pays out $SB"
          >
            <g ref={feedRef}>
              {FEED.map((c, i) => (
                <g
                  key={i}
                  className={`${s.feedcoin} ${idle ? s.bob : ""}`}
                  transform={`translate(${c.x} ${c.y})`}
                >
                  <circle r="19" cx="19" cy="19" fill={c.bg} stroke="#12110c" strokeWidth="4" />
                  <g transform="translate(19 19) scale(0.24) translate(-50 -50)" fill="#12110c">
                    <ellipse cx="50" cy="56" rx="31" ry="28" />
                    <circle cx="39" cy="52" r="5" fill={c.bg} />
                    <circle cx="61" cy="52" r="5" fill={c.bg} />
                  </g>
                </g>
              ))}
            </g>

            <g
              className={s.shell}
              stroke="#12110c"
              strokeWidth="7"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <path d="M212 86 L448 86 L372 158 L288 158 Z" fill="var(--funnel)" />
              <rect x="206" y="78" width="248" height="16" rx="7" fill="var(--funnel-dark)" />
              <rect x="150" y="152" width="360" height="300" rx="28" fill="var(--machine)" />
              <rect x="198" y="196" width="264" height="168" rx="16" fill="var(--machine-deep)" />

              <g opacity="0.9">
                <circle cx="268" cy="300" r="21" fill="#b9b3a6" stroke="#12110c" strokeWidth="4" />
                <circle cx="316" cy="286" r="21" fill="#a8c24e" stroke="#12110c" strokeWidth="4" />
                <circle cx="364" cy="300" r="21" fill="#e0a33c" stroke="#12110c" strokeWidth="4" />
                <circle cx="292" cy="332" r="21" fill="#7a6a5b" stroke="#12110c" strokeWidth="4" />
                <circle cx="340" cy="332" r="21" fill="#c4392b" stroke="#12110c" strokeWidth="4" />
              </g>

              <rect
                className={s.door}
                x="198"
                y="196"
                width="264"
                height="168"
                rx="16"
                fill="var(--vault)"
              />

              <rect
                className={s.chuteGlow}
                x="236"
                y="380"
                width="188"
                height="30"
                rx="9"
                fill="var(--sb)"
                stroke="none"
              />
              <rect x="236" y="380" width="188" height="30" rx="9" fill="none" />

              <rect x="176" y="452" width="58" height="34" rx="12" fill="var(--machine-dark)" />
              <rect x="426" y="452" width="58" height="34" rx="12" fill="var(--machine-dark)" />
            </g>

            <g className={s.padlock} stroke="#12110c" strokeWidth="7" strokeLinejoin="round">
              <path d="M304 274 v-18 a26 26 0 0 1 52 0 v18" fill="none" />
              <rect x="292" y="272" width="76" height="60" rx="12" fill="var(--cream)" />
              <circle cx="330" cy="298" r="8" fill="#12110c" stroke="none" />
              <path d="M330 304 v12" strokeWidth="6" strokeLinecap="round" />
            </g>

            {/* The only red on the page, so the thing you touch is the thing
                that shouts. */}
            <g
              className={s.lever}
              onClick={pull}
              role="button"
              tabIndex={0}
              aria-label="Pull the lever"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  pull();
                }
              }}
            >
              <rect
                x="128"
                y="236"
                width="26"
                height="26"
                rx="6"
                fill="var(--machine-dark)"
                stroke="#12110c"
                strokeWidth="6"
              />
              <g className={s.leverArm}>
                <rect
                  x="133"
                  y="150"
                  width="15"
                  height="100"
                  rx="7"
                  fill="var(--machine-dark)"
                  stroke="#12110c"
                  strokeWidth="6"
                />
                <circle
                  className={`${s.leverKnob} ${idle ? s.glint : ""}`}
                  cx="141"
                  cy="146"
                  r="27"
                  fill="var(--stamp)"
                  stroke="#12110c"
                  strokeWidth="7"
                />
              </g>

            </g>

            {/* Deliberately a sibling of the lever, not a child: it nudges on a
                loop, and inside the button that motion would keep the click
                target's box moving. Without it the red knob was just a red dot
                — nothing said it was the control. */}
            <text
              className={s.pullLabel}
              x="141"
              y="98"
              textAnchor="middle"
              fontWeight="900"
              fontSize="20"
              letterSpacing="1"
              fill="var(--stamp)"
              aria-hidden="true"
            >
              PULL
            </text>

            {/* IN / LOCKED / OUT on the three parts is the whole explanation. */}
            <g
              fontWeight="900"
              fontSize="19"
              letterSpacing="2"
              fill="var(--text-dim)"
              textAnchor="middle"
            >
              <text x="330" y="78">IN</text>
              <text className={s.labelLocked} x="330" y="188" fill="var(--cream)">
                LOCKED
              </text>
              <text className={s.labelOut} x="330" y="438" fill="var(--cream)">
                OUT
              </text>
            </g>

            <g ref={payoutRef} />

            {/* Slide-in on the group, breathing on the image inside it —
                one element cannot carry both transforms. */}
            <g className={`${s.mascot} ${pulled ? s.mascotIn : ""}`}>
              <image
                className={s.mascotBreath}
                href={MASCOT_SRC}
                x="452"
                y="250"
                width="200"
                height="254"
                preserveAspectRatio="xMidYMax meet"
              />
            </g>
          </svg>
        </div>
      </div>

      <div className="bottom">
        <div className="hint">{hint}</div>

        <div className={`${s.spend} ${spendOpen ? s.spendShow : ""}`}>
          <button
            className={s.spendBtn}
            disabled={spent}
            onClick={() => spendOn("lambo")}
            aria-label="Spend it on a lambo"
          >
            <span className={s.spendDisc}>
              <svg viewBox="0 0 100 100" fill="#12110c" aria-hidden="true">
                <path d="M8 66 L26 44 L58 39 L82 52 L92 57 L92 68 L8 68 Z" />
                <path d="M31 49 L54 46 L70 54 L33 56 Z" fill="#f7edd9" />
                <circle cx="30" cy="70" r="9" />
                <circle cx="72" cy="70" r="9" />
                <circle cx="30" cy="70" r="3.5" fill="#f7edd9" />
                <circle cx="72" cy="70" r="3.5" fill="#f7edd9" />
              </svg>
            </span>
            <span className={s.spendLabel}>LAMBO</span>
          </button>

          <button
            className={s.spendBtn}
            disabled={spent}
            onClick={() => spendOn("pizza")}
            aria-label="Spend it on pizza"
          >
            <span className={s.spendDisc}>
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <path
                  d="M50 10 L86 82 Q50 96 14 82 Z"
                  fill="#e0a33c"
                  stroke="#12110c"
                  strokeWidth="6"
                  strokeLinejoin="round"
                />
                <circle cx="42" cy="56" r="6" fill="#c4392b" />
                <circle cx="62" cy="64" r="6" fill="#c4392b" />
                <circle cx="50" cy="76" r="5" fill="#c4392b" />
              </svg>
            </span>
            <span className={s.spendLabel}>PIZZA</span>
          </button>

          <button
            className={s.spendBtn}
            disabled={spent}
            onClick={() => spendOn("memes")}
            aria-label="Spend it on more memes"
          >
            <span className={s.spendDisc}>
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="38" cy="42" r="24" fill="#b9b3a6" stroke="#12110c" strokeWidth="6" />
                <circle cx="66" cy="62" r="24" fill="#a8c24e" stroke="#12110c" strokeWidth="6" />
                <circle cx="59" cy="58" r="4" fill="#12110c" />
                <circle cx="73" cy="58" r="4" fill="#12110c" />
              </svg>
            </span>
            <span className={s.spendLabel}>MORE MEMES</span>
          </button>
        </div>

        <div className="cue">
          <span>Scroll ↓</span>
        </div>
      </div>
    </section>
  );
}
