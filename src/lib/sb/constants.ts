export const SB_PROGRAM_ID = "SBProt1111111111111111111111111111111111111";
export const SB_DECIMALS = 6;
export const SB_TOTAL_SUPPLY = 1_000_000_000;
export const PRICE_DECIMALS = 1_000_000;
export const BPS_DENOMINATOR = 10_000;

export const MOCK_SB_PRICE = 0.82;

export const COLLATERAL_TOKENS = [
  { symbol: "CC", name: "CashCat", price: 0.025, icon: "CC", color: "#E5A435" },
  { symbol: "HOOD", name: "HOOD", price: 0.134, icon: "HD", color: "#60A5FA" },
  { symbol: "MM", name: "MoonMouse", price: 0.022, icon: "MM", color: "#C084FC" },
] as const;

export const MOCK_POSITIONS = [
  { id: 0, token: "CC", name: "CashCat", amount: 50000, price: 0.025, debt: 800, openedAt: "2026-07-20" },
  { id: 1, token: "HOOD", name: "HOOD", amount: 10000, price: 0.134, debt: 1200, openedAt: "2026-07-18" },
  { id: 2, token: "MM", name: "MoonMouse", amount: 25000, price: 0.022, debt: 500, openedAt: "2026-07-15" },
] as const;
