# Basecut NLE - Project State & Progress Tracking

**Last Updated**: 2026-07-05 13:45
**Current Branch**: `dev`
**Status**: ✅ Core Command Engine Complete - Ready for Advanced Features

---

## 🎯 Project Overview

**Goal**: React Non-Linear Editor with strict Command Pattern architecture for bio-sequence visualization

**Key Innovation**: All state mutations through text commands (`executeCommand()`), creating auditable, reproducible system like Maya

**Repository**: https://github.com/lucyellu/basecut.git

---

## ✅ Completed Features

### 1. Command Engine (Zustand Store)
- `src/store/useCommandStore.ts` - Single mutation point via `executeCommand(commandString)`
- Strict TypeScript with `ParsedCommand` interface
- Domain whitelist: `Timeline | Playback | Data | Viewport`
- Command history (raw + parsed) + error handling

### 2. Terminal Interface (Maya-Style)
- `CommandInputBar.tsx` - Always-visible input at bottom
- `CommandOutputWindow.tsx` - Collapsible output panel
- Separate scrollable panels, resizable, dark theme

### 3. Data Loading System
- `DataPanel.tsx` - GUI for loading/editing bio-sequence data
- `data.types.ts` - Type definitions
- `public/bio-data-2026-07-05.json` - Sample data (100 sequences, 5 cameras)

### 4. Layout & UI
- Separate scrollable panels (main vs terminal)
- Status dashboard, quick commands, responsive design

---

## 🔧 Available Commands

```bash
Timeline.setPlayhead(5)    # Set playhead position
Playback.play()            # Start playback
Playback.toggle()          # Toggle playback
Data.loadBioData('bio-data-2026-07-05.json')  # Load bio-sequence data
Data.clear()              # Clear loaded data
```

---

## 📁 Key Files

```
src/
├── components/
│   ├── CommandInputBar.tsx     # Always-visible input
│   ├── CommandOutputWindow.tsx # Collapsible output
│   └── DataPanel.tsx          # Data GUI
├── store/
│   └── useCommandStore.ts      # Command engine ⭐
├── types/
│   ├── command.types.ts        # Command interfaces
│   └── data.types.ts           # Data interfaces
└── App.tsx                     # Root component
```

---

## 🧪 Testing Status

**Working**: ✅ Terminal commands, state updates, data loading, error handling
**Ready to Test**: Load bio-data via `Data.loadBioData('bio-data-2026-07-05.json')`

---

## 🚧 Next Steps (Current Session)

**IMMEDIATE**: Test data loading thoroughly
1. Run `Data.loadBioData('bio-data-2026-07-05.json')`
2. Verify 100 sequences load correctly
3. Check camera state updates
4. Confirm playhead initializes to position 64

**FUTURE**: 3D viewport, timeline scrubber, waveform tracks

---

## 📊 Bio-Data Structure

```json
{
  "sequences": [100 DNA bases with 3D coordinates],
  "currentPlayheadIndex": 64,
  "cameras": [5 camera configurations],
  "activeCameraId": "camera_1783210028954"
}
```

---

## 🛠️ Resume Instructions

1. Read this file for current state
2. `git checkout dev` (current branch)
3. `npm install && npm run dev`
4. Test: `Data.loadBioData('bio-data-2026-07-05.json')`

---

## 📝 Recent Progress

**Latest Commits**:
- `3a938a4` - Remove redundant Recent Commands section
- `2bbb52e` - Add data loading system and README
- `877c3f3` - Fix layout: Separate scrollable panels

**Branch Status**: dev is clean, main is stable

---

## 🎯 Architecture Principle

```typescript
// ❌ WRONG
setPlayheadPosition(10)

// ✅ RIGHT
executeCommand('Timeline.setPlayhead(10)')
```

**All state changes MUST go through commands**

---

## 📈 Project Metrics

- Commands: 12 total
- Components: 5 main
- Code: ~2,000 lines
- Data: 100 sequences, 5 cameras

---

**Status**: 🟢 Ready for testing and next phase
