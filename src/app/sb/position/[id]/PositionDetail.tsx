"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MOCK_POSITIONS, MOCK_SB_PRICE, COLLATERAL_TOKENS } from "@/lib/sb/constants";

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const GAUGE_RADIUS = 52;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

export default function PositionDetail() {
  const params = useParams();
  const positionId = Number(String(params.id));

  const position = useMemo(
    () => MOCK_POSITIONS.find((p) => p.id === positionId) ?? MOCK_POSITIONS[0],
    [positionId]
  );

  const tokenInfo = useMemo(
    () => COLLATERAL_TOKENS.find((t) => t.symbol === position.token) ?? COLLATERAL_TOKENS[0],
    [position.token]
  );

  const collateralValue = position.amount * position.price;
  const debtValue = position.debt * MOCK_SB_PRICE;
  const ltv = (debtValue / collateralValue) * 100;
  const liquidationPrice = (position.debt * MOCK_SB_PRICE) / (position.amount * 0.9);
  const safetyMargin = 90 - ltv;
  const health = healthLabel(ltv);
  const gaugeOffset = GAUGE_CIRCUMFERENCE * (1 - ltv / 100);

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px 24px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Link href="/sb/dashboard" className="sb-link-back" style={{ marginBottom: 24, display: "inline-flex" }}>
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
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Dashboard
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: tokenInfo.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "#000",
            }}
          >
            {tokenInfo.icon}
          </div>
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {position.name} Position
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
              Opened {formatDate(position.openedAt)}
            </p>
          </div>
        </div>
        <span
          style={{
            display: "inline-block",
            padding: "5px 14px",
            borderRadius: 9999,
            fontSize: 13,
            fontWeight: 500,
            backgroundColor: `color-mix(in srgb, ${health.color} 15%, transparent)`,
            color: health.color,
          }}
        >
          {health.text}
        </span>
      </div>

      <div
        className="sb-card"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 32,
          marginBottom: 20,
        }}
      >
        <svg
          width="160"
          height="160"
          viewBox="0 0 120 120"
          style={{ marginBottom: 20 }}
        >
          <circle
            cx="60"
            cy="60"
            r={GAUGE_RADIUS}
            fill="none"
            stroke="var(--bg-tertiary)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={GAUGE_RADIUS}
            fill="none"
            stroke={ltvColor(ltv)}
            strokeWidth="8"
            strokeDasharray={GAUGE_CIRCUMFERENCE}
            strokeDashoffset={gaugeOffset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s" }}
          />
          <text
            x="60"
            y="55"
            textAnchor="middle"
            fill="var(--text-primary)"
            fontSize="24"
            fontWeight="600"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {ltv.toFixed(0)}%
          </text>
          <text
            x="60"
            y="72"
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize="12"
          >
            LTV
          </text>
        </svg>

        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Healthy", range: "<70%", color: "var(--sb-green)" },
            { label: "Caution", range: "70-85%", color: "var(--sb-yellow)" },
            { label: "Liquidation", range: ">=90%", color: "var(--sb-red)" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: item.color,
                }}
              />
              {item.label} {item.range}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <InfoCard
          label="Collateral Locked"
          value={`${position.amount.toLocaleString()} ${position.token}`}
          sub={`$${collateralValue.toLocaleString()}`}
        />
        <InfoCard
          label="Debt Owed"
          value={`${position.debt.toLocaleString()} SB`}
          sub={`$${debtValue.toLocaleString()}`}
        />
        <InfoCard
          label="Liquidation Price"
          value={`$${liquidationPrice.toFixed(4)}`}
          sub={`per ${position.token}`}
        />
        <InfoCard
          label="Safety Margin"
          value={`${safetyMargin.toFixed(0)}%`}
          sub="from liquidation"
          valueColor={safetyMargin > 20 ? "var(--sb-green)" : "var(--sb-yellow)"}
        />
      </div>

      <div className="sb-card">
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 20,
          }}
        >
          Repay & Unlock
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              Amount to Repay
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-primary)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {position.debt.toLocaleString()} SB
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              You Receive Back
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--sb-accent)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {position.amount.toLocaleString()} {position.token}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              Interest Charged
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--sb-green)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              0 SB
            </span>
          </div>
          <div
            style={{
              height: 1,
              backgroundColor: "var(--border-color)",
              margin: "8px 0",
            }}
          />
          <button
            className="sb-btn-green"
            style={{ width: "100%", padding: "14px 24px", fontSize: 15 }}
          >
            Repay & Unlock
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub: string;
  valueColor?: string;
}) {
  return (
    <div className="sb-card">
      <p
        style={{
          fontSize: 12,
          color: "var(--text-tertiary)",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          fontWeight: 500,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: valueColor ?? "var(--text-primary)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: 12,
          color: "var(--text-secondary)",
          marginTop: 2,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {sub}
      </p>
    </div>
  );
}
