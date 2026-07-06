/**
 * Viewport3D Component
 * 3D viewport with Three.js using @react-three/fiber
 * Reads state from store and updates camera smoothly via useFrame
 */

import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sphere, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useCommandStore } from '../store/useCommandStore'

// Separate component for the 3D scene content
function SceneContent() {
  const currentData = useCommandStore((state) => state.currentData as any)
  const playheadPosition = useCommandStore((state) => state.playheadPosition)
  const selection = useCommandStore((state) => state.selection)
  const executeCommand = useCommandStore((state) => state.executeCommand)
  const { camera } = useThree()

  const sequences = currentData?.data?.sequences || []
  const sphereRef = useRef<THREE.Group>(null)
  const controlsRef = useRef<any>(null)
  
  // Animation state for framing
  const isFraming = useRef(false)
  const frameTargetCenter = useRef(new THREE.Vector3())
  const frameTargetCamPos = useRef(new THREE.Vector3())
  const frameTargetZoom = useRef(20)
  const isInitialized = useRef(false)

  // Calculate the current playhead position
  const currentIndex = Math.max(0, Math.round(playheadPosition) - 1)
  const currentSequence = sequences[currentIndex]

  // Frame logic
  const frameSelection = () => {
    if (sequences.length === 0) return

    let center = new THREE.Vector3()
    let boundingSphereRadius = 10

    if (selection && selection.length > 0) {
      // Frame the selected nodes
      const box = new THREE.Box3()
      let count = 0
      sequences.forEach((seq: any) => {
        if (selection.includes(seq.id)) {
          box.expandByPoint(new THREE.Vector3(seq.x, seq.y, seq.z))
          count++
        }
      })
      if (count > 0) {
        box.getCenter(center)
        boundingSphereRadius = count === 1 ? 20 : box.getBoundingSphere(new THREE.Sphere()).radius
      }
    } else {
      // Frame entire scene
      const box = new THREE.Box3()
      sequences.forEach((seq: any) => {
        box.expandByPoint(new THREE.Vector3(seq.x, seq.y, seq.z))
      })
      box.getCenter(center)
      boundingSphereRadius = box.getBoundingSphere(new THREE.Sphere()).radius
    }

    // Set animation targets
    frameTargetCenter.current.copy(center)
    
    // Perspective offset (use 2.5x radius to comfortably fit inside FOV 50)
    const fitDistance = Math.max(boundingSphereRadius * 2.5, 10)
    const currentDir = camera.position.clone().sub(controlsRef.current?.target || center).normalize()
    
    if (currentDir.lengthSq() > 0.1) {
      frameTargetCamPos.current.copy(center).add(currentDir.multiplyScalar(fitDistance))
    } else {
      frameTargetCamPos.current.copy(center).add(new THREE.Vector3(0, 0, fitDistance))
    }
    
    // Orthographic Zoom Target
    // The screen size is approx min(width, height). We want bounding radius to fit.
    const screenMin = Math.min(window.innerWidth, window.innerHeight)
    frameTargetZoom.current = screenMin / (boundingSphereRadius * 2.5)
    
    isFraming.current = true
  }

  // Global framing listener
  const frameTrigger = useCommandStore((state) => state.frameTrigger)
  
  useEffect(() => {
    if (frameTrigger > 0) {
      frameSelection()
    }
  }, [frameTrigger])

  // Update sphere position immediately when sequence changes
  useEffect(() => {
    if (currentSequence && sphereRef.current) {
      sphereRef.current.position.set(currentSequence.x, currentSequence.y, currentSequence.z)
    }
  }, [currentSequence])

  useFrame(() => {
    // Auto-rotate the active node marker for visual effect
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.01
      sphereRef.current.rotation.x += 0.005
    }

    // Handle smooth framing animation
    if (isFraming.current && controlsRef.current) {
      const smoothFactor = 0.1
      camera.position.lerp(frameTargetCamPos.current, smoothFactor)
      controlsRef.current.target.lerp(frameTargetCenter.current, smoothFactor)
      
      if (camera.type === 'OrthographicCamera') {
        // @ts-ignore - zoom exists on OrthographicCamera
        camera.zoom += (frameTargetZoom.current - camera.zoom) * smoothFactor
        camera.updateProjectionMatrix()
      }
      
      controlsRef.current.update()

      // Stop framing when close enough (check zoom too for ortho)
      const dist = camera.position.distanceTo(frameTargetCamPos.current)
      const zoomDiff = camera.type === 'OrthographicCamera' ? Math.abs((camera as any).zoom - frameTargetZoom.current) : 0
      
      if (dist < 0.5 && zoomDiff < 0.1) {
        isFraming.current = false
      }
    }

    // Initialize camera position on first load
    if (!isInitialized.current && sequences.length > 0) {
      frameSelection()
      isInitialized.current = true
    }
  })

  // Generate 3D line points from sequences
  const linePoints = sequences.map((seq: any) => new THREE.Vector3(seq.x, seq.y, seq.z))

  return (
    <>
      {/* Camera Controls - Maya style buttons but no Alt required */}
      <OrbitControls 
        ref={controlsRef} 
        enableDamping 
        dampingFactor={0.05}
        zoomSpeed={2}
        panSpeed={2}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: THREE.MOUSE.DOLLY
        }}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Grid helper for spatial reference */}
      <gridHelper args={[50, 50, '#444444', '#222222']} position={[0, 0, 0]} />

      {/* Axes helper */}
      <axesHelper args={[10]} />

      {/* 3D Line connecting sequence coordinates */}
      {linePoints.length > 0 && (
        <Line
          points={linePoints}
          color="#00ff00"
          lineWidth={2}
          opacity={0.6}
          transparent
        />
      )}

      {/* Active Base Marker - Glowing Sphere */}
      {currentSequence && (
        <group ref={sphereRef}>
          {/* Outer glow */}
          <Sphere args={[0.8, 32, 32]}>
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={0.3}
              blending={THREE.AdditiveBlending}
            />
          </Sphere>

          {/* Inner sphere */}
          <Sphere args={[0.4, 32, 32]}>
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.5}
            />
          </Sphere>
        </group>
      )}

      {/* Sequence Points (optional - show all positions as small dots) */}
      {sequences.map((seq: any, index: number) => {
        const isActive = index === currentIndex
        const isSelected = selection?.includes(seq.id)
        return (
          <Sphere
            key={seq.id}
            args={[0.1, 8, 8]}
            position={[seq.x, seq.y, seq.z]}
            onClick={(e) => {
              // Only trigger if mouse delta is small (i.e. not dragging)
              if (e.delta <= 2) {
                e.stopPropagation()
                // Select the node, wrap ID in quotes if it's a string, or just pass number
                const idArg = typeof seq.id === 'string' ? `'${seq.id}'` : seq.id
                executeCommand(`Data.select(${idArg})`)
              }
            }}
          >
            <meshBasicMaterial
              color={isActive ? '#00ffff' : isSelected ? '#ff9f43' : '#444444'}
              transparent
              opacity={isActive || isSelected ? 1 : 0.3}
            />
          </Sphere>
        )
      })}
    </>
  )
}

import { OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import { useState } from 'react'

// Main Viewport3D component
export default function Viewport3D({ viewType = 'persp' }: { viewType?: 'top' | 'front' | 'side' | 'persp' }) {
  const currentData = useCommandStore((state) => state.currentData as any)
  const sequences = currentData?.data?.sequences || []
  const [currentView, setCurrentView] = useState(viewType)

  return (
    <div className="viewport-3d" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Viewport Dropdown */}
      <div style={{ position: 'absolute', top: 4, left: 4, zIndex: 10 }}>
        <select 
          value={currentView}
          onChange={(e) => setCurrentView(e.target.value as any)}
          style={{ 
            background: 'rgba(22, 25, 35, 0.8)', 
            color: '#fff', 
            border: '1px solid #282d3f', 
            borderRadius: '4px',
            fontSize: '11px',
            padding: '2px 4px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="persp">Perspective</option>
          <option value="top">Top View</option>
          <option value="front">Front View</option>
          <option value="side">Side View</option>
        </select>
      </div>
      
      {sequences.length > 0 ? (
        <Canvas
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
          onPointerMissed={() => {
            const state = useCommandStore.getState()
            if (state.selection && state.selection.length > 0) {
              state.executeCommand('Data.clearSelection()')
            }
          }}
        >
          {currentView === 'persp' && <PerspectiveCamera makeDefault position={[50, 50, 50]} fov={50} near={0.1} far={10000} />}
          {currentView === 'top' && <OrthographicCamera makeDefault position={[0, 100, 0]} zoom={20} near={0.1} far={10000} />}
          {currentView === 'front' && <OrthographicCamera makeDefault position={[0, 0, 100]} zoom={20} near={0.1} far={10000} />}
          {currentView === 'side' && <OrthographicCamera makeDefault position={[100, 0, 0]} zoom={20} near={0.1} far={10000} />}
          <SceneContent />
        </Canvas>
      ) : (
        <div className="viewport-empty">
          <div className="viewport-empty-icon">🧬</div>
          <div className="viewport-empty-text">Load bio-data to see 3D structure</div>
          <div className="viewport-empty-hint">Use Outliner → Load Bio Data</div>
        </div>
      )}
    </div>
  )
}
