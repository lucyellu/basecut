/**
 * Data Type Definitions
 * TypeScript interfaces for the bio-sequence data structure
 */

export interface BioSequence {
  id: number
  base: string
  value: number
  x: number
  y: number
  z: number
}

export interface Camera {
  id: string
  name: string
  type: 'perspective' | 'orthographic'
  position: [number, number, number]
  target: [number, number, number]
  zoom: number
}

export interface BioData {
  sequences: BioSequence[]
  currentPlayheadIndex: number
  cameras: Camera[]
  activeCameraId: string
  keyframes: any[]
}

export interface LoadedDataInfo {
  filename: string
  loadedAt: string
  sequenceCount: number
  cameraCount: number
  data: BioData
}
