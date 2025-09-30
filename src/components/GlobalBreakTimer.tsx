'use client'

import { useEffect, useState } from 'react'
import { useWorkoutStore } from '@/lib/store'

export default function GlobalBreakTimer() {
  const { isBreakActive, breakTimeLeft, startBreakTimer, stopBreakTimer } = useWorkoutStore()
  const [customMinutes, setCustomMinutes] = useState(2) // 2 minutes default
  const [customSeconds, setCustomSeconds] = useState(0) // 0 seconds default
  const [isEditingDuration, setIsEditingDuration] = useState(false)

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Play beep sound
  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2) // 2 second beep
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 2)
    } catch (error) {
      console.log('Could not play beep sound:', error)
    }
  }

  // Handle break timer completion
  useEffect(() => {
    if (isBreakActive && breakTimeLeft === 0) {
      playBeep()
      stopBreakTimer()
    }
  }, [isBreakActive, breakTimeLeft, stopBreakTimer])

  // Handle custom duration change
  const handleDurationChange = () => {
    setIsEditingDuration(false)
  }

  // Start break with custom duration
  const startCustomBreak = () => {
    const totalSeconds = customMinutes * 60 + customSeconds
    startBreakTimer(totalSeconds)
    setIsEditingDuration(false)
  }

  // Get current duration display
  const getDurationDisplay = () => {
    if (customSeconds === 0) {
      return `${customMinutes} min`
    }
    return `${customMinutes}:${customSeconds.toString().padStart(2, '0')}`
  }

  if (!isBreakActive) {
    return (
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">Break Timer:</span>
            {isEditingDuration ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-12 px-2 py-1 text-sm border border-slate-300 rounded"
                  autoFocus
                />
                <span className="text-sm text-slate-500">min</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-12 px-2 py-1 text-sm border border-slate-300 rounded"
                />
                <span className="text-sm text-slate-500">sec</span>
                <button
                  onClick={handleDurationChange}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Set
                </button>
                <button
                  onClick={() => setIsEditingDuration(false)}
                  className="px-3 py-1 text-xs bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-700">{getDurationDisplay()}</span>
                <button
                  onClick={() => setIsEditingDuration(true)}
                  className="px-2 py-1 text-xs bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                >
                  Change
                </button>
              </div>
            )}
          </div>
          <button
            onClick={startCustomBreak}
            className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
          >
            Start Break
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-orange-100 border-b border-orange-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-orange-800">Break Time</span>
          </div>
          <div className="text-2xl font-mono font-bold text-orange-900">
            {formatTime(breakTimeLeft)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={stopBreakTimer}
            className="px-3 py-1 text-sm bg-orange-200 text-orange-800 rounded hover:bg-orange-300 transition-colors"
          >
            Stop
          </button>
          <button
            onClick={() => startBreakTimer(customMinutes * 60 + customSeconds)}
            className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            +{getDurationDisplay()}
          </button>
        </div>
      </div>
    </div>
  )
}
