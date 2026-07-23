"use client";

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
  const { connected, connecting, shortAddress, connectWallet, disconnect } =
    useWalletState();

  const NAV_LINKS = [
    { href: "/sb/dashboard", label: t("sbDashboard") },
    { href: "/sb/borrow", label: t("sbBorrow") },
    { href: "/sb/treasury", label: t("sbTreasury") },
  ];

  return (
    <header
      style={{
        height: 56,
        backgroundColor: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        flexShrink: 0,
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>

        {connected ? (
          <button
            onClick={() => disconnect()}
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
                backgroundColor: "var(--sb-green)",
              }}
            />
            {shortAddress}
          </button>
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
    </header>
  );
}
