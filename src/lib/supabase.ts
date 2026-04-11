import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Game = {
  id: string
  player1_name: string
  player2_name: string
  winner: string | null
  started_at: string
  completed_at: string | null
}

export type Hand = {
  id: string
  game_id: string
  hand_number: number
  player1_score: number
  player2_score: number
  created_at: string
}
