'use client'

import { useWorkoutStore } from '@/lib/store'
import { Pause, Play, SkipForward } from 'lucide-react'

export default function BreakTimer() {
  const { 
    breakTimeLeft, 
    timerInterval, 
    pauseBreakTimer, 
    resumeBreakTimer, 
    skipBreak 
  } = useWorkoutStore()

  const minutes = Math.floor(breakTimeLeft / 60)
  const seconds = breakTimeLeft % 60

  const isPaused = !timerInterval

  return (
    <div className="timer-display mb-6">
      <div className="mb-6">
        <div className="text-6xl font-bold text-blue-600 mb-3">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
        <p className="text-slate-600 font-medium">Rest time</p>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={isPaused ? resumeBreakTimer : pauseBreakTimer}
          className="btn btn-secondary flex items-center gap-2"
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          )}
        </button>
        
        <button
          onClick={skipBreak}
          className="btn btn-primary flex items-center gap-2"
        >
          <SkipForward className="w-4 h-4" />
          Skip
        </button>
      </div>
    </div>
  )
}
