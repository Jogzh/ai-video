export const noise = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};

export const glow = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  strength = 1,
) => {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'transparent');
  ctx.save();
  ctx.globalAlpha = strength;
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
};

export const space = (ctx: CanvasRenderingContext2D, time: number, warm = false) => {
  ctx.fillStyle = '#030609';
  ctx.fillRect(0, 0, 1080, 1920);
  glow(ctx, 540, 760, 760, warm ? '#2b211627' : '#12273558');
  for (let i = 0; i < 160; i++) {
    const x = noise(i + 1) * 1080;
    const y = noise(i + 202) * 1750;
    const alpha = (0.13 + noise(i + 603) * 0.25) * (0.8 + 0.2 * Math.sin(time * 0.3 + i));
    ctx.fillStyle = `rgba(178,199,204,${alpha})`;
    ctx.beginPath();
    ctx.arc(x + Math.sin(time * 0.1 + i) * 2, y + time * 0.6, 0.45 + noise(i + 1204) * 1.15, 0, Math.PI * 2);
    ctx.fill();
  }
};
