import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(
  "h82pJGF9p7kpzb6eU326EFZf2cDnimbTFVeJtx1qtBm"
);

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

export const DEVNET_USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

export const PRICE_DECIMALS = 1_000_000;

export const MARKETS = [
  { index: 0, name: "BTC-PERP", tickSize: 100_000, minOrderSize: 1_000, maxLeverage: 50 },
  { index: 1, name: "ETH-PERP", tickSize: 10_000, minOrderSize: 10_000, maxLeverage: 50 },
  { index: 2, name: "SOL-PERP", tickSize: 1_000, minOrderSize: 100_000, maxLeverage: 50 },
] as const;
