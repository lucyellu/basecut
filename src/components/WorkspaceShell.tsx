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

/**
 * Component registry for Dockview
 */
const components: Record<string, React.FunctionComponent<IDockviewPanelProps>> = {
  outliner: OutlinerPanelWrapper,
  viewport3d: Viewport3DPanelWrapper,
  timeline: TimelinePanelWrapper,
  agentchat: AgentChatPanelWrapper,
}

export default function WorkspaceShell() {
  const setDockviewApi = useCommandStore(state => state.setDockviewApi)

  const buildDefaultLayout = useCallback((api: DockviewApi) => {
    // Clear existing layout
    api.clear()

    // 1. Add Outliner panel
    const outlinerPanel = api.addPanel({
      id: 'outliner',
      component: 'outliner',
      title: '⊞ Outliner',
    })

    // 2. Add Top Viewport
    const viewportTop = api.addPanel({
      id: 'viewport-top',
      component: 'viewport3d',
      title: '🎥 Top View',
      params: { viewType: 'top' },
      position: { referencePanel: outlinerPanel, direction: 'right' },
    })

    // 3. Add Front Viewport
    const viewportFront = api.addPanel({
      id: 'viewport-front',
      component: 'viewport3d',
      title: '🎥 Front View',
      params: { viewType: 'front' },
      position: { referencePanel: viewportTop, direction: 'below' },
    })

    // 4. Add Side Viewport
    const viewportSide = api.addPanel({
      id: 'viewport-side',
      component: 'viewport3d',
      title: '🎥 Side View',
      params: { viewType: 'side' },
      position: { referencePanel: viewportTop, direction: 'right' },
    })

    // 5. Add Perspective Viewport
    api.addPanel({
      id: 'viewport-persp',
      component: 'viewport3d',
      title: '🧬 Perspective',
      params: { viewType: 'persp' },
      position: { referencePanel: viewportSide, direction: 'below' },
    })

    // 6. Add Timeline panel
    const timelinePanel = api.addPanel({
      id: 'timeline',
      component: 'timeline',
      title: '▶ Timeline',
      position: { referencePanel: viewportFront, direction: 'below' },
    })

    // 7. Add AgentChat
    api.addPanel({
      id: 'agentchat',
      component: 'agentchat',
      title: '🤖 Agent Chat',
      position: { referencePanel: timelinePanel, direction: 'within' },
    })
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
