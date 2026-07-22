"use client";

import { useEffect, useState, useCallback } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { useProgram } from "./useProgram";
import { getMarketPda } from "@/lib/pda";
import { PRICE_DECIMALS } from "@/lib/constants";

export interface OrderInfo {
  id: number;
  owner: string;
  side: number;
  orderType: number;
  price: number;
  size: number;
  filled: number;
  leverage: number;
  timestamp: number;
  active: boolean;
}

export interface MarketData {
  authority: string;
  marketIndex: number;
  tickSize: number;
  minOrderSize: number;
  maxLeverage: number;
  quoteMint: string;
  nextOrderId: number;
  bestBid: number;
  bestAsk: number;
  lastTradePrice: number;
  totalVolume: number;
  orderCount: number;
  bids: OrderInfo[];
  asks: OrderInfo[];
}

function parseOrders(orders: unknown[]): OrderInfo[] {
  return orders
    .filter((o: unknown) => {
      const order = o as Record<string, unknown>;
      return order.active;
    })
    .map((o: unknown) => {
      const order = o as Record<string, { toNumber?: () => number; toString?: () => string }>;
      return {
        id: order.id?.toNumber?.() ?? 0,
        owner: order.owner?.toString?.() ?? "",
        side: typeof order.side === "number" ? order.side : (order.side as unknown as number),
        orderType: typeof order.orderType === "number" ? order.orderType : (order.orderType as unknown as number),
        price: order.price?.toNumber?.() ?? 0,
        size: order.size?.toNumber?.() ?? 0,
        filled: order.filled?.toNumber?.() ?? 0,
        leverage: typeof order.leverage === "number" ? order.leverage : (order.leverage as unknown as number),
        timestamp: order.timestamp?.toNumber?.() ?? 0,
        active: true,
      };
    });
}

export function useMarket(marketIndex: number) {
  const program = useProgram();
  const { connection } = useConnection();
  const [market, setMarket] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMarket = useCallback(async () => {
    if (!program) {
      setLoading(false);
      return;
    }

    try {
      const [marketPda] = getMarketPda(marketIndex);
      const data = await (program.account as Record<string, { fetch: (key: PublicKey) => Promise<unknown> }>).market.fetch(marketPda);
      const d = data as Record<string, { toNumber?: () => number; toString?: () => string }>;

      const allOrders = parseOrders(d.orders as unknown as unknown[]);

      setMarket({
        authority: d.authority?.toString?.() ?? "",
        marketIndex: typeof d.marketIndex === "number" ? d.marketIndex : (d.marketIndex as unknown as number),
        tickSize: d.tickSize?.toNumber?.() ?? 0,
        minOrderSize: d.minOrderSize?.toNumber?.() ?? 0,
        maxLeverage: typeof d.maxLeverage === "number" ? d.maxLeverage : (d.maxLeverage as unknown as number),
        quoteMint: d.quoteMint?.toString?.() ?? "",
        nextOrderId: d.nextOrderId?.toNumber?.() ?? 0,
        bestBid: d.bestBid?.toNumber?.() ?? 0,
        bestAsk: d.bestAsk?.toNumber?.() ?? 0,
        lastTradePrice: d.lastTradePrice?.toNumber?.() ?? 0,
        totalVolume: Number(d.totalVolume ?? 0),
        orderCount: typeof d.orderCount === "number" ? d.orderCount : (d.orderCount as unknown as number),
        bids: allOrders.filter((o) => o.side === 0 && o.size > o.filled).sort((a, b) => b.price - a.price),
        asks: allOrders.filter((o) => o.side === 1 && o.size > o.filled).sort((a, b) => a.price - b.price),
      });
    } catch {
      setMarket(null);
    } finally {
      setLoading(false);
    }
  }, [program, marketIndex, connection]);

  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 5000);
    return () => clearInterval(interval);
  }, [fetchMarket]);

  return { market, loading, refetch: fetchMarket };
}

export function formatPrice(raw: number): string {
  return (raw / PRICE_DECIMALS).toFixed(2);
}

export function toRawPrice(usd: number): number {
  return Math.round(usd * PRICE_DECIMALS);
}
