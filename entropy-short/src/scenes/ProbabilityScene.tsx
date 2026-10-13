import {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

const TAU = Math.PI * 2;
const hash = (n: number) => {
  const value = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
};
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => {
  const value = clamp(n);
  return value * value * (3 - 2 * value);
};

type Particle = {
  orderedX: number;
  orderedY: number;
  orderedZ: number;
  radius: number;
  angle: number;
  depth: number;
  size: number;
  heat: number;
  phase: number;
};

const makeGlow = (warm: boolean) => {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  const gradient = context.createRadialGradient(48, 48, 0, 48, 48, 48);
  gradient.addColorStop(0, warm ? 'rgba(255,245,217,1)' : 'rgba(216,248,255,1)');
  gradient.addColorStop(0.07, warm ? 'rgba(255,221,169,.95)' : 'rgba(173,223,239,.95)');
  gradient.addColorStop(0.17, warm ? 'rgba(223,192,145,.35)' : 'rgba(125,183,208,.35)');
  gradient.addColorStop(0.5, warm ? 'rgba(200,135,70,.045)' : 'rgba(77,141,165,.045)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 96, 96);
  return canvas;
};

/** An ordered star crystal opens into an immense, probabilistic cloud. */
export const ProbabilityScene = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spritesRef = useRef<{blue: HTMLCanvasElement; gold: HTMLCanvasElement} | null>(null);
  const particles = useMemo<Particle[]>(() => Array.from({length: 2350}, (_, i) => {
    const node = i % 245;
    const radius = Math.pow(hash(i + 89), 0.62) * 760;
    const arm = i % 3;
    return {
      orderedX: ((node % 7) - 3) * 77,
      orderedY: ((Math.floor(node / 7) % 7) - 3) * 77,
      orderedZ: (Math.floor(node / 49) - 2) * 85,
      radius,
      angle: arm * TAU / 3 + radius * 0.009 + (hash(i + 214) - 0.5) * (0.16 + radius / 300),
      depth: (hash(i + 414) - 0.5) * (30 + radius * 0.34),
      size: 0.5 + hash(i + 914) * 1.8,
      heat: hash(i + 518),
      phase: hash(i + 107) * TAU,
    };
  }), []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    if (!spritesRef.current) spritesRef.current = {blue: makeGlow(false), gold: makeGlow(true)};
    const sprites = spritesRef.current;
    const t = Math.max(0, frame / fps);
    const release = smooth((t - 0.38) / 2.1);
    const expansion = 0.67 + release * 0.39;
    const camera = t * 0.022;
    const cx = 540 + Math.sin(t * 0.4) * 16;
    const cy = 814 - t * 9;
    context.save();
    context.scale(width / 1080, height / 1920);
    context.fillStyle = '#030609';
    context.fillRect(0, 0, 1080, 1920);

    // A nearly invisible atmosphere keeps blacks rich while the center has depth.
    const atmosphere = context.createRadialGradient(cx, cy, 50, cx, cy, 1010);
    atmosphere.addColorStop(0, 'rgba(13,32,40,.64)');
    atmosphere.addColorStop(0.5, 'rgba(7,18,26,.25)');
    atmosphere.addColorStop(1, 'rgba(3,6,9,0)');
    context.fillStyle = atmosphere;
    context.fillRect(0, 0, 1080, 1450);

    for (let i = 0; i < 180; i++) {
      const x = hash(i + 9232) * 1080;
      const y = hash(i + 403) * 1450;
      const alpha = (0.09 + hash(i + 89) * 0.25) * (1 - smooth((y - 1110) / 300));
      context.fillStyle = `rgba(172,213,229,${alpha})`;
      context.fillRect(x + camera * (hash(i + 515) - 0.5) * 50, y, hash(i + 114) > 0.96 ? 2 : 1, 1);
    }

    const project = (x: number, y: number, z: number) => {
      const rotation = -0.28 + camera;
      const rotateY = x * Math.cos(0.62 + camera) + z * Math.sin(0.62 + camera);
      const rotateZ = z * Math.cos(0.62 + camera) - x * Math.sin(0.62 + camera);
      const tiltY = y * Math.cos(-0.23) - rotateZ * Math.sin(-0.23);
      const depth = y * Math.sin(-0.23) + rotateZ * Math.cos(-0.23);
      const perspective = 980 / (980 + depth);
      return {
        x: cx + (rotateY * Math.cos(rotation) - tiltY * Math.sin(rotation)) * perspective,
        y: cy + (rotateY * Math.sin(rotation) + tiltY * Math.cos(rotation)) * perspective,
        p: perspective,
      };
    };

    // Thin, illuminated bonds give the opening a rare, ordered configuration.
    const bondsOpacity = Math.pow(1 - release, 2) * 0.38;
    if (bondsOpacity > 0.001) {
      context.lineWidth = 0.68;
      for (let z = 0; z < 5; z++) {
        for (let y = 0; y < 7; y++) {
          for (let x = 0; x < 7; x++) {
            const p1 = project((x - 3) * 77, (y - 3) * 77, (z - 2) * 85);
            for (const step of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) {
              if (x + step[0] > 6 || y + step[1] > 6 || z + step[2] > 4) continue;
              const p2 = project((x + step[0] - 3) * 77, (y + step[1] - 3) * 77, (z + step[2] - 2) * 85);
              context.strokeStyle = `rgba(${z === 2 ? '223,192,145' : '146,200,221'},${bondsOpacity * (0.5 + p1.p * 0.3)})`;
              context.beginPath();
              context.moveTo(p1.x, p1.y);
              context.lineTo(p2.x, p2.y);
              context.stroke();
            }
          }
        }
      }
    }

    context.globalCompositeOperation = 'screen';
    // Broad, transparent gas ribbons form the spiral without flat graphic strokes.
    if (release > 0.01) {
      context.save();
      context.translate(cx, cy);
      context.rotate(-0.27 + camera);
      context.scale(1, 0.51);
      for (let i = 0; i < 155; i++) {
        const radius = 70 + hash(i + 819) * 650;
        const angle = (i % 3) * TAU / 3 + radius * 0.009 + (hash(i + 1511) - 0.5) * 0.5 + t * 0.035;
        const x = Math.cos(angle) * radius * expansion;
        const y = Math.sin(angle) * radius * expansion;
        const fogSize = 24 + hash(i + 19) * 90;
        const fog = context.createRadialGradient(x, y, 0, x, y, fogSize);
        fog.addColorStop(0, i % 6 === 0 ? `rgba(192,138,81,${release * 0.055})` : `rgba(78,133,155,${release * 0.05})`);
        fog.addColorStop(0.42, `rgba(55,99,119,${release * 0.026})`);
        fog.addColorStop(1, 'rgba(20,40,55,0)');
        context.fillStyle = fog;
        context.fillRect(x - fogSize, y - fogSize, fogSize * 2, fogSize * 2);
      }
      context.restore();
    }

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      const angle = particle.angle + t * 0.025 + release * 0.17;
      const spreadX = Math.cos(angle) * particle.radius * expansion;
      const spreadY = Math.sin(angle) * particle.radius * 0.51 * expansion + particle.depth * 0.26;
      const spreadZ = Math.sin(angle) * particle.radius * 0.21 + particle.depth;
      const lag = smooth((t - 0.38 - hash(i + 13) * 0.21) / 1.95);
      const jitter = release * Math.sin(particle.phase + t * 0.31) * 7;
      const p = project(
        particle.orderedX * (1 - lag) + spreadX * lag + jitter,
        particle.orderedY * (1 - lag) + spreadY * lag,
        particle.orderedZ * (1 - lag) + spreadZ * lag,
      );
      const alpha = (0.23 + hash(i + 311) * 0.58) * (0.32 + release * 0.68);
      const isWarm = particle.radius < 160 || particle.heat > 0.89;
      const size = particle.size * p.p * (0.76 + release * 0.5);
      context.globalAlpha = alpha;
      context.fillStyle = isWarm ? '#dfc091' : '#a8d5e5';
      context.beginPath();
      context.arc(p.x, p.y, size * 0.5, 0, TAU);
      context.fill();
      if (i % 7 === 0 || particle.radius < 90) {
        const glow = size * (isWarm ? 11 : 9);
        context.globalAlpha = alpha * 0.38;
        context.drawImage(isWarm ? sprites.gold : sprites.blue, p.x - glow, p.y - glow, glow * 2, glow * 2);
      }
      if (release > 0.2 && i % 181 === 0) {
        context.globalAlpha = alpha * 0.43;
        context.strokeStyle = '#b3dce9';
        context.lineWidth = 0.65;
        context.beginPath();
        context.moveTo(p.x - size * 9, p.y);
        context.lineTo(p.x + size * 9, p.y);
        context.moveTo(p.x, p.y - size * 6);
        context.lineTo(p.x, p.y + size * 6);
        context.stroke();
      }
    }

    // A compact gold heart and one optical flare anchor the expanding cloud.
    context.globalAlpha = 0.6 + release * 0.23;
    const heartSize = 110 + release * 160;
    context.drawImage(sprites.gold, cx - heartSize, cy - heartSize * 0.7, heartSize * 2, heartSize * 1.4);
    context.globalAlpha = release * 0.18;
    const flare = context.createLinearGradient(cx - 370, cy, cx + 370, cy);
    flare.addColorStop(0, 'rgba(168,213,229,0)');
    flare.addColorStop(0.5, 'rgba(216,234,231,.85)');
    flare.addColorStop(1, 'rgba(168,213,229,0)');
    context.fillStyle = flare;
    context.fillRect(cx - 370, cy - 0.6, 740, 1.2);
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';

    const shade = context.createLinearGradient(0, 1080, 0, 1580);
    shade.addColorStop(0, 'rgba(3,6,9,0)');
    shade.addColorStop(0.7, 'rgba(3,6,9,.92)');
    shade.addColorStop(1, '#030609');
    context.fillStyle = shade;
    context.fillRect(0, 1080, 1080, 840);

    const vignette = context.createRadialGradient(540, 880, 390, 540, 880, 1100);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,.7)');
    context.fillStyle = vignette;
    context.fillRect(0, 0, 1080, 1920);
    context.restore();
  }, [frame, fps, width, height, particles]);

  return (
    <AbsoluteFill style={{backgroundColor: '#030609'}}>
      <canvas ref={canvasRef} width={width} height={height} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};
