"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { useWalletState } from "./useWalletState";
import type { Language } from "@/i18n/translations";

const SB_LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

export function SBHeader() {
  const pathname = usePathname();
  const { t, lang, setLang } = useLanguage();
  const { theme, toggle } = useTheme();
  const {
    connected,
    connecting,
    shortAddress,
    connectWallet,
    disconnect,
    isWrongChain,
    switchToRobinhood,
    ethBalance,
    ethSymbol,
    sbBalance,
    chainName,
  } = useWalletState();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const NAV_LINKS = [
    { href: "/sb/dashboard", label: t("sbDashboard") },
    { href: "/sb/borrow", label: t("sbBorrow") },
    { href: "/sb/treasury", label: t("sbTreasury") },
  ];

  return (
    <header
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
        flexShrink: 0,
      }}
    >
      {isWrongChain && (
        <div
          style={{
            padding: "8px 16px",
            backgroundColor: "color-mix(in srgb, var(--sb-red) 12%, transparent)",
            borderBottom: "1px solid var(--sb-red)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sb-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span style={{ fontSize: 13, color: "var(--sb-red)", fontWeight: 500 }}>
            {lang === "ru" ? "Неправильная сеть" : "Wrong network"}
          </span>
          <button
            onClick={switchToRobinhood}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 12px",
              borderRadius: 6,
              border: "1px solid var(--sb-red)",
              background: "transparent",
              color: "var(--sb-red)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {lang === "ru" ? `Переключить на ${chainName}` : `Switch to ${chainName}`}
          </button>
        </div>
      )}

      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        <Link
          href="/sb"
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: 32,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              backgroundColor: "var(--sb-accent)",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#000",
                letterSpacing: "0.02em",
              }}
            >
              SB
            </span>
          </div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            SB Token
          </span>
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            height: "100%",
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: 14,
                color: pathname.startsWith(link.href)
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid var(--border-color)",
            }}
          >
            {SB_LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                style={{
                  padding: "6px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  border: "none",
                  cursor: "pointer",
                  background:
                    lang === l.code ? "var(--sb-accent)" : "transparent",
                  color: lang === l.code ? "#000" : "var(--text-secondary)",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            onClick={toggle}
            aria-label={t("toggleTheme")}
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "1px solid var(--border-color)",
              borderRadius: 8,
              cursor: "pointer",
              color: "var(--text-secondary)",
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          {connected ? (
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  height: 36,
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "0 16px",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "border-color 0.15s",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: isWrongChain ? "var(--sb-red)" : "var(--sb-green)",
                  }}
                />
                {shortAddress}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    width: 260,
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 12,
                    overflow: "hidden",
                    zIndex: 50,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  }}
                >
                  <div style={{ padding: "16px 16px 12px" }}>
                    <p style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500, marginBottom: 8 }}>
                      {lang === "ru" ? "Кошелек" : "Wallet"}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, fontFamily: "monospace", wordBreak: "break-all" }}>
                      {shortAddress}
                    </p>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-color)", padding: "12px 16px" }}>
                    <p style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500, marginBottom: 10 }}>
                      {lang === "ru" ? "Балансы" : "Balances"}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--text-secondary)" }}>
                          {ethSymbol.slice(0, 2)}
                        </div>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{ethSymbol}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                        {Number(ethBalance).toFixed(4)}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--sb-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#000" }}>
                          SB
                        </div>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>SB</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                        {Number(sbBalance).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-color)", padding: "8px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px", borderRadius: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                      <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isWrongChain ? "var(--sb-red)" : "var(--sb-green)" }} />
                      {isWrongChain
                        ? (lang === "ru" ? "Неправильная сеть" : "Wrong network")
                        : chainName}
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-color)", padding: "8px 8px" }}>
                    <button
                      onClick={() => { disconnect(); setShowDropdown(false); }}
                      style={{
                        width: "100%",
                        padding: "8px 8px",
                        borderRadius: 6,
                        border: "none",
                        background: "transparent",
                        color: "var(--sb-red)",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      {lang === "ru" ? "Отключить" : "Disconnect"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={connecting}
              style={{
                height: 36,
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                padding: "0 20px",
                background: "var(--sb-accent)",
                border: "none",
                color: "#000",
                cursor: connecting ? "wait" : "pointer",
                fontFamily: "inherit",
                opacity: connecting ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {connecting ? t("sbConnecting") : t("sbConnectWallet")}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
