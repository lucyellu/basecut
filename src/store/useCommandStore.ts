/**
 * Zustand Command Store
 * The heart of the command pattern architecture
 * All state mutations MUST go through executeCommand()
 */

import { create } from 'zustand'
import type { CommandStore, ParsedCommand, CommandDomain } from '../types/command.types'
import type { LoadedDataInfo } from '../types/data.types'

/**
 * Strict domain whitelist for command validation
 * Prevents invalid commands from executing
 */
const VALID_DOMAINS: CommandDomain[] = ['Timeline', 'Playback', 'Data', 'Viewport']

/**
 * Parse a command string into a ParsedCommand object
 * Handles various command formats with type safety
 *
 * Supported formats:
 * - Timeline.setPlayhead(5)
 * - Playback.play()
 * - File.load('mock_data.json')
 * - Data.loadMock()
 */
function parseCommandString(commandString: string): ParsedCommand {
  const trimmed = commandString.trim()

  // Extract domain, action, and args using regex
  const match = trimmed.match(/^(\w+)\.(\w+)\((.*)??\)$/)

  if (!match) {
    throw new Error(`Invalid command format: ${commandString}`)
  }

  const [, domain, action, argsString] = match

  // Validate domain
  if (!VALID_DOMAINS.includes(domain as CommandDomain)) {
    throw new Error(`Invalid domain: ${domain}. Must be one of: ${VALID_DOMAINS.join(', ')}`)
  }

  // Parse arguments
  let args: (string | number | boolean | object)[] = []
  if (argsString && argsString.trim()) {
    try {
      // Handle different argument types
      if (argsString.startsWith("'") || argsString.startsWith('"')) {
        // String argument
        args = [argsString.slice(1, -1)]
      } else if (argsString.startsWith('[') || argsString.startsWith('{')) {
        // Array or object argument
        args = [JSON.parse(argsString)]
      } else if (argsString.includes(',')) {
        // Multiple arguments
        args = argsString.split(',').map(arg => {
          arg = arg.trim()
          if (arg.startsWith("'") || arg.startsWith('"')) {
            return arg.slice(1, -1)
          }
          return isNaN(Number(arg)) ? arg : Number(arg)
        })
      } else {
        // Single argument
        const trimmedArg = argsString.trim()
        if (trimmedArg.startsWith("'") || trimmedArg.startsWith('"')) {
          args = [trimmedArg.slice(1, -1)]
        } else if (trimmedArg === 'true' || trimmedArg === 'false') {
          args = [trimmedArg === 'true']
        } else {
          args = [isNaN(Number(trimmedArg)) ? trimmedArg : Number(trimmedArg)]
        }
      }
    } catch {
      throw new Error(`Failed to parse arguments: ${argsString}`)
    }
  }

  return {
    domain: domain as CommandDomain,
    action,
    args
  }
}

/**
 * Validate a parsed command
 */
function isValidCommand(parsed: ParsedCommand): boolean {
  return VALID_DOMAINS.includes(parsed.domain) &&
         typeof parsed.action === 'string' &&
         Array.isArray(parsed.args)
}

/**
 * Execute a parsed command and apply state changes
 * This is where the actual state mutations happen
 */
