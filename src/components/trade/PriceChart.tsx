"use client";

import { useEffect, useRef } from "react";

function generateCandlestickData(count: number) {
  const data = [];
  let price = 67000;
  for (let i = 0; i < count; i++) {
    const open = price;
    const change = (Math.random() - 0.48) * 800;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 400;
    const low = Math.min(open, close) - Math.random() * 400;
    data.push({ open, close, high, low });
    price = close;
  }
  return data;
}

export function PriceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      draw(ctx, rect.width, rect.height);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  function draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const data = generateCandlestickData(60);
    const padding = { top: 20, right: 60, bottom: 30, left: 10 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    const allPrices = data.flatMap((d) => [d.high, d.low]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;

    const toY = (price: number) =>
      padding.top + chartH - ((price - minPrice) / priceRange) * chartH;

    ctx.strokeStyle = "#1e1e1e";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartH / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = "#555555";
      ctx.font = "11px Arial";
      ctx.textAlign = "left";
      ctx.fillText(price.toFixed(0), w - padding.right + 8, y + 4);
    }

    const candleWidth = Math.max(2, (chartW / data.length) * 0.7);
    const gap = chartW / data.length;

    data.forEach((d, i) => {
      const x = padding.left + gap * i + gap / 2;
      const bullish = d.close >= d.open;
      const color = bullish ? "#22c55e" : "#ef4444";

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, toY(d.high));
      ctx.lineTo(x, toY(d.low));
      ctx.stroke();

      ctx.fillStyle = color;
      const bodyTop = toY(Math.max(d.open, d.close));
      const bodyBottom = toY(Math.min(d.open, d.close));
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-0">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
