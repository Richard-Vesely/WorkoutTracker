'use client'

import { ArrowLeft, Check, Dumbbell } from 'lucide-react'
import { WorkoutRoutine, Exercise } from '@/lib/supabase'

interface RoutineSelectionProps {
  routines: (WorkoutRoutine & { exercises: Exercise[] })[]
  selectedRoutineId: string | null
  onRoutineSelect: (routineId: string) => void
  onStartWorkout: () => void
  onBack: () => void
}

export default function RoutineSelection({
  routines,
  selectedRoutineId,
  onRoutineSelect,
  onStartWorkout,
  onBack,
}: RoutineSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Choose Routine</h1>
        </div>
      </div>

      <div className="p-6">
        {routines.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No routines found</h3>
            <p className="text-slate-600">
              Create some routines in your database first
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-24">
            {routines.map((routine) => (
              <div
                key={routine.id}
                onClick={() => onRoutineSelect(routine.id)}
                className={`card-interactive ${
                  selectedRoutineId === routine.id ? 'card-selected' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    {routine.name}
                  </h3>
                  {selectedRoutineId === routine.id && (
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-600 font-medium">
                    {routine.exercises.length} exercises
                  </span>
                </div>

                <div className="space-y-2">
                  {routine.exercises.slice(0, 3).map((exercise, index) => (
                    <div key={exercise.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-medium">
                        {exercise.name}
                      </span>
                      <span className="text-slate-500">
                        {exercise.sets} × {exercise.reps}
                      </span>
                    </div>
                  ))}
                  {routine.exercises.length > 3 && (
                    <div className="text-sm text-slate-500 font-medium">
                      +{routine.exercises.length - 3} more exercises
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100">
          <button
            onClick={onStartWorkout}
            disabled={!selectedRoutineId}
            className="btn btn-primary w-full text-lg"
          >
            Start Workout
          </button>
        </div>
      </div>
    </div>
  )
}
