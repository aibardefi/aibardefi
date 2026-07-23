"use client";

import { useMemo, useState, useCallback } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function useWalletState() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const shortAddress = useMemo(() => {
    if (!address) return null;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const connectWallet = useCallback(() => {
    connect({ connector: injected() });
  }, [connect]);

  return {
    address,
    connected: isConnected,
    connecting: isConnecting,
    shortAddress,
    connectWallet,
    disconnect,
  };
}

export function useTxSimulation() {
  const [txState, setTxState] = useState<
    "idle" | "signing" | "confirming" | "success" | "error"
  >("idle");
  const [txMessage, setTxMessage] = useState("");

  const simulateTx = useCallback(async (description: string) => {
    setTxState("signing");
    setTxMessage(description);
    await new Promise((r) => setTimeout(r, 1200));
    setTxState("confirming");
    await new Promise((r) => setTimeout(r, 1500));
    setTxState("success");
    setTimeout(() => setTxState("idle"), 3000);
  }, []);

  const resetTx = useCallback(() => {
    setTxState("idle");
    setTxMessage("");
  }, []);

  return { txState, txMessage, simulateTx, resetTx };
}
