"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUserAccount, formatBalance } from "@/hooks/useUserAccount";
import { useDeposit } from "@/hooks/useDeposit";
import { useWithdraw } from "@/hooks/useWithdraw";
import { PRICE_DECIMALS } from "@/lib/constants";

export function AccountPanel() {
  const { connected } = useWallet();
  const { account, refetch } = useUserAccount(0);
  const { deposit, loading: depositLoading } = useDeposit(0);
  const { withdraw, loading: withdrawLoading } = useWithdraw(0);

  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  if (!connected) {
    return (
      <div className="p-4 text-center text-sm text-text-secondary">
        Connect wallet to manage funds
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!amount) return;
    const raw = Math.round(parseFloat(amount) * PRICE_DECIMALS);
    setStatus(null);

    try {
      if (mode === "deposit") {
        await deposit(raw);
        setStatus("Deposited!");
      } else {
        await withdraw(raw);
        setStatus("Withdrawn!");
      }
      setAmount("");
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setStatus(msg);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-tertiary">Balance</span>
        <span className="text-sm font-medium">
          {account ? formatBalance(account.balance) : "0.00"} USDC
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-tertiary">Locked</span>
        <span className="text-sm text-text-secondary">
          {account ? formatBalance(account.lockedMargin) : "0.00"} USDC
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-tertiary">Available</span>
        <span className="text-sm text-green">
          {account ? formatBalance(account.available) : "0.00"} USDC
        </span>
      </div>

      <div className="border-t border-border pt-3">
        <div className="grid grid-cols-2 gap-1 bg-bg-primary rounded p-0.5 mb-3">
          <button
            onClick={() => setMode("deposit")}
            className={`py-1.5 text-xs font-medium rounded transition-colors ${
              mode === "deposit"
                ? "bg-green text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => setMode("withdraw")}
            className={`py-1.5 text-xs font-medium rounded transition-colors ${
              mode === "withdraw"
                ? "bg-yellow text-black"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Withdraw
          </button>
        </div>

        <div className="flex items-center bg-bg-primary border border-border rounded px-3 py-2 mb-2 focus-within:border-yellow transition-colors">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-text-primary"
            placeholder="Amount"
          />
          <span className="text-xs text-text-tertiary ml-2">USDC</span>
        </div>

        {status && (
          <div className={`text-xs px-2 py-1.5 rounded mb-2 ${
            status.includes("!") ? "bg-green/10 text-green" : "bg-red/10 text-red"
          }`}>
            {status}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={depositLoading || withdrawLoading || !amount}
          className={`w-full py-2 rounded text-sm font-medium text-white transition-colors disabled:opacity-50 ${
            mode === "deposit"
              ? "bg-green hover:bg-green-hover"
              : "bg-yellow hover:opacity-90"
          }`}
        >
          {depositLoading || withdrawLoading
            ? "Processing..."
            : mode === "deposit"
            ? "Deposit USDC"
            : "Withdraw USDC"}
        </button>
      </div>
    </div>
  );
}
