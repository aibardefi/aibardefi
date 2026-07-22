"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import { useProgram } from "./useProgram";
import { getMarketPda, getVaultPda, getUserAccountPda } from "@/lib/pda";
import { DEVNET_USDC_MINT } from "@/lib/constants";

export function useWithdraw(marketIndex: number) {
  const program = useProgram();
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);

  const withdraw = useCallback(
    async (amount: number) => {
      if (!program || !publicKey) throw new Error("Wallet not connected");
      setLoading(true);

      try {
        const [marketPda] = getMarketPda(marketIndex);
        const [vaultPda] = getVaultPda(marketIndex);
        const [userAccountPda] = getUserAccountPda(marketPda, publicKey);
        const userAta = await getAssociatedTokenAddress(
          DEVNET_USDC_MINT,
          publicKey
        );

        const tx = await (program.methods as Record<string, (...args: unknown[]) => {
          accounts: (a: Record<string, PublicKey>) => { rpc: () => Promise<string> }
        }>)
          .withdraw(new BN(amount))
          .accounts({
            market: marketPda,
            userAccount: userAccountPda,
            quoteVault: vaultPda,
            userTokenAccount: userAta,
            owner: publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();

        return tx;
      } finally {
        setLoading(false);
      }
    },
    [program, publicKey, marketIndex]
  );

  return { withdraw, loading };
}
