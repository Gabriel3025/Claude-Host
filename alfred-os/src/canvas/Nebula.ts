// Simplex noise implementation
function hash(p: number): number {
  const x = Math.sin(p) * 43758.5453;
  return x - Math.floor(x);
}

function perlin(p: number): number {
  const pi = Math.floor(p);
  const pf = p - pi;
  const u = pf * pf * (3.0 - 2.0 * pf);

  return (hash(pi) + (hash(pi + 1.0) - hash(pi)) * u) * 2.0 - 1.0;
}

function fbm(p: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * perlin(p * frequency);
    frequency *= 2;
    amplitude *= 0.5;
  }

  return value;
}

export function initNebula(canvas: HTMLCanvasElement): {
  render: () => void;
  cleanup: () => void;
} {
  const glContext = canvas.getContext('webgl2');

  if (!glContext) {
    console.error('WebGL2 not supported');
    return { render: () => {}, cleanup: () => {} };
  }

  const gl = glContext as WebGL2RenderingContext;

  // Vertex shader
  const vsSource = `#version 300 es
    in vec4 position;
    void main() {
      gl_Position = position;
    }
  `;

  // Fragment shader with FBM
  const fsSource = `#version 300 es
    precision highp float;

    uniform vec2 resolution;
    uniform float time;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;

      for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }

      return value;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;

      // FBM with time
      float n = fbm(uv * 3.0 + time * 0.1);

      // Color gradient
      vec3 col = mix(
        vec3(0.03, 0.07, 0.11),
        vec3(0.08, 0.2, 0.35),
        n * 0.5 + 0.5
      );

      // Add some glow
      col += vec3(0.13, 0.33, 0.6) * (n * 0.1 + 0.05);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // Compile shaders
  function compileShader(source: string, type: number): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(
        'Shader compilation error:',
        gl.getShaderInfoLog(shader)
      );
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);

  if (!vertexShader || !fragmentShader) {
    return { render: () => {}, cleanup: () => {} };
  }

  // Create program
  const program = gl.createProgram();
  if (!program) return { render: () => {}, cleanup: () => {} };

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return { render: () => {}, cleanup: () => {} };
  }

  // Create quad
  const positions = new Float32Array([
    -1,
    -1, 1, -1, -1, 1, 1, 1,
  ]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const posAttrib = gl.getAttribLocation(program, 'position');
  gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(posAttrib);

  const resUniform = gl.getUniformLocation(program, 'resolution');
  const timeUniform = gl.getUniformLocation(program, 'time');

  let startTime = Date.now();
  let rafId: number | null = null;

  function render() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.useProgram(program);
    gl.uniform2f(resUniform, canvas.width, canvas.height);
    gl.uniform1f(timeUniform, (Date.now() - startTime) * 0.001);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    rafId = requestAnimationFrame(render);
  }

  return {
    render: () => {
      if (!rafId) render();
    },
    cleanup: () => {
      if (rafId) cancelAnimationFrame(rafId);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    },
  };
}
