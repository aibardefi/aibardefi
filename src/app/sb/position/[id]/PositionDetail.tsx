"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";
import { MOCK_POSITIONS, MOCK_SB_PRICE, COLLATERAL_TOKENS } from "@/lib/sb/constants";
import { useWalletState } from "../../useWalletState";
import { usePositionData, useRepayAndUnlock, useSbPrice, useVaultParams } from "@/lib/sb/useContractActions";
import { DEPLOYED } from "@/lib/sb/contracts";
import type { TranslationKey } from "@/i18n/translations";

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

const GAUGE_RADIUS = 52;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

export default function PositionDetail() {
  const params = useParams();
  const positionId = Number(String(params.id));
  const { t, lang } = useLanguage();
  const { connected, connectWallet } = useWalletState();
  const repayAndUnlock = useRepayAndUnlock();
  const livePosition = usePositionData(positionId);
  const livePrice = useSbPrice();
  const vaultParams = useVaultParams();

  const sbPrice = livePrice ?? MOCK_SB_PRICE;

  const position = useMemo(() => {
    if (DEPLOYED && livePosition) {
      return {
        id: positionId,
        token: "CC",
        name: "Position",
        amount: Number(livePosition.collateralAmount),
        price: 0.025,
        debt: Number(livePosition.debtAmount),
        openedAt: new Date(livePosition.openedAt * 1000).toISOString().split("T")[0],
      };
    }
    return MOCK_POSITIONS.find((p) => p.id === positionId) ?? MOCK_POSITIONS[0];
  }, [positionId, livePosition]);

  const tokenInfo = useMemo(
    () => COLLATERAL_TOKENS.find((tk) => tk.symbol === position.token) ?? COLLATERAL_TOKENS[0],
    [position.token]
  );

  const collateralValue = position.amount * position.price;
  const debtValue = position.debt * sbPrice;
  const ltv = collateralValue > 0 ? (debtValue / collateralValue) * 100 : (DEPLOYED && livePosition ? livePosition.ltv : 0);
  const liquidationPrice = position.amount > 0 ? (position.debt * sbPrice) / (position.amount * (vaultParams.liqThreshold / 100)) : 0;
  const safetyMargin = vaultParams.liqThreshold - ltv;
  const health = healthKey(ltv);
  const gaugeOffset = GAUGE_CIRCUMFERENCE * (1 - ltv / 100);

  const locale = lang === "ru" ? "ru-RU" : "en-US";
  const formattedDate = new Date(position.openedAt + "T00:00:00").toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "40px 32px",
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
        {t("sbBackDashboard")}
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
                fontSize: 28,
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              {position.name} {t("sbPosition")}
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
              {t("sbOpened")} {formattedDate}
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
          {t(health.key)}
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
            { key: "sbHealthy" as const, range: "<70%", color: "var(--sb-green)" },
            { key: "sbCaution" as const, range: "70-85%", color: "var(--sb-yellow)" },
            { key: "sbLiqThreshold" as const, range: ">=90%", color: "var(--sb-red)" },
          ].map((item) => (
            <div
              key={item.key}
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
              {t(item.key)} {item.range}
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
          label={t("sbCollateralLocked")}
          value={`${position.amount.toLocaleString()} ${position.token}`}
          sub={`$${collateralValue.toLocaleString()}`}
        />
        <InfoCard
          label={t("sbDebtOwed")}
          value={`${position.debt.toLocaleString()} SB`}
          sub={`$${debtValue.toLocaleString()}`}
        />
        <InfoCard
          label={t("sbLiqPrice")}
          value={`$${liquidationPrice.toFixed(4)}`}
          sub={`${t("sbPer")} ${position.token}`}
        />
        <InfoCard
          label={t("sbSafetyMargin")}
          value={`${safetyMargin.toFixed(0)}%`}
          sub={t("sbFromLiq")}
          valueColor={safetyMargin > 20 ? "var(--sb-green)" : "var(--sb-yellow)"}
        />
      </div>

      <div className="sb-card">
        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 20,
          }}
        >
          {t("sbRepayUnlock")}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 15, color: "var(--text-secondary)" }}>
              {t("sbAmountRepay")}
            </span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
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
            <span style={{ fontSize: 15, color: "var(--text-secondary)" }}>
              {t("sbReceiveBack")}
            </span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
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
            <span style={{ fontSize: 15, color: "var(--text-secondary)" }}>
              {t("sbInterestCharged")}
            </span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
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
          {connected ? (
            <button
              className="sb-btn-green"
              style={{
                width: "100%",
                padding: "14px 24px",
                fontSize: 15,
                opacity: repayAndUnlock.status === "idle" ? 1 : 0.6,
                cursor: repayAndUnlock.status === "idle" ? "pointer" : "not-allowed",
              }}
              disabled={repayAndUnlock.status !== "idle"}
              onClick={() => {
                if (DEPLOYED) {
                  repayAndUnlock.execute(positionId, String(position.debt));
                }
              }}
            >
              {repayAndUnlock.status === "approving"
                ? t("sbConnecting")
                : repayAndUnlock.status === "repaying"
                  ? t("sbConnecting")
                  : repayAndUnlock.status === "success"
                    ? "✓"
                    : repayAndUnlock.status === "error"
                      ? repayAndUnlock.error ?? "Error"
                      : t("sbRepayUnlock")}
            </button>
          ) : (
            <button
              className="sb-btn-primary"
              style={{ width: "100%", padding: "14px 24px", fontSize: 15 }}
              onClick={connectWallet}
            >
              {t("sbConnectWallet")}
            </button>
          )}
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
          fontSize: 24,
          fontWeight: 700,
          color: valueColor ?? "var(--text-primary)",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.01em",
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
