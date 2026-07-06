/**
 * Command Engine Type Definitions
 * Strict TypeScript interfaces for the command pattern architecture
 */

/**
 * Valid command domains for type safety
 * Only these domains are allowed in the command system
 */
export type CommandDomain = 'Timeline' | 'Playback' | 'Data' | 'Viewport' | 'Camera'

/**
 * Parsed command interface - every command resolves to this structure
 * This is the critical type that prevents parser bugs and ensures type safety
 */
export interface ParsedCommand {
  domain: CommandDomain
  action: string
  args: any[]
}

/**
 * Store state interface for the command store
 * Contains both application state and command history
 */
export interface CommandState {
  // Core application state
  playheadPosition: number
  currentData: any | null
  isPlaying: boolean
  selection: any[] | null
  dockviewApi: any | null
  setDockviewApi: (api: any) => void

  // Command history
  historyLog: string[]              // Raw command strings
  parsedHistory: ParsedCommand[]   // Parsed commands for debugging

  // System state
  lastError: string | null
  commandCount: number
  frameTrigger: number

  // PDB Data
  backbone: any[]
  ligands: any[]
  edges: any[]
  isLoadingPDB: boolean

  // Windowing & LookAt
  windowStart: number | null
  windowEnd: number | null
  lookAtTarget: { x: number, y: number, z: number } | null

  // Viewport
  isGridVisible: boolean
  isTurntableActive: boolean
}

/**
 * Command store actions interface
 * Defines the available operations on the command store
 */
export interface CommandActions {
  // Core command execution
  executeCommand: (commandString: string) => void

  // State getters (read-only access)
  getPlayheadPosition: () => number
  getIsPlaying: () => boolean
  getHistory: () => string[]
  getParsedHistory: () => ParsedCommand[]
  getLastError: () => string | null

  // Utility functions
  clearError: () => void
  clearHistory: () => void
}

/**
 * Complete store interface combining state and actions
 */
export type CommandStore = CommandState & CommandActions

