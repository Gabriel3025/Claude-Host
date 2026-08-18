export interface Cluster {
  id: string;
  name: string;
  angle: number;
  label: string;
  labelColor: string;
  capacities: number;
}

export const CLUSTERS: Cluster[] = [
  {
    id: 'crm',
    name: 'CRM / Lifecycle',
    angle: 0,
    label: 'CRM / LIFECYCLE',
    labelColor: '#ffb84d',
    capacities: 1,
  },
  {
    id: 'ascensao',
    name: 'Ascensão Comercial',
    angle: (Math.PI * 2) / 6,
    label: 'ASCENSÃO COMERCIAL',
    labelColor: '#ffb84d',
    capacities: 1,
  },
  {
    id: 'cro',
    name: 'CRO / Funil',
    angle: (Math.PI * 2 * 2) / 6,
    label: 'CRO / FUNIL',
    labelColor: '#ffb84d',
    capacities: 1,
  },
  {
    id: 'estrategia',
    name: 'Estratégia / Company Brain',
    angle: (Math.PI * 2 * 3) / 6,
    label: 'ESTRATÉGIA / COMPANY BRAIN',
    labelColor: '#7fd4ff',
    capacities: 1,
  },
  {
    id: 'adm',
    name: 'ADM & Executivo',
    angle: (Math.PI * 2 * 4) / 6,
    label: 'ADM & EXECUTIVO',
    labelColor: '#7fd4ff',
    capacities: 1,
  },
  {
    id: 'bi',
    name: 'BI / Tracking',
    angle: (Math.PI * 2 * 5) / 6,
    label: 'BI / TRACKING',
    labelColor: '#7fd4ff',
    capacities: 1,
  },
];

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

function generateCoreParticles(count: number): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const r = Math.random() * 0.6 + 0.2;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    particles.push({
      x,
      y,
      z,
      vx: (Math.random() - 0.5) * 0.01,
      vy: (Math.random() - 0.5) * 0.01,
      vz: (Math.random() - 0.5) * 0.01,
    });
  }

  return particles;
}

export function initRadialField(canvas: HTMLCanvasElement): {
  render: (hoveredCluster: string | null) => void;
  getClusterAt: (x: number, y: number) => string | null;
  cleanup: () => void;
} {
  const ctxRaw = canvas.getContext('2d');
  if (!ctxRaw) {
    return {
      render: () => {},
      getClusterAt: () => null,
      cleanup: () => {},
    };
  }

  const ctx = ctxRaw as CanvasRenderingContext2D;

  const particles = generateCoreParticles(600);
  let time = 0;

  function project(x: number, y: number, z: number, scale: number): [number, number] {
    const cameraZ = 2;
    const perspective = cameraZ / (cameraZ + z);
    return [
      canvas.width / 2 + x * scale * perspective,
      canvas.height / 2 + y * scale * perspective,
    ];
  }

  function getClusterRadius(): number {
    return Math.min(canvas.width, canvas.height) * 0.35;
  }

  function getClusterPosition(cluster: Cluster): [number, number] {
    const radius = getClusterRadius();
    const drift = Math.sin(time * 0.5 + cluster.angle * 2) * 30;

    const x = Math.cos(cluster.angle) * (radius + drift);
    const y = Math.sin(cluster.angle) * (radius + drift);

    return [canvas.width / 2 + x, canvas.height / 2 + y];
  }

  function drawCore(): void {
    // Rotate particles slightly
    particles.forEach((p) => {
      const rotY = (time * 0.1) % (Math.PI * 2);
      const cos = Math.cos(rotY);
      const sin = Math.sin(rotY);

      const newX = p.x * cos - p.z * sin;
      const newZ = p.x * sin + p.z * cos;

      p.x = newX;
      p.z = newZ;
    });

    // Draw with additive blending for glow
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#7fd4ff';

    particles.forEach((p) => {
      const [px, py] = project(p.x, p.y, p.z, 200);

      // Brightness based on z depth
      const brightness = (p.z + 1) / 2;
      ctx.globalAlpha = brightness * 0.3;

      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // Center glow
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      150
    );
    gradient.addColorStop(0, 'rgba(127, 212, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(127, 212, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawConnections(): void {
    ctx.strokeStyle = 'rgba(127, 212, 255, 0.3)';
    ctx.lineWidth = 1;

    CLUSTERS.forEach((cluster) => {
      const [cx, cy] = getClusterPosition(cluster);

      // Quadratic Bézier from center to cluster
      const cpx = canvas.width / 2 + Math.cos(cluster.angle) * 100;
      const cpy = canvas.height / 2 + Math.sin(cluster.angle) * 100;

      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.quadraticCurveTo(cpx, cpy, cx, cy);
      ctx.stroke();

      // Flow dots along the path
      for (let i = 0; i < 4; i++) {
        const t = (time * 0.3 + i * 0.25) % 1;
        const u = 1 - t;

        // Quadratic Bézier interpolation
        const px =
          u * u * (canvas.width / 2) +
          2 * u * t * cpx +
          t * t * cx;
        const py =
          u * u * (canvas.height / 2) +
          2 * u * t * cpy +
          t * t * cy;

        ctx.fillStyle = `rgba(127, 212, 255, ${0.4 - t * 0.2})`;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  function drawClusters(hoveredCluster: string | null): void {
    CLUSTERS.forEach((cluster) => {
      const [cx, cy] = getClusterPosition(cluster);
      const isHovered = cluster.id === hoveredCluster;

      // Cluster glow
      const glowRadius = isHovered ? 80 : 50;
      const glowAlpha = isHovered ? 0.3 : 0.15;

      const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
      glowGradient.addColorStop(0, `rgba(77, 163, 255, ${glowAlpha})`);
      glowGradient.addColorStop(1, `rgba(77, 163, 255, 0)`);

      ctx.fillStyle = glowGradient;
      ctx.fillRect(cx - glowRadius, cy - glowRadius, glowRadius * 2, glowRadius * 2);

      // Cluster circle
      ctx.fillStyle = isHovered ? '#7fd4ff' : '#4da3ff';
      ctx.beginPath();
      ctx.arc(cx, cy, isHovered ? 12 : 8, 0, Math.PI * 2);
      ctx.fill();

      // Cluster border
      ctx.strokeStyle = cluster.labelColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, isHovered ? 12 : 8, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  function render(hoveredCluster: string | null = null): void {
    time += 0.016; // ~60fps

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#030711';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    drawCore();
    drawConnections();
    drawClusters(hoveredCluster);
  }

  function getClusterAt(x: number, y: number): string | null {
    for (const cluster of CLUSTERS) {
      const [cx, cy] = getClusterPosition(cluster);
      const dist = Math.hypot(x - cx, y - cy);

      if (dist < 30) {
        return cluster.id;
      }
    }
    return null;
  }

  return {
    render,
    getClusterAt,
    cleanup: () => {},
  };
}
