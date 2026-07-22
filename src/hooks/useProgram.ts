"use client";

import { useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from "@/lib/idl/orderbook.json";

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;

    const provider = new AnchorProvider(
      connection,
      wallet as never,
      AnchorProvider.defaultOptions()
    );

    return new Program(idl as never, provider);
  }, [connection, wallet]);

  return program;
}
