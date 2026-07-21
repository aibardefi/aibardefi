"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANGUAGE_NAMES, type Language } from "@/i18n/translations";

const LANGS: Language[] = ["en", "ru", "kk"];

export function Header() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const isTradeActive = pathname.startsWith("/trade");

  return (
    <header className="h-14 lg:h-16 bg-bg-secondary border-b border-border flex items-center px-4 lg:px-8 shrink-0">
      <Link href="/" className="flex items-center mr-4 lg:mr-12 shrink-0">
        <span className="text-lg lg:text-xl tracking-tight">
          <span className="font-semibold text-text-primary">Alpha</span>
          <span className="font-semibold text-green">DEX</span>
        </span>
      </Link>

      <nav className="flex items-center gap-8 h-full">
        <Link
          href="/trade"
          className={`text-sm transition-colors whitespace-nowrap ${
            isTradeActive
              ? "text-text-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {t("trade")}
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-1.5 lg:gap-2">
        {/* Language picker */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="h-9 px-2 lg:px-2.5 flex items-center gap-1.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors text-sm font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
            <span className="text-xs lg:text-sm">{lang.toUpperCase()}</span>
          </button>

          {showLangMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
              <div className="absolute right-0 top-full mt-1 bg-bg-tertiary border border-border rounded-xl shadow-xl z-20 min-w-[160px] py-1 overflow-hidden">
                {LANGS.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setShowLangMenu(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-bg-hover transition-colors ${
                      lang === l ? "text-green font-medium" : "text-text-secondary"
                    }`}
                  >
                    <span>{LANGUAGE_NAMES[l]}</span>
                    {lang === l && (
                      <svg width="14" height="14" viewBox="0 0 24 24" className="text-green">
                        <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          aria-label={t("toggleTheme")}
        >
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <Link
          href="/trade"
          className="hidden lg:inline-flex px-6 py-2 text-sm bg-btn-bg text-btn-text rounded-full font-medium hover:bg-btn-hover transition-colors"
        >
          {t("trade")}
        </Link>
      </div>
    </header>
  );
}
