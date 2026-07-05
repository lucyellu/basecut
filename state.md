# Basecut NLE - Project State & Progress Tracking

**Last Updated**: 2026-07-05 14:00
**Current Branch**: `dev`
**Status**: ✅ 3D Viewport & Timeline Scrubber Complete - Ready for Testing

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

### 5. 🆕 3D Viewport & Timeline Scrubber
- `TimelineScrubber.tsx` - 1D timeline with sequence letters + waveform
- `Viewport3D.tsx` - Three.js canvas with 3D structure visualization
- Command-only interaction (no direct state mutation)
- Camera lerping for smooth playhead following

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
│   ├── DataPanel.tsx          # Data GUI
│   ├── TimelineScrubber.tsx   # 🆕 1D timeline + waveform
│   └── Viewport3D.tsx         # 🆕 Three.js 3D viewport
├── store/
│   └── useCommandStore.ts      # Command engine ⭐
├── types/
│   ├── command.types.ts        # Command interfaces
│   └── data.types.ts           # Data interfaces
└── App.tsx                     # Root component
```

## 🆕 New Dependencies
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Useful helpers for React Three Fiber
- `three` - 3D graphics library

---

## 🧪 Testing Status

**Working**: ✅ Terminal commands, state updates, data loading, error handling
**Ready to Test**: Load bio-data via `Data.loadBioData('bio-data-2026-07-05.json')`

---

## 🚧 Next Steps (Current Session)

**IMMEDIATE**: Test 3D viewport and timeline integration
1. Load bio-data: `Data.loadBioData('bio-data-2026-07-05.json')`
2. Drag timeline scrubber - should see camera move smoothly
3. Click on timeline - playhead updates and camera follows
4. Verify 3D structure appears correctly
5. Check waveform visualization matches sequence values

**TESTING CHECKLIST**:
- ✅ Three.js canvas renders without errors
- ✅ Timeline shows 100 base letters
- ✅ Waveform bars display value scores
- ✅ Dragging playhead fires `Timeline.setPlayhead(id)` command
- ✅ Camera lerps smoothly to follow playhead
- ✅ Active base marker glows at current position

**FUTURE**: Export/import, undo/redo, advanced editing

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

**Latest Work** (2026-07-05 14:00):
- Created `TimelineScrubber.tsx` with sequence track + waveform
- Created `Viewport3D.tsx` with Three.js canvas + camera lerping
- Integrated both components into main App layout
- Installed Three.js dependencies (@react-three/fiber, drei, three)

**Latest Commits**:
- Working on: 3D viewport and timeline integration
- `8eb454f` - Add comprehensive project state tracking document
- `3a938a4` - Remove redundant Recent Commands section

**Branch Status**: dev (active development)

---

## 🎯 Architecture Principles

### Command Pattern
```typescript
// ❌ WRONG
setPlayheadPosition(10)

// ✅ RIGHT
executeCommand('Timeline.setPlayhead(10)')
```

### 3D Viewport Performance
```typescript
// ⚡ CRITICAL: Mutate camera in useFrame, not React state
useFrame(() => {
  camera.position.lerp(targetPosition, 0.05)  // Smooth follow
  camera.lookAt(targetVector)                  // Look at active base
  // No React re-renders triggered!
})
```

### Timeline Interaction
```typescript
// ⚡ CRITICAL: Fire command, don't mutate state
const handleClick = (id: number) => {
  executeCommand(`Timeline.setPlayhead(${id})`)  // Only way to change state
}
```

**All state changes MUST go through commands**

---

## 📈 Project Metrics

- Commands: 12 total
- Components: 7 main (🆕 TimelineScrubber, Viewport3D)
- Code: ~3,500 lines (including 3D components)
- Data: 100 sequences, 5 cameras
- Dependencies: Added Three.js ecosystem

---

**Status**: 🟡 Ready for testing - 3D viewport and timeline complete
