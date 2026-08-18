import React, { useRef, useCallback } from 'react';
import { useCanvas } from '../canvas/useCanvas';
import { initNebula } from '../canvas/Nebula';

export const Home: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const initCanvas = useCallback(
    (canvas: HTMLCanvasElement) => {
      return initNebula(canvas);
    },
    []
  );

  useCanvas(canvasRef, initCanvas);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          color: '#e8eef8',
        }}
      >
        <h1>ALFRED</h1>
        <p style={{ color: '#7b8aa5' }}>Inicializando...</p>
      </div>
    </div>
  );
};
