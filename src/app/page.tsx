"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  const stats = [
    { label: t("volume"), value: "$4.2M" },
    { label: t("traders"), value: "1,847" },
    { label: t("markets"), value: "20" },
    { label: t("leverage"), value: "50x" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-text-primary mb-5 text-center leading-tight">
          {t("heroTitle")}
        </h1>
        <p className="text-lg text-text-secondary mb-10">
          {t("heroSubtitle")}
        </p>
        <Link
          href="/trade"
          className="px-10 py-3.5 bg-btn-bg text-btn-text rounded-full text-sm font-medium hover:bg-btn-hover transition-colors"
        >
          {t("startTrading")}
        </Link>
      </div>

      <div className="border-t border-border">
        <div className="max-w-4xl mx-auto py-10 px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
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
