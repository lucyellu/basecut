/**
 * TimelineScrubber Component
 * 1D timeline with sequence letters and waveform visualization
 * Interacts ONLY via Timeline.setPlayhead(id) commands
 * Adapted for Dockview panel integration
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
  const handleTimelineInteraction = (clientX: number, shiftKey: boolean = false) => {
    if (!timelineRef.current || sequences.length === 0) return

    const rect = timelineRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = x / rect.width
    const clickedId = Math.round(percentage * sequences.length) + 1

    const clampedId = Math.max(1, Math.min(clickedId, sequences.length))

    // ⚡ CRITICAL: Fire command, don't mutate state directly
    const state = useCommandStore.getState()
    
    // Select the node in the timeline
    if (shiftKey) {
      // Get current selection array and add this ID if not present
      const currentSelection = Array.isArray(state.selection) ? [...state.selection] : []
      if (!currentSelection.includes(clampedId) && !currentSelection.includes(`${clampedId}`)) {
        currentSelection.push(clampedId)
        state.executeCommand(`Data.select(${JSON.stringify(currentSelection)})`)
      }
    } else {
      state.executeCommand(`Data.select(${clampedId})`)
    }
    
    state.executeCommand(`Timeline.setPlayhead(${clampedId})`)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleTimelineInteraction(e.clientX, e.shiftKey)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleTimelineInteraction(e.clientX, e.shiftKey)
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
      <div className="timeline-scrubber timeline-empty">
        <div className="timeline-empty-text">
          Load bio-data to see timeline
        </div>
      </div>
    )
  }

  return (
    <div className="timeline-scrubber">
      <div className="timeline-header">
        <h2 className="timeline-title">Timeline Scrubber</h2>
        <div className="timeline-position">
          Position: <span className="timeline-pos-value">{playheadPosition}</span> / {sequences.length}
        </div>
      </div>

      <div
        ref={timelineRef}
        className="timeline-track"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Sequence Track - Base Letters */}
        <div className="sequence-track">
          {sequences.map((seq: any) => {
            const isActive = Math.round(playheadPosition) === seq.id
            const isHovered = hoveredId === seq.id

            return (
              <div
                key={seq.id}
                className={`sequence-item ${isActive ? 'active' : ''} ${isHovered && !isActive ? 'hovered' : ''}`}
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
        <div className="waveform-track">
          {sequences.map((seq: any) => {
            const isActive = Math.round(playheadPosition) === seq.id
            const isHovered = hoveredId === seq.id
            const barHeight = (seq.value / maxValue) * 100

            return (
              <div
                key={`waveform-${seq.id}`}
                className={`waveform-bar ${isActive ? 'active' : ''} ${isHovered && !isActive ? 'hovered' : ''}`}
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
          className="playhead-line"
          style={{
            left: `${((Math.round(playheadPosition) - 1) / sequences.length) * 100}%`
          }}
        >
          {/* Playhead Handle */}
          <div className="playhead-handle" />
        </div>

        {/* Hover Tooltip */}
        {hoveredId && !isDragging && (
          <div
            className="timeline-tooltip"
            style={{
              left: `${((hoveredId - 0.5) / sequences.length) * 100}%`
            }}
          >
            <div className="tooltip-content">
              <div>ID: {hoveredId}</div>
              <div>Base: {sequences[hoveredId - 1]?.base}</div>
              <div>Value: {sequences[hoveredId - 1]?.value?.toFixed(3)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Controls */}
      <div className="timeline-controls">
        <div className="timeline-hint">Click or drag to scrub • Letters = Sequence • Bars = Activity</div>
        <div className="timeline-btns">
          <button
            onClick={() => executeCommand('Timeline.setPlayhead(1)')}
            className="timeline-btn"
          >
            Start
          </button>
          <button
            onClick={() => executeCommand(`Timeline.setPlayhead(${sequences.length})`)}
            className="timeline-btn"
          >
            End
          </button>
          <button
            onClick={() => executeCommand('Timeline.reset()')}
            className="timeline-btn"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
