'use client'

import { useEffect, useState } from 'react'
import { useWorkoutStore } from '@/lib/store'
import { WorkoutRoutine, Exercise, supabase } from '@/lib/supabase'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import BreakTimer from './BreakTimer'

interface WorkoutInterfaceProps {
  routines: (WorkoutRoutine & { exercises: Exercise[] })[]
  onBackToHome: () => void
}

interface WeightInput {
  id: string
  weight: string
  reps: string
}

export default function WorkoutInterface({ routines, onBackToHome }: WorkoutInterfaceProps) {
  const {
    currentWorkout,
    startWorkout,
    endWorkout,
    logSet,
    nextExercise,
    previousExercise,
    isBreakActive,
    startBreakTimer,
    selectedRoutineId,
  } = useWorkoutStore()

  const [weightInputs, setWeightInputs] = useState<WeightInput[]>([
    { id: '1', weight: '', reps: '' }
  ])
  const [muscleFeeling, setMuscleFeeling] = useState(3)
  const [newGoals, setNewGoals] = useState({ weight: '', reps: '', sets: '' })

  // Initialize workout if not already started
  useEffect(() => {
    if (!currentWorkout && selectedRoutineId) {
      const selectedRoutine = routines.find(r => r.id === selectedRoutineId)
      if (selectedRoutine) {
        startWorkout(selectedRoutine, selectedRoutine.exercises)
      }
    }
  }, [currentWorkout, selectedRoutineId, routines, startWorkout])

  // Update weight inputs when exercise changes
  useEffect(() => {
    if (currentWorkout) {
      const currentExercise = currentWorkout.exercises[currentWorkout.currentExerciseIndex]
      if (currentExercise) {
        setWeightInputs([{
          id: '1',
          weight: currentExercise.weight.toString(),
          reps: currentExercise.reps.toString()
        }])
      }
    }
  }, [currentWorkout?.currentExerciseIndex])

  if (!currentWorkout) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center">
          <p className="text-gray-600 mb-4">Loading workout...</p>
          <button onClick={onBackToHome} className="btn btn-secondary">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const currentExercise = currentWorkout.exercises[currentWorkout.currentExerciseIndex]
  const totalExercises = currentWorkout.exercises.length
  const progress = ((currentWorkout.currentExerciseIndex + 1) / totalExercises) * 100

  // Calculate current set number
  const completedSetsForExercise = currentWorkout.completedSets.filter(
    set => set.exercise_name === currentExercise.name
  ).length
  const currentSetNumber = completedSetsForExercise + 1

  const addWeightInput = () => {
    setWeightInputs(prev => [
      ...prev,
      { id: Date.now().toString(), weight: '', reps: '' }
    ])
  }

  const removeWeightInput = (id: string) => {
    if (weightInputs.length > 1) {
      setWeightInputs(prev => prev.filter(input => input.id !== id))
    }
  }

  const updateWeightInput = (id: string, field: 'weight' | 'reps', value: string) => {
    setWeightInputs(prev => prev.map(input => 
      input.id === id ? { ...input, [field]: value } : input
    ))
  }

  const handleLogSet = async () => {
    const weights: Record<string, number> = {}
    
    weightInputs.forEach(input => {
      if (input.weight && input.reps) {
        weights[`${input.weight}kg`] = parseInt(input.reps)
      }
    })

    if (Object.keys(weights).length === 0) {
      alert('Please enter at least one weight and reps combination')
      return
    }

    const setData = {
      exercise_name: currentExercise.name,
      set_number: currentSetNumber,
      weights,
      muscle_feeling: muscleFeeling,
    }

    // Log set locally (will be saved to database when workout is finished)
    logSet(setData)

    // Check if all sets completed for this exercise
    if (currentSetNumber >= currentExercise.sets) {
      // Move to next exercise or finish workout
      if (currentWorkout.currentExerciseIndex < totalExercises - 1) {
        nextExercise()
      } else {
        handleFinishWorkout()
        return
      }
    } else {
      // Start break timer
      startBreakTimer(120) // 2 minutes
    }

    // Reset form
    setWeightInputs([{
      id: '1',
      weight: currentExercise.weight.toString(),
      reps: currentExercise.reps.toString()
    }])
    setMuscleFeeling(3)
  }

  const handleFinishWorkout = async () => {
    if (!confirm('Are you sure you want to finish this workout?')) return

    try {
      // Save workout to database
      const endTime = new Date()
      const startTime = new Date(currentWorkout.startTime)
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60)

      const { error: workoutError } = await supabase.from('workouts').insert({
        id: currentWorkout.id,
        routine_id: currentWorkout.routineId,
        routine_name: currentWorkout.routineName,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration,
        energy_level: currentWorkout.energyLevel,
      })

      if (workoutError) {
        console.error('Supabase workout error:', workoutError)
        throw workoutError
      }

      // Save all workout sets to database
      if (currentWorkout.completedSets.length > 0) {
        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(currentWorkout.completedSets.map(set => ({
            id: set.id,
            workout_id: set.workout_id,
            exercise_name: set.exercise_name,
            set_number: set.set_number,
            weights: set.weights,
            muscle_feeling: set.muscle_feeling,
          })))

        if (setsError) {
          console.error('Supabase sets error:', setsError)
          throw setsError
        }
      }

      endWorkout()
      onBackToHome()
      alert('Workout completed and saved!')
    } catch (error) {
      console.error('Error saving workout:', error)
      alert(`Error saving workout: ${error.message || 'Please try again.'}`)
    }
  }

  const updateGoals = () => {
    // This would update the exercise goals in the database
    // For now, just clear the inputs
    setNewGoals({ weight: '', reps: '', sets: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBackToHome} 
            className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{currentWorkout.routineName}</h1>
            <p className="text-slate-600">Started: {new Date(currentWorkout.startTime).toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      <div className="p-6 pb-24">

        {/* Progress */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-slate-700">Progress</span>
            <span className="text-sm text-slate-600">
              Exercise {currentWorkout.currentExerciseIndex + 1} of {totalExercises}
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Exercise Info */}
        <div className="card mb-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              {currentExercise.name}
            </h2>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-medium">
              Goal: {currentExercise.sets} × {currentExercise.reps} @ {currentExercise.weight}kg
            </div>
          </div>

          {/* Exercise Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={previousExercise}
              disabled={currentWorkout.currentExerciseIndex === 0}
              className="exercise-nav-btn"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">Set {currentSetNumber}</div>
              <div className="text-sm text-slate-500">of {currentExercise.sets}</div>
            </div>
            
            <button
              onClick={nextExercise}
              disabled={currentWorkout.currentExerciseIndex === totalExercises - 1}
              className="exercise-nav-btn"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Break Timer */}
        {isBreakActive && <BreakTimer />}

        {/* Set Logging */}
        {!isBreakActive && (
          <div className="card mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Log Set {currentSetNumber}</h3>
            
            {/* Weight Inputs */}
            <div className="space-y-3 mb-4">
              {weightInputs.map((input, index) => (
                <div key={input.id} className="flex gap-3 items-center">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Weight {index + 1} (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      className="input"
                      placeholder="50"
                      value={input.weight}
                      onChange={(e) => updateWeightInput(input.id, 'weight', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Reps
                    </label>
                    <input
                      type="number"
                      className="input"
                      placeholder="10"
                      value={input.reps}
                      onChange={(e) => updateWeightInput(input.id, 'reps', e.target.value)}
                    />
                  </div>
                  {weightInputs.length > 1 && (
                    <button
                      onClick={() => removeWeightInput(input.id)}
                      className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addWeightInput}
              className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4"
            >
              <Plus className="w-4 h-4" />
              Add Drop Set
            </button>

            {/* Muscle Feeling */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Muscle Feeling (1-5)
              </label>
              <select
                className="select"
                value={muscleFeeling}
                onChange={(e) => setMuscleFeeling(parseInt(e.target.value))}
              >
                <option value={1}>1 - Very Light</option>
                <option value={2}>2 - Light</option>
                <option value={3}>3 - Moderate</option>
                <option value={4}>4 - Hard</option>
                <option value={5}>5 - Very Hard</option>
              </select>
            </div>

            <button onClick={handleLogSet} className="btn btn-success w-full">
              Log Set & Start Break
            </button>
          </div>
        )}

        {/* Goal Updates */}
        {!isBreakActive && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Update Goals (Optional)</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <input
                type="number"
                step="0.5"
                className="input"
                placeholder="Weight"
                value={newGoals.weight}
                onChange={(e) => setNewGoals(prev => ({ ...prev, weight: e.target.value }))}
              />
              <input
                type="number"
                className="input"
                placeholder="Reps"
                value={newGoals.reps}
                onChange={(e) => setNewGoals(prev => ({ ...prev, reps: e.target.value }))}
              />
              <input
                type="number"
                className="input"
                placeholder="Sets"
                value={newGoals.sets}
                onChange={(e) => setNewGoals(prev => ({ ...prev, sets: e.target.value }))}
              />
            </div>
            <button onClick={updateGoals} className="btn btn-secondary w-full">
              Update Goals
            </button>
          </div>
        )}

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100">
          <button onClick={handleFinishWorkout} className="btn btn-danger w-full">
            Finish Workout
          </button>
        </div>
      </div>
    </div>
  )
}
