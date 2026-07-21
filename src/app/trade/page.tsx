import { TradingPairInfo } from "@/components/trade/TradingPairInfo";
import { PriceChart } from "@/components/trade/PriceChart";
import { OrderBook } from "@/components/trade/OrderBook";
import { TradeForm } from "@/components/trade/TradeForm";
import { RecentTrades } from "@/components/trade/RecentTrades";

export default function TradePage() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TradingPairInfo />

      <div className="flex-1 grid grid-cols-[1fr_280px_320px] grid-rows-[1fr_1fr] min-h-0 gap-px bg-border">
        {/* Chart */}
        <div className="bg-bg-secondary row-span-2 min-h-0 flex flex-col">
          <div className="px-3 py-2 border-b border-border flex items-center gap-4">
            <span className="text-xs text-text-secondary cursor-pointer hover:text-text-primary">
              1m
            </span>
            <span className="text-xs text-text-secondary cursor-pointer hover:text-text-primary">
              5m
            </span>
            <span className="text-xs text-yellow cursor-pointer">15m</span>
            <span className="text-xs text-text-secondary cursor-pointer hover:text-text-primary">
              1h
            </span>
            <span className="text-xs text-text-secondary cursor-pointer hover:text-text-primary">
              4h
            </span>
            <span className="text-xs text-text-secondary cursor-pointer hover:text-text-primary">
              1D
            </span>
            <span className="text-xs text-text-secondary cursor-pointer hover:text-text-primary">
              1W
            </span>
          </div>
          <div className="flex-1 min-h-0 p-1">
            <PriceChart />
          </div>
        </div>

        {/* Order Book */}
        <div className="bg-bg-secondary row-span-2 min-h-0 overflow-hidden">
          <OrderBook />
        </div>

        {/* Trade Form */}
        <div className="bg-bg-secondary min-h-0 overflow-y-auto">
          <TradeForm />
        </div>

        {/* Recent Trades */}
        <div className="bg-bg-secondary min-h-0 overflow-hidden">
          <RecentTrades />
        </div>
      </div>
    </div>
  );
}
