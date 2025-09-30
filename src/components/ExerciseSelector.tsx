'use client'

import { useState } from 'react'
import { useWorkoutStore } from '@/lib/store'
import { CheckCircle, Circle, Search } from 'lucide-react'

interface ExerciseSelectorProps {
  onSelectExercise: (exerciseName: string) => void
  onBack: () => void
}

export default function ExerciseSelector({ onSelectExercise, onBack }: ExerciseSelectorProps) {
  const { currentWorkout } = useWorkoutStore()
  const [searchTerm, setSearchTerm] = useState('')

  if (!currentWorkout) {
    return null
  }

  // Filter exercises based on search and completion status
  const availableExercises = currentWorkout.exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    const isNotCompleted = !currentWorkout.completedExercises.has(exercise.name)
    return matchesSearch && isNotCompleted
  })

  const completedExercises = currentWorkout.exercises.filter(exercise => 
    currentWorkout.completedExercises.has(exercise.name)
  )

  const getExerciseProgress = (exerciseName: string) => {
    const completedSets = currentWorkout.completedSets.filter(set => set.exercise_name === exerciseName).length
    const exercise = currentWorkout.exercises.find(ex => ex.name === exerciseName)
    return {
      completed: completedSets,
      total: exercise?.sets || 0,
      hasExtra: completedSets > (exercise?.sets || 0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-colors duration-200"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Select Exercise</h1>
            <p className="text-slate-600">Choose an exercise to log sets for</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Available Exercises */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Exercises</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableExercises.map((exercise) => {
              const progress = getExerciseProgress(exercise.name)
              return (
                <button
                  key={exercise.name}
                  onClick={() => onSelectExercise(exercise.name)}
                  className="p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{exercise.name}</h4>
                    <div className="text-sm text-slate-500">
                      {progress.completed}/{progress.total} sets
                      {progress.hasExtra && (
                        <span className="text-orange-600 ml-1">(+{progress.completed - progress.total})</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}kg
                  </div>
                  {progress.completed > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((progress.completed / progress.total) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Completed Exercises */}
        {completedExercises.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Completed Exercises</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedExercises.map((exercise) => {
                const progress = getExerciseProgress(exercise.name)
                return (
                  <div
                    key={exercise.name}
                    className="p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-900 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {exercise.name}
                      </h4>
                      <div className="text-sm text-green-600">
                        {progress.completed} sets completed
                        {progress.hasExtra && (
                          <span className="text-orange-600 ml-1">(+{progress.completed - progress.total})</span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-green-700">
                      {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}kg
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {availableExercises.length === 0 && completedExercises.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Circle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No exercises found</h3>
            <p className="text-slate-500">Try adjusting your search term</p>
          </div>
        )}
      </div>
    </div>
  )
}
