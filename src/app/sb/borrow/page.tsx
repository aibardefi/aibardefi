"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { COLLATERAL_TOKENS, MOCK_SB_PRICE } from "@/lib/sb/constants";

type TokenSymbol = (typeof COLLATERAL_TOKENS)[number]["symbol"];

export default function BorrowPage() {
  const { t } = useLanguage();
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>("CC");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [sbAmount, setSbAmount] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const token = useMemo(
    () => COLLATERAL_TOKENS.find((t) => t.symbol === selectedToken) ?? COLLATERAL_TOKENS[0],
    [selectedToken]
  );

  const collateralValue = useMemo(() => {
    const amt = parseFloat(collateralAmount) || 0;
    return amt * token.price;
  }, [collateralAmount, token.price]);

  const sbValue = useMemo(() => {
    const amt = parseFloat(sbAmount) || 0;
    return amt * MOCK_SB_PRICE;
  }, [sbAmount]);

  const maxSb = useMemo(() => {
    if (collateralValue <= 0) return 0;
    return Math.floor((collateralValue * 0.85) / MOCK_SB_PRICE);
  }, [collateralValue]);

  const ltv = useMemo(() => {
    if (collateralValue <= 0 || !sbAmount) return 0;
    return (sbValue / collateralValue) * 100;
  }, [sbValue, collateralValue, sbAmount]);

  const liquidationPrice = useMemo(() => {
    const amt = parseFloat(collateralAmount) || 0;
    const sb = parseFloat(sbAmount) || 0;
    if (amt <= 0 || sb <= 0) return 0;
    return (sb * MOCK_SB_PRICE) / (amt * 0.9);
  }, [collateralAmount, sbAmount]);

  function ltvBarColor(): string {
    if (ltv < 70) return "var(--sb-green)";
    if (ltv < 85) return "var(--sb-yellow)";
    return "var(--sb-red)";
  }

  function handleCollateralMax() {
    const mockBalance: Record<string, number> = { CC: 100000, HOOD: 50000, MM: 200000 };
    setCollateralAmount(String(mockBalance[selectedToken] ?? 0));
  }

  function handleSbMax() {
    if (maxSb > 0) {
      setSbAmount(String(maxSb));
    }
  }

  return (
    <div
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "32px 24px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 6,
          }}
        >
          {t("sbBorrowTitle")}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          {t("sbBorrowSub")}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="sb-card">
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-secondary)",
                marginBottom: 8,
              }}
            >
              {t("sbCollateralToken")}
            </label>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    backgroundColor: token.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#000",
                    flexShrink: 0,
                  }}
                >
                  {token.icon}
                </div>
                <span style={{ flex: 1, textAlign: "left" }}>
                  {token.name}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-tertiary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  ${token.price}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-tertiary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showDropdown && (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 10 }}
                    onClick={() => setShowDropdown(false)}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      right: 0,
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: 8,
                      overflow: "hidden",
                      zIndex: 20,
                    }}
                  >
                    {COLLATERAL_TOKENS.map((t) => (
                      <button
                        key={t.symbol}
                        onClick={() => {
                          setSelectedToken(t.symbol);
                          setShowDropdown(false);
                          setCollateralAmount("");
                          setSbAmount("");
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 16px",
                          background:
                            t.symbol === selectedToken
                              ? "var(--bg-hover)"
                              : "transparent",
                          border: "none",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          fontSize: 14,
                          fontFamily: "inherit",
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            backgroundColor: t.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#000",
                          }}
                        >
                          {t.icon}
                        </div>
                        <span style={{ flex: 1, textAlign: "left" }}>
                          {t.name}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--text-tertiary)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          ${t.price}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="sb-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                }}
              >
                {t("sbCollateralAmount")}
              </label>
              <button
                onClick={handleCollateralMax}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--sb-accent)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                MAX
              </button>
            </div>
            <input
              type="number"
              className="sb-input"
              placeholder="0.00"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              style={{ fontVariantNumeric: "tabular-nums" }}
            />
            {collateralValue > 0 && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-tertiary)",
                  marginTop: 6,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                = ${collateralValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>

          <div className="sb-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                }}
              >
                {t("sbSbAmountBorrow")}
              </label>
              <button
                onClick={handleSbMax}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--sb-accent)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                MAX
              </button>
            </div>
            <input
              type="number"
              className="sb-input"
              placeholder="0.00"
              value={sbAmount}
              onChange={(e) => setSbAmount(e.target.value)}
              style={{ fontVariantNumeric: "tabular-nums" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
              }}
            >
              {sbValue > 0 && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-tertiary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  = ${sbValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
              {maxSb > 0 && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-tertiary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  Max: {maxSb.toLocaleString()} SB
                </p>
              )}
            </div>
          </div>

          <div className="sb-card">
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-secondary)",
                marginBottom: 12,
              }}
            >
              {t("sbLoanToValue")}
            </p>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "100%",
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: "var(--bg-tertiary)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(ltv, 100)}%`,
                    height: "100%",
                    borderRadius: 6,
                    backgroundColor: ltvBarColor(),
                    transition: "width 0.2s, background-color 0.2s",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "90%",
                    top: -2,
                    width: 2,
                    height: 16,
                    backgroundColor: "var(--sb-red)",
                    borderRadius: 1,
                  }}
                  title={t("sbLiquidationAt")}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: ltv > 0 ? ltvBarColor() : "var(--text-tertiary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {ltv > 0 ? `${ltv.toFixed(1)}%` : "--"}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  {t("sbLiquidationAt")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="sb-card">
            <h3
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: 16,
              }}
            >
              {t("sbSummary")}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <SummaryRow
                label={t("sbCollateralValue")}
                value={
                  collateralValue > 0
                    ? `$${collateralValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "--"
                }
              />
              <SummaryRow
                label={t("sbYouReceive")}
                value={
                  sbAmount && parseFloat(sbAmount) > 0
                    ? `${parseFloat(sbAmount).toLocaleString()} SB`
                    : "--"
                }
                valueColor="var(--sb-accent)"
              />
              <SummaryRow
                label={t("sbToRepay")}
                value={
                  sbAmount && parseFloat(sbAmount) > 0
                    ? `${parseFloat(sbAmount).toLocaleString()} SB`
                    : "--"
                }
              />
              <div
                style={{
                  height: 1,
                  backgroundColor: "var(--border-color)",
                  margin: "4px 0",
                }}
              />
              <SummaryRow
                label={t("sbInitialLtv")}
                value={ltv > 0 ? `${ltv.toFixed(1)}%` : "--"}
                valueColor={ltv > 0 ? ltvBarColor() : undefined}
              />
              <SummaryRow
                label={t("sbLiqThreshold")}
                value="90%"
              />
              <SummaryRow
                label={t("sbLiqPrice")}
                value={
                  liquidationPrice > 0
                    ? `$${liquidationPrice.toFixed(4)}`
                    : "--"
                }
              />
              <div
                style={{
                  height: 1,
                  backgroundColor: "var(--border-color)",
                  margin: "4px 0",
                }}
              />
              <SummaryRow label={t("sbInterest")} value="0%" valueColor="var(--sb-green)" />
              <SummaryRow label={t("sbProtocolFee")} value="0%" valueColor="var(--sb-green)" />
            </div>
          </div>

          <button
            className="sb-btn-primary"
            style={{
              width: "100%",
              padding: "14px 24px",
              fontSize: 15,
              opacity: ltv > 0 && ltv < 90 ? 1 : 0.4,
              cursor: ltv > 0 && ltv < 90 ? "pointer" : "not-allowed",
            }}
            disabled={ltv <= 0 || ltv >= 90}
          >
            {t("sbLockBtn")}
          </button>

          <div
            style={{
              padding: 16,
              borderRadius: 8,
              backgroundColor: "var(--sb-accent-muted)",
              border: "1px solid var(--sb-accent)",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--sb-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: 1 }}
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--sb-accent)",
                    marginBottom: 4,
                  }}
                >
                  {t("sbRiskTitle")}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {t("sbRiskText")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: valueColor ?? "var(--text-primary)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}
