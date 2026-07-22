"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useProgram } from "./useProgram";
import { getMarketPda, getUserAccountPda } from "@/lib/pda";

export function useCancelOrder(marketIndex: number) {
  const program = useProgram();
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);

  const cancelOrder = useCallback(
    async (orderId: number) => {
      if (!program || !publicKey) throw new Error("Wallet not connected");
      setLoading(true);

      try {
        const [marketPda] = getMarketPda(marketIndex);
        const [userAccountPda] = getUserAccountPda(marketPda, publicKey);

        const tx = await (program.methods as Record<string, (...args: unknown[]) => {
          accounts: (a: Record<string, PublicKey>) => { rpc: () => Promise<string> }
        }>)
          .cancelOrder(new BN(orderId))
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

  return { cancelOrder, loading };
}
