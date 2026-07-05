/**
 * Command Input Bar Component
 * Always visible at the bottom of the screen
 * Provides quick access to command input and output window toggle
 */

import { useState } from 'react'
import { useCommandStore } from '../store/useCommandStore'

export default function CommandInputBar() {
  const executeCommand = useCommandStore((state) => state.executeCommand)
  const isOutputWindowOpen = useCommandStore((state) => state.terminalUI.isOutputWindowOpen)
  const toggleOutputWindow = useCommandStore((state) => state.toggleOutputWindow)
  const lastError = useCommandStore((state) => state.lastError)
  const clearError = useCommandStore((state) => state.clearError)

  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      executeCommand(inputValue.trim())
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="command-input-bar fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700">
      {/* Error Display */}
      {lastError && (
        <div className="error-banner px-4 py-1 bg-red-900/30 border-b border-red-700">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-400 font-semibold">ERROR:</span>
            <span className="text-red-300 flex-1">{lastError}</span>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-200 transition-colors"
              aria-label="Clear error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="input-bar px-4 py-3 flex items-center gap-3">
        {/* Toggle Button */}
        <button
          onClick={toggleOutputWindow}
          className="toggle-btn p-2 hover:bg-gray-800 rounded transition-colors"
          title={isOutputWindowOpen ? 'Hide Output Window' : 'Show Output Window'}
        >
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOutputWindowOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Prompt */}
        <span className="prompt text-green-400 text-lg font-mono">
          ❯
        </span>

        {/* Input Field */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command... (e.g., Timeline.setPlayhead(5))"
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 outline-none px-3 py-2 rounded font-mono text-sm"
            autoFocus
          />
        </form>

        {/* Status Indicators */}
        <div className="status-indicators flex items-center gap-2 text-xs text-gray-500">
          <span className="px-2 py-1 bg-gray-800 rounded">
            {isOutputWindowOpen ? 'Output: ON' : 'Output: OFF'}
          </span>
        </div>
      </div>
    </div>
  )
}