function executeCommandAction(
  parsed: ParsedCommand,
  set: (partial: Partial<CommandStore> | ((state: CommandStore) => Partial<CommandStore>)) => void,
  _get: () => CommandStore
): void {
  const { domain, action, args } = parsed

  switch (domain) {
    case 'Timeline':
      switch (action) {
        case 'setPlayhead': {
          const position = typeof args[0] === 'number' ? args[0] : parseInt(args[0] as string)
          if (isNaN(position)) {
            throw new Error(`Invalid playhead position: ${args[0]}`)
          }
          set({ playheadPosition: position })
          break
        }

        case 'reset':
          set({ playheadPosition: 0 })
          break

        default:
          throw new Error(`Unknown Timeline action: ${action}`)
      }
      break

    case 'Playback':
      switch (action) {
        case 'play':
          set({ isPlaying: true })
          break

        case 'pause':
          set({ isPlaying: false })
          break

        case 'toggle':
          set((state: CommandStore) => ({ isPlaying: !state.isPlaying }))
          break

        case 'stop':
          set({ isPlaying: false, playheadPosition: 0 })
          break

        default:
          throw new Error(`Unknown Playback action: ${action}`)
      }
      break

    case 'Data':
      switch (action) {
        case 'load': {
          const filename = args[0] as string
          // In real app, would fetch from API or file system
          // For now, load from root (Vite serves public/ at root)
          fetch(`/${filename}`)
            .then(response => response.json())
            .then(data => {
              set({
                currentData: {
                  filename,
                  loadedAt: new Date().toISOString(),
                  sequenceCount: data.sequences?.length || 0,
                  cameraCount: data.cameras?.length || 0,
                  data
                } as LoadedDataInfo
              })
            })
            .catch(error => {
              set({ lastError: `Failed to load data: ${error.message}` })
            })
          break
        }

        case 'loadBioData': {
          // Specific command to load the bio-sequence data
          const bioFilename = (args[0] as string) || 'bio-data-2026-07-05.json'
          fetch(`/${bioFilename}`)
            .then(response => {
              if (!response.ok) throw new Error(`HTTP ${response.status}`)
              return response.json()
            })
            .then(data => {
              const loadedData: LoadedDataInfo = {
                filename: bioFilename,
                loadedAt: new Date().toISOString(),
                sequenceCount: data.sequences?.length || 0,
                cameraCount: data.cameras?.length || 0,
                data
              }
              set({ currentData: loadedData })
              // Also update playhead to match data
              if (data.currentPlayheadIndex !== undefined) {
                set({ playheadPosition: data.currentPlayheadIndex })
              }
            })
            .catch(error => {
              set({ lastError: `Failed to load bio-data: ${error.message}` })
            })
          break
        }

        case 'clear':
          set({ currentData: null })
          break

        case 'editSequence':
          // Placeholder for sequence editing — args[0] = sequenceId, args[1] = edits
          break

        default:
          throw new Error(`Unknown Data action: ${action}`)
      }
      break

    case 'Viewport':
      switch (action) {
        case 'reset':
          // Placeholder for viewport reset
          break

        case 'zoom': {
          const level = typeof args[0] === 'number' ? args[0] : parseFloat(args[0] as string)
          if (isNaN(level)) {
            throw new Error(`Invalid zoom level: ${args[0]}`)
          }
          // Placeholder for viewport zoom
          break
        }

        default:
          throw new Error(`Unknown Viewport action: ${action}`)
      }
      break

    default:
      throw new Error(`Unknown domain: ${domain}`)
  }
}

/**
 * Create the Zustand store with command pattern architecture
 */
export const useCommandStore = create<CommandStore>((set, get) => ({
  // Initial state
  playheadPosition: 0,
  currentData: null,
  isPlaying: false,
  selection: [],
  historyLog: [],
  parsedHistory: [],
  lastError: null,
  commandCount: 0,

  /**
   * CORE FUNCTION: Execute a command string
   * This is the ONLY way to mutate state in the application
   */
  executeCommand: (commandString: string) => {
    try {
      // Step 1: Parse the command string into strict ParsedCommand interface
      const parsed = parseCommandString(commandString)

      // Step 2: Validate the parsed command
      if (!isValidCommand(parsed)) {
        throw new Error(`Invalid command structure: ${commandString}`)
      }

      // Step 3: Execute the command with type safety
      executeCommandAction(parsed, set, get)

      // Step 4: Log both raw and parsed commands
      set((state) => ({
        historyLog: [...state.historyLog, commandString],
        parsedHistory: [...state.parsedHistory, parsed],
        commandCount: state.commandCount + 1,
        lastError: null
      }))
    } catch (error) {
      // Log errors visibly and to history
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set((state) => ({
        lastError: errorMessage,
        historyLog: [...state.historyLog, `[ERROR] ${commandString}`]
      }))
    }
  },

  /**
   * State getters (read-only access)
   */
  getPlayheadPosition: () => get().playheadPosition,
  getIsPlaying: () => get().isPlaying,
  getHistory: () => get().historyLog,
  getParsedHistory: () => get().parsedHistory,
  getLastError: () => get().lastError,

  /**
   * Utility functions
   */
  clearError: () => set({ lastError: null }),
  clearHistory: () => set({ historyLog: [], parsedHistory: [], commandCount: 0 })
}))
