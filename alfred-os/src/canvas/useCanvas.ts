import { useEffect, useRef } from 'react';

export function useCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  initFn: (canvas: HTMLCanvasElement) => { render: () => void; cleanup: () => void }
): void {
  const instanceRef = useRef<{ render: () => void; cleanup: () => void } | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isRenderingRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize only once
    if (!instanceRef.current) {
      instanceRef.current = initFn(canvasRef.current);
    }

    const instance = instanceRef.current;

    // Start rendering
    isRenderingRef.current = true;
    instance.render();

    // Handle visibility change to save battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
        }
      } else {
        isRenderingRef.current = true;
        instance.render();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current && isRenderingRef.current) {
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = canvasRef.current.clientWidth * dpr;
        canvasRef.current.height = canvasRef.current.clientHeight * dpr;
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      isRenderingRef.current = false;

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      if (instanceRef.current) {
        instanceRef.current.cleanup();
        instanceRef.current = null;
      }
    };
  }, [canvasRef, initFn]);
}
