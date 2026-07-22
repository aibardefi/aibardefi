import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";

export function getMarketPda(marketIndex: number): [PublicKey, number] {
  const buf = Buffer.alloc(2);
  buf.writeUInt16LE(marketIndex);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("market"), buf],
    PROGRAM_ID
  );
}

export function getVaultPda(marketIndex: number): [PublicKey, number] {
  const buf = Buffer.alloc(2);
  buf.writeUInt16LE(marketIndex);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), buf],
    PROGRAM_ID
  );
}

export function getUserAccountPda(
  marketKey: PublicKey,
  owner: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user"), marketKey.toBuffer(), owner.toBuffer()],
    PROGRAM_ID
  );
}
