'use client'

import { Dumbbell, Play, RotateCcw } from 'lucide-react'
import { useWorkoutStore } from '@/lib/simpleStore'

interface SimpleHomeScreenProps {
  onStartWorkout: () => void
  onContinueWorkout: () => void
  hasCurrentWorkout: boolean
}

export default function SimpleHomeScreen({ 
  onStartWorkout, 
  onContinueWorkout, 
  hasCurrentWorkout 
}: SimpleHomeScreenProps) {
  const { clearWorkout } = useWorkoutStore()

  const handleClearWorkout = () => {
    if (confirm('Clear current workout data? This will remove any unsaved progress.')) {
      clearWorkout()
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
          <h1 className="text-2xl font-bold text-slate-900">Workout Tracker</h1>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={handleClearWorkout}
            className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors duration-200"
            title="Clear workout data"
          >
            Clear
          </button>
        )}
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
              className="btn btn-success w-full flex items-center justify-center gap-3 text-lg"
            >
              <RotateCcw className="w-5 h-5" />
              Continue Workout
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
