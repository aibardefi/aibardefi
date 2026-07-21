"use client";

import { useState } from "react";
import { PriceChart } from "./PriceChart";
import { MobileOrderSheet } from "./MobileOrderSheet";

const TIME_PERIODS = ["1m", "5m", "15m", "1h", "4h", "1D"] as const;

const pairs = [
  { symbol: "BTC/USDT", price: 67432.51, change: 2.34 },
  { symbol: "ETH/USDT", price: 3521.87, change: -1.12 },
  { symbol: "SOL/USDT", price: 178.43, change: 5.67 },
];

function generateOrderBookPreview() {
  const basePrice = 67432.51;
  const asks = [];
  const bids = [];
  for (let i = 0; i < 5; i++) {
    const askOffset = (i + 1) * (Math.random() * 5 + 1);
    const bidOffset = (i + 1) * (Math.random() * 5 + 1);
    asks.push({
      price: basePrice + askOffset,
      size: Math.random() * 2 + 0.01,
    });
    bids.push({
      price: basePrice - bidOffset,
      size: Math.random() * 2 + 0.01,
    });
  }
  return { asks: asks.reverse(), bids, spread: asks[asks.length - 1].price - bids[0].price };
}

const orderBookData = generateOrderBookPreview();

export function MobileTradeView() {
  const [selectedPair, setSelectedPair] = useState(pairs[0]);
  const [showPairPicker, setShowPairPicker] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("15m");
  const [orderSheet, setOrderSheet] = useState<"long" | "short" | null>(null);

  const price = selectedPair.price;
  const change = selectedPair.change;
  const isPositive = change >= 0;

  return (
    <>
      <div className="flex flex-col h-full overflow-y-auto pb-20">
        {/* Pair selector + Price */}
        <div className="px-4 pt-3 pb-1">
          <div className="relative inline-block">
            <button
              onClick={() => setShowPairPicker(!showPairPicker)}
              className="flex items-center gap-1.5 text-sm font-medium text-text-secondary"
            >
              {selectedPair.symbol}
              <svg width="10" height="10" viewBox="0 0 10 10" className="mt-0.5">
                <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            {showPairPicker && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowPairPicker(false)} />
                <div className="absolute top-full left-0 mt-1 bg-bg-tertiary border border-border rounded-xl shadow-xl z-20 min-w-[160px] overflow-hidden">
                  {pairs.map((pair) => (
                    <button
                      key={pair.symbol}
                      onClick={() => { setSelectedPair(pair); setShowPairPicker(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm flex justify-between items-center hover:bg-bg-hover ${
                        pair.symbol === selectedPair.symbol ? "bg-bg-hover" : ""
                      }`}
                    >
                      <span className="font-medium">{pair.symbol}</span>
                      <span className={pair.change >= 0 ? "text-green" : "text-red"}>
                        {pair.change >= 0 ? "+" : ""}{pair.change}%
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="text-3xl font-bold tracking-tight mt-1">
            ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className={`text-sm font-medium mt-0.5 ${isPositive ? "text-green" : "text-red"}`}>
            {isPositive ? "+" : ""}{change}% today
          </div>
        </div>

        {/* Chart */}
        <div className="h-[240px] px-2">
          <PriceChart />
        </div>

        {/* Time period selectors */}
        <div className="flex gap-1 px-4 py-2">
          {TIME_PERIODS.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-colors ${
                selectedPeriod === period
                  ? "bg-green text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 px-4 py-3 border-t border-border">
          <div>
            <div className="text-xs text-text-tertiary">24h Volume</div>
            <div className="text-sm font-medium mt-0.5">1.23B</div>
          </div>
          <div>
            <div className="text-xs text-text-tertiary">24h High</div>
            <div className="text-sm font-medium mt-0.5">
              {(price * 1.015).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-tertiary">24h Low</div>
            <div className="text-sm font-medium mt-0.5">
              {(price * 0.975).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Compact order book */}
        <div className="px-4 py-3 border-t border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Order Book</span>
            <span className="text-xs text-text-tertiary">
              Spread: {orderBookData.spread.toFixed(2)}
            </span>
          </div>
          <div className="flex gap-3">
            {/* Bids */}
            <div className="flex-1">
              {orderBookData.bids.map((bid, i) => (
                <div key={i} className="flex justify-between py-0.5 text-xs">
                  <span className="text-green">
                    {bid.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-text-secondary">{bid.size.toFixed(4)}</span>
                </div>
              ))}
            </div>
            {/* Asks */}
            <div className="flex-1">
              {orderBookData.asks.map((ask, i) => (
                <div key={i} className="flex justify-between py-0.5 text-xs">
                  <span className="text-red">
                    {ask.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-text-secondary">{ask.size.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Position info placeholder */}
        <div className="px-4 py-3 border-t border-border">
          <div className="text-sm font-medium mb-2">Your Position</div>
          <div className="bg-bg-tertiary rounded-xl p-4 text-center">
            <div className="text-sm text-text-secondary">No open position</div>
            <div className="text-xs text-text-tertiary mt-1">
              Open a long or short to start trading
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom trade buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-border px-4 py-3 flex gap-3 z-30 lg:hidden">
        <button
          onClick={() => setOrderSheet("long")}
          className="flex-1 py-3 rounded-xl bg-green text-white font-semibold text-base active:opacity-80 transition-opacity"
        >
          Long
        </button>
        <button
          onClick={() => setOrderSheet("short")}
          className="flex-1 py-3 rounded-xl bg-red text-white font-semibold text-base active:opacity-80 transition-opacity"
        >
          Short
        </button>
      </div>

      {/* Order entry bottom sheet */}
      {orderSheet && (
        <MobileOrderSheet
          side={orderSheet}
          onClose={() => setOrderSheet(null)}
          price={price}
        />
      )}
    </>
  );
}
