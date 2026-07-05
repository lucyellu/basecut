/**
 * CommandOutputWindow Component (Legacy)
 * Preserved for backwards compatibility — replaced by AgentChatPanel in Dockview layout
 */

import { useCommandStore } from '../store/useCommandStore'

export default function CommandOutputWindow() {
  const historyLog = useCommandStore((state) => state.historyLog)

  return (
    <div className="command-output-window" style={{ background: '#111', borderTop: '1px solid #333', maxHeight: '200px', overflowY: 'auto', padding: '8px 12px' }}>
      {historyLog.length === 0 ? (
        <div style={{ color: '#575e72', fontSize: '11px' }}>No commands executed yet</div>
      ) : (
        historyLog.map((entry, i) => (
          <div key={i} style={{ fontFamily: 'monospace', fontSize: '11px', color: entry.startsWith('[ERROR]') ? '#ff5e5e' : '#8891a5', padding: '2px 0' }}>
            {entry}
          </div>
        ))
      )}
    </div>
  )
}
