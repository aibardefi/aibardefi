"use client";

import Link from "next/link";
import { MOCK_POSITIONS, MOCK_SB_PRICE, SB_TOTAL_SUPPLY } from "@/lib/sb/constants";

function computeLtv(amount: number, price: number, debt: number): number {
  const collateralValue = amount * price;
  if (collateralValue === 0) return 0;
  return ((debt * MOCK_SB_PRICE) / collateralValue) * 100;
}

function ltvColor(ltv: number): string {
  if (ltv < 70) return "var(--sb-green)";
  if (ltv < 85) return "var(--sb-yellow)";
  return "var(--sb-red)";
}

function healthLabel(ltv: number): { text: string; color: string } {
  if (ltv < 70) return { text: "Healthy", color: "var(--sb-green)" };
  if (ltv < 85) return { text: "Caution", color: "var(--sb-yellow)" };
  return { text: "At Risk", color: "var(--sb-red)" };
}

const totalCollateral = MOCK_POSITIONS.reduce((sum, p) => sum + p.amount * p.price, 0);
const totalDebt = MOCK_POSITIONS.reduce((sum, p) => sum + p.debt, 0);
const totalDebtUsd = totalDebt * MOCK_SB_PRICE;
const avgLtv = 62.4;
const treasuryBorrowed = 108_000_000;
const treasuryAvailable = SB_TOTAL_SUPPLY - treasuryBorrowed;
const treasuryPct = (treasuryBorrowed / SB_TOTAL_SUPPLY) * 100;

const STAT_CARDS = [
  {
    label: "Your Collateral",
    value: `$${totalCollateral.toLocaleString()}`,
    sub: `${MOCK_POSITIONS.length} positions`,
  },
  {
    label: "Total Debt",
    value: `${totalDebt.toLocaleString()} SB`,
    sub: `$${totalDebtUsd.toLocaleString()}`,
  },
  {
    label: "Average LTV",
    value: `${avgLtv}%`,
    sub: null,
    color: "var(--sb-green)",
  },
  {
    label: "SB Price",
    value: `$${MOCK_SB_PRICE}`,
    sub: "+3.8%",
    subColor: "var(--sb-green)",
  },
];

export default function DashboardPage() {
  return (
    <div
      style={{
        maxWidth: 1040,
        margin: "0 auto",
        padding: "32px 24px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {STAT_CARDS.map((stat) => (
          <div key={stat.label} className="sb-card">
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>
              {stat.label}
            </p>
            <p
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: stat.color ?? "var(--text-primary)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {stat.value}
            </p>
            {stat.sub && (
              <p
                style={{
                  fontSize: 13,
                  color: stat.subColor ?? "var(--text-secondary)",
                  marginTop: 2,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {stat.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="sb-card" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
            Treasury Utilization
          </p>
          <p
            style={{
              fontSize: 13,
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
            height: 8,
            borderRadius: 4,
            backgroundColor: "var(--bg-tertiary)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${treasuryPct}%`,
              height: "100%",
              borderRadius: 4,
              backgroundColor: "var(--sb-accent)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <p
          style={{
            fontSize: 12,
            color: "var(--text-tertiary)",
            marginTop: 6,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {treasuryPct.toFixed(1)}% utilized
        </p>
      </div>

      <div className="sb-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Positions
          </h2>
          <Link href="/sb/borrow" className="sb-btn-outline" style={{ padding: "8px 16px", fontSize: 13 }}>
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
            New Position
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                {["Asset", "Collateral Value", "Debt", "LTV", "Health"].map(
                  (col) => (
                    <th
                      key={col}
                      style={{
                        padding: "10px 20px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--text-tertiary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {MOCK_POSITIONS.map((pos) => {
                const collateralValue = pos.amount * pos.price;
                const ltv = computeLtv(pos.amount, pos.price, pos.debt);
                const health = healthLabel(ltv);
                const tokenInfo = {
                  CC: { color: "#E5A435" },
                  HOOD: { color: "#60A5FA" },
                  MM: { color: "#C084FC" },
                }[pos.token] ?? { color: "#888" };

                return (
                  <tr key={pos.id} className="sb-table-row">
                    <td style={{ padding: "14px 20px" }}>
                      <Link
                        href={`/sb/position/${pos.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: tokenInfo.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#000",
                            flexShrink: 0,
                          }}
                        >
                          {pos.token}
                        </div>
                        <div>
                          <p style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                            {pos.name}
                          </p>
                          <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                            {pos.amount.toLocaleString()} {pos.token}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td style={{ padding: "14px 20px", color: "var(--text-primary)" }}>
                      ${collateralValue.toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 20px", color: "var(--text-primary)" }}>
                      {pos.debt.toLocaleString()} SB
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 48,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: "var(--bg-tertiary)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(ltv, 100)}%`,
                              height: "100%",
                              borderRadius: 3,
                              backgroundColor: ltvColor(ltv),
                            }}
                          />
                        </div>
                        <span style={{ color: ltvColor(ltv), fontWeight: 500 }}>
                          {ltv.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: 9999,
                          fontSize: 12,
                          fontWeight: 500,
                          backgroundColor: `color-mix(in srgb, ${health.color} 15%, transparent)`,
                          color: health.color,
                        }}
                      >
                        {health.text}
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
