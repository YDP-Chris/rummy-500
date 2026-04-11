"use client";

import { useEffect, useRef } from "react";

const CHARSET =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function MatrixWinEffect({ winnerName }: { winnerName: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const fontSize = 18;
    let columns = Math.floor(width / fontSize);
    let drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -50);

    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      columns = Math.floor(width / fontSize);
      drops = new Array(columns).fill(0).map(() => Math.random() * -50);
    }
    window.addEventListener("resize", handleResize);

    let raf = 0;
    function draw() {
      if (!ctx) return;
      // trail fade
      ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#00ff00";
      ctx.font = `${fontSize}px ui-monospace, monospace`;
      ctx.shadowColor = "#00ff00";
      ctx.shadowBlur = 6;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARSET[Math.floor(Math.random() * CHARSET.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div
          className="text-6xl sm:text-8xl font-black tracking-widest text-[#00ff00] font-mono matrix-pulse"
          style={{
            textShadow:
              "0 0 10px #00ff00, 0 0 25px #00ff00, 0 0 50px #00ff00",
          }}
        >
          WINNER
        </div>
        <div
          className="mt-4 text-2xl sm:text-3xl font-mono text-[#00ff00]"
          style={{ textShadow: "0 0 10px #00ff00, 0 0 20px #00ff00" }}
        >
          {winnerName}
        </div>
        <div className="mt-8 text-xs font-mono text-[#00ff00]/60">
          tap to dismiss
        </div>
      </div>
    </div>
  );
}
