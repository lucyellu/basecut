/**
 * TimelineScrubber Component
 * 1D timeline with sequence letters and waveform visualization
 * Interacts ONLY via Timeline.setPlayhead(id) commands
 */

import { useRef, useEffect, useState } from 'react'
import { useCommandStore } from '../store/useCommandStore'

export default function TimelineScrubber() {
  const currentData = useCommandStore((state) => state.currentData as any)
  const playheadPosition = useCommandStore((state) => state.playheadPosition)
  const executeCommand = useCommandStore((state) => state.executeCommand)

  const timelineRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const sequences = currentData?.data?.sequences || []
  const maxValue = Math.max(...sequences.map((s: any) => s.value), 1)

  // Handle timeline click/drag
  const handleTimelineInteraction = (clientX: number) => {
    if (!timelineRef.current || sequences.length === 0) return

    const rect = timelineRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = x / rect.width
    const clickedId = Math.round(percentage * sequences.length) + 1

    const clampedId = Math.max(1, Math.min(clickedId, sequences.length))

    // ⚡ CRITICAL: Fire command, don't mutate state directly
    executeCommand(`Timeline.setPlayhead(${clampedId})`)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleTimelineInteraction(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleTimelineInteraction(e.clientX)
    } else {
      // Update hover state
      if (timelineRef.current && sequences.length > 0) {
        const rect = timelineRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = x / rect.width
        const hoverId = Math.round(percentage * sequences.length) + 1
        setHoveredId(Math.max(1, Math.min(hoverId, sequences.length)))
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    setHoveredId(null)
  }

  // Global mouse up for drag end
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  if (sequences.length === 0) {
    return (
      <div className="timeline-scrubber bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="text-center text-gray-500 text-sm">
          Load bio-data to see timeline
        </div>
      </div>
    )
  }

  return (
    <div className="timeline-scrubber bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white">Timeline Scrubber</h2>
        <div className="text-sm text-gray-400">
          Position: <span className="text-blue-400 font-semibold">{playheadPosition}</span> / {sequences.length}
        </div>
      </div>

      <div
        ref={timelineRef}
        className="timeline-track relative h-24 bg-gray-900 rounded cursor-crosshair select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Sequence Track - Base Letters */}
        <div className="sequence-track absolute top-0 left-0 right-0 h-12 flex">
          {sequences.map((seq: any) => {
            const isActive = Math.round(playheadPosition) === seq.id
            const isHovered = hoveredId === seq.id

            return (
              <div
                key={seq.id}
                className={`sequence-item flex-1 flex items-center justify-center text-xs font-mono border-r border-gray-800 transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                } ${isHovered && !isActive ? 'bg-gray-700' : ''}`}
                style={{
                  minWidth: `${100 / sequences.length}%`,
                  maxWidth: `${100 / sequences.length}%`
                }}
              >
                {seq.base}
              </div>
            )
          })}
        </div>

        {/* Waveform Track - Value Visualization */}
        <div className="waveform-track absolute bottom-0 left-0 right-0 h-12 flex items-end">
          {sequences.map((seq: any) => {
            const isActive = Math.round(playheadPosition) === seq.id
            const isHovered = hoveredId === seq.id
            const barHeight = (seq.value / maxValue) * 100

            return (
              <div
                key={`waveform-${seq.id}`}
                className={`flex-1 mx-px rounded-t transition-all duration-75 ${
                  isActive ? 'bg-green-500' : 'bg-gray-600'
                } ${isHovered && !isActive ? 'bg-gray-500' : ''}`}
                style={{
                  height: `${barHeight}%`,
                  minWidth: `calc(${100 / sequences.length}% - 4px)`,
                  maxWidth: `calc(${100 / sequences.length}% - 4px)`
                }}
              />
            )
          })}
        </div>

        {/* Playhead Line */}
        <div
          className="playhead absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none transition-all duration-75"
          style={{
            left: `${((Math.round(playheadPosition) - 1) / sequences.length) * 100}%`
          }}
        >
          {/* Playhead Handle */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-lg" />
        </div>

        {/* Hover Tooltip */}
        {hoveredId && !isDragging && (
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-xs text-white whitespace-nowrap z-10"
            style={{
              left: `${((hoveredId - 0.5) / sequences.length) * 100}%`
            }}
          >
            <div className="font-mono">
              <div>ID: {hoveredId}</div>
              <div>Base: {sequences[hoveredId - 1]?.base}</div>
              <div>Value: {sequences[hoveredId - 1]?.value?.toFixed(3)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Controls */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div>Click or drag to scrub • Letters = Sequence • Bars = Activity</div>
        <div className="flex gap-2">
          <button
            onClick={() => executeCommand('Timeline.setPlayhead(1)')}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            Start
          </button>
          <button
            onClick={() => executeCommand(`Timeline.setPlayhead(${sequences.length})`)}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            End
          </button>
          <button
            onClick={() => executeCommand('Timeline.reset()')}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
