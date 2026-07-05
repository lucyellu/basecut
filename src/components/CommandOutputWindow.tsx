import { useEffect, useRef } from 'react'
import { useCommandStore } from '../store/useCommandStore'

export default function CommandOutputWindow() {
  const historyLog = useCommandStore((state) => state.historyLog)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [historyLog])

  return (
    <div 
      className="command-output-window" 
      style={{ 
        width: '100%', 
        height: '100%', 
        background: 'var(--bg-input)', 
        color: '#8891a5', 
        fontFamily: 'monospace', 
        fontSize: '11px', 
        padding: '8px', 
        overflowY: 'auto' 
      }}
      ref={containerRef}
    >
      <div style={{ marginBottom: '8px', color: '#575e72', fontStyle: 'italic' }}>
        // BaseCut NLE Script Editor Initialized...
      </div>
      
      {historyLog.length === 0 && (
        <div style={{ color: '#575e72' }}>No commands executed yet.</div>
      )}
      
      {historyLog.map((log, i) => {
        const isError = log.startsWith('[ERROR]')
        return (
          <div 
            key={i} 
            style={{ 
              color: isError ? '#ff5e5e' : '#4ceb9b',
              marginBottom: '2px',
              wordBreak: 'break-all'
            }}
          >
            {isError ? log : `> ${log}`}
          </div>
        )
      })}
    </div>
  )
}
