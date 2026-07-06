import { useState, useEffect } from 'react'
import { useCommandStore } from '../store/useCommandStore'
import { IDockviewPanelProps } from 'dockview-react'

export default function DetailsPanel(_props: IDockviewPanelProps) {
  const selection = useCommandStore((state) => state.selection)
  const currentData = useCommandStore((state) => state.currentData)
  const executeCommand = useCommandStore((state) => state.executeCommand)

  const [activeItem, setActiveItem] = useState<any>(null)
  const [itemType, setItemType] = useState<'camera' | 'sequence' | null>(null)

  useEffect(() => {
    if (!selection || selection.length === 0 || !currentData) {
      setActiveItem(null)
      setItemType(null)
      return
    }

    const id = selection[0]
    
    // Check if camera
    const camera = currentData.data.cameras?.find((c: any) => c.id === id || c.name === id)
    if (camera) {
      setActiveItem(camera)
      setItemType('camera')
      return
    }

    // Check if sequence
    // The selection might be string or number, so check both
    const numId = typeof id === 'string' ? parseInt(id, 10) : id
    const sequence = currentData.data.sequences?.find((s: any) => s.id === numId || s.id === id)
    if (sequence) {
      setActiveItem(sequence)
      setItemType('sequence')
      return
    }

    setActiveItem(null)
    setItemType(null)
  }, [selection, currentData])

  if (!activeItem) {
    return (
      <div className="details-panel" style={{ padding: '16px', color: '#575e72', fontSize: '11px', textAlign: 'center' }}>
        Select an object to view details
      </div>
    )
  }

  const handleCameraUpdate = (field: string, value: any) => {
    const val = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(val)) return
    
    // Dispatch command
    executeCommand(`Camera.update('${activeItem.id}', ${JSON.stringify({ [field]: val })})`)
  }

  return (
    <div className="details-panel" style={{ padding: '12px', fontSize: '11px', color: '#8891a5', overflowY: 'auto', height: '100%' }}>
      
      <div style={{ paddingBottom: '8px', borderBottom: '1px solid #282d3f', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '13px' }}>Attribute Editor</h3>
        <span style={{ color: '#4ceb9b' }}>{activeItem.name || `Node ${activeItem.id}`}</span>
      </div>

      {itemType === 'camera' && (
        <div className="details-form">
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Camera Type</label>
            <input type="text" disabled value={activeItem.type} style={{ background: '#161923', border: '1px solid #282d3f', color: '#fff', padding: '4px', width: '100%', borderRadius: '4px' }} />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Near Plane</label>
            <input 
              type="number" 
              value={activeItem.near || 0.1} 
              onChange={(e) => handleCameraUpdate('near', e.target.value)}
              style={{ background: '#1a1d27', border: '1px solid #282d3f', color: '#fff', padding: '4px', width: '100%', borderRadius: '4px' }} 
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Far Plane</label>
            <input 
              type="number" 
              value={activeItem.far || 100000} 
              onChange={(e) => handleCameraUpdate('far', e.target.value)}
              style={{ background: '#1a1d27', border: '1px solid #282d3f', color: '#fff', padding: '4px', width: '100%', borderRadius: '4px' }} 
            />
          </div>

          {activeItem.type === 'perspective' && (
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Field of View (FOV)</label>
              <input 
                type="number" 
                value={activeItem.fov || 50} 
                onChange={(e) => handleCameraUpdate('fov', e.target.value)}
                style={{ background: '#1a1d27', border: '1px solid #282d3f', color: '#fff', padding: '4px', width: '100%', borderRadius: '4px' }} 
              />
            </div>
          )}
        </div>
      )}

      {itemType === 'sequence' && (
        <div className="details-form">
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Base Pair</label>
            <input type="text" disabled value={activeItem.base} style={{ background: '#161923', border: '1px solid #282d3f', color: '#00ffff', padding: '4px', width: '100%', borderRadius: '4px', fontWeight: 'bold' }} />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Position X</label>
            <input type="text" disabled value={activeItem.x.toFixed(3)} style={{ background: '#161923', border: '1px solid #282d3f', color: '#fff', padding: '4px', width: '100%', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Position Y</label>
            <input type="text" disabled value={activeItem.y.toFixed(3)} style={{ background: '#161923', border: '1px solid #282d3f', color: '#fff', padding: '4px', width: '100%', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Position Z</label>
            <input type="text" disabled value={activeItem.z.toFixed(3)} style={{ background: '#161923', border: '1px solid #282d3f', color: '#fff', padding: '4px', width: '100%', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Confidence Value</label>
            <input type="text" disabled value={activeItem.value.toFixed(6)} style={{ background: '#161923', border: '1px solid #282d3f', color: '#ff9f43', padding: '4px', width: '100%', borderRadius: '4px' }} />
          </div>
        </div>
      )}

    </div>
  )
}
