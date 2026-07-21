# Project: AlphaDEX — Leveraged Trading Protocol (Solana)

## Core Principle
Never copy existing solutions. Always think from first principles. The goal is to create something genuinely new, not recombine what others already built. If an idea feels "template-like" — reject it and dig deeper.

## Architecture Decision
Hybrid CLOB + Oracle with **Time-Decaying Leverage** — leverage naturally decreases over time (10x → 1x). Traders "recharge" to maintain high leverage (recurring fee). No liquidations ever.

## Tech Stack
- Solana, Anchor (smart contracts)
- Next.js, Tailwind, TypeScript (frontend)
- Pyth (oracle)
