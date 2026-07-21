"use client";

import { useState, useEffect } from "react";

type Side = "long" | "short";
type OrderType = "market" | "limit";

const LEVERAGE_OPTIONS = [1, 2, 5, 10, 20, 50];

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
    setTimeout(onClose, 250);
  };

  const isLong = side === "long";
  const accent = isLong ? "text-green" : "text-red";
  const accentBg = isLong ? "bg-green" : "bg-red";
  const activePrice = orderType === "market" ? price : parseFloat(limitPrice) || 0;
  const amountNum = parseFloat(amount) || 0;
  const notional = amountNum * activePrice;
  const margin = leverage > 0 ? notional / leverage : 0;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-250 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      <div
        className={`absolute bottom-0 left-0 right-0 bg-bg-primary rounded-t-3xl transition-transform duration-250 ease-out max-h-[92vh] overflow-y-auto ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-bg-primary z-10">
          <div className="w-9 h-1 bg-text-tertiary/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div className="text-xl font-bold">
            <span className={accent}>{isLong ? "Long" : "Short"}</span>
            {" "}BTC
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-bg-tertiary flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-text-secondary">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-8 space-y-5">
          {/* Order type */}
          <div className="flex bg-bg-secondary rounded-full p-1">
            <button
              onClick={() => setOrderType("market")}
              className={`flex-1 py-2.5 text-[13px] font-semibold rounded-full transition-all ${
                orderType === "market" ? "bg-bg-tertiary text-text-primary shadow-sm" : "text-text-tertiary"
              }`}
            >
              Market
            </button>
            <button
              onClick={() => setOrderType("limit")}
              className={`flex-1 py-2.5 text-[13px] font-semibold rounded-full transition-all ${
                orderType === "limit" ? "bg-bg-tertiary text-text-primary shadow-sm" : "text-text-tertiary"
              }`}
            >
              Limit
            </button>
          </div>

          {/* Limit price */}
          {orderType === "limit" && (
            <div>
              <label className="text-[13px] text-text-tertiary mb-2 block font-medium">Price</label>
              <div className="flex items-center bg-bg-secondary rounded-2xl px-5 py-4">
                <span className="text-text-tertiary text-lg mr-1">$</span>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="flex-1 bg-transparent text-lg font-medium outline-none text-text-primary"
                  inputMode="decimal"
                />
              </div>
            </div>
          )}

          {/* Leverage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-text-tertiary font-medium">Leverage</span>
              <span className={`text-[13px] font-bold ${accent}`}>{leverage}x</span>
            </div>
            <div className="flex gap-2">
              {LEVERAGE_OPTIONS.map((lev) => (
                <button
                  key={lev}
                  onClick={() => setLeverage(lev)}
                  className={`flex-1 py-2.5 text-[13px] font-semibold rounded-xl transition-all ${
                    leverage === lev
                      ? `${accentBg} text-white`
                      : "bg-bg-secondary text-text-tertiary"
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[13px] text-text-tertiary mb-2 block font-medium">Amount</label>
            <div className="flex items-center bg-bg-secondary rounded-2xl px-5 py-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent text-lg font-medium outline-none text-text-primary"
                inputMode="decimal"
              />
              <span className="text-sm text-text-tertiary font-medium ml-2">BTC</span>
            </div>
            {/* Quick percentages */}
            <div className="flex gap-2 mt-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  className="flex-1 py-1.5 text-xs font-medium text-text-tertiary bg-bg-secondary rounded-lg"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="space-y-3 pt-1">
            <SummaryRow label="Market Price" value={`$${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
            <SummaryRow label="Notional" value={`$${notional.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
            <SummaryRow label="Margin Required" value={`$${margin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
            <SummaryRow
              label="Est. Liquidation"
              value={amountNum > 0
                ? `$${(isLong
                    ? activePrice * (1 - 0.9 / leverage)
                    : activePrice * (1 + 0.9 / leverage)
                  ).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "—"}
            />
            <div className="flex justify-between pt-1">
              <span className="text-[13px] text-text-tertiary">Available Balance</span>
              <span className="text-[13px] font-medium">$0.00</span>
            </div>
          </div>

          {/* Submit */}
          <button
            className={`w-full py-4 rounded-full font-semibold text-[16px] text-white active:scale-[0.98] transition-transform ${accentBg}`}
          >
            {isLong ? "Open Long" : "Open Short"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[13px] text-text-tertiary">{label}</span>
      <span className="text-[13px] font-medium">{value}</span>
    </div>
  );
}
