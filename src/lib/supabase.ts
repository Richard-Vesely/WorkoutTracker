import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface WorkoutRoutine {
  id: string
  name: string
  active: boolean
  created_at: string
  exercises: Exercise[]
}

export interface Exercise {
  id: string
  routine_id: string
  name: string
  sets: number
  reps: number
  weight: number
  order_index: number
}

export interface Workout {
  id: string
  routine_id: string
  routine_name: string
  start_time: string
  end_time?: string
  duration?: number
  energy_level: number
  created_at: string
}

export interface WorkoutSet {
  id: string
  workout_id: string
  exercise_name: string
  set_number: number
  weights: Record<string, number> // e.g., {"50kg": 10, "45kg": 8}
  muscle_feeling: number
  created_at: string
}
