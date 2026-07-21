"use client";

import { useState, useEffect } from "react";

type Side = "long" | "short";
type OrderType = "market" | "limit";

const LEVERAGE_OPTIONS = [1, 2, 5, 10, 20, 50];
const SIZE_PRESETS = [10, 25, 50, 75, 100];

export function MobileOrderSheet({
  side,
  onClose,
  price,
}: {
  side: Side;
  onClose: () => void;
  price: number;
}) {
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [leverage, setLeverage] = useState(10);
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState(price.toString());
  const [sizePercent, setSizePercent] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const isLong = side === "long";
  const accentColor = isLong ? "bg-green" : "bg-red";
  const activePrice = orderType === "market" ? price : parseFloat(limitPrice) || 0;
  const amountNum = parseFloat(amount) || 0;
  const notional = amountNum * activePrice;
  const margin = leverage > 0 ? notional / leverage : 0;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${
          visible ? "opacity-50" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-bg-secondary rounded-t-2xl transition-transform duration-200 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-bg-tertiary rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3">
          <div>
            <span className={`text-lg font-bold ${isLong ? "text-green" : "text-red"}`}>
              {isLong ? "Long" : "Short"} BTC
            </span>
            <span className="text-sm text-text-secondary ml-2">
              ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" className="text-text-secondary">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-6 space-y-4">
          {/* Order type toggle */}
          <div className="flex bg-bg-primary rounded-xl p-1">
            <button
              onClick={() => setOrderType("market")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                orderType === "market" ? "bg-bg-tertiary text-text-primary" : "text-text-secondary"
              }`}
            >
              Market
            </button>
            <button
              onClick={() => setOrderType("limit")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                orderType === "limit" ? "bg-bg-tertiary text-text-primary" : "text-text-secondary"
              }`}
            >
              Limit
            </button>
          </div>

          {/* Limit price input */}
          {orderType === "limit" && (
            <div>
              <label className="text-xs text-text-tertiary mb-1.5 block">Price</label>
              <div className="flex items-center bg-bg-primary border border-border rounded-xl px-4 py-3 focus-within:border-text-secondary transition-colors">
                <span className="text-text-tertiary mr-2">$</span>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="flex-1 bg-transparent text-base outline-none text-text-primary"
                  inputMode="decimal"
                />
              </div>
            </div>
          )}

          {/* Leverage selector */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs text-text-tertiary">Leverage</label>
              <span className="text-xs font-medium">{leverage}x</span>
            </div>
            <div className="flex gap-1.5">
              {LEVERAGE_OPTIONS.map((lev) => (
                <button
                  key={lev}
                  onClick={() => setLeverage(lev)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                    leverage === lev
                      ? `${accentColor} text-white`
                      : "bg-bg-primary text-text-secondary"
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          {/* Size input */}
          <div>
            <label className="text-xs text-text-tertiary mb-1.5 block">Size (BTC)</label>
            <div className="flex items-center bg-bg-primary border border-border rounded-xl px-4 py-3 focus-within:border-text-secondary transition-colors">
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSizePercent(0);
                }}
                placeholder="0.00"
                className="flex-1 bg-transparent text-base outline-none text-text-primary"
                inputMode="decimal"
              />
              <span className="text-sm text-text-tertiary">BTC</span>
            </div>
          </div>

          {/* Size percentage presets */}
          <div className="flex gap-2">
            {SIZE_PRESETS.map((pct) => (
              <button
                key={pct}
                onClick={() => setSizePercent(pct)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  sizePercent === pct
                    ? `${accentColor} text-white`
                    : "bg-bg-primary text-text-secondary"
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Order summary */}
          <div className="bg-bg-primary rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-tertiary">Notional Value</span>
              <span>${notional.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-tertiary">Required Margin</span>
              <span>${margin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-tertiary">Leverage</span>
              <span>{leverage}x</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-tertiary">Est. Liq. Price</span>
              <span>
                {amountNum > 0
                  ? `$${(isLong
                      ? activePrice * (1 - 0.9 / leverage)
                      : activePrice * (1 + 0.9 / leverage)
                    ).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "—"}
              </span>
            </div>
          </div>

          {/* Available balance */}
          <div className="flex justify-between text-xs text-text-secondary px-1">
            <span>Available</span>
            <span>0.00 USDT</span>
          </div>

          {/* Submit button */}
          <button
            className={`w-full py-3.5 rounded-xl font-semibold text-base text-white transition-opacity active:opacity-80 ${accentColor}`}
          >
            {isLong ? "Open Long" : "Open Short"}
          </button>
        </div>
      </div>
    </div>
  );
}
