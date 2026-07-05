/**
 * AgentChatPanel Component
 * AI-native natural language interface for the command engine
 * Parses conversational text into structured commands
 * Echoes system events from the command history log
 */

import { useState, useEffect, useRef } from 'react'
import { useCommandStore } from '../store/useCommandStore'

/**
 * Message types for the chat system
 */
interface ChatMessage {
  id: string
  type: 'user' | 'agent' | 'system'
  text: string
  timestamp: number
  command?: string // The actual command that was executed, if any
}

/**
 * Intent parsing result
 */
interface ParsedIntent {
  command: string
  response: string
}

/**
 * Lightweight regex-based intent parser
 * Maps natural language to executeCommand() calls
 */
function parseIntent(input: string): ParsedIntent | null {
  const text = input.toLowerCase().trim()

  // Navigation: "go to base 45", "jump to index 12", "navigate to 78", "base 50"
  const navMatch = text.match(/(?:go\s+to|jump\s+to|navigate\s+to|move\s+to|seek\s+to|set\s+playhead\s+to?)\s*(?:base|index|position|seq(?:uence)?)?\s*(\d+)/i)
  if (navMatch) {
    const idx = parseInt(navMatch[1])
    return {
      command: `Timeline.setPlayhead(${idx})`,
      response: `Navigating to base ${idx}...`,
    }
  }

  // Direct base reference: "base 45"
  const baseMatch = text.match(/^base\s+(\d+)$/i)
  if (baseMatch) {
    const idx = parseInt(baseMatch[1])
    return {
      command: `Timeline.setPlayhead(${idx})`,
      response: `Jumping to base ${idx}.`,
    }
  }

  // Playback: "play", "play the track", "start playback"
  if (/\b(?:play|start\s+play(?:back)?|resume)\b/i.test(text) && !/\bpause\b/i.test(text)) {
    return {
      command: 'Playback.play()',
      response: 'Starting playback ▶',
    }
  }

  // Pause: "pause", "pause playback", "stop playing"
  if (/\b(?:pause|stop\s+play(?:ing|back)?)\b/i.test(text)) {
    return {
      command: 'Playback.pause()',
      response: 'Pausing playback ⏸',
    }
  }

  // Stop: "stop", "stop everything"
  if (/^stop$|stop\s+(?:everything|all)/i.test(text)) {
    return {
      command: 'Playback.stop()',
      response: 'Stopping and resetting playhead ⏹',
    }
  }

  // Toggle: "toggle playback", "toggle"
  if (/\btoggle\b/i.test(text)) {
    return {
      command: 'Playback.toggle()',
      response: 'Toggling playback ⏯',
    }
  }

  // Load data: "load data", "load bio data", "load the file"
  if (/\b(?:load|open|import)\s*(?:the\s+)?(?:data|bio|file|sequence)/i.test(text)) {
    return {
      command: "Data.loadBioData('bio-data-2026-07-05.json')",
      response: 'Loading bio-sequence data...',
    }
  }

  // Clear data: "clear data", "unload", "remove data"
  if (/\b(?:clear|unload|remove|delete)\s*(?:the\s+)?(?:data|all)/i.test(text)) {
    return {
      command: 'Data.clear()',
      response: 'Clearing loaded data.',
    }
  }

  // Reset: "reset", "reset timeline", "go to start"
  if (/\b(?:reset|go\s+to\s+start|beginning|rewind)\b/i.test(text)) {
    return {
      command: 'Timeline.reset()',
      response: 'Resetting timeline to start.',
    }
  }

  // Help
  if (/\b(?:help|what\s+can|commands|how\s+do)\b/i.test(text)) {
    return {
      command: '',
      response: `Here's what I can do:\n• "go to base 45" — navigate to a specific position\n• "play" / "pause" — control playback\n• "toggle" — toggle play/pause\n• "load data" — load the bio-sequence file\n• "clear data" — unload current data\n• "reset" — return to the start\n\nYou can also type raw commands like Timeline.setPlayhead(10)`,
    }
  }

  // Try to detect if it's a raw command (Domain.action format)
  if (/^\w+\.\w+\(.*\)$/.test(input.trim())) {
    return {
      command: input.trim(),
      response: `Executing: ${input.trim()}`,
    }
  }

  return null
}

let messageIdCounter = 0
function nextId() {
  return `msg_${Date.now()}_${++messageIdCounter}`
}

export default function AgentChatPanel() {
  const executeCommand = useCommandStore((state) => state.executeCommand)
  const historyLog = useCommandStore((state) => state.historyLog)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId(),
      type: 'agent',
      text: 'Welcome to BaseCut Agent. Try "go to base 45", "play the track", or "load data". Type "help" for all commands.',
      timestamp: Date.now(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const lastHistoryLength = useRef(0)

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /**
   * Subscribe to historyLog changes
   * Echo UI-triggered commands as system messages
   */
  useEffect(() => {
    if (historyLog.length > lastHistoryLength.current) {
      const newEntries = historyLog.slice(lastHistoryLength.current)
      const systemMessages: ChatMessage[] = newEntries
        .filter(entry => !entry.startsWith('[ERROR]'))
        .map(entry => ({
          id: nextId(),
          type: 'system' as const,
          text: `[System]: ${entry} executed`,
          timestamp: Date.now(),
          command: entry,
        }))

      if (systemMessages.length > 0) {
        setMessages(prev => [...prev, ...systemMessages])
      }
    }
    lastHistoryLength.current = historyLog.length
  }, [historyLog])

  /**
   * Handle user message submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = inputValue.trim()
    if (!text) return

    // Add user message
    const userMsg: ChatMessage = {
      id: nextId(),
      type: 'user',
      text,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')

    // Parse intent
    const intent = parseIntent(text)

    if (intent) {
      // Execute command if there is one
      if (intent.command) {
        executeCommand(intent.command)
      }

      // Add agent response
      const agentMsg: ChatMessage = {
        id: nextId(),
        type: 'agent',
        text: intent.response,
        timestamp: Date.now(),
        command: intent.command || undefined,
      }

      // Small delay for natural feel
      setTimeout(() => {
        setMessages(prev => [...prev, agentMsg])
      }, 150)
    } else {
      // Unknown intent
      const fallbackMsg: ChatMessage = {
        id: nextId(),
        type: 'agent',
        text: `I didn't understand "${text}". Try "go to base 45", "play the track", or type "help" for all commands.`,
        timestamp: Date.now(),
      }

      setTimeout(() => {
        setMessages(prev => [...prev, fallbackMsg])
      }, 150)
    }
  }

  return (
    <div className="agent-chat">
      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.type}`}>
            {msg.type === 'agent' && (
              <div className="bubble-avatar agent-avatar">🤖</div>
            )}
            <div className="bubble-content">
              {msg.type === 'system' ? (
                <div className="system-msg">{msg.text}</div>
              ) : (
                <>
                  <div className="bubble-text">{msg.text}</div>
                  {msg.command && msg.type === 'agent' && (
                    <div className="bubble-command">
                      <code>{msg.command}</code>
                    </div>
                  )}
                </>
              )}
            </div>
            {msg.type === 'user' && (
              <div className="bubble-avatar user-avatar">👤</div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me anything... (e.g., &quot;go to base 45&quot;)"
          className="chat-input"
        />
        <button type="submit" className="chat-send-btn">
          ↵
        </button>
      </form>
    </div>
  )
}
