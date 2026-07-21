import Link from "next/link";

const stats = [
  { label: "Volume", value: "$4.2M" },
  { label: "Traders", value: "1,847" },
  { label: "Markets", value: "20" },
  { label: "Leverage", value: "50x" },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="text-6xl md:text-7xl font-semibold tracking-tight text-text-primary mb-5">
          Trade with AI
        </h1>
        <p className="text-lg text-text-secondary mb-10">
          Perps on Solana. Up to 50x.
        </p>
        <Link
          href="/trade"
          className="px-10 py-3.5 bg-text-primary text-bg-primary rounded-full text-sm font-medium hover:bg-white transition-colors"
        >
          Start trading
        </Link>
      </div>

      <div className="border-t border-border">
        <div className="max-w-4xl mx-auto py-10 px-6 grid grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold text-text-primary">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
