"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MASCOT_SRC } from "./Mascot";
import { COINS, CoinGlyph } from "./coins";
import { useEntrance, prefersReducedMotion } from "@/lib/useEntrance";
import s from "./VaultSection.module.css";

const TOTAL = 42000;
const SVGNS = "http://www.w3.org/2000/svg";

/**
 * Where each waiting memecoin sits above the hopper. The coins themselves come
 * from the shared roster, so this screen and the feeding screen can never drift
 * apart on which tokens exist.
 */
/** Centre of the funnel's narrow neck, and the waiting coins' radius. */
const FUNNEL_NECK_X = 330;
const FEED_COIN_R = 19;

const FEED_AT = [
  { x: 214, y: 24 },
  { x: 256, y: 10 },
  { x: 298, y: 20 },
  { x: 340, y: 6 },
  { x: 382, y: 22 },
  { x: 424, y: 12 },
];

/** The same six, at rest inside the vault once the door shuts over them. */
const INSIDE_AT = [
  { x: 270, y: 286 },
  { x: 330, y: 278 },
  { x: 390, y: 286 },
  { x: 250, y: 330 },
  { x: 310, y: 336 },
  { x: 370, y: 330 },
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
  const rollRaf = useRef<number | null>(null);
  const busy = useRef(false);

  const [pulled, setPulled] = useState(false);
  const [borrowed, setBorrowed] = useState(0);
  const [hint, setHint] = useState("");
  const [spendOpen, setSpendOpen] = useState(false);
  const [spent, setSpent] = useState(false);
  const [jolt, setJolt] = useState(false);
  /** How many memes have made it into the vault. Drives the chamber filling. */
  const [landed, setLanded] = useState(0);

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
    // The counter runs on rAF, not a timeout, so it survived this and would
    // drive a freshly-zeroed readout straight back up to the full amount.
    if (rollRaf.current !== null) {
      cancelAnimationFrame(rollRaf.current);
      rollRaf.current = null;
    }
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const say = useCallback((text: string) => {
    const el = bubbleRef.current;
    if (!el) return;
    el.textContent = text;
    el.classList.add("show");
  }, []);

  const dropCoins = useCallback(() => {
    const coins = feedRef.current?.querySelectorAll(`.${s.drop}`);
    coins?.forEach((c, i) => {
      after(195 + i * 104, () => {
        const el = c as SVGGElement;
        if (prefersReducedMotion()) {
          el.style.opacity = "0";
          setLanded((n) => Math.max(n, i + 1));
          return;
        }
        // Funnel mouth spans 212..448 but its neck is only 288..372, so a coin
        // that falls straight down from where it waits passes through the
        // sloped wall instead of into the hole. Each one slides in along the
        // wall to the neck: barely any drift while it is still above the mouth,
        // then most of it during the run down the slope.
        //
        // These offsets are relative, which only works because this element
        // carries no position of its own — its parent holds the translate. Put
        // both on one element and the animation replaces the attribute, which
        // is what used to fling every coin over to the lever and drop it there.
        const dx = FUNNEL_NECK_X - (FEED_AT[i].x + FEED_COIN_R);
        const fall = el.animate(
          [
            { transform: "translate(0,0) scale(1)", opacity: 1 },
            {
              transform: `translate(${(dx * 0.12).toFixed(1)}px,66px) scale(0.97)`,
              opacity: 1,
              offset: 0.34,
            },
            {
              transform: `translate(${(dx * 0.92).toFixed(1)}px,142px) scale(0.82)`,
              opacity: 1,
              offset: 0.72,
            },
            {
              transform: `translate(${dx.toFixed(1)}px,206px) scaleY(0.55) scaleX(1.15)`,
              opacity: 0,
            },
          ],
          { duration: 598, easing: "cubic-bezier(.42,0,.7,.35)", fill: "forwards" }
        );
        // The coin inside the vault appears as this one arrives, so the chamber
        // fills a coin at a time instead of being full before you touched it.
        fall.onfinish = () => setLanded((n) => Math.max(n, i + 1));
      });
    });
  }, [after]);

  /** Gold spraying out of the chute and piling in two tiers on the floor. */
  const payOut = useCallback(() => {
    for (let i = 0; i < 12; i++) {
      after(2250 + i * 72, () => {
        const host = payoutRef.current;
        if (!host) return;

        const g = document.createElementNS(SVGNS, "g");
        const c = document.createElementNS(SVGNS, "circle");
        c.setAttribute("r", "17");
        c.setAttribute("fill", "#d9a020");
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
        // Where it ends up. The payout animation is fill:forwards, so the
        // attribute still reads the chute position — spending needs the real
        // resting place to lift from, not the corner of the viewBox.
        g.dataset.lx = String(lx);
        g.dataset.ly = String(ly);
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
          { duration: 910, easing: "cubic-bezier(.3,.7,.4,1)", fill: "forwards" }
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
      const p = Math.min(1, (now - start) / 1430);
      setBorrowed(Math.round(TOTAL * (1 - Math.pow(1 - p, 3))));
      rollRaf.current = p < 1 ? requestAnimationFrame(step) : null;
    };
    rollRaf.current = requestAnimationFrame(step);
  }, []);

  const reset = useCallback(
    (silent: boolean) => {
      clearTimers();
      setPulled(false);
      setJolt(false);
      setBorrowed(0);
      setSpendOpen(false);
      setSpent(false);
      setLanded(0);
      if (payoutRef.current) payoutRef.current.innerHTML = "";
      bubbleRef.current?.classList.remove("show");
      // Only the fall. getAnimations() also hands back the CSS bob, and
      // cancelling a CSSAnimation through the API detaches it permanently —
      // the coins stopped bobbing for good after one scroll-away.
      feedRef.current?.querySelectorAll(`.${s.drop}`).forEach((c) => {
        const el = c as SVGGElement;
        el.getAnimations().forEach((a) => a.cancel());
        el.style.opacity = "";
      });
      if (!silent) {
        // Blank, not "Pull the lever": that instruction now sits above the
        // lever itself, and repeating it down here read as two separate
        // prompts for one control.
        setHint("");
        busy.current = false;
      }
    },
    [clearTimers]
  );

  const startSequence = useCallback(() => {
    dropCoins();

    // The jolt lands with the padlock, not the door — that's the heavy beat.
    after(1560, () => {
      if (prefersReducedMotion()) return;
      setJolt(true);
      after(416, () => setJolt(false));
    });

    payOut();
    after(2250, rollCounter);

    after(3100, () => say("buy whatever you want."));

    after(3750, () => {
      setSpendOpen(true);
      setHint("Now go spend it.");
      busy.current = false;
    });
  }, [after, dropCoins, payOut, rollCounter, say]);

  const pull = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    reset(true);
    setHint("");

    // Across two commits, not one. React batches a false-then-true inside a
    // single handler into no DOM change at all, so every `.pulled` rule stayed
    // parked in its end state: from the second pull onward the door never
    // re-closed, the padlock never dropped, the machine never shuddered and the
    // chute never lit. Only the lever moved, because only the lever had been
    // given a key to force it. Letting the class genuinely go off and back on
    // restarts all of them, and needs no keys at all.
    requestAnimationFrame(() => {
      setPulled(true);
      startSequence();
    });
  }, [reset, startSequence]);

  const spendOn = useCallback(
    (kind: string) => {
      if (!spendOpen || spent) return;
      const coins = payoutRef.current?.querySelectorAll("g");
      if (!coins?.length) return;
      setSpent(true);

      coins.forEach((g, i) => {
        after(i * 35, () => {
          if (prefersReducedMotion()) {
            g.remove();
            return;
          }
          // Absolute viewBox coordinates, not a relative rise: written as
          // translate(0,-260) every coin converged on the top-left corner and
          // the whole pile slewed left as it faded.
          const cx = Number(g.dataset.lx ?? 330);
          const cy = Number(g.dataset.ly ?? 400);
          g.animate(
            [
              { transform: `translate(${cx}px,${cy}px)`, opacity: 1 },
              { transform: `translate(${cx}px,${cy - 260}px) scale(0.2)`, opacity: 0 },
            ],
            { duration: 520, easing: "cubic-bezier(.5,0,.9,.4)", fill: "forwards" }
          ).onfinish = () => g.remove();
        });
      });

      after(600, () => {
        say(SPEND_LINE[kind]);
        setHint(kind === "memes" ? "And now you owe him." : "That was fast.");
        // MORE MEMES is the joke and the hand-off into the next screen.
        if (kind === "memes") after(1400, () => reset(false));
      });
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
      // spendOpen is set in the same beat that releases `busy`, so it marks
      // exactly the moment the lever becomes pullable again — which is when its
      // label has to come back.
      className={`stage ${pulled ? s.pulled : ""} ${jolt ? s.jolt : ""} ${
        spendOpen ? s.settled : ""
      }`}
      ref={setRefs}
    >
      <div className="top" data-ent="fade" data-ent-delay="0">
        <div className="eyebrow">Kapibara Blyatovich · Lending Co.</div>
        <div className="count">02 / 07</div>
      </div>

      <div className="head" data-ent="up" data-ent-delay="90">
        <h1 className="sticker">
          Lock them. Borrow <span className="hot">$SB</span>.
        </h1>
      </div>

      <div className={`middle ${s.middle}`} data-ent="up" data-ent-delay="240">
        <div className={s.readout}>
          <div className={s.label}>$SB borrowed</div>
          <div className={s.value}>{borrowed.toLocaleString("en-US")}</div>
        </div>

        <div className={s.wrap}>
          <div className={`bubble ${s.bubble}`} ref={bubbleRef}>
            buy whatever you want.
          </div>

          <svg
            className={s.svg}
            viewBox="0 0 660 560"
            role="img"
            aria-label="A machine that locks memecoins and pays out $SB"
          >
            <g ref={feedRef}>
              {/* Three layers, one job each: the outer group holds the coin's
                  place above the hopper, the middle one falls, the inner one
                  bobs. Stacking any two of those on one element means the
                  animation replaces the position outright. */}
              {COINS.map((coin, i) => (
                <g
                  key={coin.ticker}
                  transform={`translate(${FEED_AT[i].x} ${FEED_AT[i].y})`}
                >
                  <g className={s.drop}>
                    <g
                      className={`${s.feedcoin} ${idle ? s.bob : ""}`}
                      style={{ animationDelay: `${-0.4 * i}s` }}
                    >
                      <circle r="19" cx="19" cy="19" fill={coin.bg} stroke="#12110c" strokeWidth="4" />
                      <g transform="translate(19 19) scale(0.3) translate(-50 -50)" fill={coin.glyphOn}>
                        {coin.glyph}
                      </g>
                    </g>
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
              <rect
                x="198"
                y="196"
                width="264"
                height="168"
                rx="18"
                fill="var(--glass-deep)"
                fillOpacity="0.55"
              />

              {/* Each one appears as its falling counterpart arrives. Rendered
                  unconditionally before, which left the vault looking full
                  before the lever had been touched — invisible behind the old
                  dark chamber, obvious behind glass. */}
              {COINS.map((coin, i) => (
                <g
                  key={coin.ticker}
                  transform={`translate(${INSIDE_AT[i].x} ${INSIDE_AT[i].y})`}
                >
                  <g className={`${s.inside} ${landed > i ? s.insideIn : ""}`}>
                    <circle r="21" fill={coin.bg} stroke="#12110c" strokeWidth="4" />
                    <g transform="scale(0.33) translate(-50 -50)" fill={coin.glyphOn}>
                      {coin.glyph}
                    </g>
                  </g>
                </g>
              ))}

              <rect
                className={s.door}
                x="198"
                y="196"
                width="264"
                height="168"
                rx="16"
                fill="var(--glass)"
                fillOpacity="0.62"
              />

              <g className={s.glassSheen} pointerEvents="none">
                <path
                  d="M214 352 L286 200 L330 200 L258 352 Z"
                  fill="var(--glass-lit)"
                  fillOpacity="0.16"
                  stroke="none"
                />
                <path
                  d="M300 352 L372 200 L392 200 L320 352 Z"
                  fill="var(--glass-lit)"
                  fillOpacity="0.1"
                  stroke="none"
                />
              </g>
              <rect
                x="198"
                y="196"
                width="264"
                height="168"
                rx="18"
                fill="none"
                stroke="var(--glass-lit)"
                strokeOpacity="0.45"
                strokeWidth="3"
              />

              <rect
                className={s.chuteGlow}
                x="236"
                y="380"
                width="188"
                height="30"
                rx="9"
                fill="var(--gold)"
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
            {/* Two lines, not one: set on a single line at a readable size the
                label reached the hopper rim and sat under the first coin. */}
            <text
              className={s.pullLabel}
              x="141"
              y="76"
              textAnchor="middle"
              fontWeight="900"
              fontSize="19"
              letterSpacing="0.5"
              fill="var(--stamp)"
              aria-hidden="true"
            >
              <tspan x="141">Pull the</tspan>
              <tspan x="141" dy="21">lever</tspan>
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
            <g className={s.mascot}>
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
