import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";
import * as fs from "fs";
import * as path from "path";

const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.chain.robinhood.com"] } },
});

const ORACLE_ABI = [
  {
    inputs: [
      { name: "tokens", type: "address[]" },
      { name: "_prices", type: "uint256[]" },
    ],
    name: "setBatchPrices",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

async function main() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match) process.env[match[1]] = match[2];
    }
  }

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const oracleAddress = process.env.NEXT_PUBLIC_ORACLE_ADDRESS;

  if (!privateKey || !oracleAddress) {
    console.error("Need DEPLOYER_PRIVATE_KEY and NEXT_PUBLIC_ORACLE_ADDRESS");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const transport = http();
  const publicClient = createPublicClient({ chain: robinhoodChain, transport });
  const walletClient = createWalletClient({ account, chain: robinhoodChain, transport });

  const tokens = [
    process.env.NEXT_PUBLIC_CC_TOKEN_ADDRESS!,
    process.env.NEXT_PUBLIC_HOOD_TOKEN_ADDRESS!,
    process.env.NEXT_PUBLIC_MM_TOKEN_ADDRESS!,
    process.env.NEXT_PUBLIC_SB_TOKEN_ADDRESS!,
  ] as `0x${string}`[];

  const prices = [
    BigInt(Math.round(0.025 * 1e8)),   // CC
    BigInt(Math.round(0.048 * 1e8)),   // HOOD
    BigInt(Math.round(0.012 * 1e8)),   // MM
    BigInt(Math.round(0.82 * 1e8)),    // SB
  ];

  const hash = await walletClient.writeContract({
    address: oracleAddress as `0x${string}`,
    abi: ORACLE_ABI,
    functionName: "setBatchPrices",
    args: [tokens, prices],
  });
  await publicClient.waitForTransactionReceipt({ hash });

  console.log(`Prices updated at ${new Date().toISOString()}`);
  console.log("CC=$0.025, HOOD=$0.048, MM=$0.012, SB=$0.82");
  console.log("Next update needed within 1 hour");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
