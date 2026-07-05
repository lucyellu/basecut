# BaseCut — Progress Assessment & Implementation Plan

## Current State Assessment

### Step 1: The Foundation (Zustand & Types) — ✅ DONE
| Requirement | Status | Notes |
|---|---|---|
| `command.types.ts` with strong types | ✅ | [command.types.ts](file:///L:/Projects/basecut/src/types/command.types.ts) — `ParsedCommand`, `CommandDomain`, `CommandState` |
| `data.types.ts` typing bio-data JSON | ✅ | [data.types.ts](file:///L:/Projects/basecut/src/types/data.types.ts) — `BioSequence` (id, base, value, x, y, z), `Camera`, `BioData` |
| Zustand store with `executeCommand()` | ✅ | [useCommandStore.ts](file:///L:/Projects/basecut/src/store/useCommandStore.ts) — strict command pattern, single mutation point |
| String parser for `Timeline.setPlayhead()`, `Playback.play()`, `Data.load()` | ✅ | `parseCommandString()` handles domain.action(args) format with type coercion |
| `Data.load('bio-data-2026-07-05.json')` fetches from `/public` | ✅ | Both `Data.load` and `Data.loadBioData` implemented with `fetch()` |
| Immutable `historyLog: string[]` | ✅ | Tracks every command; errors prefixed with `[ERROR]` |

---

### Step 2: Maya Panel Layout (Dockview Shell) — ❌ NOT STARTED
| Requirement | Status | Notes |
|---|---|---|
| Install `dockview-react` | ❌ | Not in `package.json` |
| `WorkspaceShell.tsx` with `<DockviewReact>` | ❌ | Does not exist |
| 4 registered panels: Outliner, Viewport3D, Timeline, AgentChat | ❌ | Components exist in flat layout, no dockable panels |
| Premium dark theme with Dockview CSS | ❌ | Current UI is a scrollable page layout, not a professional NLE |
| Render as root in `App.tsx` | ❌ | App.tsx is a traditional scrollable dashboard |

> [!IMPORTANT]
> This is the **biggest gap**. The app currently renders as a vertically-scrolling page — not the Maya-style resizable/draggable panel workspace described in the spec. Adding Dockview transforms it from a dashboard into a professional NLE.

---

### Step 3: 3D Canvas & Timeline Tracks — ✅ MOSTLY DONE (needs Dockview integration)
| Requirement | Status | Notes |
|---|---|---|
| R3F viewport rendering 3D spline from sequences | ✅ | [Viewport3D.tsx](file:///L:/Projects/basecut/src/components/Viewport3D.tsx) — green Line + per-node Spheres |
| `useFrame` camera lerp to `currentPlayheadIndex` | ✅ | Smooth lerp at 0.05 factor, no React re-renders |
| Glowing sphere marker at active base | ✅ | Outer glow (cyan, additive blending) + inner sphere |
| Horizontal timeline with base letters | ✅ | [TimelineScrubber.tsx](file:///L:/Projects/basecut/src/components/TimelineScrubber.tsx) — flex row of letters |
| Mini-waveform bars from `value` float | ✅ | Height-proportional bars underneath letters |
| Click fires `executeCommand("Timeline.setPlayhead(id)")` only | ✅ | Line 34: `executeCommand(\`Timeline.setPlayhead(${clampedId})\`)` |
| Plug components into Dockview panel slots | ❌ | Currently rendered inline in App.tsx grid |

---

### Step 4: AI-Native Agent Chat Panel — ❌ NOT STARTED
| Requirement | Status | Notes |
|---|---|---|
| `AgentChatPanel.tsx` | ❌ | Does not exist |
| Chat bubble UI (user right, AI left) | ❌ | — |
| Intent parser for natural language → commands | ❌ | — |
| "go to base 45" → `executeCommand('Timeline.setPlayhead(45)')` | ❌ | — |
| "play the track" → `executeCommand('Playback.play()')` | ❌ | — |
| Subscribe to `historyLog` and echo system messages | ❌ | — |

---

## Summary

| Step | Status | Effort |
|---|---|---|
| 1. Foundation (Zustand & Types) | ✅ Complete | — |
| 2. Dockview Panel Layout | ❌ **Not started** | **High** — new dependency, layout rewrite |
| 3. 3D Canvas & Timeline | ✅ Code exists | **Low** — just needs Dockview slot wiring |
| 4. Agent Chat Panel | ❌ **Not started** | **Medium** — new component + intent parser |

---

## Proposed Changes

### Phase 1: Install Dockview

#### [MODIFY] [package.json](file:///L:/Projects/basecut/package.json)
- Install `dockview-react` via npm

---

### Phase 2: Dockview Workspace Shell

#### [NEW] `src/components/WorkspaceShell.tsx`
- Create `<DockviewReact>` wrapper with dark theme
- Register 4 panel factories: `OutlinerPanel`, `Viewport3DPanel`, `TimelinePanel`, `AgentChatPanel`
- Layout spec:
  - **Left column** (~20% width): Outliner
  - **Right top** (~70% height): 3D Viewport
  - **Right bottom** (~15% height): Timeline
  - **Tabbed with timeline or below**: Agent Chat
- Import Dockview's built-in dark theme CSS (`dockview-react/dist/styles/dockview.css`)

#### [NEW] `src/components/OutlinerPanel.tsx`
- Scene hierarchy panel showing loaded data info, sequence count, camera list, playhead status
- Quick-action buttons that fire commands
- Premium dark styling consistent with the NLE aesthetic

#### [MODIFY] [App.tsx](file:///L:/Projects/basecut/src/App.tsx)
- Replace the entire scrollable dashboard with `<WorkspaceShell />`
- Remove the status grid, quick commands, and DataPanel (they move into panels)
- Keep header as a slim toolbar

---

### Phase 3: Agent Chat Panel

#### [NEW] `src/components/AgentChatPanel.tsx`
- **Chat UI**: Scrollable message list with bubble styling (user = right/blue, AI = left/gray, system = center/muted)
- **Intent Parser**: Lightweight regex-based NLU:
  - `/go\s+to\s+(base|index|position)?\s*(\d+)/i` → `Timeline.setPlayhead(N)`
  - `/jump\s+to\s+(\d+)/i` → `Timeline.setPlayhead(N)`
  - `/play/i` → `Playback.play()`
  - `/pause|stop/i` → `Playback.pause()`
  - `/load\s+data/i` → `Data.loadBioData('bio-data-2026-07-05.json')`
  - `/reset/i` → `Timeline.reset()`
  - Fallback: "I didn't understand that. Try 'go to base 45' or 'play the track'."
- **System log subscription**: `useEffect` watching `historyLog.length`; new entries echoed as muted `[System]` messages
- **Input field**: Fixed at bottom of panel, Enter to send

---

### Phase 4: Wire Existing Components into Dockview

#### [MODIFY] [Viewport3D.tsx](file:///L:/Projects/basecut/src/components/Viewport3D.tsx)
- Remove hardcoded `style={{ height: '400px' }}` — let Dockview control sizing
- Make Canvas fill parent container (`width: 100%, height: 100%`)

#### [MODIFY] [TimelineScrubber.tsx](file:///L:/Projects/basecut/src/components/TimelineScrubber.tsx)
- Adapt to fill its Dockview panel slot (remove fixed sizing)

---

### Phase 5: Polish

#### [MODIFY] [index.css](file:///L:/Projects/basecut/src/index.css)
- Import Dockview dark theme CSS
- Override Dockview theme variables for premium slate/gray aesthetic matching the current color palette
- Add chat bubble styles

---

## Open Questions

> [!IMPORTANT]
> **Outliner panel content**: The spec says "OutlinerPanel (Left side, 20%)" but doesn't detail what goes in it. I'll populate it with a scene hierarchy (loaded data info, sequence list, camera list, and quick-action commands). Is that what you want, or should it be something else?

> [!NOTE]
> **Existing Terminal components**: The current [CommandInputBar.tsx](file:///L:/Projects/basecut/src/components/CommandInputBar.tsx) and [CommandOutputWindow.tsx](file:///L:/Projects/basecut/src/components/CommandOutputWindow.tsx) will be superseded by the Agent Chat Panel. Should I keep them accessible (e.g. as a hidden "Terminal" tab in Dockview) or remove them entirely?

## Verification Plan

### Automated Tests
- `npm run build` — TypeScript compilation must pass with no errors

### Manual Verification
1. `npm run dev` → app opens with Dockview 4-panel layout
2. Panels are resizable by dragging borders
3. Outliner shows data info after loading
4. 3D viewport fills its panel and renders the sequence spline
5. Timeline scrubs correctly and fires commands
6. Agent Chat: typing "go to base 45" navigates viewport + shows AI response
7. Agent Chat: clicking timeline echoes `[System]` message in chat
8. Dark theme is consistent across all panels
