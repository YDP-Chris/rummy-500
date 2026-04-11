"use client";

import { MatrixWinEffect } from "./MatrixWinEffect";
import { FlowerWinEffect } from "./FlowerWinEffect";

export function WinnerOverlay({
  winnerName,
  onDismiss,
}: {
  winnerName: string;
  onDismiss: () => void;
}) {
  const lower = winnerName.toLowerCase();
  const variant: "matrix" | "flowers" | "neutral" = lower.includes("chris")
    ? "matrix"
    : lower.includes("nikki")
    ? "flowers"
    : "neutral";

  return (
    <div
      className="fixed inset-0 z-50 cursor-pointer"
      onClick={onDismiss}
    >
      {variant === "matrix" && <MatrixWinEffect winnerName={winnerName} />}
      {variant === "flowers" && <FlowerWinEffect winnerName={winnerName} />}
      {variant === "neutral" && (
        <div className="absolute inset-0 bg-accent-light flex flex-col items-center justify-center">
          <div className="text-6xl sm:text-8xl font-black text-accent">
            WINNER
          </div>
          <div className="mt-4 text-2xl sm:text-3xl font-semibold">
            {winnerName}
          </div>
          <div className="mt-8 text-xs text-foreground/60">tap to dismiss</div>
        </div>
      )}
    </div>
  );
}
