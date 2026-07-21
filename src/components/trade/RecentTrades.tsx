"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

type Trade = { price: string; amount: string; time: string; isBuy: boolean };

function generateTrades(count: number) {
  const trades: Trade[] = [];
  let price = 67432.51;
  for (let i = 0; i < count; i++) {
    const isBuy = Math.random() > 0.45;
    price += (Math.random() - 0.48) * 20;
    trades.push({
      price: price.toFixed(2),
      amount: (Math.random() * 0.5 + 0.001).toFixed(5),
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(
        Math.floor(Math.random() * 60)
      ).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(
        2,
        "0"
      )}`,
      isBuy,
    });
  }
  return trades;
}

export function RecentTrades() {
  const { t } = useLanguage();
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    setTrades(generateTrades(25));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-sm font-medium">{t("recentTrades")}</h3>
      </div>

      <div className="grid grid-cols-3 px-3 py-1.5 text-xs text-text-tertiary border-b border-border">
        <span>{t("priceUsdt")}</span>
        <span className="text-right">{t("amountBtc")}</span>
        <span className="text-right">{t("time")}</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {trades.map((trade, i) => (
          <div
            key={i}
            className="grid grid-cols-3 px-3 py-0.5 text-xs hover:bg-bg-hover cursor-pointer"
          >
            <span className={trade.isBuy ? "text-green" : "text-red"}>
              {parseFloat(trade.price).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
            <span className="text-right">{trade.amount}</span>
            <span className="text-right text-text-secondary">{trade.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
