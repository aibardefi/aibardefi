"use client";

import { useState, useRef, useCallback } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

type BuySell = "buy" | "sell";
type Frequency = "once" | "daily" | "weekly" | "biweekly" | "monthly";

const FREQUENCY_KEYS: Record<Frequency, TranslationKey> = {
  once: "oneTime",
  daily: "everyDay",
  weekly: "everyWeek",
  biweekly: "every2Weeks",
  monthly: "everyMonth",
};

const QUICK_AMOUNTS = ["10", "25", "50", "100"];

export function MobileSpotOrderScreen({
  side,
  onClose,
  price,
  symbol,
  fullName,
}: {
  side: BuySell;
  onClose: () => void;
  price: number;
  symbol: string;
  fullName: string;
}) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("0");
  const [frequency, setFrequency] = useState<Frequency>("once");
  const [showFrequency, setShowFrequency] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const swipeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const trackWidthRef = useRef(0);

  const isBuy = side === "buy";
  const amountNum = parseFloat(amount) || 0;
  const estimatedQty = amountNum / price;

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
    trackWidthRef.current = swipeRef.current.getBoundingClientRect().width;
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
    } else {
      setSwipeX(0);
    }
    setSwiping(false);
  }, [swiping, swipeX]);

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-bg-primary px-8">
        <div className="w-16 h-16 rounded-full bg-green flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-2xl font-bold mb-2">
          {frequency === "once" ? t("orderPlaced") : t("recurringBuySet")}
        </div>
        <div className="text-text-secondary text-center text-[15px]">
          {isBuy
            ? t("buyingAmount", { amount: amountNum.toLocaleString("en-US", { minimumFractionDigits: 2 }), name: fullName })
            : t("sellingAmount", { amount: amountNum.toLocaleString("en-US", { minimumFractionDigits: 2 }), name: fullName })}
          {frequency !== "once" && (
            <div className="mt-1 text-text-tertiary text-[13px]">
              {t(FREQUENCY_KEYS[frequency])}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-8 px-8 py-3 rounded-full bg-bg-secondary text-[15px] font-semibold active:scale-[0.97] transition-transform"
        >
          {t("done")}
        </button>
      </div>
    );
  }

  if (showReview) {
    return (
      <div className="flex flex-col h-full bg-bg-primary">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-1 pb-0">
          <button onClick={() => setShowReview(false)} className="w-10 h-10 flex items-center justify-center -ml-2">
            <svg width="20" height="20" viewBox="0 0 20 20" className="text-text-primary">
              <path d="M13 4l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="text-[15px] font-semibold">{t("reviewOrder")}</div>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col px-6 pt-8">
          {/* Order summary card */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-bg-tertiary flex items-center justify-center text-lg font-bold mb-4">
              {symbol.charAt(0)}
            </div>
            <div className="text-[13px] text-text-tertiary mb-1">
              {isBuy ? t("buyingName", { name: fullName }) : t("sellingName", { name: fullName })}
            </div>
            <div className="text-[36px] font-bold tracking-tight">
              ${amountNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            {frequency !== "once" && (
              <div className="mt-1 px-3 py-1 rounded-full bg-green/10 text-green text-[12px] font-semibold">
                {t(FREQUENCY_KEYS[frequency])}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <ReviewRow label={t("marketPrice")} value={`$${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
            <ReviewRow label={t("estAmount", { symbol })} value={`${estimatedQty.toFixed(6)} ${symbol}`} />
            <ReviewRow label={t("networkFee")} value="~$0.00" />
            {frequency !== "once" && (
              <ReviewRow label={t("schedule")} value={t(FREQUENCY_KEYS[frequency])} />
            )}
            <div className="border-t border-border/50 pt-4">
              <ReviewRow label={t("total")} value={`$${amountNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} bold />
            </div>
          </div>
        </div>

        {/* Swipe to confirm */}
        <div className="px-6 pb-8 pt-4">
          <div
            ref={swipeRef}
            className="relative h-[56px] rounded-full bg-green/20 overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[14px] font-semibold text-green">
                {isBuy ? t("swipeToBuy") : t("swipeToSell")}
              </span>
            </div>
            <div
              className="absolute top-1 left-1 w-[48px] h-[48px] rounded-full bg-green flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing z-10"
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
          {isBuy ? t("buyName", { symbol }) : t("sellName", { symbol })}
        </div>
        <div className="w-10" />
      </div>

      {/* Frequency toggle */}
      <div className="flex justify-center gap-6 pt-4 pb-1">
        <button
          onClick={() => setFrequency("once")}
          className={`text-[13px] font-semibold pb-1 border-b-2 transition-colors ${
            frequency === "once"
              ? "text-green border-green"
              : "text-text-tertiary border-transparent"
          }`}
        >
          {t("oneTime")}
        </button>
        <button
          onClick={() => setShowFrequency(!showFrequency)}
          className={`text-[13px] font-semibold pb-1 border-b-2 transition-colors flex items-center gap-1 ${
            frequency !== "once"
              ? "text-green border-green"
              : "text-text-tertiary border-transparent"
          }`}
        >
          {t("recurring")}
          <svg
            width="8"
            height="8"
            viewBox="0 0 10 10"
            className={`transition-transform ${showFrequency ? "rotate-180" : ""}`}
          >
            <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>

      {/* Frequency options dropdown */}
      {showFrequency && (
        <div className="px-6 pt-2 pb-1">
          <div className="bg-bg-secondary rounded-2xl overflow-hidden">
            {(["daily", "weekly", "biweekly", "monthly"] as Frequency[]).map((freq) => (
              <button
                key={freq}
                onClick={() => { setFrequency(freq); setShowFrequency(false); }}
                className={`w-full px-4 py-3 text-left text-[14px] font-medium flex items-center justify-between active:bg-bg-hover transition-colors ${
                  frequency === freq ? "text-green" : "text-text-secondary"
                }`}
              >
                {t(FREQUENCY_KEYS[freq])}
                {frequency === freq && (
                  <svg width="16" height="16" viewBox="0 0 24 24" className="text-green">
                    <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recurring badge */}
      {frequency !== "once" && !showFrequency && (
        <div className="flex justify-center pt-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green/10">
            <svg width="12" height="12" viewBox="0 0 24 24" className="text-green">
              <path d="M23 4v6h-6M1 20v-6h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[12px] font-semibold text-green">{t(FREQUENCY_KEYS[frequency])}</span>
          </div>
        </div>
      )}

      {/* Amount display */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="text-[48px] font-bold tracking-tight leading-none">
          ${amount === "0" ? "0" : amount}
        </div>
        <div className="text-[13px] text-text-tertiary mt-2">
          {amountNum > 0
            ? `≈ ${estimatedQty.toFixed(6)} ${symbol}`
            : t("availableBalance")}
        </div>

        {/* Quick amount buttons */}
        <div className="flex gap-2 mt-4">
          {QUICK_AMOUNTS.map((qa) => (
            <button
              key={qa}
              onClick={() => setAmount(qa)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                amount === qa
                  ? "bg-green text-white"
                  : "bg-bg-secondary text-text-tertiary"
              }`}
            >
              ${qa}
            </button>
          ))}
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
                    <path d="M9 18l-6-6 6-6M21 18V6H9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

      {/* Review button */}
      <div className="px-6 pb-8 pt-2">
        <button
          onClick={() => amountNum > 0 && setShowReview(true)}
          className={`w-full py-[14px] rounded-full font-semibold text-[16px] text-white active:scale-[0.97] transition-all ${
            amountNum > 0 ? "bg-green" : "bg-green/30"
          }`}
        >
          {isBuy ? t("reviewBuy") : t("reviewSell")}
        </button>
      </div>
    </div>
  );
}

function ReviewRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={`text-[14px] ${bold ? "font-semibold" : "text-text-tertiary"}`}>{label}</span>
      <span className={`text-[14px] ${bold ? "font-bold" : "font-medium"}`}>{value}</span>
    </div>
  );
}
