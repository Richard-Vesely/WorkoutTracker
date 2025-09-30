'use client'

import { useState } from 'react'
import { useWorkoutStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, Clock, Dumbbell } from 'lucide-react'

interface FinishWorkoutConfirmationProps {
  onBack: () => void
  onFinish: () => void
}

export default function FinishWorkoutConfirmation({ onBack, onFinish }: FinishWorkoutConfirmationProps) {
  const { currentWorkout, endWorkout } = useWorkoutStore()
  const [isFinishing, setIsFinishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!currentWorkout) {
    return null
  }

  const handleConfirmFinish = async () => {
    setIsFinishing(true)
    setError(null)

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
            intensity: set.intensity,
            correctness: set.correctness,
            comment: set.comment,
          })))

        if (setsError) {
          console.error('Supabase sets error:', setsError)
          throw setsError
        }
      }

      endWorkout()
      onFinish()
    } catch (error) {
      console.error('Error saving workout:', error)
      setError(`Error saving workout: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setIsFinishing(false)
    }
  }

  const totalSets = currentWorkout.completedSets.length
  const totalExercises = currentWorkout.exercises.length
  const completedExercises = new Set(currentWorkout.completedSets.map(set => set.exercise_name)).size

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Finish Workout?</h1>
          <p className="text-slate-600">Are you sure you want to complete this workout?</p>
        </div>

        {/* Workout Summary */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-slate-900 mb-3">Workout Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Routine:</span>
              <span className="font-medium">{currentWorkout.routineName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Exercises:</span>
              <span className="font-medium">{completedExercises} / {totalExercises}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Sets Completed:</span>
              <span className="font-medium">{totalSets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Started:</span>
              <span className="font-medium">{new Date(currentWorkout.startTime).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            disabled={isFinishing}
            className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleConfirmFinish}
            disabled={isFinishing}
            className="flex-1 btn btn-success flex items-center justify-center gap-2"
          >
            {isFinishing ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Finish Workout
              </>
            )}
          </button>
        </div>

        {isFinishing && (
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">Saving your workout data...</p>
          </div>
        )}
      </div>
    </div>
  )
}
