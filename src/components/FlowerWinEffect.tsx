"use client";

import { useMemo } from "react";

const PETAL_COLORS = ["#fbcfe8", "#f9a8d4", "#f472b6", "#ec4899", "#db2777"];

function Flower({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-25 -25 50 50"
      xmlns="http://www.w3.org/2000/svg"
    >
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="0"
          cy="-12"
          rx="7"
          ry="12"
          fill={color}
          transform={`rotate(${angle})`}
          opacity="0.9"
        />
      ))}
      <circle cx="0" cy="0" r="5" fill="#fde047" />
      <circle cx="0" cy="0" r="3" fill="#facc15" />
    </svg>
  );
}

type FlowerConfig = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  startRotation: number;
};

export function FlowerWinEffect({ winnerName }: { winnerName: string }) {
  const flowers: FlowerConfig[] = useMemo(
    () =>
      Array.from({ length: 45 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 24 + Math.random() * 36,
        duration: 4 + Math.random() * 5,
        delay: Math.random() * 3,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        startRotation: Math.random() * 360,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#fce7f3] via-[#fbcfe8] to-[#f9a8d4]">
      {flowers.map((f) => (
        <div
          key={f.id}
          className="absolute flower-fall"
          style={{
            left: `${f.left}vw`,
            top: `-10vh`,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            transform: `rotate(${f.startRotation}deg)`,
          }}
        >
          <Flower color={f.color} size={f.size} />
        </div>
      ))}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
        <div
          className="text-6xl sm:text-8xl font-black italic tracking-wide text-[#831843] text-center"
          style={{
            fontFamily: "ui-serif, Georgia, serif",
            textShadow:
              "0 2px 20px rgba(219,39,119,0.4), 0 0 40px rgba(255,255,255,0.6)",
          }}
        >
          Winner
        </div>
        <div
          className="mt-4 text-2xl sm:text-3xl italic text-[#831843]"
          style={{ fontFamily: "ui-serif, Georgia, serif" }}
        >
          {winnerName}
        </div>
        <div className="mt-8 text-xs text-[#831843]/60 italic">
          tap to dismiss
        </div>
      </div>
    </div>
  );
}
