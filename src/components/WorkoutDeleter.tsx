'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Trash2, Calendar, Clock, Dumbbell } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Workout {
  id: string
  routine_name: string
  start_time: string
  end_time?: string
  duration?: number
  energy_level: number
  created_at: string
}

interface WorkoutDeleterProps {
  onBack: () => void
}

export default function WorkoutDeleter({ onBack }: WorkoutDeleterProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWorkouts, setSelectedWorkouts] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadWorkouts()
  }, [])

  const loadWorkouts = async () => {
    try {
      setLoading(true)
      console.log('Loading workouts from database...')
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error loading workouts:', error)
        throw error
      }
      
      console.log('Loaded workouts:', data)
      setWorkouts(data || [])
    } catch (error) {
      console.error('Error loading workouts:', error)
      alert(`Error loading workouts: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleWorkoutSelection = (workoutId: string) => {
    console.log('Toggling workout selection for ID:', workoutId)
    const newSelected = new Set(selectedWorkouts)
    if (newSelected.has(workoutId)) {
      newSelected.delete(workoutId)
      console.log('Removed from selection')
    } else {
      newSelected.add(workoutId)
      console.log('Added to selection')
    }
    console.log('Selected workouts:', Array.from(newSelected))
    setSelectedWorkouts(newSelected)
  }

  const selectAll = () => {
    setSelectedWorkouts(new Set(workouts.map(w => w.id)))
  }

  const clearSelection = () => {
    setSelectedWorkouts(new Set())
  }

  const createTestWorkout = async () => {
    try {
      console.log('Creating test workout...')
      const testWorkout = {
        id: crypto.randomUUID(),
        routine_id: crypto.randomUUID(),
        routine_name: 'Test Workout',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration: 30,
        energy_level: 3,
      }

      const { error } = await supabase
        .from('workouts')
        .insert(testWorkout)

      if (error) {
        console.error('Error creating test workout:', error)
        throw error
      }

      console.log('Test workout created successfully')
      loadWorkouts()
    } catch (error) {
      console.error('Error creating test workout:', error)
      alert(`Error creating test workout: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const deleteSelectedWorkouts = async () => {
    console.log('deleteSelectedWorkouts called!')
    console.log('Selected workouts size:', selectedWorkouts.size)
    console.log('Selected workouts:', Array.from(selectedWorkouts))
    
    if (selectedWorkouts.size === 0) {
      console.log('No workouts selected, showing alert')
      alert('Please select workouts to delete')
      return
    }

    console.log('Showing confirmation dialog')
    if (!confirm(`Are you sure you want to delete ${selectedWorkouts.size} workout(s)? This action cannot be undone.`)) {
      console.log('User cancelled deletion')
      return
    }
    
    console.log('User confirmed deletion, proceeding...')

    try {
      const workoutIds = Array.from(selectedWorkouts)
      console.log('Deleting workouts with IDs:', workoutIds)

      // Delete workout sets first (due to foreign key constraint)
      console.log('Deleting workout sets...')
      const { error: setsError, count: setsCount } = await supabase
        .from('workout_sets')
        .delete()
        .in('workout_id', workoutIds)

      if (setsError) {
        console.error('Error deleting workout sets:', setsError)
        throw setsError
      }
      console.log(`Deleted ${setsCount || 0} workout sets`)

      // Delete workouts
      console.log('Deleting workouts...')
      const { error: workoutsError, count: workoutsCount } = await supabase
        .from('workouts')
        .delete()
        .in('id', workoutIds)

      if (workoutsError) {
        console.error('Error deleting workouts:', workoutsError)
        throw workoutsError
      }
      console.log(`Deleted ${workoutsCount || 0} workouts`)

      alert(`Successfully deleted ${workoutsCount || selectedWorkouts.size} workout(s)`)
      setSelectedWorkouts(new Set())
      loadWorkouts()
    } catch (error) {
      console.error('Error deleting workouts:', error)
      alert(`Error deleting workouts: ${error instanceof Error ? error.message : 'Please try again.'}`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 pulse-glow">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Loading workouts...</p>
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
          <h1 className="text-2xl font-bold text-slate-900">Delete Workouts</h1>
        </div>
        
        {selectedWorkouts.size > 0 && (
          <button
            onClick={deleteSelectedWorkouts}
            className="btn btn-danger flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete ({selectedWorkouts.size})
          </button>
        )}
      </div>

      <div className="p-6">
        {workouts.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No workouts found</h3>
            <p className="text-slate-600 mb-4">You haven't logged any workouts yet</p>
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={createTestWorkout}
                className="btn btn-secondary"
              >
                Create Test Workout
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Selection Controls */}
            <div className="card mb-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  {selectedWorkouts.size} of {workouts.length} workouts selected
                </div>
                <div className="flex gap-2">
                  {process.env.NODE_ENV === 'development' && (
                    <>
                      <button
                        onClick={createTestWorkout}
                        className="btn btn-ghost text-sm px-3 py-1 bg-green-100 text-green-600"
                      >
                        Create Test
                      </button>
                      <button
                        onClick={() => {
                          console.log('Debug: Current selected workouts:', Array.from(selectedWorkouts))
                          console.log('Debug: Total workouts:', workouts.length)
                          if (selectedWorkouts.size > 0) {
                            deleteSelectedWorkouts()
                          } else {
                            alert('Please select a workout first')
                          }
                        }}
                        className="btn btn-ghost text-sm px-3 py-1 bg-red-100 text-red-600"
                      >
                        Debug Delete
                      </button>
                    </>
                  )}
                  <button
                    onClick={selectAll}
                    className="btn btn-ghost text-sm px-3 py-1"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="btn btn-ghost text-sm px-3 py-1"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Workouts List */}
            <div className="space-y-4 mb-24">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => toggleWorkoutSelection(workout.id)}
                  className={`card-interactive ${
                    selectedWorkouts.has(workout.id) ? 'card-selected' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {workout.routine_name}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(workout.start_time)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(workout.start_time)}
                        </div>
                        {workout.duration && (
                          <div className="flex items-center gap-1">
                            <span>{workout.duration} min</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {selectedWorkouts.has(workout.id) && (
                      <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      Energy Level: {workout.energy_level}/5
                    </div>
                    <div className="text-xs text-slate-400">
                      ID: {workout.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fixed Bottom Button */}
            {selectedWorkouts.size > 0 && (
              <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100">
                <button
                  onClick={deleteSelectedWorkouts}
                  className="btn btn-danger w-full text-lg"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete {selectedWorkouts.size} Workout{selectedWorkouts.size > 1 ? 's' : ''}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
