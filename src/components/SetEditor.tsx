'use client'

import { useState, useEffect } from 'react'
import { useWorkoutStore } from '@/lib/store'
import { WorkoutSet } from '@/lib/supabase'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import MuscleFeelingInput from './MuscleFeelingInput'
import { showError, showSuccess } from '@/lib/errorHandler'

interface SetEditorProps {
  setId: string
  onBack: () => void
  onSave: () => void
}

export default function SetEditor({ setId, onBack, onSave }: SetEditorProps) {
  const { currentWorkout, updateSet, removeSet } = useWorkoutStore()
  const [weights, setWeights] = useState<Record<string, number>>({})
  const [intensity, setIntensity] = useState(0)
  const [correctness, setCorrectness] = useState(0)
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Find the set to edit
  const setToEdit = currentWorkout?.completedSets.find(set => set.id === setId)

  useEffect(() => {
    if (setToEdit) {
      setWeights(setToEdit.weights)
      setIntensity(setToEdit.intensity)
      setCorrectness(setToEdit.correctness)
      setComment(setToEdit.comment || '')
    }
  }, [setToEdit])

  if (!setToEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Set not found</h2>
          <button onClick={onBack} className="btn btn-secondary">Go Back</button>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    if (intensity === 0 || correctness === 0) {
      showError('Please select both intensity and correctness', 'Validation Error')
      return
    }

    if (Object.keys(weights).length === 0) {
      showError('Please enter at least one weight and reps combination', 'Validation Error')
      return
    }

    setIsLoading(true)
    try {
      updateSet(setId, {
        weights,
        intensity,
        correctness,
        comment: comment.trim() || undefined,
      })
      showSuccess('Set updated successfully')
      onSave()
    } catch (error) {
      showError('Failed to update set', 'Error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this set?')) {
      removeSet(setId)
      showSuccess('Set deleted successfully')
      onBack()
    }
  }

  const addWeightInput = () => {
    const newWeight = prompt('Enter weight (e.g., 50kg):')
    if (newWeight) {
      const reps = prompt('Enter reps:')
      if (reps && !isNaN(parseInt(reps))) {
        setWeights(prev => ({
          ...prev,
          [newWeight]: parseInt(reps)
        }))
      }
    }
  }

  const removeWeight = (weight: string) => {
    const newWeights = { ...weights }
    delete newWeights[weight]
    setWeights(newWeights)
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
            <h1 className="text-2xl font-bold text-slate-900">Edit Set</h1>
            <p className="text-slate-600">{setToEdit.exercise_name} - Set {setToEdit.set_number}</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="w-10 h-10 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-200 transition-colors duration-200"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {/* Weight Inputs */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Weight & Reps</h3>
          
          <div className="space-y-3 mb-4">
            {Object.entries(weights).map(([weight, reps]) => (
              <div key={weight} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">{weight}</div>
                  <div className="text-sm text-slate-500">{reps} reps</div>
                </div>
                <button
                  onClick={() => removeWeight(weight)}
                  className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addWeightInput}
            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            + Add Weight/Reps
          </button>
        </div>

        {/* Muscle Feeling */}
        <div className="card mb-6">
          <MuscleFeelingInput
            intensity={intensity}
            correctness={correctness}
            comment={comment}
            onIntensityChange={setIntensity}
            onCorrectnessChange={setCorrectness}
            onCommentChange={setComment}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            disabled={isLoading}
            className="flex-1 btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || intensity === 0 || correctness === 0}
            className="flex-1 btn btn-success flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
