'use client'

import { useState } from 'react'

interface MuscleFeelingInputProps {
  intensity: number
  correctness: number
  comment: string
  onIntensityChange: (intensity: number) => void
  onCorrectnessChange: (correctness: number) => void
  onCommentChange: (comment: string) => void
}

export default function MuscleFeelingInput({
  intensity,
  correctness,
  comment,
  onIntensityChange,
  onCorrectnessChange,
  onCommentChange,
}: MuscleFeelingInputProps) {
  const intensityLabels = [
    'Not at all',
    'Slightly',
    'Moderately',
    'Quite a bit',
    'Burning'
  ]

  const correctnessLabels = [
    'Completely off',
    'Mostly off',
    'Somewhat correct',
    'Mostly correct',
    'Perfect'
  ]

  const ScaleButton = ({ 
    value, 
    selected, 
    onClick, 
    label 
  }: { 
    value: number
    selected: boolean
    onClick: () => void
    label: string
  }) => (
    <button
      onClick={onClick}
      className={`
        w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
        ${selected 
          ? 'bg-blue-500 text-white shadow-lg scale-110' 
          : 'bg-slate-200 text-slate-700 hover:bg-slate-300 hover:scale-105'
        }
      `}
    >
      {value}
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Intensity Scale */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-700">
            Intensity: {intensityLabels[intensity - 1]}
          </label>
          <span className="text-xs text-slate-500">Required</span>
        </div>
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4, 5].map((value) => (
            <div key={value} className="flex flex-col items-center gap-1">
              <ScaleButton
                value={value}
                selected={intensity === value}
                onClick={() => onIntensityChange(value)}
                label={intensityLabels[value - 1]}
              />
              <span className="text-xs text-slate-500 text-center max-w-12">
                {value === 1 ? 'Not at all' : value === 5 ? 'Burning' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Correctness Scale */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-700">
            Correctness: {correctnessLabels[correctness - 1]}
          </label>
          <span className="text-xs text-slate-500">Required</span>
        </div>
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4, 5].map((value) => (
            <div key={value} className="flex flex-col items-center gap-1">
              <ScaleButton
                value={value}
                selected={correctness === value}
                onClick={() => onCorrectnessChange(value)}
                label={correctnessLabels[value - 1]}
              />
              <span className="text-xs text-slate-500 text-center max-w-12">
                {value === 1 ? 'Completely off' : value === 5 ? 'Perfect' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Comment Input */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Comment (Optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Add any notes about this set..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      {/* Validation Message */}
      {(!intensity || !correctness) && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          Please select both intensity and correctness before logging the set.
        </div>
      )}
    </div>
  )
}
