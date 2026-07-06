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
  const backbone = useCommandStore((state) => state.backbone)
  const playheadPosition = useCommandStore((state) => state.playheadPosition)
  const executeCommand = useCommandStore((state) => state.executeCommand)

  const timelineRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  // Determine which data to use
  const hasSequences = currentData?.data?.sequences && currentData.data.sequences.length > 0;
  const hasPDB = backbone && backbone.length > 0;
  
  const items = hasPDB 
    ? backbone.map((atom: any, i: number) => ({ id: i + 1, base: `${i + 1}`, value: 1 }))
    : (hasSequences ? currentData.data.sequences : []);

  // Range State
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(items.length > 0 ? items.length : 1);

  // Sync range if items change completely
  useEffect(() => {
    if (items.length > 0) {
      setRangeStart(1);
      setRangeEnd(items.length);
    }
  }, [items.length]);

  const visibleItems = items.filter((item: any) => item.id >= rangeStart && item.id <= rangeEnd);
  const maxValue = Math.max(...items.map((s: any) => s.value), 1);

  const handleTimelineInteraction = (clientX: number, shiftKey: boolean = false) => {
    if (!timelineRef.current || visibleItems.length === 0) return

    const rect = timelineRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    
    // Map percentage to the visible range
    const clickedId = Math.round(rangeStart + percentage * (rangeEnd - rangeStart))
    const clampedId = Math.max(rangeStart, Math.min(clickedId, rangeEnd))

    const state = useCommandStore.getState()
    if (shiftKey) {
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
      if (timelineRef.current && visibleItems.length > 0) {
        const rect = timelineRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = Math.max(0, Math.min(1, x / rect.width))
        const hoverId = Math.round(rangeStart + percentage * (rangeEnd - rangeStart))
        setHoveredId(Math.max(rangeStart, Math.min(hoverId, rangeEnd)))
      }
    }
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleMouseLeave = () => {
    setIsDragging(false)
    setHoveredId(null)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  if (items.length === 0) {
    return (
      <div className="timeline-scrubber timeline-empty flex items-center justify-center h-full bg-gray-900 text-gray-500">
        <div className="timeline-empty-text">Load bio-data or PDB to see timeline</div>
      </div>
    )
  }

  const playheadPercentage = visibleItems.length > 1 
    ? ((Math.max(rangeStart, Math.min(Math.round(playheadPosition), rangeEnd)) - rangeStart) / (rangeEnd - rangeStart)) * 100
    : 0;

  return (
    <div className="timeline-scrubber flex flex-col h-full bg-gray-900 p-3 text-white text-sm select-none">
      <div className="timeline-header flex justify-between items-center mb-3">
        <h2 className="timeline-title font-bold text-gray-300">Timeline Scrubber</h2>
        <div className="timeline-position text-gray-400">
          Position: <span className="timeline-pos-value font-mono text-white">{playheadPosition}</span> / {items.length}
        </div>
      </div>

      {/* Range Sliders */}
      <div className="flex gap-4 mb-3 items-center bg-gray-800 p-2 rounded border border-gray-700">
        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Range View:</span>
        <input 
          type="range" 
          min="1" 
          max={items.length} 
          value={rangeStart} 
          onChange={(e) => setRangeStart(Math.min(Number(e.target.value), rangeEnd - 1))}
          className="flex-1 accent-indigo-500 cursor-ew-resize"
        />
        <span className="font-mono text-xs w-10 text-center text-indigo-300 bg-gray-900 rounded py-1">{rangeStart}</span>
        <span className="text-gray-500 text-xs">to</span>
        <input 
          type="range" 
          min="1" 
          max={items.length} 
          value={rangeEnd} 
          onChange={(e) => setRangeEnd(Math.max(Number(e.target.value), rangeStart + 1))}
          className="flex-1 accent-indigo-500 cursor-ew-resize"
        />
        <span className="font-mono text-xs w-10 text-center text-indigo-300 bg-gray-900 rounded py-1">{rangeEnd}</span>
        <button 
          onClick={() => { setRangeStart(1); setRangeEnd(items.length); }}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
        >
          Reset
        </button>
      </div>

      <div
        ref={timelineRef}
        className="timeline-track relative flex-1 min-h-[80px] bg-gray-800 rounded overflow-hidden cursor-crosshair border border-gray-700 shadow-inner"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Sequence Track - Base Letters and Numeric Axis */}
        <div className="sequence-track absolute inset-0 flex flex-col">
          {/* Base letters */}
          <div className="flex-1 flex">
            {visibleItems.map((seq: any) => {
              const isActive = Math.round(playheadPosition) === seq.id
              const isHovered = hoveredId === seq.id
              const showLabel = visibleItems.length < 100;

              return (
                <div
                  key={seq.id}
                  className={`sequence-item flex-1 flex items-center justify-center border-r border-gray-700/30 text-[10px] select-none transition-colors duration-75
                    ${isActive ? 'bg-indigo-600/40 text-indigo-200 font-bold' : 'text-gray-400'} 
                    ${isHovered && !isActive ? 'bg-gray-700 text-white' : ''}`}
                >
                  {showLabel ? seq.base : ''}
                </div>
              )
            })}
          </div>

          {/* Numeric Axis */}
          <div className="flex h-4 bg-gray-900 border-t border-gray-700/50">
            {visibleItems.map((seq: any) => {
              // Show label if zoomed in, or at intervals if zoomed out
              const showLabel = visibleItems.length < 50 || seq.id % Math.ceil(visibleItems.length / 20) === 0;
              return (
                <div key={`num-${seq.id}`} className="flex-1 border-r border-gray-700/30 flex items-end pb-[1px] justify-center text-[8px] text-gray-500 font-mono">
                  {showLabel ? seq.id : ''}
                </div>
              )
            })}
          </div>
        </div>

        {/* Waveform Track - Value Visualization (Hide for PDBs) */}
        {!hasPDB && (
          <div className="waveform-track absolute inset-0 flex items-end pointer-events-none opacity-50">
            {visibleItems.map((seq: any) => {
              const isActive = Math.round(playheadPosition) === seq.id
              const isHovered = hoveredId === seq.id
              const barHeight = (seq.value / maxValue) * 100

              return (
                <div
                  key={`waveform-${seq.id}`}
                  className={`waveform-bar flex-1 mx-[1px] rounded-t-sm transition-all duration-75
                    ${isActive ? 'bg-indigo-400' : 'bg-green-500'} 
                    ${isHovered && !isActive ? 'bg-green-400' : ''}`}
                  style={{ height: `${barHeight}%` }}
                />
              )
            })}
          </div>
        )}

        {/* Playhead Line */}
        {playheadPosition >= rangeStart && playheadPosition <= rangeEnd && (
          <div
            className="playhead-line absolute top-0 bottom-0 w-[2px] bg-indigo-500 pointer-events-none z-10"
            style={{ left: `${playheadPercentage}%` }}
          >
            <div className="playhead-handle absolute -top-1 -left-[5px] w-3 h-3 bg-indigo-500 rounded-sm shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
          </div>
        )}

        {/* Hover Tooltip */}
        {hoveredId && !isDragging && hoveredId >= rangeStart && hoveredId <= rangeEnd && (
          <div
            className="timeline-tooltip absolute top-2 bg-black/90 border border-gray-700 text-white p-2 rounded text-xs pointer-events-none z-20 whitespace-nowrap transform -translate-x-1/2 shadow-lg"
            style={{ left: `${((hoveredId - rangeStart) / (rangeEnd - rangeStart)) * 100}%` }}
          >
            <div className="font-mono text-indigo-300 font-bold mb-1">Index: {hoveredId}</div>
            {hasPDB ? (
              <div className="text-gray-300">Atom: {items[hoveredId - 1]?.base}</div>
            ) : (
              <>
                <div className="text-gray-300">Base: {items[hoveredId - 1]?.base}</div>
                <div className="text-gray-300">Value: {items[hoveredId - 1]?.value?.toFixed(3)}</div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Timeline Controls */}
      <div className="timeline-controls flex justify-between items-center mt-3">
        <div className="timeline-hint text-gray-500 text-xs">Click or drag to scrub • Use sliders to zoom range</div>
        <div className="timeline-btns flex gap-2">
          <button onClick={() => executeCommand('Timeline.setPlayhead(1)')} className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs transition-colors">Start</button>
          <button onClick={() => executeCommand(`Timeline.setPlayhead(${items.length})`)} className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs transition-colors">End</button>
          <button onClick={() => executeCommand('Timeline.reset()')} className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-red-400 transition-colors">Reset</button>
        </div>
      </div>
    </div>
  )
}
