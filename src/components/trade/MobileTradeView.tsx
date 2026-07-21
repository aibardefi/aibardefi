"use client";

import { useState } from "react";
import { LineChart } from "./LineChart";
import { MobileOrderScreen } from "./MobileOrderScreen";
import { MobileSpotOrderScreen } from "./MobileSpotOrderScreen";
import { useLanguage } from "@/i18n/LanguageContext";

const TIME_PERIODS = ["1D", "1W", "1M", "3M", "1Y", "ALL"] as const;

type TradeMode = "spot" | "perps";

const pairs = [
  { symbol: "BTC", full: "Bitcoin", price: 67432.51, change: 1573.82, changePct: 2.34 },
  { symbol: "ETH", full: "Ethereum", price: 3521.87, change: -39.84, changePct: -1.12 },
  { symbol: "SOL", full: "Solana", price: 178.43, change: 9.56, changePct: 5.67 },
];

export function MobileTradeView() {
  const { t } = useLanguage();
  const [selectedPair, setSelectedPair] = useState(pairs[0]);
  const [showPairPicker, setShowPairPicker] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1D");
  const [tradeMode, setTradeMode] = useState<TradeMode>("spot");
  const [orderScreen, setOrderScreen] = useState<"long" | "short" | "buy" | "sell" | null>(null);

  const isPositive = selectedPair.changePct >= 0;
  const accentColor = isPositive ? "text-green" : "text-red";

  if (orderScreen === "long" || orderScreen === "short") {
    return (
      <MobileOrderScreen
        side={orderScreen}
        onClose={() => setOrderScreen(null)}
        price={selectedPair.price}
        symbol={selectedPair.symbol}
      />
    );
  }

  if (orderScreen === "buy" || orderScreen === "sell") {
    return (
      <MobileSpotOrderScreen
        side={orderScreen}
        onClose={() => setOrderScreen(null)}
        price={selectedPair.price}
        symbol={selectedPair.symbol}
        fullName={selectedPair.full}
      />
    );
  }

  const descKey = selectedPair.symbol === "BTC" ? "btcDesc" : selectedPair.symbol === "ETH" ? "ethDesc" : "solDesc";

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Minimal header */}
      <div className="flex items-center justify-between px-4 pt-1 pb-0">
        <button className="w-10 h-10 flex items-center justify-center -ml-2">
          <svg width="20" height="20" viewBox="0 0 20 20" className="text-text-primary">
            <path d="M13 4l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" className="text-text-primary">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="w-10 h-10 flex items-center justify-center -mr-2">
            <svg width="20" height="20" viewBox="0 0 24 24" className="text-text-primary">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-[76px]">
        {/* Asset name + selector */}
        <div className="px-5 pt-2">
          <div className="relative inline-block">
            <button
              onClick={() => setShowPairPicker(!showPairPicker)}
              className="flex items-center gap-1.5"
            >
              <span className="text-[15px] font-semibold">{selectedPair.full}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" className="text-text-tertiary mt-0.5">
                <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            {showPairPicker && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowPairPicker(false)} />
                <div className="absolute top-full left-0 mt-2 bg-bg-secondary rounded-2xl shadow-2xl z-20 min-w-[240px] overflow-hidden py-1 border border-border">
                  {pairs.map((pair) => (
                    <button
                      key={pair.symbol}
                      onClick={() => { setSelectedPair(pair); setShowPairPicker(false); }}
                      className={`w-full px-4 py-3.5 text-left flex items-center gap-3 active:bg-bg-hover transition-colors ${
                        pair.symbol === selectedPair.symbol ? "bg-bg-hover" : ""
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-bg-tertiary flex items-center justify-center text-xs font-bold shrink-0">
                        {pair.symbol.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-semibold">{pair.full}</div>
                        <div className="text-xs text-text-tertiary">{pair.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[14px] font-semibold">
                          ${pair.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs ${pair.changePct >= 0 ? "text-green" : "text-red"}`}>
                          {pair.changePct >= 0 ? "+" : ""}{pair.changePct}%
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Spot / Perps toggle */}
        <div className="px-5 pt-3 pb-1">
          <div className="flex bg-bg-secondary rounded-full p-1 max-w-[200px]">
            <button
              onClick={() => setTradeMode("spot")}
              className={`flex-1 py-1.5 text-[12px] font-semibold rounded-full transition-all ${
                tradeMode === "spot" ? "bg-bg-tertiary text-text-primary shadow-sm" : "text-text-tertiary"
              }`}
            >
              {t("spot")}
            </button>
            <button
              onClick={() => setTradeMode("perps")}
              className={`flex-1 py-1.5 text-[12px] font-semibold rounded-full transition-all ${
                tradeMode === "perps" ? "bg-bg-tertiary text-text-primary shadow-sm" : "text-text-tertiary"
              }`}
            >
              {t("perps")}
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="px-5 pt-2 pb-2">
          <div className="text-[34px] font-bold leading-none tracking-tight">
            ${selectedPair.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`text-[15px] font-medium ${accentColor}`}>
              {isPositive ? "+" : ""}${Math.abs(selectedPair.change).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-[15px] font-medium ${accentColor}`}>
              ({isPositive ? "+" : ""}{selectedPair.changePct}%)
            </span>
            <span className="text-[13px] text-text-tertiary">{t("today")}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[250px] w-full mt-1">
          <LineChart positive={isPositive} />
        </div>

        {/* Time periods */}
        <div className="flex justify-between px-5 pt-3 pb-1">
          {TIME_PERIODS.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`py-2 px-1 text-[13px] font-semibold transition-colors relative ${
                selectedPeriod === period ? accentColor : "text-text-tertiary"
              }`}
            >
              {period}
              {selectedPeriod === period && (
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${isPositive ? "bg-green" : "bg-red"}`} />
              )}
            </button>
          ))}
        </div>

        {/* Your Position / Holdings */}
        <div className="mx-5 mt-5">
          <div className="text-[17px] font-bold mb-3">
            {tradeMode === "spot" ? t("yourHoldings") : t("yourPosition")}
          </div>
          <div className="py-4 text-center">
            <div className="text-[15px] text-text-secondary">
              {t("noHoldings", { name: selectedPair.full })}
            </div>
          </div>
        </div>

        {/* Recurring / DCA callout for spot */}
        {tradeMode === "spot" && (
          <div className="mx-5 mt-2">
            <button
              onClick={() => setOrderScreen("buy")}
              className="w-full flex items-center gap-3 bg-bg-secondary rounded-2xl px-4 py-4 active:bg-bg-hover transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-green/10 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" className="text-green">
                  <path d="M23 4v6h-6M1 20v-6h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="text-[14px] font-semibold">{t("setupRecurring")}</div>
                <div className="text-[12px] text-text-tertiary">{t("recurringDesc", { symbol: selectedPair.symbol })}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 20 20" className="text-text-tertiary shrink-0">
                <path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Key Statistics */}
        <div className="mx-5 mt-5">
          <div className="text-[17px] font-bold mb-1">{t("keyStats")}</div>
          <StatRow label={t("volume24h")} value="$1.23B" />
          <StatRow label={t("highToday")} value={`$${(selectedPair.price * 1.015).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          <StatRow label={t("lowToday")} value={`$${(selectedPair.price * 0.975).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          <StatRow label={t("marketCap")} value="$1.32T" />
          {tradeMode === "perps" && (
            <>
              <StatRow label={t("openInterest")} value="$2.4B" />
              <StatRow label={t("fundingRate")} value="0.0100%" />
              <StatRow label={t("maxLeverage")} value="50x" />
            </>
          )}
        </div>

        {/* About */}
        <div className="mx-5 mt-6 mb-6">
          <div className="text-[17px] font-bold mb-2">{t("about", { name: selectedPair.full })}</div>
          <p className="text-[14px] text-text-secondary leading-[1.6]">
            {t(descKey as "btcDesc" | "ethDesc" | "solDesc")}
          </p>
        </div>
      </div>

      {/* Fixed bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary px-5 pb-4 pt-2 z-30 lg:hidden">
        {tradeMode === "spot" ? (
          <div className="flex gap-3">
            <button
              onClick={() => setOrderScreen("buy")}
              className="flex-1 py-[14px] rounded-full bg-green font-semibold text-[15px] text-white active:scale-[0.97] transition-transform"
            >
              {t("buy")}
            </button>
            <button
              onClick={() => setOrderScreen("sell")}
              className="flex-1 py-[14px] rounded-full bg-red font-semibold text-[15px] text-white active:scale-[0.97] transition-transform"
            >
              {t("sell")}
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setOrderScreen("long")}
              className="flex-1 py-[14px] rounded-full bg-green font-semibold text-[15px] text-white active:scale-[0.97] transition-transform"
            >
              {t("long")}
            </button>
            <button
              onClick={() => setOrderScreen("short")}
              className="flex-1 py-[14px] rounded-full bg-red font-semibold text-[15px] text-white active:scale-[0.97] transition-transform"
            >
              {t("short")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-[14px] border-b border-border/50">
      <span className="text-[14px] text-text-secondary">{label}</span>
      <span className="text-[14px] font-medium">{value}</span>
    </div>
  );
}
