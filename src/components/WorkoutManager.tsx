'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, Edit3, Save, X } from 'lucide-react'
import { WorkoutRoutine, Exercise, supabase } from '@/lib/supabase'

interface WorkoutManagerProps {
  routines: (WorkoutRoutine & { exercises: Exercise[] })[]
  onBack: () => void
  onRoutinesUpdated: () => void
}

interface EditingRoutine {
  id?: string
  name: string
  exercises: Omit<Exercise, 'id' | 'routine_id' | 'created_at' | 'updated_at'>[]
}

export default function WorkoutManager({ routines, onBack, onRoutinesUpdated }: WorkoutManagerProps) {
  const [editingRoutine, setEditingRoutine] = useState<EditingRoutine | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const startEditing = (routine: WorkoutRoutine & { exercises: Exercise[] }) => {
    setEditingRoutine({
      id: routine.id,
      name: routine.name,
      exercises: routine.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        order_index: ex.order_index
      }))
    })
  }

  const startCreating = () => {
    setEditingRoutine({
      name: '',
      exercises: []
    })
    setIsCreating(true)
  }

  const addExercise = () => {
    if (!editingRoutine) return
    
    const newExercise = {
      name: '',
      sets: 3,
      reps: 10,
      weight: 50,
      order_index: editingRoutine.exercises.length
    }
    
    setEditingRoutine({
      ...editingRoutine,
      exercises: [...editingRoutine.exercises, newExercise]
    })
  }

  const updateExercise = (index: number, field: keyof Omit<Exercise, 'id' | 'routine_id' | 'created_at' | 'updated_at'>, value: any) => {
    if (!editingRoutine) return
    
    const updatedExercises = [...editingRoutine.exercises]
    updatedExercises[index] = { ...updatedExercises[index], [field]: value }
    
    setEditingRoutine({
      ...editingRoutine,
      exercises: updatedExercises
    })
  }

  const removeExercise = (index: number) => {
    if (!editingRoutine) return
    
    const updatedExercises = editingRoutine.exercises.filter((_, i) => i !== index)
    // Reorder indices
    updatedExercises.forEach((ex, i) => ex.order_index = i)
    
    setEditingRoutine({
      ...editingRoutine,
      exercises: updatedExercises
    })
  }

  const saveRoutine = async () => {
    if (!editingRoutine || !editingRoutine.name.trim()) {
      alert('Please enter a routine name')
      return
    }

    if (editingRoutine.exercises.length === 0) {
      alert('Please add at least one exercise')
      return
    }

    try {
      if (isCreating) {
        // Create new routine
        const { data: routine, error: routineError } = await supabase
          .from('workout_routines')
          .insert({
            name: editingRoutine.name,
            active: true
          })
          .select()
          .single()

        if (routineError) throw routineError

        // Add exercises
        const exercisesToInsert = editingRoutine.exercises.map(ex => ({
          routine_id: routine.id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          order_index: ex.order_index
        }))

        const { error: exercisesError } = await supabase
          .from('exercises')
          .insert(exercisesToInsert)

        if (exercisesError) throw exercisesError
      } else {
        // Update existing routine
        const { error: routineError } = await supabase
          .from('workout_routines')
          .update({ name: editingRoutine.name })
          .eq('id', editingRoutine.id)

        if (routineError) throw routineError

        // Delete existing exercises
        const { error: deleteError } = await supabase
          .from('exercises')
          .delete()
          .eq('routine_id', editingRoutine.id)

        if (deleteError) throw deleteError

        // Insert updated exercises
        const exercisesToInsert = editingRoutine.exercises.map(ex => ({
          routine_id: editingRoutine.id!,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          order_index: ex.order_index
        }))

        const { error: exercisesError } = await supabase
          .from('exercises')
          .insert(exercisesToInsert)

        if (exercisesError) throw exercisesError
      }

      setEditingRoutine(null)
      setIsCreating(false)
      onRoutinesUpdated()
    } catch (error) {
      console.error('Error saving routine:', error)
      alert(`Error saving routine: ${error instanceof Error ? error.message : 'Please try again.'}`)
    }
  }

  const deleteRoutine = async (routineId: string) => {
    if (!confirm('Are you sure you want to delete this routine?')) return

    try {
      const { error } = await supabase
        .from('workout_routines')
        .delete()
        .eq('id', routineId)

      if (error) throw error

      onRoutinesUpdated()
    } catch (error) {
      console.error('Error deleting routine:', error)
      alert(`Error deleting routine: ${error instanceof Error ? error.message : 'Please try again.'}`)
    }
  }

  const cancelEditing = () => {
    setEditingRoutine(null)
    setIsCreating(false)
  }

  if (editingRoutine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={cancelEditing}
              className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">
              {isCreating ? 'Create Routine' : 'Edit Routine'}
            </h1>
          </div>
          <button
            onClick={saveRoutine}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>

        <div className="p-6 pb-24">
          {/* Routine Name */}
          <div className="card mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Routine Name
            </label>
            <input
              type="text"
              className="input"
              value={editingRoutine.name}
              onChange={(e) => setEditingRoutine({ ...editingRoutine, name: e.target.value })}
              placeholder="Enter routine name"
            />
          </div>

          {/* Exercises */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Exercises</h3>
              <button
                onClick={addExercise}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Exercise
              </button>
            </div>

            {editingRoutine.exercises.map((exercise, index) => (
              <div key={index} className="card">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-500">
                    Exercise {index + 1}
                  </span>
                  <button
                    onClick={() => removeExercise(index)}
                    className="w-8 h-8 bg-red-50 text-red-600 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Exercise Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      placeholder="Enter exercise name"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Sets
                      </label>
                      <input
                        type="number"
                        className="input"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Reps
                      </label>
                      <input
                        type="number"
                        className="input"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        className="input"
                        value={exercise.weight}
                        onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value))}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {editingRoutine.exercises.length === 0 && (
              <div className="card text-center py-12">
                <p className="text-slate-500 mb-4">No exercises added yet</p>
                <button
                  onClick={addExercise}
                  className="btn btn-primary flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add First Exercise
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-slate-900">Manage Workouts</h1>
        </div>
        <button
          onClick={startCreating}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Routine
        </button>
      </div>

      <div className="p-6">
        {routines.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No routines yet</h3>
            <p className="text-slate-600 mb-6">Create your first workout routine to get started</p>
            <button
              onClick={startCreating}
              className="btn btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create First Routine
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {routines.map((routine) => (
              <div key={routine.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      {routine.name}
                    </h3>
                    <p className="text-slate-600">
                      {routine.exercises.length} exercises
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(routine)}
                      className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-100 transition-colors duration-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRoutine(routine.id)}
                      className="w-10 h-10 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-100 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {routine.exercises.slice(0, 3).map((exercise, index) => (
                    <div key={exercise.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-medium">
                        {exercise.name}
                      </span>
                      <span className="text-slate-500">
                        {exercise.sets} × {exercise.reps} @ {exercise.weight}kg
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
      </div>
    </div>
  )
}
