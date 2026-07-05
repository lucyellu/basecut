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

/**
 * Component registry for Dockview
 */
const components: Record<string, React.FunctionComponent<IDockviewPanelProps>> = {
  outliner: OutlinerPanelWrapper,
  viewport3d: Viewport3DPanelWrapper,
  timeline: TimelinePanelWrapper,
  agentchat: AgentChatPanelWrapper,
  commandoutput: CommandOutputWindowWrapper,
}

export default function WorkspaceShell() {
  const setDockviewApi = useCommandStore(state => state.setDockviewApi)

  const buildDefaultLayout = useCallback((api: DockviewApi) => {
    // Clear existing layout
    api.clear()

    // 1. Add Timeline first (fills screen, will be pushed to bottom)
    const timelinePanel = api.addPanel({
      id: 'timeline',
      component: 'timeline',
      title: '▶ Timeline',
    })

    // 2. Add AgentChat and Output Log into Timeline group
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

    // 3. Add Outliner above Timeline (Timeline becomes bottom half)
    const outlinerPanel = api.addPanel({
      id: 'outliner',
      component: 'outliner',
      title: '⊞ Outliner',
      position: { referencePanel: timelinePanel, direction: 'above' },
    })

    // 4. Add Top Viewport to the right of Outliner (splits top half horizontally)
    const viewportTop = api.addPanel({
      id: 'viewport-top',
      component: 'viewport3d',
      title: '🎥 Top View',
      params: { viewType: 'top' },
      position: { referencePanel: outlinerPanel, direction: 'right' },
    })

    // 5. Add Side Viewport to the right of Top Viewport (splits viewports area into two columns)
    const viewportSide = api.addPanel({
      id: 'viewport-side',
      component: 'viewport3d',
      title: '🎥 Side View',
      params: { viewType: 'side' },
      position: { referencePanel: viewportTop, direction: 'right' },
    })

    // 6. Add Front Viewport below Top Viewport (splits left viewport column vertically)
    api.addPanel({
      id: 'viewport-front',
      component: 'viewport3d',
      title: '🎥 Front View',
      params: { viewType: 'front' },
      position: { referencePanel: viewportTop, direction: 'below' },
    })

    // 7. Add Perspective Viewport below Side Viewport (splits right viewport column vertically)
    api.addPanel({
      id: 'viewport-persp',
      component: 'viewport3d',
      title: '🧬 Perspective',
      params: { viewType: 'persp' },
      position: { referencePanel: viewportSide, direction: 'below' },
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
