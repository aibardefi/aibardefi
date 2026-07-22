"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useMarket, formatPrice } from "@/hooks/useMarket";
import { PRICE_DECIMALS } from "@/lib/constants";

type Order = { price: string; amount: string; total: string };

function generateMockOrders(basePrice: number, side: "ask" | "bid", count: number) {
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const offset = (i + 1) * (Math.random() * 5 + 1);
    const price = side === "ask" ? basePrice + offset : basePrice - offset;
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
  const { connected } = useWallet();
  const { market } = useMarket(0);

  const [mockAsks, setMockAsks] = useState<Order[]>([]);
  const [mockBids, setMockBids] = useState<Order[]>([]);

  useEffect(() => {
    if (!connected || !market) {
      setMockAsks(generateMockOrders(BASE_PRICE, "ask", 12));
      setMockBids(generateMockOrders(BASE_PRICE, "bid", 12));
    }
  }, [connected, market]);

  const asks: Order[] = connected && market && market.asks.length > 0
    ? market.asks.map((o) => ({
        price: formatPrice(o.price),
        amount: ((o.size - o.filled) / PRICE_DECIMALS).toFixed(5),
        total: ((o.price * (o.size - o.filled)) / PRICE_DECIMALS / PRICE_DECIMALS).toFixed(2),
      }))
    : mockAsks;

  const bids: Order[] = connected && market && market.bids.length > 0
    ? market.bids.map((o) => ({
        price: formatPrice(o.price),
        amount: ((o.size - o.filled) / PRICE_DECIMALS).toFixed(5),
        total: ((o.price * (o.size - o.filled)) / PRICE_DECIMALS / PRICE_DECIMALS).toFixed(2),
      }))
    : mockBids;

  const midPrice = connected && market && market.lastTradePrice > 0
    ? market.lastTradePrice / PRICE_DECIMALS
    : BASE_PRICE;

  const maxTotal = Math.max(
    ...asks.map((o) => parseFloat(o.total)),
    ...bids.map((o) => parseFloat(o.total)),
    1
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("orderBook")}</h3>
        {connected && market && (
          <span className="text-xs text-text-tertiary">
            {market.orderCount} orders
          </span>
        )}
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
                style={{ width: `${(parseFloat(order.total) / maxTotal) * 100}%` }}
              />
              <span className="text-red relative z-10">
                {parseFloat(order.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-right relative z-10">{order.amount}</span>
              <span className="text-right text-text-secondary relative z-10">
                {parseFloat(order.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>

        <div className="px-3 py-2 border-y border-border flex items-center gap-2">
          <span className="text-lg font-semibold text-green">
            {midPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-text-secondary">
            ${midPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
                style={{ width: `${(parseFloat(order.total) / maxTotal) * 100}%` }}
              />
              <span className="text-green relative z-10">
                {parseFloat(order.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-right relative z-10">{order.amount}</span>
              <span className="text-right text-text-secondary relative z-10">
                {parseFloat(order.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
