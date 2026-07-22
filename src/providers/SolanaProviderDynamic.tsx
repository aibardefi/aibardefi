"use client";

import dynamic from "next/dynamic";

const SolanaProvider = dynamic(() => import("./SolanaProvider"), {
  ssr: false,
});

export default function SolanaProviderDynamic({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SolanaProvider>{children}</SolanaProvider>;
}
