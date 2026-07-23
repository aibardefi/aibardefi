"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const NAV_LINKS = [
  { href: "/sb/dashboard", label: "Dashboard" },
  { href: "/sb/borrow", label: "Borrow" },
];

export function SBHeader() {
  const pathname = usePathname();

  return (
    <header
      style={{
        height: 56,
        backgroundColor: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        flexShrink: 0,
      }}
    >
      <Link
        href="/sb"
        style={{
          display: "flex",
          alignItems: "center",
          marginRight: 32,
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            backgroundColor: "var(--sb-accent)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#000",
              letterSpacing: "0.02em",
            }}
          >
            SB
          </span>
        </div>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          SB Token
        </span>
      </Link>

      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          height: "100%",
        }}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: 14,
              color: pathname.startsWith(link.href)
                ? "var(--text-primary)"
                : "var(--text-secondary)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div style={{ marginLeft: "auto" }}>
        <WalletMultiButton
          style={{
            height: 36,
            borderRadius: 9999,
            fontSize: 14,
            fontWeight: 500,
            padding: "0 20px",
          }}
        />
      </div>
    </header>
  );
}
