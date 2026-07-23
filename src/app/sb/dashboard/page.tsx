"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";
import { MOCK_POSITIONS, MOCK_SB_PRICE, SB_TOTAL_SUPPLY, COLLATERAL_TOKENS } from "@/lib/sb/constants";
import { useTreasuryData, useUserPositions, usePositionData, useSbPrice } from "@/lib/sb/useContractActions";
import { DEPLOYED } from "@/lib/sb/contracts";
import type { TranslationKey } from "@/i18n/translations";

function computeLtv(amount: number, price: number, debt: number, sbPrice: number): number {
  const collateralValue = amount * price;
  if (collateralValue === 0) return 0;
  return ((debt * sbPrice) / collateralValue) * 100;
}

function ltvColor(ltv: number): string {
  if (ltv < 70) return "var(--sb-green)";
  if (ltv < 85) return "var(--sb-yellow)";
  return "var(--sb-red)";
}

function healthKey(ltv: number): { key: TranslationKey; color: string } {
  if (ltv < 70) return { key: "sbHealthy", color: "var(--sb-green)" };
  if (ltv < 85) return { key: "sbCaution", color: "var(--sb-yellow)" };
  return { key: "sbAtRisk", color: "var(--sb-red)" };
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const treasury = useTreasuryData();
  const { positionIds } = useUserPositions();
  const livePrice = useSbPrice();

  const sbPrice = livePrice ?? MOCK_SB_PRICE;
  const positions = MOCK_POSITIONS;
  const totalCollateral = positions.reduce((sum, p) => sum + p.amount * p.price, 0);
  const totalDebt = positions.reduce((sum, p) => sum + p.debt, 0);
  const totalDebtUsd = totalDebt * sbPrice;
  const avgLtv = 62.4;

  const treasuryBorrowed = treasury.totalDebt ? Number(treasury.totalDebt) : 108_000_000;
  const treasuryTotal = treasury.sbTotalSupply ? Number(treasury.sbTotalSupply) : SB_TOTAL_SUPPLY;
  const treasuryPct = (treasuryBorrowed / treasuryTotal) * 100;

  const STAT_CARDS = [
    {
      label: t("sbYourCollateral"),
      value: `$${totalCollateral.toLocaleString()}`,
      sub: t("sbPositionsCount", { n: String(DEPLOYED && positionIds.length > 0 ? positionIds.length : positions.length) }),
    },
    {
      label: t("sbTotalDebt"),
      value: `${totalDebt.toLocaleString()} SB`,
      sub: `$${totalDebtUsd.toLocaleString()}`,
    },
    {
      label: t("sbAverageLtv"),
      value: `${avgLtv}%`,
      sub: null,
      color: "var(--sb-green)",
    },
    {
      label: t("sbSbPrice"),
      value: `$${sbPrice}`,
      sub: "+3.8%",
      subColor: "var(--sb-green)",
    },
  ];

  const TABLE_HEADERS = [
    t("sbAsset"),
    t("sbCollateralValue"),
    t("sbDebt"),
    t("sbLtv"),
    t("sbHealth"),
  ];

  return (
    <div
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "40px 32px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {STAT_CARDS.map((stat) => (
          <div key={stat.label} className="sb-card">
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 10 }}>
              {stat.label}
            </p>
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: stat.color ?? "var(--text-primary)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.01em",
              }}
            >
              {stat.value}
            </p>
            {stat.sub && (
              <p
                style={{
                  fontSize: 13,
                  color: stat.subColor ?? "var(--text-secondary)",
                  marginTop: 4,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {stat.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="sb-card" style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
            {t("sbTreasuryUtil")}
          </p>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {(treasuryBorrowed / 1_000_000).toFixed(0)}M / {(SB_TOTAL_SUPPLY / 1_000_000_000).toFixed(0)}B SB
          </p>
        </div>
        <div
          style={{
            width: "100%",
            height: 10,
            borderRadius: 5,
            backgroundColor: "var(--bg-tertiary)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${treasuryPct}%`,
              height: "100%",
              borderRadius: 5,
              backgroundColor: "var(--sb-accent)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-tertiary)",
            marginTop: 8,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {treasuryPct.toFixed(1)}% {t("sbUtilized")}
        </p>
      </div>

      <div className="sb-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {t("sbPositions")}
          </h2>
          <Link href="/sb/borrow" className="sb-btn-outline" style={{ padding: "8px 18px", fontSize: 13 }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t("sbNewPosition")}
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 15,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                {TABLE_HEADERS.map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "14px 24px",
                      textAlign: "left",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--text-tertiary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_POSITIONS.map((pos) => {
                const collateralValue = pos.amount * pos.price;
                const ltv = computeLtv(pos.amount, pos.price, pos.debt, sbPrice);
                const health = healthKey(ltv);
                const tokenInfo = {
                  CC: { color: "#E5A435" },
                  HOOD: { color: "#60A5FA" },
                  MM: { color: "#C084FC" },
                }[pos.token] ?? { color: "#888" };

                return (
                  <tr
                    key={pos.id}
                    className="sb-table-row"
                    style={{ borderBottom: "1px solid var(--border-color)" }}
                  >
                    <td style={{ padding: "18px 24px" }}>
                      <Link
                        href={`/sb/position/${pos.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            backgroundColor: tokenInfo.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#000",
                            flexShrink: 0,
                          }}
                        >
                          {pos.token}
                        </div>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: 15, color: "var(--text-primary)" }}>
                            {pos.name}
                          </p>
                          <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>
                            {pos.token}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td style={{ padding: "18px 24px" }}>
                      <p style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: 15 }}>
                        {pos.amount.toLocaleString()}
                      </p>
                      <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>
                        ${collateralValue.toLocaleString()}
                      </p>
                    </td>
                    <td style={{ padding: "18px 24px" }}>
                      <p style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: 15 }}>
                        {pos.debt.toLocaleString()} SB
                      </p>
                      <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>
                        ${(pos.debt * sbPrice).toLocaleString()}
                      </p>
                    </td>
                    <td style={{ padding: "18px 24px" }}>
                      <span style={{ color: ltvColor(ltv), fontWeight: 600, fontSize: 15 }}>
                        {ltv.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: "18px 24px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: 9999,
                          fontSize: 13,
                          fontWeight: 500,
                          backgroundColor: `color-mix(in srgb, ${health.color} 15%, transparent)`,
                          color: health.color,
                        }}
                      >
                        {t(health.key)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
