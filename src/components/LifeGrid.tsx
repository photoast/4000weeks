"use client";

import { useRef, useEffect, useCallback } from "react";

interface LifeGridProps {
  birthdate: string;
}

function getWeekInfo(birthdate: string) {
  const birth = new Date(birthdate);
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const elapsed = now.getTime() - birth.getTime();
  const currentWeek = Math.floor(elapsed / msPerWeek);
  const totalWeeks = 4000;

  const startOfThisWeek = new Date(birth.getTime() + currentWeek * msPerWeek);
  const endOfThisWeek = new Date(startOfThisWeek.getTime() + msPerWeek);
  const remainingMs = endOfThisWeek.getTime() - now.getTime();

  return { currentWeek, totalWeeks, remainingMs };
}

export default function LifeGrid({ birthdate }: LifeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      ctx.clearRect(0, 0, width, height);

      const { currentWeek, totalWeeks } = getWeekInfo(birthdate);

      const cols = 50;
      const rows = Math.ceil(totalWeeks / cols);
      const padding = 16;
      const availableW = width - padding * 2;
      const availableH = height - padding * 2;
      const gap = Math.min(availableW / cols, availableH / rows);
      const dotSize = gap * 0.4;

      const offsetX = (width - cols * gap) / 2;
      const offsetY = (height - rows * gap) / 2;

      for (let i = 0; i < totalWeeks; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = offsetX + col * gap + gap / 2;
        const y = offsetY + row * gap + gap / 2;

        const delay = (i / totalWeeks) * 2000;
        const progress = Math.min(1, Math.max(0, (elapsed - delay) / 600));
        const scale = progress;

        if (scale <= 0) continue;

        ctx.beginPath();
        ctx.arc(x, y, dotSize * scale, 0, Math.PI * 2);

        if (i < currentWeek) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        } else if (i === currentWeek) {
          const pulse = 0.5 + 0.5 * Math.sin(timestamp / 300);
          ctx.fillStyle = `rgba(255, 59, 48, ${0.4 + pulse * 0.6})`;
          ctx.shadowColor = "#FF3B30";
          ctx.shadowBlur = 8 + pulse * 6;
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        }

        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
      }

      animRef.current = requestAnimationFrame(draw);
    },
    [birthdate]
  );

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}

export { getWeekInfo };
