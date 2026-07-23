/**
 * SB Token Liquidation Bot
 *
 * Monitors all active positions and liquidates any with LTV >= 90%.
 * Run with: npx tsx scripts/liquidator.ts
 *
 * Required env vars:
 *   PRIVATE_KEY          - Keeper wallet private key (has SB to repay debts)
 *   VAULT_ADDRESS        - CollateralVault contract address
 *   SB_TOKEN_ADDRESS     - SB Token contract address
 *   ORACLE_ADDRESS       - PriceOracle contract address
 *   RPC_URL              - Robinhood Chain RPC (default: https://rpc.mainnet.chain.robinhood.com)
 *   POLL_INTERVAL_MS     - How often to check (default: 30000)
 */

import { createPublicClient, createWalletClient, http, parseAbi, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";

const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [process.env.RPC_URL ?? "https://rpc.mainnet.chain.robinhood.com"] } },
});

const VAULT_ABI = parseAbi([
  "function nextPositionId() view returns (uint256)",
  "function getPositionDetails(uint256) view returns (address owner, address collateralToken, uint256 collateralAmount, uint256 debtAmount, uint256 ltv, uint256 openedAt, bool active)",
  "function getPositionLtv(uint256) view returns (uint256)",
  "function liquidate(uint256) external",
  "function LIQUIDATION_THRESHOLD() view returns (uint256)",
]);

const ERC20_ABI = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
]);

const VAULT_ADDRESS = process.env.VAULT_ADDRESS as `0x${string}`;
const SB_TOKEN_ADDRESS = process.env.SB_TOKEN_ADDRESS as `0x${string}`;
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS ?? 30_000);

if (!process.env.PRIVATE_KEY || !VAULT_ADDRESS || !SB_TOKEN_ADDRESS) {
  console.error("Missing required env vars: PRIVATE_KEY, VAULT_ADDRESS, SB_TOKEN_ADDRESS");
  process.exit(1);
}

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

const publicClient = createPublicClient({
  chain: robinhoodChain,
  transport: http(),
});

const walletClient = createWalletClient({
  account,
  chain: robinhoodChain,
  transport: http(),
});

async function checkAndLiquidate() {
  const nextId = await publicClient.readContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "nextPositionId",
  });

  const total = Number(nextId);
  let liquidated = 0;

  for (let i = 0; i < total; i++) {
    try {
      const details = await publicClient.readContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "getPositionDetails",
        args: [BigInt(i)],
      });

      const [owner, , , debtAmount, ltv, , active] = details;
      if (!active) continue;

      const ltvBps = Number(ltv);
      if (ltvBps < 9000) continue;

      console.log(`[LIQUIDATE] Position #${i} | Owner: ${owner} | LTV: ${(ltvBps / 100).toFixed(1)}% | Debt: ${formatUnits(debtAmount, 18)} SB`);

      const allowance = await publicClient.readContract({
        address: SB_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [account.address, VAULT_ADDRESS],
      });

      if (allowance < debtAmount) {
        const approveTx = await walletClient.writeContract({
          address: SB_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [VAULT_ADDRESS, debtAmount * BigInt(2)],
        });
        await publicClient.waitForTransactionReceipt({ hash: approveTx });
        console.log(`  Approved SB spend: ${approveTx}`);
      }

      const liqTx = await walletClient.writeContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "liquidate",
        args: [BigInt(i)],
      });
      await publicClient.waitForTransactionReceipt({ hash: liqTx });
      console.log(`  Liquidated: ${liqTx}`);
      liquidated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("Position healthy") && !msg.includes("not active")) {
        console.error(`  Error on position #${i}:`, msg);
      }
    }
  }

  return { total, liquidated };
}

async function main() {
  console.log("SB Token Liquidation Bot");
  console.log(`Keeper: ${account.address}`);
  console.log(`Vault: ${VAULT_ADDRESS}`);
  console.log(`Poll interval: ${POLL_INTERVAL}ms`);
  console.log("---");

  const balance = await publicClient.readContract({
    address: SB_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [account.address],
  });
  console.log(`SB balance: ${formatUnits(balance, 18)}`);
  console.log("Starting monitoring...\n");

  while (true) {
    try {
      const { total, liquidated } = await checkAndLiquidate();
      const ts = new Date().toISOString();
      if (liquidated > 0) {
        console.log(`[${ts}] Scanned ${total} positions, liquidated ${liquidated}`);
      } else {
        console.log(`[${ts}] Scanned ${total} positions, all healthy`);
      }
    } catch (err) {
      console.error("Scan error:", err instanceof Error ? err.message : err);
    }
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
  }
}

main().catch(console.error);
