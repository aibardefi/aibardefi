"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

type Order = { price: string; amount: string; total: string };

function generateOrders(basePrice: number, side: "ask" | "bid", count: number) {
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const offset = (i + 1) * (Math.random() * 5 + 1);
    const price =
      side === "ask" ? basePrice + offset : basePrice - offset;
    const amount = Math.random() * 2 + 0.001;
    const total = price * amount;
    orders.push({
      price: price.toFixed(2),
      amount: amount.toFixed(5),
      total: total.toFixed(2),
    });
  }
  return side === "ask" ? orders.reverse() : orders;
}

const BASE_PRICE = 67432.51;

export function OrderBook() {
  const { t } = useLanguage();
  const [asks, setAsks] = useState<Order[]>([]);
  const [bids, setBids] = useState<Order[]>([]);
  const [maxTotal, setMaxTotal] = useState(1);

  useEffect(() => {
    const a = generateOrders(BASE_PRICE, "ask", 12);
    const b = generateOrders(BASE_PRICE, "bid", 12);
    setAsks(a);
    setBids(b);
    setMaxTotal(
      Math.max(
        ...a.map((o) => parseFloat(o.total)),
        ...b.map((o) => parseFloat(o.total))
      )
    );
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-sm font-medium">{t("orderBook")}</h3>
      </div>

      <div className="grid grid-cols-3 px-3 py-1.5 text-xs text-text-tertiary border-b border-border">
        <span>{t("priceUsdt")}</span>
        <span className="text-right">{t("amountBtc")}</span>
        <span className="text-right">{t("total")}</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <div className="flex-1 flex flex-col justify-end px-1">
          {asks.map((order, i) => (
            <div
              key={`ask-${i}`}
              className="relative grid grid-cols-3 px-2 py-0.5 text-xs hover:bg-bg-hover cursor-pointer"
            >
              <div
                className="absolute right-0 top-0 bottom-0 bg-red/10"
                style={{
                  width: `${(parseFloat(order.total) / maxTotal) * 100}%`,
                }}
              />
              <span className="text-red relative z-10">
                {parseFloat(order.price).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span className="text-right relative z-10">{order.amount}</span>
              <span className="text-right text-text-secondary relative z-10">
                {parseFloat(order.total).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>

        <div className="px-3 py-2 border-y border-border flex items-center gap-2">
          <span className="text-lg font-semibold text-green">
            {BASE_PRICE.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-text-secondary">
            ${BASE_PRICE.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex-1 px-1">
          {bids.map((order, i) => (
            <div
              key={`bid-${i}`}
              className="relative grid grid-cols-3 px-2 py-0.5 text-xs hover:bg-bg-hover cursor-pointer"
            >
              <div
                className="absolute right-0 top-0 bottom-0 bg-green/10"
                style={{
                  width: `${(parseFloat(order.total) / maxTotal) * 100}%`,
                }}
              />
              <span className="text-green relative z-10">
                {parseFloat(order.price).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span className="text-right relative z-10">{order.amount}</span>
              <span className="text-right text-text-secondary relative z-10">
                {parseFloat(order.total).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
