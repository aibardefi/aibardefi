import { PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("SBProt1111111111111111111111111111111111111");

export function getProtocolPda() {
  return PublicKey.findProgramAddressSync([Buffer.from("protocol")], PROGRAM_ID);
}

export function getCollateralConfigPda(collateralMint: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from("collateral"), collateralMint.toBuffer()], PROGRAM_ID);
}

export function getPositionPda(owner: PublicKey, collateralMint: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from("position"), owner.toBuffer(), collateralMint.toBuffer()], PROGRAM_ID);
}

export function getTreasuryVaultPda() {
  return PublicKey.findProgramAddressSync([Buffer.from("treasury")], PROGRAM_ID);
}

export function getCollateralVaultPda(collateralMint: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from("col_vault"), collateralMint.toBuffer()], PROGRAM_ID);
}

export function getPriceFeedPda(assetMint: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from("price_feed"), assetMint.toBuffer()], PROGRAM_ID);
}
