/**
 * OutlinerPanel Component
 * Maya-style scene hierarchy / outliner
 * Shows loaded data info, sequences, cameras, and quick actions
 */

import { useState } from 'react'
import { useCommandStore } from '../store/useCommandStore'

export default function OutlinerPanel() {
  const currentData = useCommandStore((state) => state.currentData as any)
  const playheadPosition = useCommandStore((state) => state.playheadPosition)
  const isPlaying = useCommandStore((state) => state.isPlaying)
  const commandCount = useCommandStore((state) => state.commandCount)
  const executeCommand = useCommandStore((state) => state.executeCommand)
  const lastError = useCommandStore((state) => state.lastError)

  const [commandInput, setCommandInput] = useState('')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    status: true,
    data: true,
    cameras: false,
    commands: true,
  })

  const sequences = currentData?.data?.sequences || []
  const cameras = currentData?.data?.cameras || []

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (commandInput.trim()) {
      executeCommand(commandInput.trim())
      setCommandInput('')
    }
  }

  return (
    <div className="outliner-content">
      {/* Status Section */}
      <div className="outliner-section">
        <button className="section-header" onClick={() => toggleSection('status')}>
          <span className="section-chevron">{expandedSections.status ? '▾' : '▸'}</span>
          <span className="section-icon">◉</span>
          <span>Status</span>
        </button>
        {expandedSections.status && (
          <div className="section-body">
            <div className="stat-row">
              <span className="stat-label">Playhead</span>
              <span className="stat-value accent">{playheadPosition}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Playback</span>
              <span className={`stat-value ${isPlaying ? 'stat-active' : 'stat-stopped'}`}>
                {isPlaying ? '▶ Playing' : '⏸ Stopped'}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Commands</span>
              <span className="stat-value">{commandCount}</span>
            </div>
            {lastError && (
              <div className="stat-row error-row">
                <span className="stat-label">Error</span>
                <span className="stat-value stat-error" title={lastError}>
                  {lastError.slice(0, 30)}…
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data Section */}
      <div className="outliner-section">
        <button className="section-header" onClick={() => toggleSection('data')}>
          <span className="section-chevron">{expandedSections.data ? '▾' : '▸'}</span>
          <span className="section-icon">🧬</span>
          <span>Scene Data</span>
        </button>
        {expandedSections.data && (
          <div className="section-body">
            {currentData ? (
              <>
                <div className="stat-row">
                  <span className="stat-label">File</span>
                  <span className="stat-value file-name">{currentData.filename}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Sequences</span>
                  <span className="stat-value">{currentData.sequenceCount}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Cameras</span>
                  <span className="stat-value">{currentData.cameraCount}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Loaded</span>
                  <span className="stat-value dim">
                    {new Date(currentData.loadedAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Current Sequence Info */}
                {sequences.length > 0 && playheadPosition > 0 && (
                  <div className="current-seq-info">
                    <div className="seq-label">Active Base</div>
                    <div className="seq-detail">
                      <span className="seq-base">
                        {sequences[Math.round(playheadPosition) - 1]?.base || '—'}
                      </span>
                      <span className="seq-id">
                        #{Math.round(playheadPosition)}
                      </span>
                    </div>
                    <div className="seq-coords">
                      x: {sequences[Math.round(playheadPosition) - 1]?.x?.toFixed(1) || '—'}{' '}
                      y: {sequences[Math.round(playheadPosition) - 1]?.y?.toFixed(1) || '—'}{' '}
                      z: {sequences[Math.round(playheadPosition) - 1]?.z?.toFixed(1) || '—'}
                    </div>
                  </div>
                )}

                <button
                  className="outliner-btn danger"
                  onClick={() => executeCommand('Data.clear()')}
                >
                  Clear Data
                </button>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📂</div>
                <div className="empty-text">No data loaded</div>
                <button
                  className="outliner-btn primary"
                  onClick={() => executeCommand("Data.loadBioData('bio-data-2026-07-05.json')")}
                >
                  Load Bio Data
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cameras Section */}
      {cameras.length > 0 && (
        <div className="outliner-section">
          <button className="section-header" onClick={() => toggleSection('cameras')}>
            <span className="section-chevron">{expandedSections.cameras ? '▾' : '▸'}</span>
            <span className="section-icon">📷</span>
            <span>Cameras ({cameras.length})</span>
          </button>
          {expandedSections.cameras && (
            <div className="section-body">
              {cameras.map((cam: any) => (
                <div key={cam.id} className="camera-item">
                  <span className="camera-icon">
                    {cam.type === 'perspective' ? '📐' : '📏'}
                  </span>
                  <span className="camera-name">{cam.name}</span>
                  <span className="camera-type">{cam.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Commands Section */}
      <div className="outliner-section">
        <button className="section-header" onClick={() => toggleSection('commands')}>
          <span className="section-chevron">{expandedSections.commands ? '▾' : '▸'}</span>
          <span className="section-icon">⚡</span>
          <span>Quick Commands</span>
        </button>
        {expandedSections.commands && (
          <div className="section-body">
            <div className="quick-cmd-grid">
              <button
                className="outliner-btn"
                onClick={() => executeCommand('Playback.play()')}
              >
                ▶ Play
              </button>
              <button
                className="outliner-btn"
                onClick={() => executeCommand('Playback.pause()')}
              >
                ⏸ Pause
              </button>
              <button
                className="outliner-btn"
                onClick={() => executeCommand('Timeline.reset()')}
              >
                ⏮ Reset
              </button>
              <button
                className="outliner-btn"
                onClick={() => executeCommand('Timeline.setPlayhead(1)')}
              >
                ⏪ Start
              </button>
              <button
                className="outliner-btn"
                onClick={() => executeCommand(`Timeline.setPlayhead(${sequences.length || 100})`)}
              >
                ⏩ End
              </button>
            </div>

            {/* Inline command input */}
            <form className="inline-command" onSubmit={handleCommand}>
              <span className="cmd-prompt">❯</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Type command..."
                className="cmd-input"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
