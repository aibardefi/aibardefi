"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

const pairs = [
  { symbol: "BTC/USDT", price: 67432.51, change: 2.34 },
  { symbol: "ETH/USDT", price: 3521.87, change: -1.12 },
  { symbol: "SOL/USDT", price: 178.43, change: 5.67 },
  { symbol: "BNB/USDT", price: 598.21, change: 0.89 },
];

export function TradingPairInfo() {
  const { t } = useLanguage();
  const [selectedPair, setSelectedPair] = useState(pairs[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bg-bg-secondary border-b border-border px-4 py-2 flex items-center gap-4 lg:gap-6 overflow-x-auto scrollbar-hide">
      <div className="relative shrink-0">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 hover:bg-bg-tertiary px-2 py-1 rounded transition-colors"
        >
          <span className="text-lg lg:text-xl font-bold whitespace-nowrap">{selectedPair.symbol}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className="text-text-secondary"
          >
            <path
              d="M3 5l3 3 3-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute top-full left-0 mt-1 bg-bg-tertiary border border-border rounded-lg shadow-xl z-20 min-w-[200px]">
              {pairs.map((pair) => (
                <button
                  key={pair.symbol}
                  onClick={() => {
                    setSelectedPair(pair);
                    setShowDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left hover:bg-bg-hover flex justify-between items-center text-sm ${
                    pair.symbol === selectedPair.symbol ? "bg-bg-hover" : ""
                  }`}
                >
                  <span className="font-medium">{pair.symbol}</span>
                  <span
                    className={
                      pair.change >= 0 ? "text-green" : "text-red"
                    }
                  >
                    {pair.change >= 0 ? "+" : ""}
                    {pair.change}%
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-4 lg:gap-6 text-sm shrink-0">
        <div>
          <span
            className={`text-xl lg:text-2xl font-semibold ${
              selectedPair.change >= 0 ? "text-green" : "text-red"
            }`}
          >
            {selectedPair.price.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex flex-col shrink-0">
          <span className="text-text-tertiary text-xs">{t("change24h")}</span>
          <span
            className={selectedPair.change >= 0 ? "text-green" : "text-red"}
          >
            {selectedPair.change >= 0 ? "+" : ""}
            {selectedPair.change}%
          </span>
        </div>
        <div className="flex flex-col shrink-0 hidden sm:flex">
          <span className="text-text-tertiary text-xs">{t("high24h")}</span>
          <span>
            {(selectedPair.price * 1.015).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex flex-col shrink-0 hidden sm:flex">
          <span className="text-text-tertiary text-xs">{t("low24h")}</span>
          <span>
            {(selectedPair.price * 0.975).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex flex-col shrink-0 hidden sm:flex">
          <span className="text-text-tertiary text-xs">{t("volume24h")}</span>
          <span>1.23B USDT</span>
        </div>
      </div>
    </div>
  );
}
