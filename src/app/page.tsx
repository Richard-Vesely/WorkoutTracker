'use client'

import { useEffect, useState } from 'react'
import { supabase, WorkoutRoutine, Exercise } from '@/lib/supabase'
import { useWorkoutStore } from '@/lib/store'
import HomeScreen from '@/components/HomeScreen'
import RoutineSelection from '@/components/RoutineSelection'
import WorkoutInterface from '@/components/WorkoutInterface'
import WorkoutManager from '@/components/WorkoutManager'
import WorkoutDeleter from '@/components/WorkoutDeleter'
import { Dumbbell } from 'lucide-react'

export default function Home() {
  const [routines, setRoutines] = useState<(WorkoutRoutine & { exercises: Exercise[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentScreen, setCurrentScreen] = useState<'home' | 'routines' | 'workout' | 'manage' | 'delete'>('home')
  
  const { currentWorkout, selectedRoutineId, setSelectedRoutine, loadWorkout } = useWorkoutStore()

  useEffect(() => {
    loadWorkout()
    loadRoutines()
  }, [])

  useEffect(() => {
    if (currentWorkout) {
      setCurrentScreen('workout')
    }
  }, [currentWorkout])

  const loadRoutines = async () => {
    try {
      setLoading(true)
      
      // Get active routines
      const { data: routinesData, error: routinesError } = await supabase
        .from('workout_routines')
        .select('*')
        .eq('active', true)
        .order('created_at')

      if (routinesError) throw routinesError

      // Get exercises for each routine
      const routinesWithExercises = await Promise.all(
        (routinesData || []).map(async (routine) => {
          const { data: exercises, error: exercisesError } = await supabase
            .from('exercises')
            .select('*')
            .eq('routine_id', routine.id)
            .order('order_index')

          if (exercisesError) throw exercisesError

          return {
            ...routine,
            exercises: exercises || [],
          }
        })
      )

      setRoutines(routinesWithExercises)
    } catch (err) {
      console.error('Error loading routines:', err)
      setError(err instanceof Error ? err.message : 'Failed to load routines')
    } finally {
      setLoading(false)
    }
  }

  const handleStartWorkout = () => {
    setCurrentScreen('routines')
  }

  const handleContinueWorkout = () => {
    if (currentWorkout) {
      setCurrentScreen('workout')
    }
  }

  const handleBackToHome = () => {
    setCurrentScreen('home')
    setSelectedRoutine('')
  }

  const handleManageWorkouts = () => {
    setCurrentScreen('manage')
  }

  const handleDeleteWorkouts = () => {
    setCurrentScreen('delete')
  }

  const handleRoutineSelect = (routineId: string) => {
    setSelectedRoutine(routineId)
  }

  const handleStartSelectedWorkout = () => {
    const selectedRoutine = routines.find(r => r.id === selectedRoutineId)
    if (selectedRoutine) {
      setCurrentScreen('workout')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-xl font-semibold">Loading your workouts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={loadRoutines}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {currentScreen === 'home' && (
        <HomeScreen 
          onStartWorkout={handleStartWorkout}
          onContinueWorkout={handleContinueWorkout}
          onManageWorkouts={handleManageWorkouts}
          onDeleteWorkouts={handleDeleteWorkouts}
          hasCurrentWorkout={!!currentWorkout}
        />
      )}
      
      {currentScreen === 'routines' && (
        <RoutineSelection
          routines={routines}
          selectedRoutineId={selectedRoutineId}
          onRoutineSelect={handleRoutineSelect}
          onStartWorkout={handleStartSelectedWorkout}
          onBack={handleBackToHome}
        />
      )}
      
      {currentScreen === 'workout' && (
        <WorkoutInterface 
          routines={routines}
          onBackToHome={handleBackToHome}
        />
      )}

      {currentScreen === 'manage' && (
        <WorkoutManager
          routines={routines}
          onBack={handleBackToHome}
          onRoutinesUpdated={loadRoutines}
        />
      )}

      {currentScreen === 'delete' && (
        <WorkoutDeleter
          onBack={handleBackToHome}
        />
      )}
    </div>
  )
}
