"use client";

import { useLanguage } from "@/i18n/LanguageContext";
import { useTreasuryData, useSbPrice, useVaultParams } from "@/lib/sb/useContractActions";
import { MOCK_SB_PRICE, SB_TOTAL_SUPPLY, COLLATERAL_TOKENS } from "@/lib/sb/constants";

export default function TreasuryPage() {
  const { t } = useLanguage();
  const treasury = useTreasuryData();
  const livePrice = useSbPrice();
  const vaultParams = useVaultParams();

  const sbPrice = livePrice ?? MOCK_SB_PRICE;
  const totalSupply = treasury.sbTotalSupply ? Number(treasury.sbTotalSupply) : SB_TOTAL_SUPPLY;
  const treasuryBorrowed = treasury.totalDebt ? Number(treasury.totalDebt) : 108_000_000;
  const treasuryAvailable = treasury.treasuryBalance ? Number(treasury.treasuryBalance) : (totalSupply - treasuryBorrowed);
  const treasuryPct = (treasuryBorrowed / totalSupply) * 100;
  const treasuryValueUsd = treasuryAvailable * sbPrice;

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
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 8,
            letterSpacing: "-0.01em",
          }}
        >
          {t("sbTreasuryTitle")}
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          {t("sbTreasurySub")}
        </p>
      </div>

      {treasury.deployed && treasury.treasuryBalance !== null && (
        <div
          style={{
            padding: 16,
            borderRadius: 10,
            backgroundColor: "color-mix(in srgb, var(--sb-green) 10%, transparent)",
            border: "1px solid var(--sb-green)",
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "var(--sb-green)",
              animation: "pulse 2s infinite",
            }}
          />
          <span style={{ fontSize: 14, color: "var(--sb-green)", fontWeight: 500 }}>
            {t("sbLiveOnChain")}
          </span>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div className="sb-card">
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 10 }}>
            {t("sbTotalSupplyLabel")}
          </p>
          <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>
            {totalSupply.toLocaleString()}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>SB</p>
        </div>
        <div className="sb-card">
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 10 }}>
            {t("sbTreasuryAvail")}
          </p>
          <p style={{ fontSize: 28, fontWeight: 700, color: "var(--sb-green)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>
            {treasury.deployed && treasury.treasuryBalance !== null
              ? Number(treasury.treasuryBalance).toLocaleString()
              : treasuryAvailable.toLocaleString()}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
            ${treasuryValueUsd.toLocaleString()} USD
          </p>
        </div>
        <div className="sb-card">
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 10 }}>
            {t("sbTotalBorrowed")}
          </p>
          <p style={{ fontSize: 28, fontWeight: 700, color: "var(--sb-accent)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>
            {treasury.deployed && treasury.totalDebt !== null
              ? Number(treasury.totalDebt).toLocaleString()
              : treasuryBorrowed.toLocaleString()}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>SB</p>
        </div>
        <div className="sb-card">
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 10 }}>
            {t("sbSbPrice")}
          </p>
          <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>
            ${sbPrice}
          </p>
          <p style={{ fontSize: 13, color: "var(--sb-green)", marginTop: 4 }}>+3.8%</p>
        </div>
      </div>

      <div className="sb-card" style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
            {t("sbTreasuryUtil")}
          </h2>
          <span style={{ fontSize: 14, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
            {treasuryPct.toFixed(1)}% {t("sbUtilized")}
          </span>
        </div>
        <div style={{ width: "100%", height: 20, borderRadius: 10, backgroundColor: "var(--bg-tertiary)", overflow: "hidden" }}>
          <div style={{ width: `${treasuryPct}%`, height: "100%", borderRadius: 10, backgroundColor: "var(--sb-accent)", transition: "width 0.5s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 14 }}>
          <div>
            <span style={{ color: "var(--text-tertiary)" }}>{t("sbBorrowed")}: </span>
            <span style={{ color: "var(--text-primary)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
              {(treasuryBorrowed / 1_000_000).toFixed(0)}M SB
            </span>
          </div>
          <div>
            <span style={{ color: "var(--text-tertiary)" }}>{t("sbRemaining")}: </span>
            <span style={{ color: "var(--sb-green)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
              {(treasuryAvailable / 1_000_000).toFixed(0)}M SB
            </span>
          </div>
        </div>
      </div>

      <div className="sb-card" style={{ padding: 0, overflow: "hidden", marginBottom: 32 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
            {t("sbAcceptedCollateral")}
          </h2>
        </div>
        <div>
          {COLLATERAL_TOKENS.map((tk, i) => (
            <div
              key={tk.symbol}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px",
                borderTop: i > 0 ? "1px solid var(--border-color)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: tk.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#000",
                  }}
                >
                  {tk.icon}
                </div>
                <div>
                  <p style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: 15 }}>{tk.name}</p>
                  <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>{tk.symbol}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
                  ${tk.price}
                </p>
                <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>
                  Max LTV {vaultParams.maxLtv}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sb-card">
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 20 }}>
          {t("sbProtocolParams")}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: t("sbMaxLtv"), value: `${vaultParams.maxLtv}%` },
            { label: t("sbLiqThreshold"), value: `${vaultParams.liqThreshold}%` },
            { label: t("sbLiqPenalty"), value: "5%" },
            { label: t("sbInterest"), value: "0%", color: "var(--sb-green)" },
            { label: t("sbProtocolFee"), value: "0%", color: "var(--sb-green)" },
            { label: t("sbChain"), value: "Robinhood Chain" },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 16,
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <span style={{ fontSize: 15, color: "var(--text-secondary)" }}>
                {row.label}
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: row.color ?? "var(--text-primary)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
