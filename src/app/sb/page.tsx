"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

const STEP_ICONS = [
  <svg key="lock" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--sb-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>,
  <svg key="receive" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--sb-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>,
  <svg key="repay" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--sb-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>,
];

const FEATURE_ICONS = [
  <svg key="fixed" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sb-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>,
  <svg key="zero" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sb-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>,
  <svg key="market" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sb-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>,
  <svg key="transparent" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sb-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>,
];

export default function SBLandingPage() {
  const { t } = useLanguage();

  const STEPS = [
    { titleKey: "sbStepLock" as const, descKey: "sbStepLockDesc" as const, icon: STEP_ICONS[0] },
    { titleKey: "sbStepReceive" as const, descKey: "sbStepReceiveDesc" as const, icon: STEP_ICONS[1] },
    { titleKey: "sbStepRepay" as const, descKey: "sbStepRepayDesc" as const, icon: STEP_ICONS[2] },
  ];

  const STATS = [
    { labelKey: "sbTvl" as const, value: "$2.4M" },
    { labelKey: "sbActivePositions" as const, value: "847" },
    { labelKey: "sbTreasuryAvail" as const, value: "892M SB" },
    { labelKey: "sbTotalBorrowed" as const, value: "108M SB" },
  ];

  const FEATURES = [
    { titleKey: "sbFixedSupply" as const, descKey: "sbFixedSupplyDesc" as const, icon: FEATURE_ICONS[0] },
    { titleKey: "sbZeroInterest" as const, descKey: "sbZeroInterestDesc" as const, icon: FEATURE_ICONS[1] },
    { titleKey: "sbMarketPriced" as const, descKey: "sbMarketPricedDesc" as const, icon: FEATURE_ICONS[2] },
    { titleKey: "sbTransparentTreasury" as const, descKey: "sbTransparentTreasuryDesc" as const, icon: FEATURE_ICONS[3] },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          textAlign: "center",
          minHeight: 480,
        }}
      >
        <h1
          style={{
            fontSize: "clamp(32px, 6vw, 64px)",
            fontWeight: 700,
            lineHeight: 1.1,
            color: "var(--text-primary)",
            marginBottom: 16,
            maxWidth: 720,
            letterSpacing: "-0.02em",
          }}
        >
          {t("sbHeroTitle")}{" "}
          <span style={{ color: "var(--sb-accent)" }}>{t("sbHeroAccent")}</span>
        </h1>
        <p
          style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            color: "var(--text-secondary)",
            maxWidth: 520,
            lineHeight: 1.5,
            marginBottom: 40,
          }}
        >
          {t("sbHeroSub")}
        </p>
        <Link href="/sb/dashboard" className="sb-btn-primary" style={{ padding: "14px 36px", fontSize: 16 }}>
          {t("sbLaunchApp")}
        </Link>
      </section>

      <section
        style={{
          padding: "64px 24px",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: 14,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--sb-accent)",
              textAlign: "center",
              marginBottom: 40,
            }}
          >
            {t("sbHowItWorks")}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
            }}
          >
            {STEPS.map((step, i) => (
              <div key={i} className="sb-card" style={{ textAlign: "center", padding: 32 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    backgroundColor: "var(--sb-accent-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  {step.icon}
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: 8,
                  }}
                >
                  {t(step.titleKey)}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {t(step.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          borderTop: "1px solid var(--border-color)",
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "32px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 24,
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.labelKey} style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginBottom: 4,
                }}
              >
                {t(stat.labelKey)}
              </p>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "64px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: 14,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--sb-accent)",
              textAlign: "center",
              marginBottom: 40,
            }}
          >
            {t("sbWhyTitle")}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {FEATURES.map((feature) => (
              <div key={feature.titleKey} className="sb-card" style={{ padding: 24 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: "var(--sb-accent-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: 6,
                  }}
                >
                  {t(feature.titleKey)}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {t(feature.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
