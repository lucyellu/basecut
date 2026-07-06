import React, { useState, useRef, useEffect } from 'react';
import { useCommandStore } from '../store/useCommandStore';

interface PlayblastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayblastModal({ isOpen, onClose }: PlayblastModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const executeCommand = useCommandStore(state => state.executeCommand);
  const isTurntableActive = useCommandStore(state => state.isTurntableActive);
  const isGridVisible = useCommandStore(state => state.isGridVisible);

  // Stop recording if modal closes
  useEffect(() => {
    if (!isOpen && isRecording) {
      stopRecording();
    }
  }, [isOpen]);

  const startRecording = () => {
    const canvas = document.querySelector('canvas#basecut-viewport-canvas') as HTMLCanvasElement;
    if (!canvas) {
      alert("Could not find the 3D viewport canvas!");
      return;
    }

    // Turn on turntable if not already on
    if (!isTurntableActive) {
      executeCommand('Viewport.toggleTurntable()');
    }

    try {
      // Must cast any for captureStream as it's not standard in all TS DOM libs
      const stream = (canvas as any).captureStream(60); // 60 FPS
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `playblast_turntable_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start MediaRecorder", err);
      alert("Your browser does not support capturing this stream (or WebM format).");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    
    // Stop turntable
    if (useCommandStore.getState().isTurntableActive) {
      executeCommand('Viewport.toggleTurntable()');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#1e1e1e',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '24px',
        width: '400px',
        color: '#eee',
        fontFamily: 'sans-serif'
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#fff' }}>Export Playblast</h2>
        
        <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '20px' }}>
          This will capture your current 3D viewport and automatically rotate the camera 360° to create a standard protein turntable video.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px' }}>Grid Visible</span>
            <button 
              onClick={() => executeCommand('Viewport.toggleGrid()')}
              style={{
                background: isGridVisible ? '#4ceb9b' : '#333',
                color: isGridVisible ? '#000' : '#fff',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {isGridVisible ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          {!isRecording ? (
            <>
              <button 
                onClick={onClose}
                style={{ background: 'transparent', border: '1px solid #444', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={startRecording}
                style={{ background: '#0066cc', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <div style={{ width: '10px', height: '10px', background: '#ff4444', borderRadius: '50%' }} />
                Record Turntable
              </button>
            </>
          ) : (
            <button 
              onClick={stopRecording}
              style={{ background: '#ff4444', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
            >
              Stop Recording & Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
