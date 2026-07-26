"use client";

import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { asset } from "@/lib/asset";
import { Reveal } from "@/components/Reveal";

/**
 * The live $SB token contract address. Leave as an empty string until the
 * token launches — the bar then shows a "coming soon" state so nobody copies
 * a placeholder by mistake. Paste the real address here to make it copyable.
 */
const CONTRACT_ADDRESS = "";

/**
 * Page 4: the Meme Yard.
 *
 * The bear king on his throne surrounded by the meme crowd. Every character
 * runs its own continuous idle loop (bob, bounce, wobble, peck, sway, wiggle),
 * staggered by per-character duration + delay so nothing moves in sync. All
 * motion is pure CSS transform/opacity for performance. Positions are % of the
 * height-fit stage, measured from the approved page-4 mockup.
 *
 * Note: the supplied filenames are swapped — little-john-ranger.webp is the
 * throne king, and bear-king-on-throne.webp is the green ranger.
 */

type Yard = {
  src: string;
  x: number;
  y: number;
  w: number;
  ar: string;
  anim: string;
  dur: number;
  delay: number;
  z: number;
  org?: string;
  crop?: boolean;
  king?: boolean;
  shine?: boolean;
  sparkle?: boolean;
};

const YARD: Yard[] = [
  { src: "/assets/sb-flag.webp", x: 79, y: 23, w: 14, ar: "245/186", anim: "flag", dur: 4.5, delay: 0, z: 2, org: "left center", crop: true },
  { src: "/assets/little-john-ranger.webp", x: 63, y: 46, w: 54, ar: "1536/1024", anim: "king", dur: 11, delay: 0, z: 3, king: true },
  { src: "/assets/boombox.webp", x: 41.3, y: 69, w: 8.6, ar: "210/188", anim: "bass", dur: 0.65, delay: 0.2, z: 4, crop: true },
  { src: "/assets/pigeon-left.webp", x: 23.3, y: 82.4, w: 16.5, ar: "1536/1024", anim: "peck", dur: 3.2, delay: 0.4, z: 5 },
  { src: "/assets/pepe-frog.webp", x: 32.6, y: 82, w: 16.3, ar: "1536/1024", anim: "bounce", dur: 2.4, delay: 0.9, z: 5 },
  { src: "/assets/cool-doge.webp", x: 41.9, y: 83.6, w: 22.3, ar: "1536/1024", anim: "bob", dur: 2.8, delay: 0.2, z: 6, shine: true },
  { src: "/assets/shiba-pup.webp", x: 49, y: 86.1, w: 18.5, ar: "1536/1024", anim: "bounce", dur: 3.0, delay: 1.3, z: 6 },
  { src: "/assets/penguin.webp", x: 72, y: 85.5, w: 16.5, ar: "1536/1024", anim: "wobble", dur: 2.6, delay: 0.6, z: 6 },
  { src: "/assets/galaxy-cat.webp", x: 79.8, y: 81.5, w: 15.2, ar: "1536/1024", anim: "sway", dur: 3.4, delay: 1.1, z: 6, sparkle: true },
  { src: "/assets/tendies-nugget.webp", x: 86.4, y: 81.5, w: 15.9, ar: "1536/1024", anim: "wiggle", dur: 2.8, delay: 0.5, z: 6 },
  { src: "/assets/bear-king-on-throne.webp", x: 92, y: 75, w: 19, ar: "1536/1024", anim: "bounce", dur: 3, delay: 1.6, z: 6 },
  { src: "/assets/pigeon-right.webp", x: 94.5, y: 90, w: 12.3, ar: "1536/1024", anim: "peck", dur: 2.9, delay: 1.4, z: 7 },
];

