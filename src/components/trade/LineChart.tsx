"use client";

import { useEffect, useRef } from "react";

function generateLineData(count: number) {
  const data = [];
  let price = 67000;
  for (let i = 0; i < count; i++) {
    price += (Math.random() - 0.48) * 400;
    data.push(price);
  }
  return data;
}

export function LineChart({ positive = true }: { positive?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(ctx, rect.width, rect.height);
    };

    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(container);

    const themeObserver = new MutationObserver(draw);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
    };
  }, [positive]);

  function render(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const data = generateLineData(96);
    const pad = { top: 8, bottom: 8, left: 0, right: 0 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const toX = (i: number) => pad.left + (i / (data.length - 1)) * chartW;
    const toY = (v: number) => pad.top + chartH - ((v - min) / range) * chartH;

    const lineColor = positive ? "#22c55e" : "#ef4444";

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, pad.top, 0, h);
    if (positive) {
      gradient.addColorStop(0, "rgba(34, 197, 94, 0.15)");
      gradient.addColorStop(1, "rgba(34, 197, 94, 0)");
    } else {
      gradient.addColorStop(0, "rgba(239, 68, 68, 0.15)");
      gradient.addColorStop(1, "rgba(239, 68, 68, 0)");
    }

    // Fill area
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(data[0]));
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(toX(i), toY(data[i]));
    }
    ctx.lineTo(toX(data.length - 1), h);
    ctx.lineTo(toX(0), h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(data[0]));
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(toX(i), toY(data[i]));
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
