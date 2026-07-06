/**
 * WorkspaceShell Component
 * Maya-style resizable panel workspace using Dockview
 * Registers 4 panels: Outliner, Viewport3D, Timeline, AgentChat
 */

import { useCallback, useEffect } from 'react'
import {
  DockviewReact,
  DockviewReadyEvent,
  IDockviewPanelProps,
  DockviewApi
} from 'dockview-react'
import 'dockview-react/dist/styles/dockview.css'

import OutlinerPanel from './OutlinerPanel'
import Viewport3D from './Viewport3D'
import TimelineScrubber from './TimelineScrubber'
import AgentChatPanel from './AgentChatPanel'
import CommandOutputWindow from './CommandOutputWindow'
import DetailsPanel from './DetailsPanel'
import { useCommandStore } from '../store/useCommandStore'

/**
 * Panel wrapper components for Dockview registry
 * Each wraps the actual component and fills the panel container
 */
function OutlinerPanelWrapper(_props: IDockviewPanelProps) {
  return (
    <div className="panel-content outliner-panel">
      <OutlinerPanel />
    </div>
  )
}

function Viewport3DPanelWrapper(props: IDockviewPanelProps) {
  const viewType = props.params?.viewType as 'top' | 'front' | 'side' | 'persp' | undefined;
  return (
    <div className="panel-content viewport-panel">
      <Viewport3D viewType={viewType} />
    </div>
  )
}

function TimelinePanelWrapper(_props: IDockviewPanelProps) {
  return (
    <div className="panel-content timeline-panel">
      <TimelineScrubber />
    </div>
  )
}

function AgentChatPanelWrapper(_props: IDockviewPanelProps) {
  return (
    <div className="panel-content chat-panel">
      <AgentChatPanel />
    </div>
  )
}

function CommandOutputWindowWrapper(_props: IDockviewPanelProps) {
  return (
    <div className="panel-content output-panel" style={{ height: '100%', width: '100%' }}>
      <CommandOutputWindow />
    </div>
  )
}

function DetailsPanelWrapper(props: IDockviewPanelProps) {
  return (
    <div className="panel-content details-panel" style={{ height: '100%', width: '100%' }}>
      <DetailsPanel {...props} />
    </div>
  )
}

/**
 * Component registry for Dockview
 */
const components: Record<string, React.FunctionComponent<IDockviewPanelProps>> = {
  outliner: OutlinerPanelWrapper,
  viewport3d: Viewport3DPanelWrapper,
  timeline: TimelinePanelWrapper,
  agentchat: AgentChatPanelWrapper,
  commandoutput: CommandOutputWindowWrapper,
  details: DetailsPanelWrapper,
}

export default function WorkspaceShell() {
  const setDockviewApi = useCommandStore((state) => state.setDockviewApi)
  const isPlaying = useCommandStore((state) => state.isPlaying)
  const playheadPosition = useCommandStore((state) => state.playheadPosition)
  const currentData = useCommandStore((state) => state.currentData)
  
  // Playback Engine Loop
  useEffect(() => {
    let interval: number
    if (isPlaying) {
      interval = window.setInterval(() => {
        const sequences = currentData?.data?.sequences || []
        const nextId = playheadPosition >= sequences.length ? 1 : playheadPosition + 1
        useCommandStore.getState().executeCommand(`Timeline.setPlayhead(${nextId})`)
      }, 50) // 20fps playback speed
    }
    return () => window.clearInterval(interval)
  }, [isPlaying, playheadPosition, currentData])

  // Global Hotkeys (F to frame)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.key.toLowerCase() === 'f' && e.target instanceof Element && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        useCommandStore.getState().executeCommand('Viewport.frameAll()')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const buildDefaultLayout = useCallback((api: DockviewApi) => {
    // Clear existing layout
    api.clear()

    // 1. Add Outliner first (fills screen)
    const outlinerPanel = api.addPanel({
      id: 'outliner',
      component: 'outliner',
      title: '⊞ Outliner',
    })

    // 2. Add Details to the far right (splits screen 50/50)
    const detailsPanel = api.addPanel({
      id: 'details',
      component: 'details',
      title: '☰ Details',
      position: { referencePanel: outlinerPanel, direction: 'right' }
    })

    // 3. Add Top Viewport to the left of Details (splits 50/50, creating a center column)
    const viewportTop = api.addPanel({
      id: 'viewport-top',
      component: 'viewport3d',
      title: '🎥 Top View',
      params: { viewType: 'top' },
      position: { referencePanel: detailsPanel, direction: 'left' },
    })

    // 4. Add Side Viewport to the right of Top Viewport (splits center column 50/50)
    const viewportSide = api.addPanel({
      id: 'viewport-side',
      component: 'viewport3d',
      title: '🎥 Side View',
      params: { viewType: 'side' },
      position: { referencePanel: viewportTop, direction: 'right' },
    })

    // 5. Add Front Viewport below Top Viewport
    api.addPanel({
      id: 'viewport-front',
      component: 'viewport3d',
      title: '🎥 Front View',
      params: { viewType: 'front' },
      position: { referencePanel: viewportTop, direction: 'below' },
    })

    // 6. Add Perspective Viewport below Side Viewport
    api.addPanel({
      id: 'viewport-persp',
      component: 'viewport3d',
      title: '🧬 Perspective',
      params: { viewType: 'persp' },
      position: { referencePanel: viewportSide, direction: 'below' },
    })

    // 6. Add Timeline at the root bottom (splits root downwards)
    const timelinePanel = api.addPanel({
      id: 'timeline',
      component: 'timeline',
      title: '▶ Timeline',
      position: { direction: 'below' },
    })

    // 7. Add AgentChat and Output Log into Timeline group
    api.addPanel({
      id: 'agentchat',
      component: 'agentchat',
      title: '🤖 Agent Chat',
      position: { referencePanel: timelinePanel, direction: 'within' },
    })
    api.addPanel({
      id: 'commandoutput',
      component: 'commandoutput',
      title: '📝 Output Log',
      position: { referencePanel: timelinePanel, direction: 'within' },
    })
    
    // Explicitly size the outer panels to avoid wonky 50/50 defaults
    setTimeout(() => {
      // Assuming a standard screen, we can resize panels via their groups.
      // But a cleaner way in Dockview without complex APIs is to just let the user drag.
      // The CSS sash fix solves the dragging issue.
    }, 100)
  }, [])

  const onReady = useCallback((event: DockviewReadyEvent) => {
    const api = event.api
    setDockviewApi(api)
    buildDefaultLayout(api)
  }, [buildDefaultLayout, setDockviewApi])

  useEffect(() => {
    const handleReset = () => {
      const api = useCommandStore.getState().dockviewApi
      if (api) buildDefaultLayout(api)
    }
    window.addEventListener('reset-workspace-layout', handleReset)
    return () => window.removeEventListener('reset-workspace-layout', handleReset)
  }, [buildDefaultLayout])

  return (
    <div className="workspace-shell">
      <DockviewReact
        className="dockview-theme-dark"
        components={components}
        onReady={onReady}
        disableFloatingGroups={false}
      />
    </div>
  )
}