const SOCIALS = [
  { label: "X (Twitter)", href: "https://x.com/sbmemecoin", d: "M18.9 1.6h3.7l-8 9.1L24 22.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.6h7.6l5.2 6.9 6.1-6.9Zm-1.3 18.6h2L6.5 3.7H4.3l13.3 16.5Z" },
  { label: "Telegram", href: "https://t.me/sbmemetoken", d: "M9.8 15.6 9.6 19c.4 0 .6-.2.8-.4l2-1.9 4.1 3c.8.4 1.3.2 1.5-.7l2.7-12.7c.3-1.2-.4-1.6-1.2-1.3L2.4 9.6c-1.2.5-1.2 1.1-.2 1.4l4.3 1.3 9.9-6.2c.5-.3.9-.1.5.2l-8 7.3Z" },
  { label: "Discord", href: "#", d: "M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.3.5a18 18 0 0 1 4.3 1.4A17.6 17.6 0 0 0 3.6 5 18 18 0 0 1 8 3.5L7.7 3a19.8 19.8 0 0 0-5 1.4C.4 8 .1 11.6.3 15.1a20 20 0 0 0 6 3l.8-1.4c-.7-.3-1.3-.6-1.9-1l.5-.3a14.2 14.2 0 0 0 12.6 0l.5.3c-.6.4-1.2.7-1.9 1l.8 1.4a20 20 0 0 0 6-3c.4-4.2-.5-7.8-3.4-10.7ZM8.3 13.2c-1 0-1.7-.9-1.7-1.9s.8-1.9 1.7-1.9 1.7.9 1.7 1.9-.7 1.9-1.7 1.9Zm7.4 0c-1 0-1.7-.9-1.7-1.9s.8-1.9 1.7-1.9 1.7.9 1.7 1.9-.7 1.9-1.7 1.9Z" },
];

/**
 * Copyable contract-address pill. Clicking copies the address to the clipboard
 * (with a legacy execCommand fallback) and flashes "Copied!". While the address
 * is unset it renders a non-interactive "coming soon" state.
 */
function ContractAddress() {
  const [copied, setCopied] = useState(false);
  const has = CONTRACT_ADDRESS.length > 0;

  const copy = async () => {
    if (!has) return;
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = CONTRACT_ADDRESS;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* clipboard unavailable — nothing else to try */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      className="y-ca"
      onClick={copy}
      disabled={!has}
      aria-label={has ? "Copy the $SB contract address" : "Contract address coming soon"}
    >
      <span className="y-ca-label">CA</span>
      <span className="y-ca-addr">{has ? CONTRACT_ADDRESS : "Coming soon"}</span>
      {has && (
        <span className="y-ca-icon" aria-hidden>
          {copied ? (
            "Copied!"
          ) : (
            <>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M9 3h9a2 2 0 0 1 2 2v11h-2V5H9V3Zm-4 4h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm0 2v10h9V9H5Z" />
              </svg>
              Copy
            </>
          )}
        </span>
      )}
    </button>
  );
}

export function MemeYardSection() {
  const ref = useRef<HTMLElement>(null);
  // The whole crowd's idle loops only run while the yard is on screen, so the
  // compositor isn't animating a dozen characters the user can't see.
  const inView = useInView(ref, { amount: 0.2 });

  return (
    <section id="yard" ref={ref} className={inView ? "live" : ""}>
      <Reveal className="y-copy">
        <h2 className="text-[clamp(2.1rem,9vw,3.2rem)] leading-[1.02] font-extrabold tracking-[-0.02em] text-navy uppercase lg:text-[clamp(2.5rem,7svh,4.6rem)]">
          The Meme
          <br />
          Powered By <span className="text-orange">Memes.</span>
        </h2>
        <p className="mt-4 text-[clamp(0.95rem,4vw,1.15rem)] font-semibold text-navy/90 lg:text-[clamp(1rem,2.4svh,1.35rem)]">
          Meme power. Community chaos.
          <br />
          The bear kingdom.
        </p>
        <a className="y-join" href="#">
          Join The Yard
        </a>
        <ContractAddress />
        <div className="y-social">
          {SOCIALS.map((social) => {
            const external = social.href !== "#";
            return (
              <a
                key={social.label}
                href={social.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
              >
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d={social.d} />
                </svg>
                {social.label}
              </a>
            );
          })}
        </div>
      </Reveal>

      <div className="y-stage" aria-hidden>
        {YARD.map((c, i) => (
          <div
            key={i}
            className="p4c"
            style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.w}%`, aspectRatio: c.ar, zIndex: c.z }}
          >
            <div
              className={`p4a a-${c.anim}${c.crop ? " p4crop" : ""}`}
              style={{ "--dur": `${c.dur}s`, "--delay": `${c.delay}s`, transformOrigin: c.org || "bottom center" } as React.CSSProperties}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(c.src)} alt="" loading="lazy" decoding="async" />
              {c.king && <span className="king-med" />}
              {c.shine && <span className="p4shine" />}
              {c.sparkle && <span className="p4sparkle" />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
