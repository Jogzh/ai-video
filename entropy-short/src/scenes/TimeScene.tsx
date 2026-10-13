import {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {glow, noise, space} from './canvas';

export const TimeScene = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  useLayoutEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    const t = frame / fps;
    space(ctx, t);
    glow(ctx, 425, 620, 560, '#28678745');
    glow(ctx, 700, 1000, 460, '#b3813721');
    ctx.save();
    ctx.translate(540, 800);
    const scale = 1.03 + t * 0.018;
    ctx.scale(scale, scale);
    const turn = -0.09 + t * 0.024;
    const point = (r: number, y: number, a: number): [number, number] => {
      const x = r * Math.cos(a + turn);
      const z = r * Math.sin(a + turn);
      const perspective = 1150 / (1150 + z);
      return [(x + y * 0.045) * perspective, (y + z * 0.19) * perspective];
    };
    const radius = (y: number) => interpolate(Math.abs(y), [0, 60, 130, 200, 260, 315, 330], [13, 48, 138, 192, 198, 181, 161], {extrapolateRight: 'clamp'});

    // The glass is a surface of revolution; grazing reflections reveal its volume.
    for (let side = 0; side < 2; side++) {
      const begin = side === 0 ? 0 : Math.PI;
      for (let j = 0; j < 96; j++) {
        const a = begin + (j / 96) * Math.PI;
        const light = Math.pow(Math.abs(Math.sin(a - 0.18)), 22);
        const reflected = Math.pow(Math.max(0, Math.cos(a + 0.84)), 70);
        ctx.strokeStyle = `rgba(164,214,235,${0.004 + light * 0.16 + reflected * 0.44})`;
        ctx.lineWidth = 2.4 + reflected * 1.8;
        ctx.beginPath();
        for (let y = -330; y <= 330; y += 5) {
          const [px, py] = point(radius(y), y, a);
          if (y === -330) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      if (side === 0) {
        // Individual sand grains fill the upper reservoir and the lower mound.
        for (let i = 0; i < 3200; i++) {
          const y = -264 + noise(i + 3000) * 247;
          const r = radius(y) * Math.sqrt(noise(i + 9000)) * 0.92;
          const a = noise(i + 13000) * Math.PI * 2;
          const [x, py] = point(r, y + t * 0.5, a);
          const highlight = noise(i + 18000);
          ctx.fillStyle = `rgba(${174 + Math.floor(highlight * 65)},${126 + Math.floor(highlight * 67)},${67 + Math.floor(highlight * 69)},${0.36 + highlight * 0.5})`;
          ctx.fillRect(x, py, 0.7 + highlight * 1.4, 0.6 + highlight * 1.2);
        }
        for (let i = 0; i < 1750; i++) {
          const r = Math.sqrt(noise(i + 27000)) * (139 + t * 2);
          const a = noise(i + 32000) * Math.PI * 2;
          const y = 310 - (1 - r / 155) * (88 + t * 4) + noise(i + 37000) * 10;
          const [x, py] = point(r, y, a);
          ctx.fillStyle = `rgba(223,185,115,${0.22 + noise(i + 44000) * 0.65})`;
          ctx.fillRect(x, py, 1.1, 1.4);
        }
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        glow(ctx, 4, 110, 120, '#deb45c13');
        for (let i = 0; i < 150; i++) {
          const y = ((noise(i + 56000) * 245 + t * 175) % 245) - 5;
          const x = (noise(i + 51000) - 0.5) * (2.5 + y * 0.015) + y * 0.045;
          ctx.strokeStyle = `rgba(247,215,151,${0.15 + noise(i + 61000) * 0.7})`;
          ctx.lineWidth = 0.75;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 2.2); ctx.stroke();
        }
        ctx.restore();
      }
    }

    for (const y of [-330, 330]) {
      const gradient = ctx.createLinearGradient(-190, y, 190, y);
      gradient.addColorStop(0, '#a3d7ed18'); gradient.addColorStop(0.2, '#d2edfa8c');
      gradient.addColorStop(0.5, '#a3d7ed12'); gradient.addColorStop(0.9, '#b7e3f966'); gradient.addColorStop(1, '#a3d7ed08');
      ctx.strokeStyle = gradient; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let j = 0; j <= 120; j++) {
        const [x, py] = point(radius(y), y, (j / 120) * Math.PI * 2);
        if (j === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
      }
      ctx.closePath(); ctx.stroke();
    }
    glow(ctx, -172, -204, 44, '#9bdcf438');
    glow(ctx, -166, -204, 5, '#e3f8ffb3');
    ctx.restore();
  }, [frame, fps]);
  return <AbsoluteFill><canvas ref={canvas} width={1080} height={1920} style={{width: '100%', height: '100%'}} /></AbsoluteFill>;
};
