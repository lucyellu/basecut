/**
 * App Component
 * Root component rendering the Dockview workspace shell
 * All panel content is managed through WorkspaceShell's Dockview registry
 */

import { useEffect } from 'react'
import WorkspaceShell from './components/WorkspaceShell'
import { useCommandStore } from './store/useCommandStore'

function App() {
  const executeCommand = useCommandStore((state) => state.executeCommand)

  // Auto-load bio data on startup for immediate visual feedback
  useEffect(() => {
    executeCommand("Data.loadBioData('bio-data-2026-07-05.json')")
  }, [executeCommand])

  return (
    <div className="app">
      {/* Slim header toolbar */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="header-title">BaseCut</h1>
          <span className="header-subtitle">NLE Command Engine</span>
        </div>
        <div className="header-right">
          <span className="header-badge">v0.1</span>
        </div>
      </header>

      {/* Dockview workspace fills remaining space */}
      <WorkspaceShell />
    </div>
  )
}

export default App
