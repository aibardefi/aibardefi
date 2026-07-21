"use client";

import { useState } from "react";
import { LineChart } from "./LineChart";
import { MobileOrderScreen } from "./MobileOrderScreen";

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
  const [orderScreen, setOrderScreen] = useState<"long" | "short" | null>(null);

  const isPositive = selectedPair.changePct >= 0;
  const accentColor = isPositive ? "text-green" : "text-red";

  if (orderScreen) {
    return (
      <MobileOrderScreen
        side={orderScreen}
        onClose={() => setOrderScreen(null)}
        price={selectedPair.price}
        symbol={selectedPair.symbol}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Minimal header - Robinhood style */}
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
            <span className="text-[13px] text-text-tertiary">Today</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[250px] w-full mt-1">
          <LineChart positive={isPositive} />
        </div>

        {/* Time periods - plain text, not pills */}
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

        {/* Your Position - if any */}
        <div className="mx-5 mt-5">
          <div className="text-[17px] font-bold mb-3">Your Position</div>
          <div className="py-4 text-center">
            <div className="text-[15px] text-text-secondary">You don&apos;t own any {selectedPair.full}</div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="mx-5 mt-4">
          <div className="text-[17px] font-bold mb-1">Key Statistics</div>
          <StatRow label="24h Volume" value="$1.23B" />
          <StatRow label="High Today" value={`$${(selectedPair.price * 1.015).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          <StatRow label="Low Today" value={`$${(selectedPair.price * 0.975).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          <StatRow label="Market Cap" value="$1.32T" />
          <StatRow label="Open Interest" value="$2.4B" />
          <StatRow label="Funding Rate" value="0.0100%" />
          <StatRow label="Max Leverage" value="50x" />
        </div>

        {/* About */}
        <div className="mx-5 mt-6 mb-6">
          <div className="text-[17px] font-bold mb-2">About {selectedPair.full}</div>
          <p className="text-[14px] text-text-secondary leading-[1.6]">
            {selectedPair.symbol === "BTC"
              ? "Bitcoin is a decentralized digital currency that can be transferred on the peer-to-peer bitcoin network. Transactions are verified by network nodes through cryptography and recorded in a public distributed ledger called a blockchain."
              : selectedPair.symbol === "ETH"
              ? "Ethereum is a decentralized blockchain platform that establishes a peer-to-peer network for securely executing and verifying application code, called smart contracts."
              : "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale. It processes thousands of transactions per second with minimal fees."}
          </p>
        </div>
      </div>

      {/* Fixed bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary px-5 pb-4 pt-2 z-30 lg:hidden">
        <div className="flex gap-3">
          <button
            onClick={() => setOrderScreen("long")}
            className="flex-1 py-[14px] rounded-full bg-green font-semibold text-[15px] text-white active:scale-[0.97] transition-transform"
          >
            Long
          </button>
          <button
            onClick={() => setOrderScreen("short")}
            className="flex-1 py-[14px] rounded-full bg-red font-semibold text-[15px] text-white active:scale-[0.97] transition-transform"
          >
            Short
          </button>
        </div>
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
