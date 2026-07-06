import React, { useState } from 'react';
import { useCommandStore } from '../store/useCommandStore';

const TopMenu = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const executeCommand = useCommandStore(state => state.executeCommand);
  const dockviewApi = useCommandStore(state => state.dockviewApi);

  const toggleMenu = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const closeMenu = () => {
    setActiveMenu(null);
  };

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.top-menu-bar')) {
        closeMenu();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleAction = (action: string) => {
    executeCommand(action);
    closeMenu();
  };

  return (
    <div className="top-menu-bar">
      <div className="menu-item-container">
        <button 
          className={`menu-button ${activeMenu === 'file' ? 'active' : ''}`}
          onClick={() => toggleMenu('file')}
        >
          File
        </button>
        {activeMenu === 'file' && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => handleAction("Data.loadBioData('bio-data-2026-07-05.json')")}>Load Default Bio-Data</button>
            <button className="dropdown-item" onClick={() => handleAction("Data.clear()")}>Clear Data</button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item" onClick={() => window.close()}>Exit</button>
          </div>
        )}
      </div>

      <div className="menu-item-container">
        <button 
          className={`menu-button ${activeMenu === 'edit' ? 'active' : ''}`}
          onClick={() => toggleMenu('edit')}
        >
          Edit
        </button>
        {activeMenu === 'edit' && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => handleAction("Data.clearSelection()")}>Deselect All</button>
            <button className="dropdown-item" onClick={() => handleAction("Timeline.reset()")}>Reset Timeline</button>
          </div>
        )}
      </div>

      <div className="menu-item-container">
        <button 
          className={`menu-button ${activeMenu === 'view' ? 'active' : ''}`}
          onClick={() => toggleMenu('view')}
        >
          View
        </button>
        {activeMenu === 'view' && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => {
              // Trigger F key virtually or just call executeCommand if we had a frame command
              // Since framing is localized to Viewport3D, we can just trigger a keydown
              const event = new KeyboardEvent('keydown', { key: 'f' });
              window.dispatchEvent(event);
              closeMenu();
            }}>Frame Selection (F)</button>
          </div>
        )}
      </div>

      <div className="menu-item-container">
        <button 
          className={`menu-button ${activeMenu === 'window' ? 'active' : ''}`}
          onClick={() => toggleMenu('window')}
        >
          Window
        </button>
        {activeMenu === 'window' && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => {
              if (dockviewApi) {
                dockviewApi.addPanel({ id: `viewport-persp-${Date.now()}`, component: 'viewport3d', title: '🧬 Perspective', params: { viewType: 'persp' } })
              }
              closeMenu()
            }}>Add Perspective View</button>
            <button className="dropdown-item" onClick={() => {
              if (dockviewApi) {
                dockviewApi.addPanel({ id: `viewport-top-${Date.now()}`, component: 'viewport3d', title: '🎥 Top View', params: { viewType: 'top' } })
              }
              closeMenu()
            }}>Add Top View</button>
            <button className="dropdown-item" onClick={() => {
              if (dockviewApi) dockviewApi.addPanel({ id: `outliner-${Date.now()}`, component: 'outliner', title: '⊞ Outliner' })
              closeMenu()
            }}>Add Outliner</button>
            <button className="dropdown-item" onClick={() => {
              if (dockviewApi) dockviewApi.addPanel({ id: `timeline-${Date.now()}`, component: 'timeline', title: '▶ Timeline' })
              closeMenu()
            }}>Add Timeline</button>
            <button className="dropdown-item" onClick={() => {
              if (dockviewApi) dockviewApi.addPanel({ id: `agentchat-${Date.now()}`, component: 'agentchat', title: '🤖 Agent Chat' })
              closeMenu()
            }}>Add Agent Chat</button>
            <button className="dropdown-item" onClick={() => {
              if (dockviewApi) dockviewApi.addPanel({ id: `commandoutput-${Date.now()}`, component: 'commandoutput', title: '📝 Output Log' })
              closeMenu()
            }}>Add Output Log</button>
            
            <div className="dropdown-divider"></div>

            <button className="dropdown-item" onClick={() => {
              if (dockviewApi) {
                const outliner = dockviewApi.getPanel('outliner')
                if (outliner) outliner.api.setVisible(!outliner.api.isVisible)
              }
              closeMenu()
            }}>Toggle Outliner</button>

            <button className="dropdown-item" onClick={() => {
              if (dockviewApi) {
                const timeline = dockviewApi.getPanel('timeline')
                if (timeline) timeline.api.setVisible(!timeline.api.isVisible)
              }
              closeMenu()
            }}>Toggle Bottom Panel</button>
            
            <div className="dropdown-divider"></div>
            
            <button className="dropdown-item" onClick={() => {
              // Trigger a reset by dispatching a custom event that WorkspaceShell listens to
              window.dispatchEvent(new CustomEvent('reset-workspace-layout'))
              closeMenu()
            }}>Reset Layout (4-Split)</button>
          </div>
        )}
      </div>

      <div className="menu-item-container">
        <button 
          className={`menu-button ${activeMenu === 'help' ? 'active' : ''}`}
          onClick={() => toggleMenu('help')}
        >
          Help
        </button>
        {activeMenu === 'help' && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => alert('BaseCut NLE - AI-Native Command Engine\n\nControls: Left to Orbit, Mid to Pan, Right to Zoom.\nPress F to Frame Selection.')}>About BaseCut</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopMenu;
