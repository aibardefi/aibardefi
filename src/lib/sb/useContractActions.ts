"use client";

import { useState, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import type { Address } from "viem";
import { COLLATERAL_VAULT_ABI, ERC20_ABI, SB_TOKEN_ABI, PRICE_ORACLE_ABI } from "./abis";
import { CONTRACTS, COLLATERAL_TOKEN_ADDRESSES, DEPLOYED } from "./contracts";

const SB_DECIMALS = 18;
const TOKEN_DECIMALS = 18;

export function useTreasuryData() {
  const { data: treasuryBalance } = useReadContract({
    address: CONTRACTS.collateralVault,
    abi: COLLATERAL_VAULT_ABI,
    functionName: "getTreasuryBalance",
    query: { enabled: DEPLOYED },
  });

  const { data: totalDebt } = useReadContract({
    address: CONTRACTS.collateralVault,
    abi: COLLATERAL_VAULT_ABI,
    functionName: "totalDebtIssued",
    query: { enabled: DEPLOYED },
  });

  const { data: totalPositions } = useReadContract({
    address: CONTRACTS.collateralVault,
    abi: COLLATERAL_VAULT_ABI,
    functionName: "nextPositionId",
    query: { enabled: DEPLOYED },
  });

  const { data: sbTotalSupply } = useReadContract({
    address: CONTRACTS.sbToken,
    abi: SB_TOKEN_ABI,
    functionName: "totalSupply",
    query: { enabled: DEPLOYED },
  });

  return {
    deployed: DEPLOYED,
    treasuryBalance: treasuryBalance ? formatUnits(treasuryBalance, SB_DECIMALS) : null,
    totalDebt: totalDebt ? formatUnits(totalDebt, SB_DECIMALS) : null,
    totalPositions: totalPositions ? Number(totalPositions) : null,
    sbTotalSupply: sbTotalSupply ? formatUnits(sbTotalSupply, SB_DECIMALS) : null,
  };
}

export function useUserPositions() {
  const { address } = useAccount();

  const { data: positionIds } = useReadContract({
    address: CONTRACTS.collateralVault,
    abi: COLLATERAL_VAULT_ABI,
    functionName: "getUserPositionIds",
    args: address ? [address] : undefined,
    query: { enabled: DEPLOYED && !!address },
  });

  return { positionIds: positionIds ?? [] };
}

export function usePositionData(positionId: number) {
  const { data } = useReadContract({
    address: CONTRACTS.collateralVault,
    abi: COLLATERAL_VAULT_ABI,
    functionName: "getPositionDetails",
    args: [BigInt(positionId)],
    query: { enabled: DEPLOYED },
  });

  if (!data) return null;
  const [owner, collateralToken, collateralAmount, debtAmount, ltv, openedAt, active] = data;
  return {
    owner,
    collateralToken,
    collateralAmount: formatUnits(collateralAmount, TOKEN_DECIMALS),
    debtAmount: formatUnits(debtAmount, SB_DECIMALS),
    ltv: Number(ltv) / 100,
    openedAt: Number(openedAt),
    active,
  };
}

export function useLockAndBorrow() {
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [status, setStatus] = useState<"idle" | "approving" | "locking" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const execute = useCallback(async (
    tokenSymbol: string,
    collateralAmount: string,
    sbAmount: string,
  ) => {
    const tokenAddress = COLLATERAL_TOKEN_ADDRESSES[tokenSymbol];
    if (!tokenAddress) throw new Error("Unknown token");

    setStatus("approving");
    setError(null);

    try {
      const collateralWei = parseUnits(collateralAmount, TOKEN_DECIMALS);

      await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACTS.collateralVault, collateralWei],
      });

      setStatus("locking");

      const sbWei = parseUnits(sbAmount, SB_DECIMALS);
      const hash = await writeContractAsync({
        address: CONTRACTS.collateralVault,
        abi: COLLATERAL_VAULT_ABI,
        functionName: "lockAndBorrow",
        args: [tokenAddress, collateralWei, sbWei],
      });

      setTxHash(hash);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Transaction failed");
    }
  }, [writeContractAsync]);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setTxHash(undefined);
  }, []);

  return { execute, status, error, isConfirming, txHash, reset };
}

export function useRepayAndUnlock() {
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [status, setStatus] = useState<"idle" | "approving" | "repaying" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const execute = useCallback(async (positionId: number, debtAmount: string) => {
    setStatus("approving");
    setError(null);

    try {
      const debtWei = parseUnits(debtAmount, SB_DECIMALS);

      await writeContractAsync({
        address: CONTRACTS.sbToken as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACTS.collateralVault, debtWei],
      });

      setStatus("repaying");

      const hash = await writeContractAsync({
        address: CONTRACTS.collateralVault,
        abi: COLLATERAL_VAULT_ABI,
        functionName: "repayAndUnlock",
        args: [BigInt(positionId)],
      });

      setTxHash(hash);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Transaction failed");
    }
  }, [writeContractAsync]);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setTxHash(undefined);
  }, []);

  return { execute, status, error, isConfirming, txHash, reset };
}

export function useTokenBalance(tokenSymbol: string) {
  const { address } = useAccount();
  const tokenAddress = COLLATERAL_TOKEN_ADDRESSES[tokenSymbol];

  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: DEPLOYED && !!address && !!tokenAddress },
  });

  return balance ? formatUnits(balance, TOKEN_DECIMALS) : "0";
}

export function useTokenPrice(tokenSymbol: string) {
  const tokenAddress = COLLATERAL_TOKEN_ADDRESSES[tokenSymbol];

  const { data } = useReadContract({
    address: CONTRACTS.priceOracle,
    abi: PRICE_ORACLE_ABI,
    functionName: "getPrice",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: { enabled: DEPLOYED && !!tokenAddress },
  });

  if (!data) return null;
  const [price] = data;
  return Number(formatUnits(price, 8));
}

export function useSbPrice() {
  const { data } = useReadContract({
    address: CONTRACTS.priceOracle,
    abi: PRICE_ORACLE_ABI,
    functionName: "getPrice",
    args: [CONTRACTS.sbToken],
    query: { enabled: DEPLOYED },
  });

  if (!data) return null;
  const [price] = data;
  return Number(formatUnits(price, 8));
}

export function useVaultParams() {
  const { data: maxLtv } = useReadContract({
    address: CONTRACTS.collateralVault,
    abi: COLLATERAL_VAULT_ABI,
    functionName: "MAX_LTV",
    query: { enabled: DEPLOYED },
  });

  const { data: liqThreshold } = useReadContract({
    address: CONTRACTS.collateralVault,
    abi: COLLATERAL_VAULT_ABI,
    functionName: "LIQUIDATION_THRESHOLD",
    query: { enabled: DEPLOYED },
  });

  return {
    maxLtv: maxLtv ? Number(maxLtv) / 100 : 80,
    liqThreshold: liqThreshold ? Number(liqThreshold) / 100 : 90,
  };
}

export function useSbBalance() {
  const { address } = useAccount();

  const { data: balance } = useReadContract({
    address: CONTRACTS.sbToken,
    abi: SB_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: DEPLOYED && !!address },
  });

  return balance ? formatUnits(balance, SB_DECIMALS) : "0";
}
