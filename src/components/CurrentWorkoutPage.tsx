'use client'

import { useState } from 'react'
import { useWorkoutStore } from '@/lib/store'
import { ArrowLeft, Edit3, Trash2, CheckCircle, Circle, Plus } from 'lucide-react'
import { showError, showSuccess } from '@/lib/errorHandler'

interface CurrentWorkoutPageProps {
  onBack: () => void
  onEditSet: (setId: string) => void
  onAddSet: (exerciseName: string) => void
}

export default function CurrentWorkoutPage({ onBack, onEditSet, onAddSet }: CurrentWorkoutPageProps) {
  const { currentWorkout, logSet, removeSet, markExerciseComplete, markExerciseIncomplete } = useWorkoutStore()
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set())

  if (!currentWorkout) {
    return null
  }

  // Group sets by exercise
  const setsByExercise = currentWorkout.completedSets.reduce((acc, set) => {
    if (!acc[set.exercise_name]) {
      acc[set.exercise_name] = []
    }
    acc[set.exercise_name].push(set)
    return acc
  }, {} as Record<string, typeof currentWorkout.completedSets>)

  // Get exercise completion status
  const getExerciseStatus = (exerciseName: string) => {
    const exercise = currentWorkout.exercises.find(ex => ex.name === exerciseName)
    if (!exercise) return { completed: false, progress: 0, total: 0 }
    
    const completedSets = setsByExercise[exerciseName]?.length || 0
    const isCompleted = completedSets >= exercise.sets
    const progress = Math.min(completedSets, exercise.sets)
    
    return {
      completed: isCompleted,
      progress,
      total: exercise.sets,
      hasExtraSets: completedSets > exercise.sets
    }
  }

  const toggleExerciseExpanded = (exerciseName: string) => {
    const newExpanded = new Set(expandedExercises)
    if (newExpanded.has(exerciseName)) {
      newExpanded.delete(exerciseName)
    } else {
      newExpanded.add(exerciseName)
    }
    setExpandedExercises(newExpanded)
  }

  const handleRemoveSet = (setId: string) => {
    if (confirm('Are you sure you want to remove this set?')) {
      removeSet(setId)
      showSuccess('Set removed successfully')
    }
  }

  const handleToggleExerciseComplete = (exerciseName: string) => {
    const status = getExerciseStatus(exerciseName)
    if (status.completed) {
      markExerciseIncomplete(exerciseName)
      showSuccess(`${exerciseName} marked as incomplete`)
    } else {
      markExerciseComplete(exerciseName)
      showSuccess(`${exerciseName} marked as complete`)
    }
  }

  const getIntensityColor = (intensity: number) => {
    const colors = ['bg-gray-100', 'bg-green-100', 'bg-yellow-100', 'bg-orange-100', 'bg-red-100']
    return colors[intensity - 1] || 'bg-gray-100'
  }

  const getCorrectnessColor = (correctness: number) => {
    const colors = ['bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-green-100', 'bg-emerald-100']
    return colors[correctness - 1] || 'bg-gray-100'
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
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Current Workout</h1>
            <p className="text-slate-600">{currentWorkout.routineName}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Total Sets</div>
          <div className="text-2xl font-bold text-slate-900">{currentWorkout.completedSets.length}</div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Workout Progress Overview */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Workout Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentWorkout.exercises.map((exercise) => {
              const status = getExerciseStatus(exercise.name)
              return (
                <div key={exercise.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleExerciseComplete(exercise.name)}
                      className="w-6 h-6 flex items-center justify-center"
                    >
                      {status.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-400" />
                      )}
                    </button>
                    <div>
                      <div className="font-medium text-slate-900">{exercise.name}</div>
                      <div className="text-sm text-slate-500">
                        {status.progress}/{status.total} sets
                        {status.hasExtraSets && (
                          <span className="text-orange-600 ml-1">(+{status.progress - status.total})</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAddSet(exercise.name)}
                      className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleExerciseExpanded(exercise.name)}
                      className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Completed Sets by Exercise */}
        <div className="space-y-4">
          {Object.entries(setsByExercise).map(([exerciseName, sets]) => {
            const status = getExerciseStatus(exerciseName)
            const isExpanded = expandedExercises.has(exerciseName)
            
            return (
              <div key={exerciseName} className="card">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExerciseExpanded(exerciseName)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${status.completed ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <h3 className="text-lg font-semibold text-slate-900">{exerciseName}</h3>
                    <span className="text-sm text-slate-500">({sets.length} sets)</span>
                  </div>
                  <div className="text-sm text-slate-500">
                    {isExpanded ? 'Hide' : 'Show'} sets
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-3">
                    {sets
                      .sort((a, b) => a.set_number - b.set_number)
                      .map((set) => (
                        <div key={set.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="text-sm font-medium text-slate-600">
                              Set {set.set_number}
                            </div>
                            <div className="text-sm text-slate-900">
                              {Object.entries(set.weights).map(([weight, reps]) => (
                                <span key={weight} className="mr-2">
                                  {weight} × {reps}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`px-2 py-1 rounded text-xs font-medium ${getIntensityColor(set.intensity)}`}>
                                Intensity: {set.intensity}
                              </div>
                              <div className={`px-2 py-1 rounded text-xs font-medium ${getCorrectnessColor(set.correctness)}`}>
                                Form: {set.correctness}
                              </div>
                            </div>
                            {set.comment && (
                              <div className="text-xs text-slate-500 italic">
                                "{set.comment}"
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onEditSet(set.id)}
                              className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveSet(set.id)}
                              className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {currentWorkout.completedSets.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-slate-400 mb-4">
              <Circle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No sets completed yet</h3>
            <p className="text-slate-500">Start logging sets to see them here</p>
          </div>
        )}
      </div>
    </div>
  )
}
