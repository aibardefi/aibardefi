"use client";

import { useState } from "react";
import { PriceChart } from "./PriceChart";
import { OrderBook } from "./OrderBook";
import { TradeForm } from "./TradeForm";
import { RecentTrades } from "./RecentTrades";

const tabs = ["Chart", "Order Book", "Trade", "Trades"] as const;
type Tab = (typeof tabs)[number];

export function MobileTradeView() {
  const [activeTab, setActiveTab] = useState<Tab>("Trade");

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border bg-bg-secondary shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab
                ? "text-text-primary border-b-2 border-green"
                : "text-text-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 bg-bg-secondary">
        {activeTab === "Chart" && (
          <div className="h-full flex flex-col">
            <div className="px-3 py-2 border-b border-border flex items-center gap-4">
              <span className="text-xs text-text-secondary">1m</span>
              <span className="text-xs text-text-secondary">5m</span>
              <span className="text-xs text-green">15m</span>
              <span className="text-xs text-text-secondary">1h</span>
              <span className="text-xs text-text-secondary">4h</span>
              <span className="text-xs text-text-secondary">1D</span>
            </div>
            <div className="flex-1 min-h-0 p-1">
              <PriceChart />
            </div>
          </div>
        )}
        {activeTab === "Order Book" && <OrderBook />}
        {activeTab === "Trade" && <TradeForm />}
        {activeTab === "Trades" && <RecentTrades />}
      </div>
    </div>
  );
}
