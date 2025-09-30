'use client'

import { useEffect, useState } from 'react'
import { useWorkoutStore } from '@/lib/store'

export default function GlobalBreakTimer() {
  const { isBreakActive, breakTimeLeft, startBreakTimer, stopBreakTimer } = useWorkoutStore()
  const [customDuration, setCustomDuration] = useState(120) // 2 minutes default
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
  const handleDurationChange = (minutes: number) => {
    setCustomDuration(minutes)
    setIsEditingDuration(false)
  }

  // Start break with custom duration
  const startCustomBreak = () => {
    startBreakTimer(customDuration * 60) // Convert minutes to seconds
    setIsEditingDuration(false)
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
                  min="1"
                  max="30"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 text-sm border border-slate-300 rounded"
                  autoFocus
                />
                <span className="text-sm text-slate-500">minutes</span>
                <button
                  onClick={() => handleDurationChange(customDuration)}
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
                <span className="text-sm text-slate-700">{customDuration} min</span>
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
            onClick={() => startBreakTimer(customDuration * 60)}
            className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            +{customDuration}min
          </button>
        </div>
      </div>
    </div>
  )
}
