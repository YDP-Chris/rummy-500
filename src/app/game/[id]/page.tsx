"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase, Game, Hand } from "@/lib/supabase";

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [hands, setHands] = useState<Hand[]>([]);
  const [p1Score, setP1Score] = useState("");
  const [p2Score, setP2Score] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGame();
  }, [id]);

  async function loadGame() {
    const [gameRes, handsRes] = await Promise.all([
      supabase.from("rummy_games").select("*").eq("id", id).single(),
      supabase
        .from("rummy_hands")
        .select("*")
        .eq("game_id", id)
        .order("hand_number", { ascending: true }),
    ]);

    if (gameRes.data) setGame(gameRes.data);
    if (handsRes.data) setHands(handsRes.data);
    setLoading(false);
  }

  if (loading) {
    return <p className="text-center text-foreground/50 mt-8">Loading...</p>;
  }

  if (!game) {
    return <p className="text-center text-foreground/50 mt-8">Game not found</p>;
  }

  const p1Total = hands.reduce((sum, h) => sum + h.player1_score, 0);
  const p2Total = hands.reduce((sum, h) => sum + h.player2_score, 0);

  async function addHand(e: React.FormEvent) {
    e.preventDefault();
    const s1 = parseInt(p1Score) || 0;
    const s2 = parseInt(p2Score) || 0;
    if (s1 === 0 && s2 === 0) return;
    setSubmitting(true);

    const nextHandNumber = hands.length + 1;

    const { data, error } = await supabase
      .from("rummy_hands")
      .insert({
        game_id: id,
        hand_number: nextHandNumber,
        player1_score: s1,
        player2_score: s2,
      })
      .select()
      .single();

    if (error || !data) {
      setSubmitting(false);
      return;
    }

    const newHands = [...hands, data];
    setHands(newHands);
    setP1Score("");
    setP2Score("");
    setSubmitting(false);

    // Check for winner
    const newP1Total = newHands.reduce((sum, h) => sum + h.player1_score, 0);
    const newP2Total = newHands.reduce((sum, h) => sum + h.player2_score, 0);

    if (newP1Total >= 500 || newP2Total >= 500) {
      const winner =
        newP1Total >= 500 && newP2Total >= 500
          ? newP1Total >= newP2Total
            ? game!.player1_name
            : game!.player2_name
          : newP1Total >= 500
          ? game!.player1_name
          : game!.player2_name;

      await supabase
        .from("rummy_games")
        .update({ winner, completed_at: new Date().toISOString() })
        .eq("id", id);

      setGame({ ...game!, winner, completed_at: new Date().toISOString() });
    }
  }

  async function undoLastHand() {
    if (hands.length === 0) return;
    const lastHand = hands[hands.length - 1];

    await supabase.from("rummy_hands").delete().eq("id", lastHand.id);

    const newHands = hands.slice(0, -1);
    setHands(newHands);

    // If game was completed, reopen it
    if (game!.winner) {
      await supabase
        .from("rummy_games")
        .update({ winner: null, completed_at: null })
        .eq("id", id);
      setGame({ ...game!, winner: null, completed_at: null });
    }
  }

  // Build running totals for the table
  let runP1 = 0;
  let runP2 = 0;
  const handRows = hands.map((h) => {
    runP1 += h.player1_score;
    runP2 += h.player2_score;
    return { ...h, runP1, runP2 };
  });

  return (
    <div className="space-y-6">
      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className={`rounded-xl p-4 text-center border ${
            game.winner === game.player1_name
              ? "bg-accent text-white border-accent"
              : "bg-card border-border"
          }`}
        >
          <div className="text-sm font-medium opacity-80">{game.player1_name}</div>
          <div className="text-4xl font-bold mt-1">{p1Total}</div>
        </div>
        <div
          className={`rounded-xl p-4 text-center border ${
            game.winner === game.player2_name
              ? "bg-accent text-white border-accent"
              : "bg-card border-border"
          }`}
        >
          <div className="text-sm font-medium opacity-80">{game.player2_name}</div>
          <div className="text-4xl font-bold mt-1">{p2Total}</div>
        </div>
      </div>

      {/* Winner banner */}
      {game.winner && (
        <div className="bg-accent-light border border-accent/20 rounded-lg p-4 text-center">
          <div className="text-lg font-bold text-accent">{game.winner} wins!</div>
          <div className="text-sm text-foreground/60 mt-1">
            Final: {p1Total} - {p2Total}
          </div>
          <button
            onClick={() => router.push("/")}
            className="mt-3 bg-accent text-white font-semibold rounded-lg px-6 py-2 text-sm"
          >
            Back to Home
          </button>
        </div>
      )}

      {/* Add Hand Form */}
      {!game.winner && (
        <form onSubmit={addHand} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground/60 block mb-1">
                {game.player1_name}
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={p1Score}
                onChange={(e) => setP1Score(e.target.value)}
                placeholder="0"
                className="w-full border border-border rounded-lg px-4 py-3 text-xl text-center bg-card"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground/60 block mb-1">
                {game.player2_name}
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={p2Score}
                onChange={(e) => setP2Score(e.target.value)}
                placeholder="0"
                className="w-full border border-border rounded-lg px-4 py-3 text-xl text-center bg-card"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent text-white font-semibold rounded-lg px-4 py-3 text-base disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Hand"}
          </button>
        </form>
      )}

      {/* Hand History */}
      {handRows.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-foreground/60">Hand History</h2>
            <button
              onClick={undoLastHand}
              className="text-xs text-accent font-medium"
            >
              Undo Last
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-foreground/60">
                <th className="py-2 text-left font-medium">#</th>
                <th className="py-2 text-center font-medium">{game.player1_name}</th>
                <th className="py-2 text-center font-medium">{game.player2_name}</th>
              </tr>
            </thead>
            <tbody>
              {handRows.map((h) => (
                <tr key={h.id} className="border-b border-border/50">
                  <td className="py-2 text-foreground/50">{h.hand_number}</td>
                  <td className="py-2 text-center">
                    <span className={h.player1_score >= 0 ? "" : "text-red-500"}>
                      {h.player1_score >= 0 ? "+" : ""}
                      {h.player1_score}
                    </span>
                    <span className="text-foreground/40 ml-2">({h.runP1})</span>
                  </td>
                  <td className="py-2 text-center">
                    <span className={h.player2_score >= 0 ? "" : "text-red-500"}>
                      {h.player2_score >= 0 ? "+" : ""}
                      {h.player2_score}
                    </span>
                    <span className="text-foreground/40 ml-2">({h.runP2})</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
