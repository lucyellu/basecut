/**
 * App Component
 * Root component that displays the command engine prototype
 */

import { useCommandStore } from './store/useCommandStore'
import CommandInputBar from './components/CommandInputBar'
import CommandOutputWindow from './components/CommandOutputWindow'
import DataPanel from './components/DataPanel'
import TimelineScrubber from './components/TimelineScrubber'
import Viewport3D from './components/Viewport3D'

function App() {
  // Subscribe to specific state slices for optimal re-renders
  const playheadPosition = useCommandStore((state) => state.playheadPosition)
  const isPlaying = useCommandStore((state) => state.isPlaying)
  const currentData = useCommandStore((state) => state.currentData)
  const commandCount = useCommandStore((state) => state.commandCount)
  const historyLog = useCommandStore((state) => state.historyLog)
  const isOutputWindowOpen = useCommandStore((state) => state.terminalUI.isOutputWindowOpen)

  return (
    <div className="app h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-lg border-b border-gray-700 flex-shrink-0">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-white mb-2">
            Basecut NLE
          </h1>
          <p className="text-gray-400 text-sm">
            Headless Command Engine Prototype
          </p>
        </div>
      </header>

      {/* Main Content Panel - Scrollable independently */}
      <main className="container mx-auto px-6 py-8 overflow-y-auto space-y-6">
        {/* Status Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Playhead Position */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-semibold mb-2">
              Playhead Position
            </h3>
            <p className="text-2xl font-bold text-white">
              {playheadPosition}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Timeline position
            </p>
          </div>

          {/* Playback Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-semibold mb-2">
              Playback Status
            </h3>
            <p className={`text-2xl font-bold ${
              isPlaying ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPlaying ? 'Playing' : 'Stopped'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Current state
            </p>
          </div>

          {/* Commands Executed */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-semibold mb-2">
              Commands Executed
            </h3>
            <p className="text-2xl font-bold text-white">
              {commandCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total commands
            </p>
          </div>

          {/* Data Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm font-semibold mb-2">
              Data Status
            </h3>
            <p className={`text-2xl font-bold ${
              currentData ? 'text-blue-400' : 'text-gray-400'
            }`}>
              {currentData ? 'Loaded' : 'None'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {currentData ? currentData.filename : 'No data loaded'}
            </p>
          </div>
        </div>

        {/* Data Panel */}
        <DataPanel />

        {/* Quick Commands */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Quick Commands
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => useCommandStore.getState().executeCommand('Timeline.setPlayhead(5)')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Timeline.setPlayhead(5)
            </button>
            <button
              onClick={() => useCommandStore.getState().executeCommand('Timeline.setPlayhead(10)')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Timeline.setPlayhead(10)
            </button>
            <button
              onClick={() => useCommandStore.getState().executeCommand('Timeline.setPlayhead(0)')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Timeline.setPlayhead(0)
            </button>
            <button
              onClick={() => useCommandStore.getState().executeCommand('Playback.play()')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Playback.play()
            </button>
            <button
              onClick={() => useCommandStore.getState().executeCommand('Playback.pause()')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Playback.pause()
            </button>
            <button
              onClick={() => useCommandStore.getState().executeCommand('Playback.toggle()')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Playback.toggle()
            </button>
            <button
              onClick={() => useCommandStore.getState().executeCommand('Data.load(mock_data.json)')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Data.load(mock_data.json)
            </button>
            <button
              onClick={() => useCommandStore.getState().executeCommand('Data.clear()')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Data.clear()
            </button>
            <button
              onClick={() => useCommandStore.getState().executeCommand('Timeline.reset()')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Timeline.reset()
            </button>
          </div>
        </div>

        {/* 3D Viewport and Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 3D Viewport */}
          <div className="viewport-container">
            <Viewport3D />
          </div>

          {/* Timeline Scrubber */}
          <div className="timeline-container">
            <TimelineScrubber />
          </div>
        </div>

      </main>

      {/* Command Output Window (Collapsible) */}
      <CommandOutputWindow />

      {/* Command Input Bar (Always Visible) */}
      <CommandInputBar />
    </div>
  )
}

export default App
