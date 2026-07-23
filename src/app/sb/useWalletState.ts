"use client";

import { useMemo, useCallback } from "react";
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain, useChainId } from "wagmi";
import { injected } from "wagmi/connectors";
import { formatUnits } from "viem";
import { robinhoodChain } from "@/lib/sb/chain";
import { useSbBalance } from "@/lib/sb/useContractActions";

export function useWalletState() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const { data: ethBalance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  const sbBalance = useSbBalance();

  const isWrongChain = isConnected && chainId !== robinhoodChain.id;

  const shortAddress = useMemo(() => {
    if (!address) return null;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const connectWallet = useCallback(() => {
    connect({ connector: injected() });
  }, [connect]);

  const switchToRobinhood = useCallback(() => {
    switchChain({ chainId: robinhoodChain.id });
  }, [switchChain]);

  return {
    address,
    connected: isConnected,
    connecting: isConnecting,
    shortAddress,
    connectWallet,
    disconnect,
    isWrongChain,
    switchToRobinhood,
    ethBalance: ethBalance ? formatUnits(ethBalance.value, ethBalance.decimals) : "0",
    ethSymbol: ethBalance?.symbol ?? "ETH",
    sbBalance,
    chainName: robinhoodChain.name,
  };
}
