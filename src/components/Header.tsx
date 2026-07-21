"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isTradeActive = pathname.startsWith("/trade");

  return (
    <header className="h-16 bg-bg-primary border-b border-border flex items-center px-8 shrink-0">
      <Link href="/" className="flex items-center mr-12">
        <span className="text-xl tracking-tight">
          <span className="font-semibold text-text-primary">Alpha</span>
          <span className="font-semibold text-green">DEX</span>
        </span>
      </Link>

      <nav className="flex items-center gap-8 h-full">
        <Link
          href="/trade"
          className={`text-sm transition-colors ${
            isTradeActive
              ? "text-text-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Trade
        </Link>
      </nav>

      <div className="ml-auto">
        <Link
          href="/trade"
          className="px-6 py-2 text-sm bg-text-primary text-bg-primary rounded-full font-medium hover:bg-white transition-colors"
        >
          Trade
        </Link>
      </div>
    </header>
  );
}
