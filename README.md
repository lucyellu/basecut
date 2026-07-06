# Basecut NLE - Headless Command Engine

A React Non-Linear Editor (NLE) application built with a strict **Command Pattern architecture**. All state mutations occur through text command strings, creating an auditable, reproducible system that mirrors professional 3D software like Maya.

Try at https://basecut.netlify.app/

## 🎯 Project Philosophy

This project demonstrates a "headless" command engine where UI components are "dumb" - they only fire commands and listen to state changes. This architecture:

- ✅ **Reproducible**: Every action can be replayed from the command log
- ✅ **Debuggable**: Full history of all state changes
- ✅ **Agent-Ready**: AI agents can manipulate the app through simple text commands
- ✅ **Testable**: Commands can be unit tested independently of UI

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will open at `http://localhost:3000` (or next available port).

## 🎮 Available Commands

### Timeline Commands
- `Timeline.setPlayhead(5)` - Set playhead to position 5
- `Timeline.setPlayhead(0)` - Reset playhead to 0
- `Timeline.reset()` - Reset timeline state

### Playback Commands
- `Playback.play()` - Start playback
- `Playback.pause()` - Pause playback
- `Playback.toggle()` - Toggle playback state
- `Playback.stop()` - Stop and reset playhead

### Data Commands
- `Data.loadBioData('bio-data-2026-07-05.json')` - Load bio-sequence data
- `Data.load('filename.json')` - Load custom data file
- `Data.clear()` - Clear loaded data
- `Data.editSequence(id, {...})` - Edit specific sequence

### Viewport Commands (Future)
- `Viewport.reset()` - Reset viewport
- `Viewport.zoom(level)` - Set zoom level

## 📁 Project Structure

```
L:\Projects\basecut\
├── public/
│   └── bio-data-2026-07-05.json    # Sample bio-sequence data
├── src/
│   ├── components/
│   │   ├── CommandInputBar.tsx     # Always-visible command input
│   │   ├── CommandOutputWindow.tsx # Collapsible output window
│   │   └── DataPanel.tsx          # Data loading/editing GUI
│   ├── store/
│   │   └── useCommandStore.ts      # Zustand command engine
│   ├── types/
│   │   ├── command.types.ts       # Command type definitions
│   │   └── data.types.ts          # Bio-data type definitions
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🧪 Testing Data Loading

The project includes sample bio-sequence data for testing:

1. **Load the data** (choose one):
   - Click the "🧬 Load Bio-Sequence Data" button in the Data Panel
   - Type `Data.loadBioData('bio-data-2026-07-05.json')` in the terminal

2. **Verify the data loaded**:
   - Check the "Data Status" panel shows "Loaded"
   - View sequence preview in the Data Panel
   - Inspect the command output for successful loading

3. **Test the timeline**:
   - Use `Timeline.setPlayhead(64)` to jump to the middle of the sequence
   - Click on individual sequences in the preview to edit them

## 📊 Bio-Sequence Data Structure

The sample data (`bio-data-2026-07-05.json`) contains:

```json
{
  "sequences": [
    {
      "id": 1,
      "base": "D",
      "value": 0.787,
      "x": 10,
      "y": -75,
      "z": 0
    }
    // ... 100 sequences
  ],
  "currentPlayheadIndex": 64,
  "cameras": [
    {
      "id": "persp",
      "name": "Perspective",
      "type": "perspective",
      "position": [0, 0, 50],
      "target": [0, 0, 0],
      "zoom": 1
    }
  ],
  "activeCameraId": "camera_1783210028954"
}
```

### Data Applications

- **1D Timeline**: Sequence IDs act as chronological ticks
- **Sequence Letters**: Base letters ('D', 'T', 'S', 'A') render on the scrubber
- **Waveform Track**: Value scores (0.6-0.99) create activity visualization
- **3D Coordinates**: Each base maps to precise 3D positions for camera movement
- **Camera State**: Complete scene state like Maya/NLE applications

## 🎨 Architecture

### Command Pattern Implementation

The core principle is that **all state mutations go through `executeCommand()`**:

```typescript
// ❌ WRONG - Direct state mutation
setPlayheadPosition(10)

// ✅ RIGHT - Command-based mutation
executeCommand('Timeline.setPlayhead(10)')
```

### Type Safety

Every command resolves to a strict `ParsedCommand` interface:

```typescript
interface ParsedCommand {
  domain: CommandDomain      // 'Timeline' | 'Playback' | 'Data' | 'Viewport'
  action: string              // 'setPlayhead' | 'play' | 'load' etc.
  args: any[]                 // [5] or ['file.json'] etc.
}
```

### State Flow

1. **User Action** → UI fires command string
2. **Parse** → String converts to `ParsedCommand`
3. **Validate** → Domain and action checked against whitelist
4. **Execute** → State updates through command handlers
5. **Log** → Both raw and parsed commands stored in history

## 🔧 Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety and better DX
- **Zustand** - Lightweight state management
- **Vite** - Fast development server and build tool
- **Tailwind CSS** - Utility-first styling

## 🌟 Features

- **Collapsible Terminal**: Maya-style output window with independent scrolling
- **Command Input Bar**: Always-visible command input at bottom
- **Data Panel**: GUI for loading and editing bio-sequence data
- **Separate Panels**: Main content and terminal have independent scrollbars
- **Error Handling**: Visible error display + command logging
- **Type Safety**: Strict TypeScript interfaces prevent bugs
- **Agent-Ready**: Simple text commands for AI automation

## 📝 Usage Examples

### Basic Commands
```bash
# Set playhead position
Timeline.setPlayhead(50)

# Start playback
Playback.play()

# Load bio-sequence data
Data.loadBioData('bio-data-2026-07-05.json')

# Jump to specific sequence
Timeline.setPlayhead(64)

# Pause playback
Playback.pause()

# Clear loaded data
Data.clear()
```

### Advanced Usage
```bash
# Edit specific sequence
Data.editSequence(1, { base: 'A', value: 0.85 })

# Reset timeline
Timeline.reset()

# Stop playback and reset
Playback.stop()
```

## 🎯 Future Development

This command engine is ready for:

- **3D Viewport**: Three.js canvas that listens to state changes
- **Timeline Scrubber**: Visual timeline that fires `Timeline.setPlayhead()` commands
- **Video/Audio Playback**: Media controls through command interface
- **Undo/Redo**: Command history enables full undo/redo system
- **Macros**: Record and replay command sequences
- **Persistence**: Save/load command scripts

## 🏗️ Why This Architecture

1. **Prevents Bugs**: Single mutation point eliminates direct state manipulation bugs
2. **Full Audit Trail**: Every user action is logged and replayable
3. **AI Integration**: Agents can understand and control the app through text
4. **Testability**: Commands are easily unit tested without UI
5. **Scalability**: Easy to add new commands and domains
6. **Professional**: Mirrors industry-standard tools like Maya and Blender

## 📄 License

MIT

## 🤝 Contributing

This is a prototype for educational purposes. The command pattern architecture can be adapted to any React application that benefits from reproducible state management.

---

**Built for the Anthropic Hackathon 2026** - Demonstrating agent-ready, command-driven architecture for creative tools.
