import React, { useRef, useState, useCallback, useEffect } from 'react';
import { initRadialField, CLUSTERS } from '../canvas/RadialField';

export const Radial: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const radialRef = useRef<{ render: (h: string | null) => void; getClusterAt: (x: number, y: number) => string | null; cleanup: () => void } | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize radial field
    radialRef.current = initRadialField(canvasRef.current);

    // Start animation loop
    const animate = () => {
      if (radialRef.current) {
        radialRef.current.render(hoveredCluster);
      }
      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (radialRef.current) {
        radialRef.current.cleanup();
      }
    };
  }, [hoveredCluster]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || !radialRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const cluster = radialRef.current.getClusterAt(x, y);
      setHoveredCluster(cluster);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredCluster(null);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || !radialRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const cluster = radialRef.current.getClusterAt(x, y);
      if (cluster) {
        setSelectedCluster(cluster);
      }
    },
    []
  );

  const getSelectedClusterDetails = () => {
    if (!selectedCluster) return null;
    return CLUSTERS.find((c) => c.id === selectedCluster);
  };

  const details = getSelectedClusterDetails();

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
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: hoveredCluster ? 'pointer' : 'default',
        }}
      />

      {/* Center card */}
      <div
        style={{
          position: 'absolute',
          zIndex: 20,
          backgroundColor: 'rgba(10, 16, 32, 0.8)',
          border: '1px solid #1c2942',
          borderRadius: '10px',
          padding: '16px 24px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#7fd4ff',
            marginBottom: '8px',
          }}
        >
          ALFRED
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#7b8aa5',
          }}
        >
          NÚCLEO ORQUESTRADOR
        </div>
      </div>

      {/* Cluster details sidebar */}
      {details && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '320px',
            backgroundColor: 'rgba(10, 16, 32, 0.95)',
            borderLeft: '1px solid #1c2942',
            padding: '32px',
            overflowY: 'auto',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <button
            onClick={() => setSelectedCluster(null)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#7b8aa5',
              cursor: 'pointer',
              fontSize: '20px',
            }}
          >
            ×
          </button>

          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: details.labelColor,
                marginBottom: '8px',
              }}
            >
              {details.label}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#e8eef8',
              }}
            >
              {details.capacities} capacidade
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#7b8aa5', lineHeight: '1.6' }}>
            Cluster com especialistas em {details.name.toLowerCase()}
          </div>
        </div>
      )}
    </div>
  );
};
