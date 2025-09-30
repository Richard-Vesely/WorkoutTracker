import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WorkoutRoutine, Exercise, Workout, WorkoutSet } from './supabase'

// Polyfill for crypto.randomUUID() for older browsers
if (typeof window !== 'undefined' && !window.crypto?.randomUUID) {
  if (!window.crypto) {
    window.crypto = {} as Crypto;
  }
  (window.crypto as any).randomUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

interface CurrentWorkout {
  id: string
  routineId: string
  routineName: string
  exercises: Exercise[]
  startTime: Date
  currentExerciseIndex: number
  energyLevel: number
  completedSets: WorkoutSet[]
}

interface WorkoutStore {
  // Current workout state
  currentWorkout: CurrentWorkout | null
  
  // Timer state
  isBreakActive: boolean
  breakTimeLeft: number
  timerInterval: NodeJS.Timeout | null
  
  // UI state
  selectedRoutineId: string | null
  
  // Actions
  startWorkout: (routine: WorkoutRoutine, exercises: Exercise[]) => void
  endWorkout: () => void
  logSet: (set: Omit<WorkoutSet, 'id' | 'workout_id' | 'created_at'>) => void
  nextExercise: () => void
  previousExercise: () => void
  setCurrentExercise: (index: number) => void
  
  // Timer actions
  startBreakTimer: (seconds?: number) => void
  pauseBreakTimer: () => void
  resumeBreakTimer: () => void
  skipBreak: () => void
  
  // Routine selection
  setSelectedRoutine: (routineId: string) => void
  
  // Persistence
  loadWorkout: () => void
  clearWorkout: () => void
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentWorkout: null,
      isBreakActive: false,
      breakTimeLeft: 0,
      timerInterval: null,
      selectedRoutineId: null,

      // Workout actions
      startWorkout: (routine, exercises) => {
        const workoutId = crypto.randomUUID()
        set({
          currentWorkout: {
            id: workoutId,
            routineId: routine.id,
            routineName: routine.name,
            exercises: exercises.sort((a, b) => a.order_index - b.order_index),
            startTime: new Date(),
            currentExerciseIndex: 0,
            energyLevel: 3,
            completedSets: [],
          },
        })
      },

      endWorkout: () => {
        const { timerInterval } = get()
        if (timerInterval) {
          clearInterval(timerInterval)
        }
        set({
          currentWorkout: null,
          isBreakActive: false,
          breakTimeLeft: 0,
          timerInterval: null,
        })
      },

      logSet: (setData) => {
        const { currentWorkout } = get()
        if (!currentWorkout) return

        const newSet: WorkoutSet = {
          id: crypto.randomUUID(),
          workout_id: currentWorkout.id,
          created_at: new Date().toISOString(),
          ...setData,
        }

        set({
          currentWorkout: {
            ...currentWorkout,
            completedSets: [...currentWorkout.completedSets, newSet],
          },
        })
      },

      nextExercise: () => {
        const { currentWorkout } = get()
        if (!currentWorkout) return

        const nextIndex = Math.min(
          currentWorkout.currentExerciseIndex + 1,
          currentWorkout.exercises.length - 1
        )

        set({
          currentWorkout: {
            ...currentWorkout,
            currentExerciseIndex: nextIndex,
          },
        })
      },

      previousExercise: () => {
        const { currentWorkout } = get()
        if (!currentWorkout) return

        const prevIndex = Math.max(currentWorkout.currentExerciseIndex - 1, 0)

        set({
          currentWorkout: {
            ...currentWorkout,
            currentExerciseIndex: prevIndex,
          },
        })
      },

      setCurrentExercise: (index) => {
        const { currentWorkout } = get()
        if (!currentWorkout) return

        const clampedIndex = Math.max(
          0,
          Math.min(index, currentWorkout.exercises.length - 1)
        )

        set({
          currentWorkout: {
            ...currentWorkout,
            currentExerciseIndex: clampedIndex,
          },
        })
      },

      // Timer actions
      startBreakTimer: (seconds = 120) => {
        const { timerInterval } = get()
        if (timerInterval) {
          clearInterval(timerInterval)
        }

        set({ isBreakActive: true, breakTimeLeft: seconds })

        const interval = setInterval(() => {
          const { breakTimeLeft } = get()
          if (breakTimeLeft <= 1) {
            get().skipBreak()
            // Play beep sound
            if (typeof window !== 'undefined') {
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
              const oscillator = audioContext.createOscillator()
              const gainNode = audioContext.createGain()
              
              oscillator.connect(gainNode)
              gainNode.connect(audioContext.destination)
              
              oscillator.frequency.value = 800
              oscillator.type = 'sine'
              
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
              
              oscillator.start(audioContext.currentTime)
              oscillator.stop(audioContext.currentTime + 0.5)
            }
          } else {
            set({ breakTimeLeft: breakTimeLeft - 1 })
          }
        }, 1000)

        set({ timerInterval: interval })
      },

      pauseBreakTimer: () => {
        const { timerInterval } = get()
        if (timerInterval) {
          clearInterval(timerInterval)
          set({ timerInterval: null })
        }
      },

      resumeBreakTimer: () => {
        const { breakTimeLeft } = get()
        get().startBreakTimer(breakTimeLeft)
      },

      skipBreak: () => {
        const { timerInterval } = get()
        if (timerInterval) {
          clearInterval(timerInterval)
        }
        set({
          isBreakActive: false,
          breakTimeLeft: 0,
          timerInterval: null,
        })
      },

      // Routine selection
      setSelectedRoutine: (routineId) => {
        set({ selectedRoutineId: routineId })
      },

      // Persistence
      loadWorkout: () => {
        // Check if stored workout has invalid ID format and clear if needed
        const { currentWorkout } = get()
        if (currentWorkout && currentWorkout.id && !currentWorkout.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
          console.log('Clearing invalid workout data with old ID format:', currentWorkout.id)
          get().clearWorkout()
        }
      },

      clearWorkout: () => {
        const { timerInterval } = get()
        if (timerInterval) {
          clearInterval(timerInterval)
        }
        set({
          currentWorkout: null,
          isBreakActive: false,
          breakTimeLeft: 0,
          timerInterval: null,
          selectedRoutineId: null,
        })
      },
    }),
    {
      name: 'workout-store',
      partialize: (state) => ({
        currentWorkout: state.currentWorkout,
        selectedRoutineId: state.selectedRoutineId,
      }),
    }
  )
)

// Cleanup on page unload to prevent memory leaks
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const store = useWorkoutStore.getState();
    if (store.timerInterval) {
      clearInterval(store.timerInterval);
    }
  });
}
