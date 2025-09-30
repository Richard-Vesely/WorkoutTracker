'use client'

import { useState, useEffect } from 'react'
import { useWorkoutStore } from '@/lib/store'
import { WorkoutRoutine, Exercise, supabase } from '@/lib/supabase'
import { ArrowLeft, ArrowRight, Play, Square } from 'lucide-react'
import { showError, showSuccess } from '@/lib/errorHandler'

interface SimpleWorkoutInterfaceProps {
  routines: (WorkoutRoutine & { exercises: Exercise[] })[]
  onBackToHome: () => void
}

export default function SimpleWorkoutInterface({ routines, onBackToHome }: SimpleWorkoutInterfaceProps) {
  const {
    currentWorkout,
    startWorkout,
    endWorkout,
    logSet,
    nextExercise,
    previousExercise,
    selectedRoutineId,
  } = useWorkoutStore()

  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [intensity, setIntensity] = useState(0)
  const [correctness, setCorrectness] = useState(0)
  const [comment, setComment] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Initialize workout if not already started
  useEffect(() => {
    if (!currentWorkout && selectedRoutineId) {
      const selectedRoutine = routines.find(r => r.id === selectedRoutineId)
      if (selectedRoutine) {
        startWorkout(selectedRoutine, selectedRoutine.exercises)
      }
    }
  }, [currentWorkout, selectedRoutineId, routines, startWorkout])

  // Update inputs when exercise changes
  useEffect(() => {
    if (currentWorkout) {
      const currentExercise = currentWorkout.exercises[currentWorkout.currentExerciseIndex]
      if (currentExercise) {
        setWeight(currentExercise.weight.toString())
        setReps(currentExercise.reps.toString())
      }
    }
  }, [currentWorkout?.currentExerciseIndex])

  if (!currentWorkout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No active workout</h2>
          <button onClick={onBackToHome} className="btn btn-primary">Back to Home</button>
        </div>
      </div>
    )
  }

  const currentExercise = currentWorkout.exercises[currentWorkout.currentExerciseIndex]
  const totalExercises = currentWorkout.exercises.length
  const completedSets = currentWorkout.completedSets.filter(set => set.exercise_name === currentExercise.name).length
  const currentSetNumber = completedSets + 1

  const handleLogSet = async () => {
    // Validate inputs
    if (intensity === 0 || correctness === 0) {
      showError('Please select both intensity and correctness', 'Validation Error')
      return
    }

    const weightNum = parseFloat(weight)
    const repsNum = parseInt(reps)
    
    if (isNaN(weightNum) || isNaN(repsNum) || weightNum <= 0 || repsNum <= 0) {
      showError('Please enter valid weight and reps', 'Validation Error')
      return
    }

    const setData = {
      exercise_name: currentExercise.name,
      set_number: currentSetNumber,
      weights: { [`${weightNum}kg`]: repsNum },
      intensity,
      correctness,
      comment: comment.trim() || undefined,
    }

    // Log set locally
    logSet(setData)

    // Reset form
    setIntensity(0)
    setCorrectness(0)
    setComment('')
  }

  const handleFinishWorkout = async () => {
    if (isSaving) return
    
    setIsSaving(true)
    try {
      const endTime = new Date()
      const startTime = new Date(currentWorkout.startTime)
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60)

      // Save workout to database
      const { error: workoutError } = await supabase.from('workouts').insert({
        id: currentWorkout.id,
        routine_id: currentWorkout.routineId,
        routine_name: currentWorkout.routineName,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration,
        energy_level: currentWorkout.energyLevel,
      })

      if (workoutError) throw workoutError

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

        if (setsError) throw setsError
      }

      endWorkout()
      showSuccess('Workout completed and saved!')
      onBackToHome()
    } catch (error) {
      console.error('Error saving workout:', error)
      showError(`Error saving workout: ${error instanceof Error ? error.message : 'Please try again.'}`, 'Save Error')
    } finally {
      setIsSaving(false)
    }
  }

  const canFinish = currentWorkout.completedSets.length > 0

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
        <div className="text-right">
          <div className="text-sm text-slate-500">Sets Completed</div>
          <div className="text-2xl font-bold text-slate-900">{currentWorkout.completedSets.length}</div>
        </div>
      </div>

      <div className="p-6 pb-24">
        {/* Progress */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-600">Progress</span>
            <span className="text-sm text-slate-500">
              {currentWorkout.currentExerciseIndex + 1} of {totalExercises}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentWorkout.currentExerciseIndex + 1) / totalExercises) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Exercise */}
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
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={previousExercise}
              disabled={currentWorkout.currentExerciseIndex === 0}
              className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">Set {currentSetNumber}</div>
              <div className="text-sm text-slate-500">of {currentExercise.sets}</div>
            </div>
            
            <button
              onClick={nextExercise}
              disabled={currentWorkout.currentExerciseIndex === totalExercises - 1}
              className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Set Logging */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Log Set {currentSetNumber}</h3>
          
          {/* Weight & Reps */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reps</label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
              />
            </div>
          </div>

          {/* Muscle Feeling */}
          <div className="space-y-6 mb-6">
            {/* Intensity Scale */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Intensity <span className="text-red-500">*</span>
              </label>
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>1 - Not at all</span>
                <span>5 - Burning</span>
              </div>
              <div className="flex justify-around gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setIntensity(value)}
                    className={`flex-1 p-3 rounded-lg text-lg font-bold transition-all duration-200 ${
                      intensity === value 
                        ? 'bg-blue-600 text-white shadow-lg scale-105' 
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* Correctness Scale */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Form <span className="text-red-500">*</span>
              </label>
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>1 - Completely off</span>
                <span>5 - Perfect</span>
              </div>
              <div className="flex justify-around gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCorrectness(value)}
                    className={`flex-1 p-3 rounded-lg text-lg font-bold transition-all duration-200 ${
                      correctness === value 
                        ? 'bg-blue-600 text-white shadow-lg scale-105' 
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                placeholder="Add any notes about this set..."
              />
            </div>
          </div>

          <button 
            onClick={handleLogSet} 
            className={`btn w-full ${
              intensity > 0 && correctness > 0 
                ? 'btn-success' 
                : 'btn-disabled'
            }`}
            disabled={intensity === 0 || correctness === 0}
          >
            Log Set
          </button>
        </div>

        {/* Finish Workout */}
        {canFinish && (
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100">
            <button 
              onClick={handleFinishWorkout}
              disabled={isSaving}
              className="btn btn-danger w-full flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Square className="w-4 h-4" />
                  Finish Workout
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
