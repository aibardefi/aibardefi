"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useProgram } from "./useProgram";
import { getMarketPda, getUserAccountPda } from "@/lib/pda";

export function usePlaceOrder(marketIndex: number) {
  const program = useProgram();
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);

  const placeOrder = useCallback(
    async (params: {
      side: "long" | "short";
      price: number;
      size: number;
      orderType: "limit" | "market";
      leverage: number;
    }) => {
      if (!program || !publicKey) throw new Error("Wallet not connected");
      setLoading(true);

      try {
        const [marketPda] = getMarketPda(marketIndex);
        const [userAccountPda] = getUserAccountPda(marketPda, publicKey);

        const side = params.side === "long" ? { long: {} } : { short: {} };
        const orderType =
          params.orderType === "limit" ? { limit: {} } : { market: {} };

        const tx = await (program.methods as Record<string, (...args: unknown[]) => {
          accounts: (a: Record<string, PublicKey>) => { rpc: () => Promise<string> }
        }>)
          .placeOrder(
            side,
            new BN(params.price),
            new BN(params.size),
            orderType,
            params.leverage
          )
          .accounts({
            market: marketPda,
            userAccount: userAccountPda,
            owner: publicKey,
          })
          .rpc();

        return tx;
      } finally {
        setLoading(false);
      }
    },
    [program, publicKey, marketIndex]
  );

  return { placeOrder, loading };
}
