"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { usePlaceOrder } from "@/hooks/usePlaceOrder";
import { useUserAccount, formatBalance } from "@/hooks/useUserAccount";
import { toRawPrice, formatPrice } from "@/hooks/useMarket";
import { PRICE_DECIMALS } from "@/lib/constants";

type Side = "buy" | "sell";
type OrderType = "limit" | "market";

const SLIDER_MARKS = [0, 25, 50, 75, 100];

export function TradeForm() {
  const { t } = useLanguage();
  const { connected } = useWallet();
  const { placeOrder, loading: orderLoading } = usePlaceOrder(0);
  const { account, refetch } = useUserAccount(0);

  const [side, setSide] = useState<Side>("buy");
  const [orderType, setOrderType] = useState<OrderType>("limit");
  const [price, setPrice] = useState("67432.51");
  const [amount, setAmount] = useState("");
  const [sliderValue, setSliderValue] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const total =
    price && amount
      ? (parseFloat(price) * parseFloat(amount)).toFixed(2)
      : "0.00";

  const available = account ? formatBalance(account.available) : "0.00";

  const handleSubmit = async () => {
    if (!connected) return;
    if (!price || !amount) return;

    setStatus(null);
    try {
      await placeOrder({
        side: side === "buy" ? "long" : "short",
        price: toRawPrice(parseFloat(price)),
        size: Math.round(parseFloat(amount) * PRICE_DECIMALS),
        orderType,
        leverage: 1,
      });
      setStatus("Order placed!");
      setAmount("");
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setStatus(msg);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-sm font-medium">{t("placeOrder")}</h3>
      </div>

      <div className="p-3 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-1 bg-bg-primary rounded p-0.5">
          <button
            onClick={() => setSide("buy")}
            className={`py-1.5 text-sm font-medium rounded transition-colors ${
              side === "buy"
                ? "bg-green text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {t("buy")}
          </button>
          <button
            onClick={() => setSide("sell")}
            className={`py-1.5 text-sm font-medium rounded transition-colors ${
              side === "sell"
                ? "bg-red text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {t("sell")}
          </button>
        </div>

        <div className="flex gap-4 text-sm">
          <button
            onClick={() => setOrderType("limit")}
            className={`pb-1 border-b-2 transition-colors ${
              orderType === "limit"
                ? "border-yellow text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {t("limit")}
          </button>
          <button
            onClick={() => setOrderType("market")}
            className={`pb-1 border-b-2 transition-colors ${
              orderType === "market"
                ? "border-yellow text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {t("market")}
          </button>
        </div>

        {orderType === "limit" && (
          <div>
            <label className="text-xs text-text-tertiary mb-1 block">
              {t("price")}
            </label>
            <div className="flex items-center bg-bg-primary border border-border rounded px-3 py-2 focus-within:border-yellow transition-colors">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-text-primary"
                placeholder={t("price")}
              />
              <span className="text-xs text-text-tertiary ml-2">USDC</span>
            </div>
          </div>
        )}

        <div>
          <label className="text-xs text-text-tertiary mb-1 block">
            {t("amount")}
          </label>
          <div className="flex items-center bg-bg-primary border border-border rounded px-3 py-2 focus-within:border-yellow transition-colors">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-text-primary"
              placeholder={t("amount")}
            />
            <span className="text-xs text-text-tertiary ml-2">BTC</span>
          </div>
        </div>

        <div className="flex items-center gap-1 px-1">
          {SLIDER_MARKS.map((mark) => (
            <button
              key={mark}
              onClick={() => setSliderValue(mark)}
              className={`flex-1 h-1 rounded-full transition-colors ${
                sliderValue >= mark
                  ? side === "buy"
                    ? "bg-green"
                    : "bg-red"
                  : "bg-bg-tertiary"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-text-tertiary px-1">
          {SLIDER_MARKS.map((mark) => (
            <button
              key={mark}
              onClick={() => setSliderValue(mark)}
              className="hover:text-text-primary transition-colors"
            >
              {mark}%
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs text-text-tertiary mb-1 block">
            {t("total")}
          </label>
          <div className="flex items-center bg-bg-primary border border-border rounded px-3 py-2">
            <span className="flex-1 text-sm text-text-secondary">
              {parseFloat(total).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs text-text-tertiary ml-2">USDC</span>
          </div>
        </div>

        <div className="flex justify-between text-xs text-text-secondary">
          <span>{t("available")}</span>
          <span>{available} USDC</span>
        </div>

        {status && (
          <div className={`text-xs px-2 py-1.5 rounded ${
            status.includes("placed") ? "bg-green/10 text-green" : "bg-red/10 text-red"
          }`}>
            {status}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={orderLoading || !amount}
          className={`w-full py-2.5 rounded font-medium text-sm text-white transition-colors disabled:opacity-50 ${
            side === "buy"
              ? "bg-green hover:bg-green-hover"
              : "bg-red hover:bg-red-hover"
          }`}
        >
          {orderLoading
            ? "Submitting..."
            : connected
            ? side === "buy"
              ? t("buySymbol", { symbol: "BTC" })
              : t("sellSymbol", { symbol: "BTC" })
            : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
}
