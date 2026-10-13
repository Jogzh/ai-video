import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {glow, noise, space} from './canvas';

type Point = [number, number, number];
type Shard = {points: Point[]; center: Point; seed: number};
const shards: Shard[] = [];
const cupPoint = (a: number, y: number): Point => {
  const r = 178 - (y + 240) * 0.092;
  return [Math.cos(a) * r, y, Math.sin(a) * r];
};
const vertex = (row: number, column: number): Point => {
  const k = column % 16;
  const angle = column / 16 * Math.PI * 2 + (row % 2) * 0.12 + (noise(row * 16 + k + 777) - 0.5) * 0.14;
  const y = -245 + row * 70 + (row > 0 && row < 7 ? (noise(row * 16 + k + 198) - 0.5) * 35 : 0);
  return cupPoint(angle, y);
};
for (let j = 0; j < 7; j++) {
  for (let k = 0; k < 16; k++) {
    const p1 = vertex(j, k);
    const p2 = vertex(j, k + 1);
    const p3 = vertex(j + 1, k);
    const p4 = vertex(j + 1, k + 1);
    for (const points of [[p1, p2, p3], [p2, p4, p3]]) {
      shards.push({points, center: [points.reduce((s, p) => s + p[0], 0) / 3, points.reduce((s, p) => s + p[1], 0) / 3, points.reduce((s, p) => s + p[2], 0) / 3], seed: shards.length});
    }
  }
}

export const GlassScene = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  useLayoutEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    const t = frame / fps;
    space(ctx, t);
    glow(ctx, 490, 755, 670, '#20465b4c');
    const elapsed = Math.max(0, t - 0.65);
    const scatter = Math.pow(elapsed, 0.68) * 200;
    const flash = Math.exp(-Math.pow((t - 0.67) / 0.1, 2));
    glow(ctx, 540, 820, 680, '#95e1f9', flash * 0.13);
    const project = (p: Point): [number, number] => {
      const yaw = -0.3 + t * 0.08;
      const x = p[0] * Math.cos(yaw) - p[2] * Math.sin(yaw);
      const z = p[0] * Math.sin(yaw) + p[2] * Math.cos(yaw);
      const s = 1400 / (1400 + z);
      return [540 + (x + p[1] * 0.08) * s * 1.28, 775 + (p[1] + z * 0.19) * s * 1.28];
    };
    const sorted = [...shards].sort((a, b) => b.center[2] - a.center[2]);
    for (const shard of sorted) {
      const id = shard.seed;
      const c = shard.center;
      const angle = Math.atan2(c[2], c[0]);
      const speed = 0.35 + noise(id + 101) * 1.1;
      const spin = elapsed * (noise(id + 512) - 0.5) * 2.2;
      const spinY = elapsed * (noise(id + 815) - 0.5) * 3.5;
      const off: Point = [Math.cos(angle) * scatter * speed, (c[1] / 245) * scatter * 0.54 + elapsed * elapsed * 22, Math.sin(angle) * scatter * speed];
      const points = shard.points.map((p): Point => {
        const dx = p[0] - c[0];
        const dy = p[1] - c[1];
        const dz = p[2] - c[2];
        const sx = dx * Math.cos(spinY) - dz * Math.sin(spinY);
        return [c[0] + sx * Math.cos(spin) - dy * Math.sin(spin) + off[0], c[1] + sx * Math.sin(spin) + dy * Math.cos(spin) + off[1], c[2] + dx * Math.sin(spinY) + dz * Math.cos(spinY) + off[2]];
      }).map(project);
      const shine = Math.pow(Math.abs(Math.sin(angle + spin - 0.35)), 14);
      const alpha = 0.025 + shine * 0.19 + noise(id + 860) * 0.025;
      const fill = ctx.createLinearGradient(points[0][0], points[0][1], points[2][0] + 2, points[2][1] + 2);
      fill.addColorStop(0, `rgba(207,239,254,${alpha})`);
      fill.addColorStop(0.52, `rgba(37,96,123,${alpha * 0.4})`);
      fill.addColorStop(1, `rgba(162,219,245,${alpha * 1.3})`);
      ctx.beginPath(); ctx.moveTo(...points[0]); ctx.lineTo(...points[1]); ctx.lineTo(...points[2]); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
      if (elapsed > 0 || id % 13 === 0) {
        ctx.strokeStyle = `rgba(175,221,241,${elapsed > 0 ? 0.05 + shine * 0.6 : 0.025 + shine * 0.14})`;
        ctx.lineWidth = 0.65 + shine * 1.1; ctx.stroke();
      }
      if (shine > 0.72 && elapsed > 0) {
        glow(ctx, points[0][0], points[0][1], 14, '#b2e9ff', shine * 0.17);
      }
    }
    // Continuous mouth and base make the vessel legible before it breaks.
    if (elapsed < 0.48) {
      for (const y of [-245, 245]) {
        ctx.strokeStyle = `rgba(204,237,251,${0.56 * Math.max(0, 1 - elapsed / 0.48)})`;
        ctx.lineWidth = y < 0 ? 3 : 6;
        ctx.beginPath();
        for (let j = 0; j <= 100; j++) {
          const p = project(cupPoint(j / 100 * Math.PI * 2, y));
          if (j === 0) ctx.moveTo(...p); else ctx.lineTo(...p);
        }
        ctx.closePath(); ctx.stroke();
      }
    }
    if (elapsed > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 420; i++) {
        const a = noise(i + 12600) * Math.PI * 2;
        const r = scatter * (0.2 + noise(i + 13800) * 2.1);
        const x = 540 + Math.cos(a) * r;
        const y = 800 + Math.sin(a) * r * 0.72 + elapsed * elapsed * 13;
        ctx.fillStyle = `rgba(189,222,239,${(0.1 + noise(i + 14100) * 0.38) * Math.min(1, elapsed * 4)})`;
        ctx.fillRect(x, y, 0.6 + noise(i + 14600) * 1.5, 1.3);
      }
      ctx.restore();
    }
    const lowerShade = ctx.createLinearGradient(0, 1120, 0, 1430);
    lowerShade.addColorStop(0, 'rgba(3,6,9,0)');
    lowerShade.addColorStop(0.68, 'rgba(3,6,9,.90)');
    lowerShade.addColorStop(1, '#030609');
    ctx.fillStyle = lowerShade;
    ctx.fillRect(0, 1120, 1080, 800);
  }, [frame, fps]);
  return <AbsoluteFill><canvas ref={canvas} width={1080} height={1920} style={{width: '100%', height: '100%'}} /></AbsoluteFill>;
};
