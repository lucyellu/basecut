/**
 * Command Output Window Component
 * Collapsible output window showing command history
 * Similar to Maya's Script Editor output panel
 */

import { useEffect, useRef } from 'react'
import { useCommandStore } from '../store/useCommandStore'

export default function CommandOutputWindow() {
  const historyLog = useCommandStore((state) => state.historyLog)
  const isOutputWindowOpen = useCommandStore((state) => state.terminalUI.isOutputWindowOpen)
  const outputWindowHeight = useCommandStore((state) => state.terminalUI.outputWindowHeight)
  const setOutputWindowHeight = useCommandStore((state) => state.setOutputWindowHeight)
  const scrollRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)

  // Auto-scroll to bottom when history updates
  useEffect(() => {
    if (scrollRef.current && isOutputWindowOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [historyLog, isOutputWindowOpen])

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return

      // Calculate new height based on mouse position relative to window bottom
      const newHeight = window.innerHeight - e.clientY - 48 // 48px is input bar height
      if (newHeight >= 100 && newHeight <= 600) {
        setOutputWindowHeight(newHeight)
      }
    }

    const handleMouseUp = () => {
      isResizing.current = false
    }

    if (isResizing.current) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [setOutputWindowHeight])

  const startResize = () => {
    isResizing.current = true
  }

  if (!isOutputWindowOpen) {
    return null
  }

  return (
    <div
      className="output-window bg-gray-900 border-t border-gray-700 flex flex-col flex-shrink-0"
      style={{ height: `${outputWindowHeight}px` }}
    >
      {/* Header with Resize Handle */}
      <div
        ref={resizeRef}
        onMouseDown={startResize}
        className="output-header px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between cursor-ns-resize"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-300">
            Command Output
          </h2>
          <span className="text-xs text-gray-500">
            ({historyLog.length} commands)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => useCommandStore.getState().clearHistory()}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            title="Clear history"
          >
            Clear
          </button>
          <div className="text-gray-600 text-xs">⋮⋮⋮</div>
        </div>
      </div>

      {/* Output Content */}
      <div
        ref={scrollRef}
        className="output-content flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1"
      >
        {historyLog.length === 0 ? (
          <div className="text-gray-600 italic">
            No commands executed yet. Type a command below to get started.
          </div>
        ) : (
          historyLog.map((command, index) => {
            const isError = command.startsWith('[ERROR]')

            return (
              <div
                key={index}
                className={`command-entry flex items-start gap-2 ${
                  isError ? 'text-red-400' : 'text-green-400'
                }`}
              >
                <span className="command-prompt text-blue-400 flex-shrink-0">
                  {String(index + 1).padStart(4, '0')}
                </span>
                <span className="command-text flex-1 break-all">
                  {isError ? command.replace('[ERROR] ', '') : command}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
