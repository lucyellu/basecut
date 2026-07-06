import React, { useRef } from 'react';
import { useCommandStore } from '../store/useCommandStore';

export default function MacroTimeline() {
  const currentData = useCommandStore(state => state.currentData as any);
  const sequences = currentData?.data?.sequences || [];
  const windowStart = useCommandStore(state => state.windowStart);
  const windowEnd = useCommandStore(state => state.windowEnd);
  const executeCommand = useCommandStore(state => state.executeCommand);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  if (sequences.length === 0) {
    return <div className="h-12 bg-[#222] text-[#555] flex items-center justify-center text-xs border-b border-[#111]">Genome Viewer (Macro)</div>;
  }
  
  const total = sequences.length;
  const wStart = windowStart ?? 1;
  const wEnd = windowEnd ?? total;
  
  const leftPercent = ((wStart - 1) / total) * 100;
  const widthPercent = Math.max(0.5, ((wEnd - wStart + 1) / total) * 100); // min width for visibility

  const handleInteraction = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const center = Math.round(percent * total);
    
    // Create a window of size 100 around the click
    const halfWindow = 50;
    const newStart = Math.max(1, center - halfWindow);
    const newEnd = Math.min(total, center + halfWindow);
    
    executeCommand(`Viewport.setWindow(${newStart}, ${newEnd})`);
  };

  return (
    <div className="h-full bg-[#161616] border-b border-[#111] flex flex-col relative select-none"
         ref={containerRef}
         onMouseDown={handleInteraction}
         style={{ cursor: 'crosshair' }}
    >
      <div className="text-[10px] text-[#666] absolute top-1 left-2 font-mono z-10 font-bold uppercase">
        Tier 1: Genome Overview
      </div>
      
      {/* Mini heatmap/density map */}
      <div className="absolute inset-y-0 left-0 right-0 opacity-40 pointer-events-none mt-4 mb-1">
        <svg width="100%" height="100%" preserveAspectRatio="none">
          {sequences.filter((_: any, i: number) => i % Math.ceil(total / 200) === 0).map((seq: any, i: number, arr: any[]) => {
            const x = (i / arr.length) * 100;
            const h = Math.max(10, (seq.value || 0.5) * 100);
            return (
              <rect key={i} x={`${x}%`} y={`${100 - h}%`} width="0.8%" height={`${h}%`} fill={seq.value > 0.8 ? '#ff4444' : '#4ceb9b'} />
            )
          })}
        </svg>
      </div>

      {/* Viewport Window Box */}
      <div 
        className="absolute top-0 bottom-0 bg-blue-500/20 border-l border-r border-blue-400 pointer-events-none transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
        style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
      >
        <div className="absolute -top-0 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-[9px] px-1 rounded-b-sm shadow-md font-bold z-20">
          {wEnd - wStart + 1} bp
        </div>
      </div>
    </div>
  )
}
