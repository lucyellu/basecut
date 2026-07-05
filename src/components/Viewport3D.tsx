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
  const { camera } = useThree()

  const sequences = currentData?.data?.sequences || []
  const sphereRef = useRef<THREE.Mesh>(null)
  const targetPosition = useRef(new THREE.Vector3())
  const isInitialized = useRef(false)

  // Calculate the current playhead position
  const currentIndex = Math.round(playheadPosition) - 1
  const currentSequence = sequences[currentIndex]

  // Update target position when playhead changes
  useEffect(() => {
    if (currentSequence) {
      targetPosition.current.set(currentSequence.x, currentSequence.y, currentSequence.z)
    }
  }, [currentSequence])

  // ⚡ CRITICAL: Camera lerping in useFrame for smooth performance
  // This mutates camera directly without triggering React re-renders
  useFrame(() => {
    if (currentSequence && sphereRef.current) {
      // Smoothly interpolate camera position toward target
      const smoothFactor = 0.05
      camera.position.lerp(targetPosition.current, smoothFactor)

      // Make camera look at the current position
      const lookAtTarget = new THREE.Vector3(
        currentSequence.x,
        currentSequence.y,
        currentSequence.z
      )
      camera.lookAt(lookAtTarget)

      // Update sphere position
      sphereRef.current.position.set(
        currentSequence.x,
        currentSequence.y,
        currentSequence.z
      )

      // Auto-rotate sphere for visual effect
      sphereRef.current.rotation.y += 0.01
      sphereRef.current.rotation.x += 0.005
    }

    // Initialize camera position on first frame
    if (!isInitialized.current && sequences.length > 0) {
      const firstSeq = sequences[0]
      camera.position.set(firstSeq.x, firstSeq.y, firstSeq.z + 20)
      isInitialized.current = true
    }
  })

  // Generate 3D line points from sequences
  const linePoints = sequences.map((seq: any) => new THREE.Vector3(seq.x, seq.y, seq.z))

  return (
    <>
      {/* Camera Controls */}
      <OrbitControls enableDamping dampingFactor={0.05} />

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
            <meshBasicMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.5}
              blending={THREE.AdditiveBlending}
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
    <div className="viewport-3d bg-gray-900 border border-gray-700 rounded-lg overflow-hidden" style={{ height: '400px' }}>
      {sequences.length > 0 ? (
        <Canvas
          camera={{ position: [0, 0, 50], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <SceneContent />
        </Canvas>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          <div className="text-center">
            <div className="text-4xl mb-2">🧬</div>
            <div>Load bio-data to see 3D structure</div>
          </div>
        </div>
      )}
    </div>
  )
}
