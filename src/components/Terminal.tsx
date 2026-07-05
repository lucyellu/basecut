/**
 * Terminal Component
 * Displays command history and provides input for executing commands
 * Styled with Tailwind CSS for a dark terminal aesthetic
 */

import { useState, useEffect, useRef } from 'react'
import { useCommandStore } from '../store/useCommandStore'

export default function Terminal() {
  const historyLog = useCommandStore((state) => state.historyLog)
  const lastError = useCommandStore((state) => state.lastError)
  const executeCommand = useCommandStore((state) => state.executeCommand)
  const clearError = useCommandStore((state) => state.clearError)

  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when history updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [historyLog])

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
    <div className="terminal-container fixed bottom-0 left-0 right-0 h-64 bg-terminal-bg border-t-2 border-terminal-text font-mono">
      {/* Header */}
      <div className="terminal-header px-4 py-2 border-b border-terminal-text/30 bg-terminal-bg/50">
        <h2 className="text-sm text-terminal-text font-semibold">
          Command Terminal
        </h2>
      </div>

      {/* Error Display */}
      {lastError && (
        <div className="terminal-error px-4 py-2 bg-terminal-error/20 border-b border-terminal-error">
          <div className="flex items-start gap-2">
            <span className="text-terminal-error font-bold">ERROR:</span>
            <span className="text-terminal-error text-sm">{lastError}</span>
            <button
              onClick={clearError}
              className="ml-auto text-terminal-error hover:text-terminal-text transition-colors"
              aria-label="Clear error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Output Area - Command History */}
      <div
        ref={scrollRef}
        className="terminal-output h-36 overflow-y-auto p-4 space-y-1"
      >
        {historyLog.length === 0 ? (
          <div className="text-terminal-text/50 text-sm italic">
            No commands executed yet. Type a command below to get started.
          </div>
        ) : (
          historyLog.map((command, index) => {
            const isError = command.startsWith('[ERROR]')

            return (
              <div
                key={index}
                className={`command-entry flex items-start gap-2 text-sm ${
                  isError ? 'text-terminal-error' : 'text-terminal-text'
                }`}
              >
                <span className="command-prompt text-terminal-prompt flex-shrink-0">
                  ❯
                </span>
                <span className="command-text flex-1 break-all">
                  {isError ? command.replace('[ERROR] ', '') : command}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Input Area */}
      <div className="terminal-input border-t border-terminal-text/30 p-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="prompt text-terminal-prompt text-lg flex-shrink-0">
            ❯
          </span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command... (e.g., Timeline.setPlayhead(5))"
            className="flex-1 bg-transparent text-terminal-text placeholder-terminal-text/50 outline-none text-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-3 py-1 bg-terminal-text/20 text-terminal-text text-sm rounded hover:bg-terminal-text/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Execute
          </button>
        </form>
      </div>
    </div>
  )
}
