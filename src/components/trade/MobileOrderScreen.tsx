"use client";

import { useState, useRef, useCallback } from "react";

type Side = "long" | "short";
type OrderType = "market" | "limit";

const LEVERAGE_OPTIONS = [1, 2, 5, 10, 20, 50];

export function MobileOrderScreen({
  side,
  onClose,
  price,
  symbol,
}: {
  side: Side;
  onClose: () => void;
  price: number;
  symbol: string;
}) {
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [leverage, setLeverage] = useState(10);
  const [amount, setAmount] = useState("0");
  const [limitPrice, setLimitPrice] = useState(price.toFixed(2));
  const [showLeverage, setShowLeverage] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const swipeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const trackWidthRef = useRef(0);

  const isLong = side === "long";
  const accent = isLong ? "text-green" : "text-red";
  const accentBg = isLong ? "bg-green" : "bg-red";

  const amountNum = parseFloat(amount) || 0;
  const activePrice = orderType === "market" ? price : parseFloat(limitPrice) || 0;
  const notional = amountNum * activePrice;
  const margin = leverage > 0 ? notional / leverage : 0;

  const handleKey = (key: string) => {
    if (key === "backspace") {
      setAmount((prev) => {
        if (prev.length <= 1) return "0";
        return prev.slice(0, -1);
      });
    } else if (key === ".") {
      setAmount((prev) => {
        if (prev.includes(".")) return prev;
        return prev + ".";
      });
    } else {
      setAmount((prev) => {
        if (prev === "0" && key !== ".") return key;
        if (prev.includes(".") && prev.split(".")[1].length >= 2) return prev;
        return prev + key;
      });
    }
  };

  const handleSwipeStart = useCallback((clientX: number) => {
    if (!swipeRef.current) return;
    const track = swipeRef.current;
    trackWidthRef.current = track.getBoundingClientRect().width;
    startXRef.current = clientX;
    setSwiping(true);
    setSwipeX(0);
  }, []);

  const handleSwipeMove = useCallback(
    (clientX: number) => {
      if (!swiping) return;
      const delta = clientX - startXRef.current;
      const maxSwipe = trackWidthRef.current - 56;
      setSwipeX(Math.max(0, Math.min(delta, maxSwipe)));
    },
    [swiping]
  );

  const handleSwipeEnd = useCallback(() => {
    if (!swiping) return;
    const maxSwipe = trackWidthRef.current - 56;
    if (swipeX > maxSwipe * 0.75) {
      setSwipeX(maxSwipe);
      setConfirmed(true);
      setTimeout(onClose, 600);
    } else {
      setSwipeX(0);
    }
    setSwiping(false);
  }, [swiping, swipeX, onClose]);

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-bg-primary px-8">
        <div className={`w-16 h-16 rounded-full ${accentBg} flex items-center justify-center mb-6`}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-2xl font-bold mb-2">Order Placed</div>
        <div className="text-text-secondary text-center">
          {isLong ? "Long" : "Short"} {symbol} · ${amountNum.toLocaleString("en-US", { minimumFractionDigits: 2 })} · {leverage}x
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-1 pb-0">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center -ml-2">
          <svg width="20" height="20" viewBox="0 0 20 20" className="text-text-primary">
            <path d="M13 4l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-[15px] font-semibold">
          <span className={accent}>{isLong ? "Long" : "Short"}</span> {symbol}
        </div>
        <div className="w-10" />
      </div>

      {/* Order type toggle */}
      <div className="flex justify-center gap-6 pt-4 pb-2">
        <button
          onClick={() => setOrderType("market")}
          className={`text-[13px] font-semibold pb-1 border-b-2 transition-colors ${
            orderType === "market"
              ? `${accent} ${isLong ? "border-green" : "border-red"}`
              : "text-text-tertiary border-transparent"
          }`}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType("limit")}
          className={`text-[13px] font-semibold pb-1 border-b-2 transition-colors ${
            orderType === "limit"
              ? `${accent} ${isLong ? "border-green" : "border-red"}`
              : "text-text-tertiary border-transparent"
          }`}
        >
          Limit
        </button>
      </div>

      {/* Limit price input */}
      {orderType === "limit" && (
        <div className="px-8 pt-2 pb-1">
          <div className="flex items-center justify-center bg-bg-secondary rounded-2xl px-4 py-3">
            <span className="text-text-tertiary text-sm mr-1">Limit Price</span>
            <span className="text-sm font-medium ml-auto">$</span>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none text-text-primary w-24 text-right"
              inputMode="decimal"
            />
          </div>
        </div>
      )}

      {/* Leverage selector */}
      <div className="px-6 pt-3">
        <button
          onClick={() => setShowLeverage(!showLeverage)}
          className="flex items-center gap-2 mx-auto"
        >
          <span className={`text-[13px] font-bold ${accent}`}>{leverage}x Leverage</span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className={`text-text-tertiary transition-transform ${showLeverage ? "rotate-180" : ""}`}
          >
            <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        {showLeverage && (
          <div className="flex gap-2 mt-3 px-2">
            {LEVERAGE_OPTIONS.map((lev) => (
              <button
                key={lev}
                onClick={() => { setLeverage(lev); setShowLeverage(false); }}
                className={`flex-1 py-2 text-[12px] font-semibold rounded-xl transition-all ${
                  leverage === lev
                    ? `${accentBg} text-white`
                    : "bg-bg-secondary text-text-tertiary"
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Amount display */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="text-[48px] font-bold tracking-tight leading-none">
          ${amount === "0" ? "0" : amount}
        </div>
        <div className="text-[13px] text-text-tertiary mt-2">
          {amountNum > 0 ? (
            <>≈ {(amountNum / activePrice).toFixed(6)} {symbol} · Margin ${margin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
          ) : (
            `$0.00 available`
          )}
        </div>
      </div>

      {/* Numeric keypad */}
      <div className="px-6 pb-3">
        <div className="grid grid-cols-3 gap-y-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"].map(
            (key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                className="h-[52px] flex items-center justify-center text-xl font-medium active:bg-bg-hover rounded-xl transition-colors"
              >
                {key === "backspace" ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" className="text-text-primary">
                    <path
                      d="M9 18l-6-6 6-6M21 18V6H9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M13 10l4 4M17 10l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  key
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* Swipe to confirm */}
      <div className="px-6 pb-8 pt-2">
        <div
          ref={swipeRef}
          className={`relative h-[56px] rounded-full ${accentBg}/20 overflow-hidden`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-[14px] font-semibold ${accent}`}>
              Swipe to {isLong ? "Open Long" : "Open Short"}
            </span>
          </div>
          <div
            className={`absolute top-1 left-1 w-[48px] h-[48px] rounded-full ${accentBg} flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing z-10`}
            style={{ transform: `translateX(${swipeX}px)`, transition: swiping ? "none" : "transform 0.3s ease" }}
            onTouchStart={(e) => handleSwipeStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleSwipeMove(e.touches[0].clientX)}
            onTouchEnd={handleSwipeEnd}
            onMouseDown={(e) => { e.preventDefault(); handleSwipeStart(e.clientX); }}
            onMouseMove={(e) => { if (swiping) handleSwipeMove(e.clientX); }}
            onMouseUp={handleSwipeEnd}
            onMouseLeave={() => { if (swiping) handleSwipeEnd(); }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12M12 6l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
