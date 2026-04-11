"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, Game, Hand } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type GameWithTotals = Game & {
  player1_total: number;
  player2_total: number;
};

export default function Home() {
  const router = useRouter();
  const { auth } = useAuth();
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [firstDealer, setFirstDealer] = useState<"player1" | "player2">("player1");
  const [games, setGames] = useState<GameWithTotals[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadGames();
  }, []);

  async function loadGames() {
    const { data: allGames } = await supabase
      .from("rummy_games")
      .select("*")
      .order("started_at", { ascending: false });

    if (!allGames) {
      setLoading(false);
      return;
    }

    const gamesWithTotals: GameWithTotals[] = [];
    for (const game of allGames) {
      const { data: hands } = await supabase
        .from("rummy_hands")
        .select("*")
        .eq("game_id", game.id);

      const p1Total = (hands || []).reduce((sum: number, h: Hand) => sum + h.player1_score, 0);
      const p2Total = (hands || []).reduce((sum: number, h: Hand) => sum + h.player2_score, 0);

      gamesWithTotals.push({
        ...game,
        player1_total: p1Total,
        player2_total: p2Total,
      });
    }

    setGames(gamesWithTotals);
    setLoading(false);
  }

  async function startGame(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    if (!player1.trim() || !player2.trim()) return;
    setCreating(true);

    const { data, error } = await supabase
      .from("rummy_games")
      .insert({
        player1_name: player1.trim(),
        player2_name: player2.trim(),
        first_dealer: firstDealer,
      })
      .select()
      .single();

    if (error || !data) {
      setCreating(false);
      return;
    }

    router.push(`/game/${data.id}`);
  }

  // Build win/loss records
  const records: Record<string, { wins: number; losses: number }> = {};
  for (const g of games) {
    if (!g.winner) continue;
    const names = [g.player1_name, g.player2_name];
    for (const name of names) {
      if (!records[name]) records[name] = { wins: 0, losses: 0 };
      if (name === g.winner) records[name].wins++;
      else records[name].losses++;
    }
  }

  const completedGames = games.filter((g) => g.winner);
  const activeGames = games.filter((g) => !g.winner);

  return (
    <div className="space-y-8">
      {/* New Game Form — logged-in only */}
      {auth && (
      <section>
        <h2 className="text-lg font-semibold mb-3">New Game</h2>
        {!auth && (
          <p className="text-sm text-foreground/60 mb-3">
            Log in to start a new game.
          </p>
        )}
        <form onSubmit={startGame} className="space-y-3">
          <input
            type="text"
            placeholder="Player 1 name"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            disabled={!auth}
            className="w-full border border-border rounded-lg px-4 py-3 text-base bg-card disabled:opacity-50"
            required
          />
          <input
            type="text"
            placeholder="Player 2 name"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            disabled={!auth}
            className="w-full border border-border rounded-lg px-4 py-3 text-base bg-card disabled:opacity-50"
            required
          />
          <div>
            <label className="text-xs font-medium text-foreground/60 block mb-2">
              Who deals first?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFirstDealer("player1")}
                disabled={!auth}
                className={`rounded-lg px-4 py-2 text-sm font-medium border disabled:opacity-50 ${
                  firstDealer === "player1"
                    ? "bg-accent text-white border-accent"
                    : "bg-card border-border"
                }`}
              >
                {player1.trim() || "Player 1"}
              </button>
              <button
                type="button"
                onClick={() => setFirstDealer("player2")}
                disabled={!auth}
                className={`rounded-lg px-4 py-2 text-sm font-medium border disabled:opacity-50 ${
                  firstDealer === "player2"
                    ? "bg-accent text-white border-accent"
                    : "bg-card border-border"
                }`}
              >
                {player2.trim() || "Player 2"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={creating || !auth}
            className="w-full bg-accent text-white font-semibold rounded-lg px-4 py-3 text-base disabled:opacity-50"
          >
            {creating ? "Starting..." : "Start Game"}
          </button>
        </form>
      </section>
      )}

      {/* Win/Loss Records */}
      {Object.keys(records).length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Records</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(records)
              .sort(([, a], [, b]) => b.wins - a.wins)
              .map(([name, r]) => (
                <div
                  key={name}
                  className="bg-card border border-border rounded-lg p-3 text-center"
                >
                  <div className="font-semibold">{name}</div>
                  <div className="text-2xl font-bold text-accent">
                    {r.wins}W - {r.losses}L
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Active Games — logged-in only */}
      {auth && activeGames.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">In Progress</h2>
          <div className="space-y-2">
            {activeGames.map((g) => (
              <a
                key={g.id}
                href={`/game/${g.id}`}
                className="block bg-accent-light border border-accent/20 rounded-lg p-3"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {g.player1_name} vs {g.player2_name}
                  </span>
                  <span className="text-sm text-foreground/60">
                    {g.player1_total} - {g.player2_total}
                  </span>
                </div>
                <div className="text-xs text-foreground/50 mt-1">
                  {new Date(g.started_at).toLocaleDateString()}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Completed Games — logged-in only */}
      {auth && loading ? (
        <p className="text-center text-foreground/50">Loading...</p>
      ) : auth && completedGames.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold mb-3">Game History</h2>
          <div className="space-y-2">
            {completedGames.map((g) => (
              <a
                key={g.id}
                href={`/game/${g.id}`}
                className="block bg-card border border-border rounded-lg p-3"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {g.player1_name} vs {g.player2_name}
                  </span>
                  <span className="text-sm font-semibold text-accent">
                    {g.winner} won
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-foreground/60">
                    {g.player1_total} - {g.player2_total}
                  </span>
                  <span className="text-xs text-foreground/50">
                    {new Date(g.started_at).toLocaleDateString()}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
