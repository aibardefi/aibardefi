import { createWalletClient, createPublicClient, http, parseEther, formatEther, maxUint256 } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";
import * as fs from "fs";
import * as path from "path";

const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.chain.robinhood.com"] } },
  blockExplorers: { default: { name: "Robinhood Explorer", url: "https://explorer.chain.robinhood.com" } },
});

function loadArtifact(name: string) {
  const p = path.join(__dirname, "..", "artifacts", `${name}.json`);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  return { abi: data.abi, bytecode: data.bytecode as `0x${string}` };
}

async function deployContract(
  walletClient: any,
  publicClient: any,
  name: string,
  args: any[] = []
) {
  const { abi, bytecode } = loadArtifact(name);
  console.log(`Deploying ${name}...`);

  const hash = await walletClient.deployContract({ abi, bytecode, args });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (!receipt.contractAddress) throw new Error(`${name} deployment failed`);
  console.log(`  ${name}: ${receipt.contractAddress} (tx: ${hash})`);
  return { address: receipt.contractAddress as `0x${string}`, abi };
}

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.error("Set DEPLOYER_PRIVATE_KEY env var");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const transport = http();

  const publicClient = createPublicClient({ chain: robinhoodChain, transport });
  const walletClient = createWalletClient({ account, chain: robinhoodChain, transport });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log("Deployer / Treasury:", account.address);
  console.log("Balance:", formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.error("No ETH for gas. Fund the deployer wallet on Robinhood Chain first.");
    process.exit(1);
  }

  // 1. Collateral tokens
  console.log("--- Deploying Collateral Tokens ---");
  const cc = await deployContract(walletClient, publicClient, "MockERC20", [
    "CryptoCoin", "CC", 18, parseEther("10000000000"), account.address,
  ]);
  const hood = await deployContract(walletClient, publicClient, "MockERC20", [
    "Hood Token", "HOOD", 18, parseEther("10000000000"), account.address,
  ]);
  const mm = await deployContract(walletClient, publicClient, "MockERC20", [
    "MemeMoney", "MM", 18, parseEther("10000000000"), account.address,
  ]);

  // 2. Oracle
  console.log("\n--- Deploying PriceOracle ---");
  const oracle = await deployContract(walletClient, publicClient, "PriceOracle");

  // 3. SB Token
  console.log("\n--- Deploying SBToken ---");
  const sbToken = await deployContract(walletClient, publicClient, "SBToken", [account.address]);

  // 4. Vault
  console.log("\n--- Deploying CollateralVault ---");
  const vault = await deployContract(walletClient, publicClient, "CollateralVault", [
    sbToken.address, oracle.address, account.address,
  ]);

  // 5. Add collateral tokens
  console.log("\n--- Configuring Vault ---");
  for (const [name, token] of [["CC", cc], ["HOOD", hood], ["MM", mm]] as const) {
    const hash = await walletClient.writeContract({
      address: vault.address,
      abi: vault.abi,
      functionName: "addCollateralToken",
      args: [token.address],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`  Added ${name} as collateral`);
  }

  // 6. Treasury approves vault to spend SB
  const approveHash = await walletClient.writeContract({
    address: sbToken.address,
    abi: sbToken.abi,
    functionName: "approve",
    args: [vault.address, maxUint256],
  });
  await publicClient.waitForTransactionReceipt({ hash: approveHash });
  console.log("  Treasury approved vault to spend SB");

  // 7. Set prices (8 decimals: 1e8 = $1.00)
  console.log("\n--- Setting Prices ---");
  const priceHash = await walletClient.writeContract({
    address: oracle.address,
    abi: oracle.abi,
    functionName: "setBatchPrices",
    args: [
      [cc.address, hood.address, mm.address, sbToken.address],
      [
        BigInt(Math.round(0.025 * 1e8)),  // CC  = $0.025
        BigInt(Math.round(0.048 * 1e8)),  // HOOD = $0.048
        BigInt(Math.round(0.012 * 1e8)),  // MM  = $0.012
        BigInt(Math.round(0.82 * 1e8)),   // SB  = $0.82
      ],
    ],
  });
  await publicClient.waitForTransactionReceipt({ hash: priceHash });
  console.log("  Prices set: CC=$0.025, HOOD=$0.048, MM=$0.012, SB=$0.82");

  // 8. Write .env.local
  const envContent = `# SB Token - Deployed on Robinhood Chain (${new Date().toISOString()})
NEXT_PUBLIC_SB_TOKEN_ADDRESS=${sbToken.address}
NEXT_PUBLIC_VAULT_ADDRESS=${vault.address}
NEXT_PUBLIC_ORACLE_ADDRESS=${oracle.address}
NEXT_PUBLIC_TREASURY_ADDRESS=${account.address}
NEXT_PUBLIC_CC_TOKEN_ADDRESS=${cc.address}
NEXT_PUBLIC_HOOD_TOKEN_ADDRESS=${hood.address}
NEXT_PUBLIC_MM_TOKEN_ADDRESS=${mm.address}
`;

  fs.writeFileSync(path.join(__dirname, "..", ".env.local"), envContent);
  console.log("\n--- .env.local written ---");
  console.log(envContent);
  console.log("=== DEPLOYMENT COMPLETE ===");
  console.log("Run 'npm run dev' to start the frontend with live contracts.");
  console.log("\nIMPORTANT: Oracle prices expire in 1 hour.");
  console.log("Run 'npx tsx scripts/update-prices.ts' to refresh.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
