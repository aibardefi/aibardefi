"use client";

import { useState } from "react";
import { LineChart } from "./LineChart";
import { MobileOrderSheet } from "./MobileOrderSheet";

const TIME_PERIODS = ["1D", "1W", "1M", "3M", "1Y", "ALL"] as const;

const pairs = [
  { symbol: "BTC", full: "Bitcoin", price: 67432.51, change: 1573.82, changePct: 2.34 },
  { symbol: "ETH", full: "Ethereum", price: 3521.87, change: -39.84, changePct: -1.12 },
  { symbol: "SOL", full: "Solana", price: 178.43, change: 9.56, changePct: 5.67 },
];

export function MobileTradeView() {
  const [selectedPair, setSelectedPair] = useState(pairs[0]);
  const [showPairPicker, setShowPairPicker] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1D");
  const [orderSheet, setOrderSheet] = useState<"long" | "short" | null>(null);

  const isPositive = selectedPair.changePct >= 0;

  return (
    <>
      <div className="flex flex-col h-full overflow-y-auto pb-[72px]">
        {/* Header - like Robinhood's asset detail header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-1">
          <div className="relative">
            <button
              onClick={() => setShowPairPicker(!showPairPicker)}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-xs font-bold">
                {selectedPair.symbol.charAt(0)}
              </div>
              <span className="text-base font-semibold">{selectedPair.full}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" className="text-text-tertiary">
                <path d="M3 5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            {showPairPicker && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowPairPicker(false)} />
                <div className="absolute top-full left-0 mt-2 bg-bg-secondary border border-border rounded-2xl shadow-2xl z-20 min-w-[220px] overflow-hidden py-1">
                  {pairs.map((pair) => (
                    <button
                      key={pair.symbol}
                      onClick={() => { setSelectedPair(pair); setShowPairPicker(false); }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-bg-hover transition-colors ${
                        pair.symbol === selectedPair.symbol ? "bg-bg-hover" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-xs font-bold shrink-0">
                        {pair.symbol.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{pair.full}</div>
                        <div className="text-xs text-text-tertiary">{pair.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
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
          {/* Favorite / watchlist star */}
          <button className="w-10 h-10 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" className="text-text-tertiary">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Price display - Robinhood style: big price, change below */}
        <div className="px-5 pt-1 pb-3">
          <div className="text-[36px] font-bold leading-tight tracking-tight">
            ${selectedPair.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-[15px] font-medium ${isPositive ? "text-green" : "text-red"}`}>
              {isPositive ? "+" : ""}${Math.abs(selectedPair.change).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-[15px] font-medium ${isPositive ? "text-green" : "text-red"}`}>
              ({isPositive ? "+" : ""}{selectedPair.changePct}%)
            </span>
            <span className="text-[13px] text-text-tertiary ml-0.5">Today</span>
          </div>
        </div>

        {/* Chart - clean, no axes, no grid - Robinhood style */}
        <div className="h-[260px] w-full">
          <LineChart positive={isPositive} />
        </div>

        {/* Time period selectors - Robinhood style: small text, not pills */}
        <div className="flex justify-between px-5 pt-4 pb-5">
          {TIME_PERIODS.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-[13px] font-semibold rounded-full transition-colors ${
                selectedPeriod === period
                  ? isPositive ? "bg-green/15 text-green" : "bg-red/15 text-red"
                  : "text-text-tertiary"
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Stats section - Robinhood style: clean rows with dividers */}
        <div className="mx-5 rounded-2xl overflow-hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <span className="text-base font-semibold">Stats</span>
          </div>
          <div className="space-y-0">
            <StatRow label="24h Volume" value="$1.23B" />
            <StatRow label="24h High" value={`$${(selectedPair.price * 1.015).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
            <StatRow label="24h Low" value={`$${(selectedPair.price * 0.975).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
            <StatRow label="Market Cap" value="$1.32T" />
            <StatRow label="Open Interest" value="$2.4B" />
            <StatRow label="Funding Rate" value="0.0100%" />
          </div>
        </div>

        {/* About section */}
        <div className="mx-5 mt-6 mb-4">
          <div className="text-base font-semibold mb-3">About {selectedPair.full}</div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {selectedPair.symbol === "BTC"
              ? "Bitcoin is a decentralized digital currency that can be transferred on the peer-to-peer bitcoin network. Transactions are verified by network nodes and recorded in a public ledger called a blockchain."
              : selectedPair.symbol === "ETH"
              ? "Ethereum is a decentralized blockchain platform that establishes a peer-to-peer network for securely executing and verifying smart contracts."
              : "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale."}
          </p>
        </div>
      </div>

      {/* Fixed bottom - Robinhood style: big chunky buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary px-5 py-3 z-30 lg:hidden">
        <div className="flex gap-3">
          <button
            onClick={() => setOrderSheet("long")}
            className="flex-1 py-3.5 rounded-full bg-green text-white font-semibold text-[15px] active:scale-[0.98] transition-transform"
          >
            Long
          </button>
          <button
            onClick={() => setOrderSheet("short")}
            className="flex-1 py-3.5 rounded-full bg-red text-white font-semibold text-[15px] active:scale-[0.98] transition-transform"
          >
            Short
          </button>
        </div>
      </div>

      {orderSheet && (
        <MobileOrderSheet
          side={orderSheet}
          onClose={() => setOrderSheet(null)}
          price={selectedPair.price}
        />
      )}
    </>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
