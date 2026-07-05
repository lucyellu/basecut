/**
 * WorkspaceShell Component
 * Maya-style resizable panel workspace using Dockview
 * Registers 4 panels: Outliner, Viewport3D, Timeline, AgentChat
 */

import { useCallback } from 'react'
import {
  DockviewReact,
  DockviewReadyEvent,
  IDockviewPanelProps,
} from 'dockview-react'
import 'dockview-react/dist/styles/dockview.css'

import OutlinerPanel from './OutlinerPanel'
import Viewport3D from './Viewport3D'
import TimelineScrubber from './TimelineScrubber'
import AgentChatPanel from './AgentChatPanel'

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

function Viewport3DPanelWrapper(_props: IDockviewPanelProps) {
  return (
    <div className="panel-content viewport-panel">
      <Viewport3D />
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
  /**
   * Build the initial 4-panel layout when Dockview is ready
   * Layout: Outliner (left 20%) | Viewport3D (top right 70%) / Timeline+Chat (bottom right 30%)
   */
  const onReady = useCallback((event: DockviewReadyEvent) => {
    const api = event.api

    // 1. Add Outliner panel (will be the initial leftmost panel)
    const outlinerPanel = api.addPanel({
      id: 'outliner',
      component: 'outliner',
      title: '⊞ Outliner',
    })

    // 2. Add Viewport3D panel to the right of Outliner
    const viewportPanel = api.addPanel({
      id: 'viewport3d',
      component: 'viewport3d',
      title: '🧬 3D Viewport',
      position: {
        referencePanel: outlinerPanel,
        direction: 'right',
      },
    })

    // 3. Add Timeline panel below the Viewport
    const timelinePanel = api.addPanel({
      id: 'timeline',
      component: 'timeline',
      title: '▶ Timeline',
      position: {
        referencePanel: viewportPanel,
        direction: 'below',
      },
    })

    // 4. Add AgentChat as a tab in the same group as Timeline
    api.addPanel({
      id: 'agentchat',
      component: 'agentchat',
      title: '🤖 Agent Chat',
      position: {
        referencePanel: timelinePanel,
        direction: 'within',
      },
    })

    // Dockview handles proportional sizing automatically based on panel order.
    // The initial layout proportions are approximated by the directional placement.
  }, [])

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
