/**
 * CommandInputBar Component (Legacy)
 * Preserved for backwards compatibility — replaced by AgentChatPanel in Dockview layout
 */

import { useState } from 'react'
import { useCommandStore } from '../store/useCommandStore'

export default function CommandInputBar() {
  const executeCommand = useCommandStore((state) => state.executeCommand)
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

  return (
    <div className="command-input-bar" style={{ background: '#111', borderTop: '1px solid #333', padding: '8px 12px' }}>
      {lastError && (
        <div style={{ color: '#ff5e5e', fontSize: '11px', marginBottom: '4px' }}>
          ERROR: {lastError}
          <button onClick={clearError} style={{ marginLeft: '8px', color: '#ff5e5e', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <span style={{ color: '#4ceb9b', fontFamily: 'monospace' }}>❯</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a command..."
          style={{ flex: 1, background: '#1a1a1a', color: '#e1e4ed', border: '1px solid #333', borderRadius: '4px', padding: '4px 8px', fontFamily: 'monospace', fontSize: '12px', outline: 'none' }}
        />
      </form>
    </div>
  )
}
