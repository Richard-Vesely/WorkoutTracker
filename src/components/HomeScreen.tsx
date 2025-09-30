'use client'

import { Dumbbell, Play, RotateCcw, Settings, Trash2 } from 'lucide-react'
import { useWorkoutStore } from '@/lib/store'

interface HomeScreenProps {
  onStartWorkout: () => void
  onContinueWorkout: () => void
  onManageWorkouts: () => void
  onDeleteWorkouts: () => void
  hasCurrentWorkout: boolean
}

export default function HomeScreen({ 
  onStartWorkout, 
  onContinueWorkout, 
  onManageWorkouts,
  onDeleteWorkouts,
  hasCurrentWorkout 
}: HomeScreenProps) {
  const { clearWorkout } = useWorkoutStore()

  const handleClearWorkout = () => {
    if (confirm('Clear current workout data? This will remove any unsaved progress.')) {
      clearWorkout()
      window.location.reload()
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Workout</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={handleClearWorkout}
              className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors duration-200"
              title="Clear workout data"
            >
              Clear
            </button>
          )}
          <button 
            onClick={onManageWorkouts}
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200"
          >
            <Settings className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-20">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 pulse-glow mx-auto">
            <Dumbbell className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Ready to train?
          </h2>
          <p className="text-slate-600">
            Choose your workout and start lifting
          </p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={onStartWorkout}
            className="btn btn-primary w-full flex items-center justify-center gap-3 text-lg"
          >
            <Play className="w-5 h-5" />
            Start Workout
          </button>

          {hasCurrentWorkout && (
            <button
              onClick={onContinueWorkout}
              className="btn btn-secondary w-full flex items-center justify-center gap-3"
            >
              <RotateCcw className="w-5 h-5" />
              Continue Workout
            </button>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onManageWorkouts}
              className="btn btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <Settings className="w-4 h-4" />
              Edit Routines
            </button>
            
            <button
              onClick={onDeleteWorkouts}
              className="btn btn-ghost flex items-center justify-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete Workouts
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
