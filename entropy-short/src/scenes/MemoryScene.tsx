import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

const TAU = Math.PI * 2;
const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return v - Math.floor(v);
};
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const n = clamp(v);
  return n * n * (3 - 2 * n);
};

// A fixed, stratified field: the same frame always produces the same image.
const dust = Array.from({length: 1800}, (_, i) => ({
  a: hash(i * 5 + 1) * TAU,
  r: 310 + Math.pow(hash(i * 5 + 2), 1.8) * 490,
  z: hash(i * 5 + 3),
  seed: hash(i * 5 + 4),
  bright: hash(i * 5 + 5),
}));

const ringRadius = (radius: number, angle: number, band: number) =>
  radius *
  (1 +
    0.015 * Math.sin(angle * 3 + band * 0.055) +
    0.011 * Math.sin(angle * 7 + band * 0.09) +
    0.005 * Math.sin(angle * 17 + band * 0.16) +
    0.0025 * Math.sin(angle * 39 + band * 0.31));

/** Paint the rich, fixed surface once; camera motion remains frame driven. */
const createCorona = () => {
  const surface = document.createElement('canvas');
  surface.width = 1100;
  surface.height = 1100;
  const c = surface.getContext('2d');
  if (!c) return surface;
  c.translate(550, 550);

  const atmosphere = c.createRadialGradient(-10, -25, 210, 0, 0, 460);
  atmosphere.addColorStop(0, 'rgba(170,104,37,0)');
  atmosphere.addColorStop(0.36, 'rgba(185,120,50,0.065)');
  atmosphere.addColorStop(0.51, 'rgba(234,178,96,0.17)');
  atmosphere.addColorStop(0.65, 'rgba(189,116,37,0.048)');
  atmosphere.addColorStop(1, 'rgba(189,116,37,0)');
  c.fillStyle = atmosphere;
  c.fillRect(-550, -550, 1100, 1100);

  const core = c.createRadialGradient(-76, -105, 12, 0, 0, 327);
  core.addColorStop(0, 'rgba(241,187,109,0.10)');
  core.addColorStop(0.36, 'rgba(157,99,47,0.075)');
  core.addColorStop(0.80, 'rgba(179,112,41,0.10)');
  core.addColorStop(0.95, 'rgba(219,160,73,0.19)');
  core.addColorStop(1, 'rgba(70,45,26,0)');
  c.fillStyle = core;
  c.beginPath();
  c.arc(0, 0, 334, 0, TAU);
  c.fill();

  // Corona filaments are curves, with a very soft envelope behind each one.
  for (let i = 0; i < 155; i++) {
    const angle = (i / 155) * TAU;
    const length = 18 + hash(i + 702) ** 3 * 91;
    const r = ringRadius(315, angle, 117);
    const bend = (hash(i + 810) - 0.5) * 0.22;
    c.beginPath();
    c.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    c.bezierCurveTo(
      Math.cos(angle + bend) * (r + length * 0.56),
      Math.sin(angle + bend) * (r + length * 0.56),
      Math.cos(angle + bend * 0.7) * (r + length),
      Math.sin(angle + bend * 0.7) * (r + length),
      Math.cos(angle + bend * 0.15) * (r + length * 0.74),
      Math.sin(angle + bend * 0.15) * (r + length * 0.74),
    );
    c.strokeStyle = 'rgba(226,159,72,0.10)';
    c.lineWidth = 3.5;
    c.shadowColor = 'rgba(240,171,79,0.30)';
    c.shadowBlur = 12;
    c.stroke();
    c.shadowBlur = 0;
    c.strokeStyle = `rgba(236,186,113,${0.065 + hash(i + 32) * 0.10})`;
    c.lineWidth = 0.55;
    c.stroke();
  }

  // Irregular contours subtly turn a solar surface into the memory of tree rings.
  for (let band = 0; band < 122; band++) {
    const radius = 27 + band * 2.36 + hash(band + 320) * 1.1;
    const alpha = 0.095 + hash(band + 120) * 0.19;
    for (let segment = 0; segment < 12; segment++) {
      const from = (segment / 12) * TAU;
      const to = ((segment + 1) / 12) * TAU + 0.007;
      const light = 0.4 + 0.6 * Math.pow((Math.cos(from + 2.1) + 1) * 0.5, 1.3);
      c.beginPath();
      for (let step = 0; step <= 28; step++) {
        const a = from + ((to - from) * step) / 28;
        const r = ringRadius(radius, a, band);
        const x = Math.cos(a) * r + 4 * Math.sin(band * 0.046);
        const y = Math.sin(a) * r + 3 * Math.cos(band * 0.035);
        if (step === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.strokeStyle = `rgba(239,198,139,${alpha * light})`;
      c.lineWidth = 0.45 + hash(band + segment * 48) * 0.55;
      c.stroke();
    }
  }

  // A layered rim gives a hot, photographic bloom without a flat white outline.
  for (let layer = 0; layer < 6; layer++) {
    const widths = [23, 11, 4.8, 1.6, 0.8, 0.42];
    const alphas = [0.035, 0.06, 0.13, 0.25, 0.63, 0.66];
    for (let segment = 0; segment < 36; segment++) {
      const from = (segment / 36) * TAU;
      const to = ((segment + 1) / 36) * TAU + 0.006;
      const lighting = 0.3 + Math.pow((Math.cos(from + 2.3) + 1) / 2, 3) * 0.7;
      c.beginPath();
      for (let step = 0; step <= 15; step++) {
        const a = from + ((to - from) * step) / 15;
        const r = ringRadius(316, a, 122) + (layer === 5 ? -1.5 : 0);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (step === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.strokeStyle = `rgba(255,221,161,${alphas[layer] * lighting})`;
      c.lineWidth = widths[layer];
      c.stroke();
    }
  }

  // Fine organic punctures and luminous grains retain detail at export resolution.
  c.globalCompositeOperation = 'screen';
  for (let i = 0; i < 8500; i++) {
    const a = hash(i * 3 + 955) * TAU;
    const r = Math.sqrt(hash(i * 3 + 956)) * 318;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const edge = r / 318;
    c.fillStyle = `rgba(247,201,129,${0.025 + hash(i * 3 + 957) * 0.12 * edge})`;
    const size = 0.35 + hash(i + 278) * 0.55;
    c.fillRect(x, y, size, size);
  }
  c.globalCompositeOperation = 'source-over';
  return surface;
};

export const MemoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coronaRef = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const c = canvas?.getContext('2d');
    if (!canvas || !c) return;
    if (!coronaRef.current) coronaRef.current = createCorona();

    const t = frame / fps;
    const formation = smooth(t / 1.85);
    const breathe = Math.sin(t * 0.82) * 0.006;
    const camera = 0.96 + t * 0.009 + breathe;
    const cx = 540 - t * 1.6;
    const cy = 756 - t * 2.9;
    c.setTransform(width / 1080, 0, 0, height / 1920, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#030609';
    c.fillRect(0, 0, 1080, 1920);

    const ambient = c.createRadialGradient(cx - 65, cy - 110, 60, cx, cy, 665);
    ambient.addColorStop(0, `rgba(126,88,45,${0.08 + formation * 0.045})`);
    ambient.addColorStop(0.46, 'rgba(85,63,39,0.08)');
    ambient.addColorStop(1, 'rgba(3,6,9,0)');
    c.fillStyle = ambient;
    c.fillRect(0, 120, 1080, 1200);

    // Distant, cool stars frame the warmth; none compete with the subtitle region.
    for (let i = 0; i < 160; i++) {
      const x = hash(i * 3 + 4000) * 1080;
      const y = hash(i * 3 + 4001) * 1220;
      const alpha = (0.08 + hash(i * 3 + 4002) * 0.24) * smooth((1220 - y) / 200);
      c.fillStyle = `rgba(204,213,218,${alpha})`;
      c.fillRect(x + t * (hash(i + 890) - 0.5) * 0.6, y - t * 0.6, 0.7, 0.7);
    }

    c.save();
    c.translate(cx, cy);
    c.scale(camera, camera);
    c.globalAlpha = 0.36 + formation * 0.64;
    c.drawImage(coronaRef.current, -550, -550);
    c.restore();

    c.globalCompositeOperation = 'screen';
    // Dust settles into a narrow sphere boundary while the loose outer field drifts.
    for (let i = 0; i < dust.length; i++) {
      const p = dust[i];
      const orbit = p.a + t * (0.018 + p.z * 0.026);
      const bound = i % 4 !== 0;
      const destination = 308 + p.z * 15;
      const radius = bound ? p.r + (destination - p.r) * formation : p.r;
      const a = orbit + (1 - formation) * (p.seed - 0.5) * 0.14;
      const x = cx + Math.cos(a) * radius * camera;
      const y = cy + Math.sin(a) * radius * camera;
      const lowerFade = smooth((1250 - y) / 260);
      if (lowerFade === 0) continue;
      const size = p.bright > 0.99 ? 1.8 : 0.45 + p.z * 0.7;
      const alpha = (0.11 + p.bright * 0.42) * lowerFade * (bound ? 1 - formation * 0.40 : 1);
      c.fillStyle = `rgba(235,190,125,${alpha})`;
      c.beginPath();
      c.arc(x, y, size, 0, TAU);
      c.fill();
      if (p.bright > 0.991) {
        const glint = c.createRadialGradient(x, y, 0, x, y, 13);
        glint.addColorStop(0, `rgba(247,213,160,${alpha * 0.32})`);
        glint.addColorStop(1, 'rgba(230,177,91,0)');
        c.fillStyle = glint;
        c.fillRect(x - 13, y - 13, 26, 26);
      }
    }
    c.globalCompositeOperation = 'source-over';

    // Quiet vignette and gentle photographic falloff leave space for the closing line.
    const falloff = c.createLinearGradient(0, 1080, 0, 1640);
    falloff.addColorStop(0, 'rgba(3,6,9,0)');
    falloff.addColorStop(0.46, 'rgba(3,6,9,0.76)');
    falloff.addColorStop(1, '#030609');
    c.fillStyle = falloff;
    c.fillRect(0, 1080, 1080, 840);
    const vignette = c.createRadialGradient(540, 770, 340, 540, 850, 1050);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.46)');
    c.fillStyle = vignette;
    c.fillRect(0, 0, 1080, 1920);
  }, [frame, fps, height, width]);

  return (
    <AbsoluteFill style={{backgroundColor: '#030609'}}>
      <canvas ref={canvasRef} width={width} height={height} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};
