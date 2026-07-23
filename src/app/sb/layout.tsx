import type { Metadata } from "next";
import { SBHeader } from "./SBHeader";
import { SBWalletProvider } from "./SBWalletProvider";

export const metadata: Metadata = {
  title: "SB Token",
  description: "Zero-interest memecoin collateral platform on Robinhood Chain",
};

export default function SBLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <style>{`
        .sb-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
        }
        .sb-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--sb-accent);
          color: #000;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.15s;
          text-decoration: none;
          font-family: inherit;
        }
        .sb-btn-primary:hover {
          background: var(--sb-accent-hover);
        }
        .sb-btn-green {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--sb-green);
          color: #000;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.15s;
          text-decoration: none;
          font-family: inherit;
        }
        .sb-btn-green:hover {
          background: #2bc489;
        }
        .sb-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
          text-decoration: none;
          font-family: inherit;
        }
        .sb-btn-outline:hover {
          border-color: var(--sb-accent);
          color: var(--sb-accent);
        }
        .sb-input {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px 16px;
          color: var(--text-primary);
          font-size: 16px;
          width: 100%;
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .sb-input:focus {
          border-color: var(--sb-accent);
        }
        .sb-table-row {
          transition: background 0.12s;
        }
        .sb-table-row:hover {
          background: var(--bg-hover);
        }
        .sb-link-back {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.15s;
        }
        .sb-link-back:hover {
          color: var(--text-primary);
        }
      `}</style>
      <SBWalletProvider>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <SBHeader />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </div>
        </div>
      </SBWalletProvider>
    </>
  );
}
