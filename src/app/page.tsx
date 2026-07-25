"use client";

import { useState, useEffect, useCallback } from "react";

const CONTRACT_ADDRESS = "COMING SOON";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  emoji: ["🐻", "💰", "🚀", "🔥", "💎", "🌙", "⭐", "🐻‍❄️", "🫡"][i % 9],
  left: `${(i * 13 + 7) % 95}%`,
  delay: `${(i * 1.7) % 12}s`,
  duration: `${10 + (i % 6) * 3}s`,
  size: `${18 + (i % 4) * 6}px`,
}));

const TOKENOMICS = [
  { label: "Liquidity Pool", percent: 90, color: "#FF2D78" },
  { label: "Marketing", percent: 5, color: "#00E5FF" },
  { label: "Team", percent: 3, color: "#FFD700" },
  { label: "CEX Reserve", percent: 2, color: "#9D4EDD" },
];

const STEPS = [
  {
    num: "1",
    title: "Create a Wallet",
    desc: "Download Phantom or Solflare wallet from the app store or as a browser extension.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <path d="M22 10H2" />
        <path d="M6 14h4" />
      </svg>
    ),
  },
  {
    num: "2",
    title: "Get Some SOL",
    desc: "Buy SOL from any exchange and send it to your wallet address.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12M6 12h12" />
      </svg>
    ),
  },
  {
    num: "3",
    title: "Swap for $SUKA",
    desc: "Head to Jupiter or Raydium, connect your wallet, paste the contract address, and swap SOL for $SUKA.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    num: "4",
    title: "HODL & Enjoy",
    desc: "You're now part of the Bear Army! Hold your $SUKA and join the community.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

function BearMascot({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <div className={className} onClick={onClick} style={{ cursor: onClick ? "pointer" : undefined }}>
      <svg viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_40px_rgba(255,45,120,0.3)]">
        {/* Legs */}
        <ellipse cx="110" cy="355" rx="28" ry="32" fill="#7A3B10" />
        <ellipse cx="190" cy="355" rx="28" ry="32" fill="#7A3B10" />
        <ellipse cx="110" cy="378" rx="24" ry="12" fill="#5C2D0E" />
        <ellipse cx="190" cy="378" rx="24" ry="12" fill="#5C2D0E" />
        {/* Toe pads */}
        <circle cx="98" cy="380" r="5" fill="#DEB887" opacity="0.5" />
        <circle cx="110" cy="383" r="5" fill="#DEB887" opacity="0.5" />
        <circle cx="122" cy="380" r="5" fill="#DEB887" opacity="0.5" />
        <circle cx="178" cy="380" r="5" fill="#DEB887" opacity="0.5" />
        <circle cx="190" cy="383" r="5" fill="#DEB887" opacity="0.5" />
        <circle cx="202" cy="380" r="5" fill="#DEB887" opacity="0.5" />

        {/* Body */}
        <ellipse cx="150" cy="275" rx="68" ry="88" fill="#8B4513" />
        <ellipse cx="150" cy="282" rx="44" ry="58" fill="#DEB887" />

        {/* Left arm - waving */}
        <g style={{ transformOrigin: "90px 230px", animation: "wave-arm 2s ease-in-out infinite" }}>
          <ellipse cx="72" cy="258" rx="22" ry="48" fill="#A0522D" transform="rotate(-20 72 258)" />
          <circle cx="58" cy="298" r="15" fill="#7A3B10" />
          <circle cx="52" cy="293" r="4" fill="#DEB887" opacity="0.5" />
          <circle cx="58" cy="290" r="4" fill="#DEB887" opacity="0.5" />
          <circle cx="64" cy="293" r="4" fill="#DEB887" opacity="0.5" />
        </g>
        {/* Right arm */}
        <g>
          <ellipse cx="228" cy="258" rx="22" ry="48" fill="#A0522D" transform="rotate(20 228 258)" />
          <circle cx="242" cy="298" r="15" fill="#7A3B10" />
          <circle cx="236" cy="293" r="4" fill="#DEB887" opacity="0.5" />
          <circle cx="242" cy="290" r="4" fill="#DEB887" opacity="0.5" />
          <circle cx="248" cy="293" r="4" fill="#DEB887" opacity="0.5" />
        </g>

        {/* Head */}
        <circle cx="150" cy="138" r="65" fill="#A0522D" />

        {/* Ears */}
        <circle cx="92" cy="88" r="24" fill="#A0522D" />
        <circle cx="208" cy="88" r="24" fill="#A0522D" />
        <circle cx="92" cy="88" r="14" fill="#DEB887" />
        <circle cx="208" cy="88" r="14" fill="#DEB887" />

        {/* Ushanka Hat */}
        <ellipse cx="150" cy="78" rx="75" ry="34" fill="#8B0000" />
        <rect x="76" y="88" width="148" height="24" rx="12" fill="#5C3317" />
        <rect x="64" y="90" width="30" height="42" rx="15" fill="#5C3317" />
        <rect x="206" y="90" width="30" height="42" rx="15" fill="#5C3317" />
        {/* Gold star */}
        <polygon points="150,58 155,71 169,72 159,81 162,94 150,87 138,94 141,81 131,72 145,71" fill="#FFD700" />
        <polygon points="150,64 153,73 162,73 155,79 157,88 150,83 143,88 145,79 138,73 147,73" fill="#FFEC80" opacity="0.6" />

        {/* Muzzle */}
        <ellipse cx="150" cy="157" rx="34" ry="27" fill="#DEB887" />

        {/* Eyes */}
        <g style={{ transformOrigin: "123px 130px", animation: "blink 4s ease-in-out infinite" }}>
          <ellipse cx="123" cy="130" rx="14" ry="16" fill="white" />
          <circle cx="126" cy="133" r="8" fill="#1a1a1a" />
          <circle cx="130" cy="129" r="3.5" fill="white" />
        </g>
        <g style={{ transformOrigin: "177px 130px", animation: "blink 4s ease-in-out infinite 0.1s" }}>
          <ellipse cx="177" cy="130" rx="14" ry="16" fill="white" />
          <circle cx="174" cy="133" r="8" fill="#1a1a1a" />
          <circle cx="170" cy="129" r="3.5" fill="white" />
        </g>

        {/* Angry eyebrows */}
        <line x1="105" y1="110" x2="136" y2="117" stroke="#5C3317" strokeWidth="5" strokeLinecap="round" />
        <line x1="195" y1="110" x2="164" y2="117" stroke="#5C3317" strokeWidth="5" strokeLinecap="round" />

        {/* Nose */}
        <ellipse cx="150" cy="150" rx="11" ry="8" fill="#2F1810" />
        <ellipse cx="147" cy="148" rx="4" ry="3" fill="#4a3525" opacity="0.6" />

        {/* Mouth - smirk */}
        <path d="M 128 167 Q 139 178 150 170 Q 161 178 172 167" fill="none" stroke="#2F1810" strokeWidth="3" strokeLinecap="round" />
        {/* Teeth */}
        <rect x="143" y="167" width="7" height="7" rx="1.5" fill="white" />
        <rect x="151" y="167" width="7" height="7" rx="1.5" fill="white" />

        {/* Cheek blush */}
        <ellipse cx="105" cy="148" rx="12" ry="8" fill="#FF6B6B" opacity="0.25" />
        <ellipse cx="195" cy="148" rx="12" ry="8" fill="#FF6B6B" opacity="0.25" />
      </svg>
    </div>
  );
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: p.left,
            bottom: "-40px",
            fontSize: p.size,
            animation: `particle-rise ${p.duration} linear infinite`,
            animationDelay: p.delay,
            opacity: 0,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

function ScrollingTicker() {
  const text = "LOCK MEMES. BORROW THE MEME  ★  SUKA BLYAT  ★  THE MEME POWERED BY MEMES  ★  ";
  const repeated = text.repeat(8);
  return (
    <div className="ticker-wrap py-4 bg-gradient-to-r from-[#FF2D78] via-[#9D4EDD] to-[#00E5FF] relative overflow-hidden">
      <div className="ticker-content">
        <span className="text-white font-black text-lg md:text-xl tracking-wider whitespace-nowrap">
          {repeated}
        </span>
        <span className="text-white font-black text-lg md:text-xl tracking-wider whitespace-nowrap">
          {repeated}
        </span>
      </div>
    </div>
  );
}

function StarField() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    left: `${(i * 7 + 3) % 100}%`,
    top: `${(i * 11 + 5) % 100}%`,
    size: `${1 + (i % 3)}px`,
    opacity: 0.15 + (i % 5) * 0.08,
    delay: `${(i * 0.7) % 5}s`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animation: `glow-pulse ${3 + (i % 3)}s ease-in-out infinite`,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [bearShake, setBearShake] = useState(false);
  const [barsVisible, setBarsVisible] = useState(false);

  const copyAddress = useCallback(() => {
    if (CONTRACT_ADDRESS === "COMING SOON") return;
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleBearClick = useCallback(() => {
    setBearShake(true);
    setTimeout(() => setBearShake(false), 500);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            if (entry.target.id === "tokenomics-bars") {
              setBarsVisible(true);
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    const els = document.querySelectorAll(".scroll-reveal");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "About", id: "about" },
    { label: "Tokenomics", id: "tokenomics" },
    { label: "How to Buy", id: "how-to-buy" },
    { label: "Community", id: "community" },
  ];

  return (
    <div className="min-h-screen relative">
      {/* ===== NAVIGATION ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a12]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 group">
            <span className="text-xl sm:text-2xl font-black tracking-tight">
              <span className="text-[#FF2D78]">SUKA</span>{" "}
              <span className="text-[#00E5FF]">BLYAT</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="nav-link text-sm font-semibold uppercase tracking-wider">
                {l.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="#how-to-buy" className="btn-primary text-sm !py-2.5 !px-6">
              Buy $SUKA
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu"
          >
            <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenu ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenu ? "opacity-0" : ""}`} />
            <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenu ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-[#0a0a12]/95 backdrop-blur-xl border-t border-white/5 px-6 py-6 space-y-4">
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="block w-full text-left text-lg font-semibold text-white/80 hover:text-[#FF2D78] transition-colors py-2"
              >
                {l.label}
              </button>
            ))}
            <a href="#how-to-buy" className="btn-primary block text-center text-sm mt-4">
              Buy $SUKA
            </a>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <StarField />
        <FloatingParticles />

        {/* Radial glow */}
        <div className="absolute inset-0 bg-gradient-radial-pink" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0a0a12] to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Text side */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[#FF2D78]/30 bg-[#FF2D78]/10 text-[#FF2D78] text-xs sm:text-sm font-semibold tracking-wider uppercase animate-scale-pulse">
              Live on Solana
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-none mb-4 animate-glow">
              <span className="text-[#FF2D78]">SUKA</span>
              <br />
              <span className="text-[#00E5FF]">BLYAT</span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-white/70 font-medium mb-3 max-w-xl mx-auto lg:mx-0">
              The meme powered by memes
            </p>
            <p className="text-sm sm:text-base text-[#FFD700] font-bold tracking-wider uppercase mb-8 max-w-xl mx-auto lg:mx-0 animate-glow-cyan">
              Lock Memes. Borrow the Meme.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="#how-to-buy" className="btn-primary text-base sm:text-lg">
                Buy $SUKA 🐻
              </a>
              <a href="#tokenomics" className="btn-secondary text-base sm:text-lg">
                Tokenomics
              </a>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mt-10 max-w-md mx-auto lg:mx-0">
              {[
                { label: "Total Supply", value: "1B" },
                { label: "Tax", value: "0%" },
                { label: "LP", value: "Burned" },
              ].map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <p className="text-xl sm:text-2xl font-black text-white">{s.value}</p>
                  <p className="text-xs text-white/40 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bear side */}
          <div className="flex-1 flex justify-center lg:justify-end max-w-sm lg:max-w-md xl:max-w-lg">
            <BearMascot
              className={`w-64 sm:w-80 lg:w-96 animate-bounce-bear ${bearShake ? "animate-wiggle" : ""}`}
              onClick={handleBearClick}
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <svg width="24" height="36" viewBox="0 0 24 36" fill="none" className="text-white/30">
            <rect x="1" y="1" width="22" height="34" rx="11" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="10" r="3" fill="currentColor" className="animate-float" />
          </svg>
        </div>
      </section>

      {/* ===== SCROLLING TICKER ===== */}
      <ScrollingTicker />

      {/* ===== ABOUT ===== */}
      <section id="about" className="relative py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-radial-cyan" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Text */}
            <div className="flex-1 scroll-reveal">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-6">
                <span className="text-gradient-pink-cyan">THE BEAR HAS AWAKENED</span>
              </h2>
              <div className="space-y-4 text-base sm:text-lg text-white/70 leading-relaxed">
                <p>
                  Born in the wild forests of the blockchain, <span className="text-[#FF2D78] font-bold">Suka Blyat</span> is
                  not just a memecoin — it&apos;s a movement. The bear has been sleeping for too long while other animals
                  took over the meme world.
                </p>
                <p>
                  Now the bear is awake, angry, and ready to take over. With zero tax, burned liquidity, and a community
                  that never sleeps, <span className="text-[#00E5FF] font-bold">$SUKA</span> is building the most
                  based community in all of crypto.
                </p>
                <p>
                  No VC money. No insider deals. Just pure, unfiltered meme energy powered by the people, for the people.
                  The bear army grows stronger every day. Will you answer the call?
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                {[
                  { val: "0%", label: "Buy/Sell Tax" },
                  { val: "100%", label: "Community" },
                  { val: "🔥", label: "LP Burned" },
                  { val: "✅", label: "Renounced" },
                ].map((item) => (
                  <div key={item.label} className="card-glass rounded-xl p-4 text-center hover-glow-pink">
                    <p className="text-2xl font-black text-white mb-1">{item.val}</p>
                    <p className="text-xs text-white/50 uppercase tracking-wider">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bear illustration */}
            <div className="flex-shrink-0 scroll-reveal">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FF2D78]/10 rounded-full blur-3xl scale-125" />
                <BearMascot className="w-48 sm:w-64 lg:w-72 relative animate-float" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TICKER 2 ===== */}
      <div className="ticker-wrap py-3 bg-gradient-to-r from-[#FFD700] via-[#FF6B35] to-[#FF2D78]">
        <div className="ticker-content" style={{ animationDirection: "reverse" }}>
          {Array(12)
            .fill("$SUKA  ★  BEAR ARMY  ★  TO THE MOON  ★  DIAMOND HANDS  ★  ")
            .map((t, i) => (
              <span key={i} className="text-black font-black text-base tracking-wider whitespace-nowrap">
                {t}
              </span>
            ))}
        </div>
      </div>

      {/* ===== TOKENOMICS ===== */}
      <section id="tokenomics" className="relative py-20 sm:py-32 bg-[#0f0f1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
              <span className="text-gradient-gold">TOKENOMICS</span>
            </h2>
            <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto">
              Simple. Transparent. Community first.
            </p>
          </div>

          {/* Token info cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 scroll-reveal">
            {[
              { label: "Token Name", value: "SUKA BLYAT", color: "#FF2D78" },
              { label: "Ticker", value: "$SUKA", color: "#00E5FF" },
              { label: "Network", value: "Solana", color: "#9D4EDD" },
              { label: "Total Supply", value: "1,000,000,000", color: "#FFD700" },
            ].map((info) => (
              <div
                key={info.label}
                className="card-glass rounded-2xl p-5 sm:p-6 text-center transition-all duration-300 hover-glow-pink"
              >
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">{info.label}</p>
                <p className="text-lg sm:text-xl font-black" style={{ color: info.color }}>
                  {info.value}
                </p>
              </div>
            ))}
          </div>

          {/* Distribution bars */}
          <div id="tokenomics-bars" className="max-w-2xl mx-auto space-y-6 scroll-reveal">
            <h3 className="text-xl font-bold text-white/80 mb-6">Distribution</h3>
            {TOKENOMICS.map((t) => (
              <div key={t.label} className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
                    {t.label}
                  </span>
                  <span className="text-sm font-black" style={{ color: t.color }}>
                    {t.percent}%
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                  <div
                    className="token-bar h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: barsVisible ? `${t.percent}%` : "0%",
                      background: `linear-gradient(90deg, ${t.color}, ${t.color}88)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Extra info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto scroll-reveal">
            {[
              { label: "Buy Tax", value: "0%", desc: "No tax on buys" },
              { label: "Sell Tax", value: "0%", desc: "No tax on sells" },
              { label: "Liquidity", value: "Burned", desc: "LP tokens burned forever" },
            ].map((item) => (
              <div key={item.label} className="card-glass rounded-xl p-5 text-center hover-glow-cyan">
                <p className="text-2xl font-black text-[#39FF14] mb-1">{item.value}</p>
                <p className="text-sm font-semibold text-white/80">{item.label}</p>
                <p className="text-xs text-white/40 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTRACT ADDRESS ===== */}
      <section className="py-12 bg-gradient-to-r from-[#0a0a12] via-[#1a1a2e] to-[#0a0a12]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-glass rounded-2xl p-6 sm:p-8 text-center animate-border-glow scroll-reveal">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Contract Address</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <code className="text-sm sm:text-base font-mono text-[#FFD700] bg-white/5 px-4 py-2 rounded-lg break-all">
                {CONTRACT_ADDRESS}
              </code>
              <button
                onClick={copyAddress}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  copied
                    ? "bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30"
                    : "bg-[#FF2D78]/20 text-[#FF2D78] border border-[#FF2D78]/30 hover:bg-[#FF2D78]/30"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW TO BUY ===== */}
      <section id="how-to-buy" className="relative py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-radial-pink opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
              <span className="text-gradient-pink-cyan">HOW TO BUY $SUKA</span>
            </h2>
            <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto">
              Get your $SUKA in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="scroll-reveal card-glass rounded-2xl p-6 sm:p-8 text-center hover-glow-pink group"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="step-number mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                  {step.num}
                </div>
                <div className="text-[#00E5FF] mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMMUNITY ===== */}
      <section id="community" className="relative py-20 sm:py-32 bg-[#0f0f1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
              <span className="text-gradient-rainbow">JOIN THE BEAR ARMY</span>
            </h2>
            <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto mb-12">
              Follow us on social media. Become part of the strongest meme community.
            </p>

            <div className="flex justify-center gap-5 flex-wrap">
              {/* Twitter/X */}
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon twitter" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Telegram */}
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon telegram" aria-label="Telegram">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>

              {/* Discord */}
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon discord" aria-label="Discord">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                </svg>
              </a>
            </div>

            {/* CTA */}
            <div className="mt-16">
              <BearMascot className="w-24 mx-auto mb-6 animate-bounce-bear" />
              <p className="text-2xl sm:text-3xl font-black text-white mb-2">Are you ready?</p>
              <p className="text-white/40 mb-6">The bear army is waiting for you.</p>
              <a href="#how-to-buy" className="btn-primary text-lg inline-block">
                Join the Revolution 🐻
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-12 bg-[#08080f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black">
                <span className="text-[#FF2D78]">SUKA</span>{" "}
                <span className="text-[#00E5FF]">BLYAT</span>
              </span>
              <span className="text-white/20 text-sm">|</span>
              <span className="text-white/30 text-sm">$SUKA</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#" className="text-white/30 hover:text-[#FF2D78] transition-colors text-sm">
                Twitter
              </a>
              <a href="#" className="text-white/30 hover:text-[#00E5FF] transition-colors text-sm">
                Telegram
              </a>
              <a href="#" className="text-white/30 hover:text-[#9D4EDD] transition-colors text-sm">
                Discord
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-white/20 text-xs leading-relaxed max-w-2xl mx-auto">
              $SUKA is a memecoin with no intrinsic value or expectation of financial return.
              There is no formal team or roadmap. The coin is for entertainment purposes only.
              Always do your own research before investing in any cryptocurrency.
            </p>
            <p className="text-white/10 text-xs mt-4">&copy; 2025 SUKA BLYAT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
