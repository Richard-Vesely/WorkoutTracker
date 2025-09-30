-- Workout Tracker Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workout Routines Table
CREATE TABLE workout_routines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises Table
CREATE TABLE exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  routine_id UUID REFERENCES workout_routines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets INTEGER NOT NULL DEFAULT 3,
  reps INTEGER NOT NULL DEFAULT 10,
  weight DECIMAL(5,2) NOT NULL DEFAULT 50.0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workouts Table
CREATE TABLE workouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  routine_id UUID REFERENCES workout_routines(id),
  routine_name TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in minutes
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5) DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Sets Table
CREATE TABLE workout_sets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  weights JSONB NOT NULL, -- {"50kg": 10, "45kg": 8}
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5) NOT NULL, -- 1=not at all, 5=burning
  correctness INTEGER CHECK (correctness >= 1 AND correctness <= 5) NOT NULL, -- 1=completely off, 5=perfect
  comment TEXT, -- Optional text comment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_exercises_routine_id ON exercises(routine_id);
CREATE INDEX idx_exercises_order ON exercises(routine_id, order_index);
CREATE INDEX idx_workouts_routine_id ON workouts(routine_id);
CREATE INDEX idx_workouts_start_time ON workouts(start_time DESC);
CREATE INDEX idx_workout_sets_workout_id ON workout_sets(workout_id);

-- Insert sample workout routines
INSERT INTO workout_routines (name, active) VALUES 
('Push (Chest + Shoulders)', true),
('Pull (Back + Biceps)', true),
('Posterior Chain + Core (Glutes + Hamstrings + Core)', true);

-- Get the routine IDs
DO $$
DECLARE
  push_routine_id UUID;
  pull_routine_id UUID;
  posterior_routine_id UUID;
BEGIN
  -- Get routine IDs
  SELECT id INTO push_routine_id FROM workout_routines WHERE name = 'Push (Chest + Shoulders)';
  SELECT id INTO pull_routine_id FROM workout_routines WHERE name = 'Pull (Back + Biceps)';
  SELECT id INTO posterior_routine_id FROM workout_routines WHERE name = 'Posterior Chain + Core (Glutes + Hamstrings + Core)';

  -- Insert Push routine exercises
  INSERT INTO exercises (routine_id, name, sets, reps, weight, order_index) VALUES
  (push_routine_id, 'Bench Press', 4, 10, 60.0, 1),
  (push_routine_id, 'Incline Bench Press', 4, 10, 50.0, 2),
  (push_routine_id, 'Overhead Press Dumbbell', 4, 10, 20.0, 3),
  (push_routine_id, 'Lateral Raises', 4, 20, 10.0, 4),
  (push_routine_id, 'Front Shoulders', 4, 20, 10.0, 5);

  -- Insert Pull routine exercises
  INSERT INTO exercises (routine_id, name, sets, reps, weight, order_index) VALUES
  (pull_routine_id, 'Dumbbell Biceps Curl', 4, 20, 15.0, 1),
  (pull_routine_id, 'Lat Pulldown', 4, 20, 40.0, 2),
  (pull_routine_id, 'Biceps Machine', 4, 20, 30.0, 3),
  (pull_routine_id, 'Triceps Pulldown', 4, 20, 25.0, 4),
  (pull_routine_id, 'Back Extension', 4, 15, 0.0, 5),
  (pull_routine_id, 'Abs - Balloon', 6, 15, 0.0, 6);

  -- Insert Posterior Chain routine exercises
  INSERT INTO exercises (routine_id, name, sets, reps, weight, order_index) VALUES
  (posterior_routine_id, 'Deadlift or Romanian Deadlift', 4, 10, 80.0, 1),
  (posterior_routine_id, 'Leg Press', 4, 10, 100.0, 2),
  (posterior_routine_id, 'Leg Back Curl', 4, 20, 35.0, 3),
  (posterior_routine_id, 'Leg Front Curl', 4, 20, 35.0, 4),
  (posterior_routine_id, 'Calf Press', 4, 30, 50.0, 5);
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - you can restrict later)
CREATE POLICY "Allow all operations on workout_routines" ON workout_routines FOR ALL USING (true);
CREATE POLICY "Allow all operations on exercises" ON exercises FOR ALL USING (true);
CREATE POLICY "Allow all operations on workouts" ON workouts FOR ALL USING (true);
CREATE POLICY "Allow all operations on workout_sets" ON workout_sets FOR ALL USING (true);
