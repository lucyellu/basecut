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
  const { camera, gl } = useThree()

  const sequences = currentData?.data?.sequences || []
  const sphereRef = useRef<THREE.Group>(null)
  const controlsRef = useRef<any>(null)
  
  // Animation state for framing
  const isFraming = useRef(false)
  const frameTargetCenter = useRef(new THREE.Vector3())
  const frameTargetCamPos = useRef(new THREE.Vector3())
  const isInitialized = useRef(false)

  // Calculate the current playhead position
  const currentIndex = Math.max(0, Math.round(playheadPosition) - 1)
  const currentSequence = sequences[currentIndex]

  // Frame logic
  const frameSelection = () => {
    if (sequences.length === 0) return

    let center = new THREE.Vector3()
    let boundingSphereRadius = 10

    if (currentSequence) {
      // Frame the current node
      center.set(currentSequence.x, currentSequence.y, currentSequence.z)
      boundingSphereRadius = 20 // Default zoom distance for a single node
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
    
    // Offset camera slightly up and back based on the size of the object
    const offset = new THREE.Vector3(0, 0, boundingSphereRadius * 1.5)
    // Try to maintain the current camera angle if possible, otherwise use default offset
    const currentDir = camera.position.clone().sub(controlsRef.current?.target || center).normalize()
    if (currentDir.lengthSq() > 0.1) {
      frameTargetCamPos.current.copy(center).add(currentDir.multiplyScalar(boundingSphereRadius * 1.5))
    } else {
      frameTargetCamPos.current.copy(center).add(offset)
    }
    
    isFraming.current = true
  }

  // Listen for 'f' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.key.toLowerCase() === 'f' && e.target instanceof Element && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        frameSelection()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sequences, currentSequence])

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
      controlsRef.current.update()

      // Stop framing when close enough
      if (camera.position.distanceTo(frameTargetCamPos.current) < 0.5) {
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
      {/* Camera Controls */}
      <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.05} />

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
        return (
          <Sphere
            key={seq.id}
            args={[0.1, 8, 8]}
            position={[seq.x, seq.y, seq.z]}
          >
            <meshBasicMaterial
              color={isActive ? '#00ffff' : '#444444'}
              transparent
              opacity={isActive ? 1 : 0.3}
            />
          </Sphere>
        )
      })}
    </>
  )
}

// Main Viewport3D component
export default function Viewport3D() {
  const currentData = useCommandStore((state) => state.currentData as any)
  const sequences = currentData?.data?.sequences || []

  return (
    <div className="viewport-3d">
      {sequences.length > 0 ? (
        <Canvas
          camera={{ position: [0, 0, 50], fov: 50, near: 0.1, far: 10000 }}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
        >
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
