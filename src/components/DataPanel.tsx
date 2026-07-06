/**
 * DataPanel Component
 * GUI for loading and editing bio-sequence data
 */

import { useState } from 'react'
import { useCommandStore } from '../store/useCommandStore'
import type { LoadedDataInfo, BioSequence } from '../types/data.types'

export default function DataPanel() {
  const currentData = useCommandStore((state) => state.currentData) as LoadedDataInfo | null
  const backbone = useCommandStore((state) => state.backbone)
  const executeCommand = useCommandStore((state) => state.executeCommand)
  const [selectedSequence, setSelectedSequence] = useState<BioSequence | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // PDB Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const hasData = currentData !== null || (backbone && backbone.length > 0)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchResults([])

    try {
      const query = {
        query: {
          type: "terminal",
          service: "full_text",
          parameters: {
            value: searchQuery
          }
        },
        return_type: "entry",
        request_options: {
          paginate: {
            start: 0,
            rows: 5
          }
        }
      }

      const res = await fetch('https://search.rcsb.org/rcsbsearch/v2/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      })

      if (res.ok) {
        const data = await res.json()
        if (data.result_set) {
          setSearchResults(data.result_set)
        } else {
          setSearchResults([])
        }
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleLoadBioData = () => {
    executeCommand('Data.loadBioData(bio-data-2026-07-05.json)')
  }

  const handleLoadCustomData = (filename: string) => {
    executeCommand(`Data.load('${filename}')`)
  }

  const handleClearData = () => {
    executeCommand('Data.clear()')
    setSelectedSequence(null)
  }

  const handleSequenceClick = (sequence: BioSequence) => {
    setSelectedSequence(sequence)
    setIsEditing(true)
  }

  return (
    <div className="data-panel bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Data Management</h2>
        {hasData && (
          <button
            onClick={handleClearData}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            Clear Data
          </button>
        )}
      </div>

      {/* Data Loading Options */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => executeCommand("Data.fetchPDB('3GOU')")}
          className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors font-semibold shadow-[0_0_15px_rgba(79,70,229,0.5)]"
        >
          🩸 Load Hemoglobin (3GOU)
        </button>

        {/* PDB Search */}
        <div className="bg-gray-900/50 border border-gray-700 rounded p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Search PDB Database</h3>
          <form onSubmit={handleSearch} className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="e.g. insulin, 1CRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 text-white placeholder-gray-400 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded transition-colors text-sm font-semibold"
            >
              {isSearching ? '...' : 'Search'}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-400 mb-1">Top Results:</div>
              {searchResults.map((result: any) => (
                <button
                  key={result.identifier}
                  type="button"
                  onClick={() => executeCommand(`Data.fetchPDB('${result.identifier}')`)}
                  className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-indigo-900 border border-gray-700 rounded text-sm text-white transition-colors flex justify-between items-center"
                >
                  <span className="font-mono font-bold text-indigo-300">{result.identifier}</span>
                  <span className="text-xs text-gray-400">Load →</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleLoadBioData}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-semibold"
        >
          🧬 Load Bio-Sequence Data (bio-data-2026-07-05.json)
        </button>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Custom filename..."
            className="flex-1 px-3 py-2 bg-gray-700 text-white placeholder-gray-400 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement
                if (input.value.trim()) {
                  handleLoadCustomData(input.value.trim())
                  input.value = ''
                }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Custom filename..."]') as HTMLInputElement
              if (input?.value.trim()) {
                handleLoadCustomData(input.value.trim())
                input.value = ''
              }
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors text-sm"
          >
            Load Custom
          </button>
        </div>
      </div>

      {/* Data Information Display */}
      {currentData && (
        <div className="data-info space-y-4">
          <div className="bg-gray-900/50 border border-gray-600 rounded p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Loaded Data Info</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-500">Filename:</div>
              <div className="text-white">{currentData.filename}</div>

              <div className="text-gray-500">Loaded At:</div>
              <div className="text-white">{new Date(currentData.loadedAt).toLocaleString()}</div>

              <div className="text-gray-500">Sequences:</div>
              <div className="text-blue-400 font-semibold">{currentData.sequenceCount}</div>

              <div className="text-gray-500">Cameras:</div>
              <div className="text-green-400 font-semibold">{currentData.cameraCount}</div>
            </div>
          </div>

          {/* Sequence Preview */}
          {currentData.data?.sequences && (
            <div className="sequence-preview">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Sequence Preview (First 20)
              </h3>
              <div className="grid grid-cols-5 gap-1 max-h-32 overflow-y-auto">
                {currentData.data.sequences.slice(0, 20).map((seq) => (
                  <button
                    key={seq.id}
                    onClick={() => handleSequenceClick(seq)}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                    title={`ID: ${seq.id}, Base: ${seq.base}, Value: ${seq.value.toFixed(2)}`}
                  >
                    <div className="font-bold">{seq.base}</div>
                    <div className="text-gray-400">{seq.id}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cameras Info */}
          {currentData.data?.cameras && (
            <div className="cameras-info">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Available Cameras
              </h3>
              <div className="space-y-1">
                {currentData.data.cameras.map((camera) => (
                  <div
                    key={camera.id}
                    className={`text-xs px-2 py-1 rounded ${
                      camera.id === currentData.data.activeCameraId
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {camera.name} ({camera.type})
                    {camera.id === currentData.data.activeCameraId && ' - Active'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sequence Editor */}
      {isEditing && selectedSequence && (
        <div className="sequence-editor mt-4 p-4 bg-gray-900/50 border border-gray-600 rounded">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Edit Sequence #{selectedSequence.id}</h3>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Base</label>
              <input
                type="text"
                defaultValue={selectedSequence.base}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Value</label>
              <input
                type="number"
                step="0.01"
                defaultValue={selectedSequence.value}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">X Position</label>
              <input
                type="number"
                step="0.1"
                defaultValue={selectedSequence.x}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Y Position</label>
              <input
                type="number"
                step="0.1"
                defaultValue={selectedSequence.y}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Z Position</label>
              <input
                type="number"
                step="0.1"
                defaultValue={selectedSequence.z}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => executeCommand(`Data.editSequence(${selectedSequence.id}, {...})`)}
                className="w-full px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasData && (
        <div className="text-center py-8 text-gray-500 text-sm">
          <div className="text-4xl mb-2">📂</div>
          <div>No data loaded</div>
          <div className="text-xs mt-1">Load bio-sequence or PDB data to get started</div>
        </div>
      )}
    </div>
  )
}
