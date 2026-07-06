/**
 * TimelineScrubber Component (Maya-Style)
 * Authentic replica of the Autodesk Maya Time Slider and Range Slider.
 * Interacts ONLY via Timeline.setPlayhead(id) commands.
 */

import { useRef, useEffect, useState, useCallback } from 'react'
import { useCommandStore } from '../store/useCommandStore'

export default function TimelineScrubber() {
  const currentData = useCommandStore((state) => state.currentData as any)
  const backbone = useCommandStore((state) => state.backbone)
  const playheadPosition = useCommandStore((state) => Math.round(state.playheadPosition))

  const timelineRef = useRef<HTMLDivElement>(null)
  const rangeTrackRef = useRef<HTMLDivElement>(null)
  
  const [isScrubbing, setIsScrubbing] = useState(false)
  
  const hasSequences = currentData?.data?.sequences && currentData.data.sequences.length > 0;
  const hasPDB = backbone && backbone.length > 0;
  
  const items = hasPDB 
    ? backbone.map((atom: any, i: number) => ({ id: i + 1, base: `${i + 1}`, value: 1 }))
    : (hasSequences ? currentData.data.sequences : []);

  const totalItems = items.length > 0 ? items.length : 1;

  // Range State
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(totalItems);

  // Range Dragging State
  const [dragMode, setDragMode] = useState<'none' | 'pan' | 'left-resize' | 'right-resize'>('none')
  const dragStartX = useRef(0)
  const dragStartRange = useRef({ start: 1, end: totalItems })

  // Sync range if items change completely
  useEffect(() => {
    if (totalItems > 0 && rangeEnd > totalItems) {
      setRangeStart(1);
      setRangeEnd(totalItems);
    } else if (totalItems > 0 && rangeStart === 1 && rangeEnd === 1 && totalItems > 1) {
      setRangeStart(1);
      setRangeEnd(totalItems);
    }
  }, [totalItems, rangeEnd, rangeStart]);

  // --- Main Timeline Scrubbing ---
  const handleTimelineInteraction = useCallback((clientX: number) => {
    if (!timelineRef.current || totalItems <= 1) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const percentage = x / rect.width
    
    // Map percentage to the visible range
    const clickedId = Math.round(rangeStart + percentage * (rangeEnd - rangeStart))
    const clampedId = Math.max(rangeStart, Math.min(clickedId, rangeEnd))
    
    useCommandStore.getState().executeCommand(`Timeline.setPlayhead(${clampedId})`)
  }, [rangeStart, rangeEnd, totalItems])

  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    setIsScrubbing(true)
    handleTimelineInteraction(e.clientX)
  }

  // --- Range Slider Interaction ---
  const handleRangeMouseDown = (e: React.MouseEvent, mode: 'pan' | 'left-resize' | 'right-resize') => {
    e.stopPropagation();
    setDragMode(mode);
    dragStartX.current = e.clientX;
    dragStartRange.current = { start: rangeStart, end: rangeEnd };
  }

  // Global mouse move for both scrubbing and range sliding
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        handleTimelineInteraction(e.clientX)
      } else if (dragMode !== 'none' && rangeTrackRef.current) {
        const rect = rangeTrackRef.current.getBoundingClientRect()
        const deltaX = e.clientX - dragStartX.current
        const deltaPercentage = deltaX / rect.width
        const deltaUnits = Math.round(deltaPercentage * totalItems)
        
        let newStart = dragStartRange.current.start
        let newEnd = dragStartRange.current.end

        if (dragMode === 'pan') {
          // Prevent panning out of bounds
          let shift = deltaUnits;
          if (newStart + shift < 1) shift = 1 - newStart;
          if (newEnd + shift > totalItems) shift = totalItems - newEnd;
          
          newStart += shift;
          newEnd += shift;
        } else if (dragMode === 'left-resize') {
          newStart = Math.max(1, Math.min(newStart + deltaUnits, newEnd - 1))
        } else if (dragMode === 'right-resize') {
          newEnd = Math.max(newStart + 1, Math.min(newEnd + deltaUnits, totalItems))
        }

        setRangeStart(newStart)
        setRangeEnd(newEnd)
      }
    }

    const handleGlobalMouseUp = () => {
      setIsScrubbing(false)
      setDragMode('none')
    }

    if (isScrubbing || dragMode !== 'none') {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isScrubbing, dragMode, handleTimelineInteraction, totalItems, rangeStart, rangeEnd])

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#323232] text-gray-500 font-sans text-xs">
        <div>Load bio-data or PDB to see timeline</div>
      </div>
    )
  }

  // --- Generate Ticks for Maya Ruler ---
  const ticks = [];
  const rangeLength = Math.max(1, rangeEnd - rangeStart);
  
  // Adaptive tick spacing based on zoom level
  let minorStep = 1;
  if (rangeLength > 100) minorStep = Math.ceil(rangeLength / 100);
  if (rangeLength > 1000) minorStep = Math.ceil(rangeLength / 50);
  
  let majorStep = minorStep * 5;
  if (rangeLength > 100) majorStep = minorStep * 10;
  if (rangeLength > 1000) majorStep = minorStep * 5;

  // Always include steps in between
  for (let i = rangeStart; i <= rangeEnd; i += minorStep) {
    ticks.push(i);
  }
  // Ensure exact start and end are drawn
  if (!ticks.includes(rangeStart)) ticks.unshift(rangeStart);
  if (!ticks.includes(rangeEnd)) ticks.push(rangeEnd);

  const playheadPercentage = ((playheadPosition - rangeStart) / Math.max(1, rangeLength)) * 100;
  const isPlayheadVisible = playheadPosition >= rangeStart && playheadPosition <= rangeEnd;

  // Render Range Thumb boundaries
  const thumbLeftPercent = ((rangeStart - 1) / Math.max(1, totalItems - 1)) * 100;
  const thumbWidthPercent = ((rangeEnd - rangeStart) / Math.max(1, totalItems - 1)) * 100;

  return (
    <div className="flex flex-col h-full bg-[#323232] text-[#dcdcdc] font-sans text-xs select-none">
      
      {/* --- MAYA TIME SLIDER --- */}
      <div 
        ref={timelineRef}
        className="relative flex-1 bg-[#444444] border-t border-b border-[#222] cursor-text overflow-hidden"
        onMouseDown={handleTimelineMouseDown}
      >
        {/* Ticks & Numbers */}
        <div className="absolute inset-0 pointer-events-none">
          {ticks.map((tickId) => {
            const isMajor = tickId % majorStep === 0 || tickId === rangeStart || tickId === rangeEnd;
            const leftPercent = ((tickId - rangeStart) / rangeLength) * 100;
            const showBase = rangeLength <= 100 && tickId <= totalItems;
            const baseChar = showBase ? items[tickId - 1]?.base : '';

            return (
              <div 
                key={tickId}
                className="absolute bottom-0 flex flex-col items-center transform -translate-x-1/2"
                style={{ left: `${leftPercent}%` }}
              >
                {/* Base Letter (if zoomed in enough) */}
                {showBase && (
                  <div className="text-[12px] text-white font-bold mb-3">{baseChar}</div>
                )}
                
                {/* Tick Mark */}
                <div className={`w-px bg-[#777777] ${isMajor ? 'h-3' : 'h-1.5'}`} />
                
                {/* Tick Number (Major only) */}
                {isMajor && (
                  <div className="absolute bottom-3.5 text-[10px] text-[#dddddd] font-semibold whitespace-nowrap">
                    {tickId}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Playhead */}
        {isPlayheadVisible && (
          <div 
            className="absolute top-0 bottom-0 pointer-events-none z-10"
            style={{ left: `${playheadPercentage}%` }}
          >
            {/* Red Line */}
            <div className="absolute inset-y-0 w-px bg-red-500 transform -translate-x-1/2" />
            {/* Red Box */}
            <div className="absolute top-0 transform -translate-x-1/2 bg-red-600/90 border border-red-800 text-white text-[12px] px-2 py-0.5 min-w-[28px] text-center font-bold shadow-md rounded-[1px]">
              {playheadPosition}
            </div>
          </div>
        )}
      </div>

      {/* --- MAYA RANGE SLIDER --- */}
      <div className="flex items-center bg-[#323232] h-10 px-2 gap-2 border-b border-[#222]">
        
        {/* Absolute Start Box */}
        <input 
          type="number" 
          value={1} 
          disabled
          className="w-16 h-6 bg-[#222222] text-[#888888] border border-[#111] text-center text-[12px] outline-none font-mono rounded-sm"
        />

        {/* Playback Start Box */}
        <input 
          type="number" 
          value={rangeStart}
          onChange={(e) => setRangeStart(Math.max(1, Math.min(Number(e.target.value), rangeEnd - 1)))}
          className="w-16 h-6 bg-[#222222] text-white border border-[#555] text-center text-[12px] outline-none focus:border-blue-500 font-mono rounded-sm"
        />

        {/* Range Track */}
        <div 
          ref={rangeTrackRef}
          className="flex-1 h-6 relative bg-[#1a1a1a] border border-[#111] mx-1 rounded-sm shadow-inner"
        >
          {/* Draggable Thumb */}
          <div 
            className="absolute top-0 bottom-0 bg-[#666666] hover:bg-[#7a7a7a] border border-[#999] cursor-grab active:cursor-grabbing rounded-[2px] transition-colors duration-75 shadow-sm"
            style={{ 
              left: `${thumbLeftPercent}%`, 
              width: `${thumbWidthPercent}%` 
            }}
            onMouseDown={(e) => handleRangeMouseDown(e, 'pan')}
          >
            {/* Left Handle */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-[#999999] z-10 rounded-l-[1px]"
              onMouseDown={(e) => handleRangeMouseDown(e, 'left-resize')}
            />
            {/* Center pattern / dots (Maya styling) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
              <div className="flex gap-[2px]">
                <div className="w-[2px] h-[6px] bg-black"></div>
                <div className="w-[2px] h-[6px] bg-black"></div>
                <div className="w-[2px] h-[6px] bg-black"></div>
              </div>
            </div>
            {/* Right Handle */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-[#999999] z-10 rounded-r-[1px]"
              onMouseDown={(e) => handleRangeMouseDown(e, 'right-resize')}
            />
          </div>
        </div>

        {/* Playback End Box */}
        <input 
          type="number" 
          value={rangeEnd}
          onChange={(e) => setRangeEnd(Math.max(rangeStart + 1, Math.min(Number(e.target.value), totalItems)))}
          className="w-16 h-6 bg-[#222222] text-white border border-[#555] text-center text-[12px] outline-none focus:border-blue-500 font-mono rounded-sm"
        />

        {/* Absolute End Box */}
        <input 
          type="number" 
          value={totalItems}
          disabled
          className="w-16 h-6 bg-[#222222] text-[#888888] border border-[#111] text-center text-[12px] outline-none font-mono rounded-sm"
        />
      </div>
    </div>
  )
}
