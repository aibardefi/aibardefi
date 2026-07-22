"use client";

import { useEffect, useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useProgram } from "./useProgram";
import { getMarketPda, getUserAccountPda } from "@/lib/pda";
import { PRICE_DECIMALS } from "@/lib/constants";

export interface UserAccountData {
  owner: string;
  balance: number;
  lockedMargin: number;
  realizedPnl: number;
  available: number;
}

export function useUserAccount(marketIndex: number) {
  const program = useProgram();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [account, setAccount] = useState<UserAccountData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccount = useCallback(async () => {
    if (!program || !publicKey) {
      setAccount(null);
      setLoading(false);
      return;
    }

    try {
      const [marketPda] = getMarketPda(marketIndex);
      const [userPda] = getUserAccountPda(marketPda, publicKey);
      const data = await (program.account as Record<string, { fetch: (key: PublicKey) => Promise<unknown> }>).userAccount.fetch(userPda);
      const d = data as Record<string, { toNumber?: () => number; toString?: () => string }>;

      const balance = d.balance?.toNumber?.() ?? 0;
      const lockedMargin = d.lockedMargin?.toNumber?.() ?? 0;
      const realizedPnl = d.realizedPnl?.toNumber?.() ?? 0;

      setAccount({
        owner: d.owner?.toString?.() ?? "",
        balance,
        lockedMargin,
        realizedPnl,
        available: balance - lockedMargin,
      });
    } catch {
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey, marketIndex, connection]);

  useEffect(() => {
    fetchAccount();
    const interval = setInterval(fetchAccount, 5000);
    return () => clearInterval(interval);
  }, [fetchAccount]);

  return { account, loading, refetch: fetchAccount };
}

export function formatBalance(raw: number): string {
  return (raw / PRICE_DECIMALS).toFixed(2);
}
