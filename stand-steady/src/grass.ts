type Point = { x: number; y: number; a: number; t: number; w: number };
type Blade = {
  length: number;
  base: number;
  angle: number;
  curve: number;
  width: number;
  phase: number;
  bend: number;
  light: number;
  dew?: number;
};

const ROOT_X = 1260;
const ROOT_Y = 930;
const blades: Blade[] = [
  { length: 392, base: -9, angle: -0.34, curve: -0.68, width: 8.8, phase: 0.7, bend: 1.0, light: 0.35 },
  { length: 562, base: -5, angle: -0.12, curve: -0.5, width: 9.9, phase: 2.4, bend: 0.97, light: 0.5, dew: 0.57 },
  { length: 620, base: 1, angle: 0.08, curve: -0.25, width: 10.4, phase: 1.1, bend: 0.96, light: 0.8, dew: 0.73 },
  { length: 510, base: 7, angle: 0.15, curve: 0.62, width: 11.6, phase: 3.8, bend: 1.07, light: 0.58 },
  { length: 667, base: -1, angle: -0.045, curve: 0.27, width: 7.8, phase: 4.4, bend: 0.92, light: 0.9 },
  { length: 427, base: 8, angle: 0.42, curve: 0.72, width: 10.5, phase: 1.9, bend: 1.1, light: 0.75, dew: 0.78 },
  { length: 582, base: 3, angle: 0.04, curve: 0.04, width: 11.1, phase: 5.2, bend: 1.0, light: 1.0, dew: 0.38 },
];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Integrating a tangent field preserves each blade's length when it bends. */
function geometry(blade: Blade, time: number, wind: number, originX = ROOT_X, originY = ROOT_Y): Point[] {
  const count = 64;
  const result: Point[] = [];
  let x = originX + blade.base;
  let y = originY;
  const sway = Math.sin(time * 1.14 + blade.phase) * 0.012 + Math.sin(time * 1.9 + blade.phase * 0.6) * 0.004;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const a = blade.angle + blade.curve * Math.pow(t, 1.3)
      + (wind * blade.bend * 1.54 + sway) * Math.pow(t, 0.76)
      + Math.sin(t * Math.PI) * wind * 0.14;
    if (i > 0) {
      const mid = (i - 0.5) / count;
      const midA = blade.angle + blade.curve * Math.pow(mid, 1.3)
        + (wind * blade.bend * 1.54 + sway) * Math.pow(mid, 0.76)
        + Math.sin(mid * Math.PI) * wind * 0.14;
      x += Math.sin(midA) * blade.length / count;
      y -= Math.cos(midA) * blade.length / count;
    }
    const w = blade.width * 2.1 * (0.59 + 0.52 * Math.sin(Math.PI * t)) * Math.pow(1 - t, 1.1);
    result.push({ x, y, a, t, w });
  }
  return result;
}

function edge(p: Point, side: number): [number, number] {
  return [p.x + Math.cos(p.a) * p.w * side, p.y + Math.sin(p.a) * p.w * side];
}

function ribbon(ctx: CanvasRenderingContext2D, pts: Point[], left = -0.5, right = 0.5) {
  ctx.beginPath();
  const first = edge(pts[0], left);
  ctx.moveTo(first[0], first[1]);
  for (const p of pts.slice(1)) {
    const e = edge(p, left);
    ctx.lineTo(e[0], e[1]);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const e = edge(pts[i], right);
    ctx.lineTo(e[0], e[1]);
  }
  ctx.closePath();
}

function longitudinal(ctx: CanvasRenderingContext2D, pts: Point[], offset: number, start = 0.02, end = 0.94) {
  ctx.beginPath();
  let begun = false;
  for (const p of pts) {
    if (p.t < start || p.t > end) continue;
    const e = edge(p, offset);
    if (!begun) { ctx.moveTo(e[0], e[1]); begun = true; }
    else ctx.lineTo(e[0], e[1]);
  }
}

function leafGradient(ctx: CanvasRenderingContext2D, pts: Point[], light: number) {
  const tip = pts[pts.length - 1];
  const g = ctx.createLinearGradient(ROOT_X - 160, ROOT_Y + 30, tip.x - 35, tip.y - 40);
  g.addColorStop(0, '#0f2923');
  g.addColorStop(0.12, '#23473c');
  g.addColorStop(0.38, light > 0.65 ? '#597d62' : '#3f624e');
  g.addColorStop(0.7, light > 0.65 ? '#91a575' : '#71875f');
  g.addColorStop(1, light > 0.8 ? '#c1c78f' : '#98a674');
  return g;
}

function dew(ctx: CanvasRenderingContext2D, p: Point, radius: number, alpha: number) {
  const x = p.x - Math.cos(p.a) * p.w * 0.16;
  const y = p.y - Math.sin(p.a) * p.w * 0.16;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y + radius * 0.1);
  ctx.rotate(p.a * 0.23);
  const shadow = ctx.createRadialGradient(radius * 0.2, radius * 0.7, 0, radius * 0.2, radius * 0.7, radius * 1.7);
  shadow.addColorStop(0, 'rgba(1,18,17,0.52)');
  shadow.addColorStop(1, 'rgba(1,18,17,0)');
  ctx.fillStyle = shadow;
  ctx.beginPath(); ctx.ellipse(radius * 0.2, radius * 0.7, radius * 1.7, radius * 1.1, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(-radius * 0.42, -radius * 0.4, 0, 0, 0, radius * 1.12);
  g.addColorStop(0, 'rgba(230,242,206,0.86)');
  g.addColorStop(0.21, 'rgba(176,205,177,0.46)');
  g.addColorStop(0.58, 'rgba(106,159,137,0.15)');
  g.addColorStop(0.82, 'rgba(32,70,60,0.51)');
  g.addColorStop(1, 'rgba(184,222,190,0.63)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 0, radius * 0.78, radius, 0, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 0.45;
  ctx.strokeStyle = 'rgba(208,230,192,0.62)';
  ctx.beginPath(); ctx.ellipse(0, 0, radius * 0.78, radius, 0, Math.PI * 0.16, Math.PI * 0.88); ctx.stroke();
  ctx.fillStyle = 'rgba(251,254,225,0.91)';
  ctx.beginPath(); ctx.ellipse(-radius * 0.24, -radius * 0.48, radius * 0.18, radius * 0.12, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawBlade(ctx: CanvasRenderingContext2D, blade: Blade, time: number, wind: number) {
  const pts = geometry(blade, time, wind);
  const tip = pts[pts.length - 1];
  ctx.save();
  ribbon(ctx, pts);
  ctx.fillStyle = leafGradient(ctx, pts, blade.light);
  ctx.fill();

  // A central fold gives the narrow leaf a three-dimensional ridge.
  const fold = ctx.createLinearGradient(ROOT_X, ROOT_Y, tip.x - 110, tip.y);
  fold.addColorStop(0, 'rgba(2,21,18,0.45)');
  fold.addColorStop(0.35, 'rgba(7,31,25,0.30)');
  fold.addColorStop(0.75, 'rgba(16,37,25,0.25)');
  fold.addColorStop(1, 'rgba(36,52,31,0.15)');
  ribbon(ctx, pts, 0.02, 0.5);
  ctx.fillStyle = fold;
  ctx.fill();

  const ridge = ctx.createLinearGradient(ROOT_X, ROOT_Y, tip.x, tip.y);
  ridge.addColorStop(0, 'rgba(174,193,125,0)');
  ridge.addColorStop(0.22, 'rgba(181,203,132,0.06)');
  ridge.addColorStop(0.66, `rgba(231,235,172,${0.07 + blade.light * 0.07})`);
  ridge.addColorStop(1, 'rgba(232,234,183,0.05)');
  ribbon(ctx, pts, -0.17, 0.02);
  ctx.fillStyle = ridge;
  ctx.fill();

  const rim = ctx.createLinearGradient(ROOT_X, ROOT_Y, tip.x, tip.y);
  rim.addColorStop(0, 'rgba(172,184,115,0)');
  rim.addColorStop(0.2, 'rgba(154,181,115,0.18)');
  rim.addColorStop(0.65, `rgba(223,224,155,${0.33 + blade.light * 0.2})`);
  rim.addColorStop(1, 'rgba(224,231,181,0.79)');
  ctx.strokeStyle = rim;
  ctx.lineWidth = 0.95;
  longitudinal(ctx, pts, -0.44, 0.08, 1);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(214,225,160,0.25)';
  ctx.lineWidth = 0.5;
  longitudinal(ctx, pts, -0.035, 0.1, 0.98);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(173,193,137,0.13)';
  ctx.lineWidth = 0.35;
  longitudinal(ctx, pts, -0.24, 0.12, 0.88);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(1,22,17,0.19)';
  longitudinal(ctx, pts, 0.25, 0.06, 0.84);
  ctx.stroke();

  if (blade.dew !== undefined) {
    const i = Math.round(blade.dew * (pts.length - 1));
    dew(ctx, pts[i], blade.light > 0.8 ? 5.5 : 4, 0.82);
  }
  ctx.restore();
}

function drawSeedStem(ctx: CanvasRenderingContext2D, time: number, wind: number) {
  const stem: Blade = { length: 636, base: -7, angle: -0.105, curve: -0.025, width: 1, phase: 2.1, bend: 0.85, light: 0.5 };
  const pts = geometry(stem, time, wind);
  const tip = pts[pts.length - 1];
  ctx.save();
  const g = ctx.createLinearGradient(ROOT_X, ROOT_Y, tip.x, tip.y);
  g.addColorStop(0, '#15362c');
  g.addColorStop(0.45, '#5d7150');
  g.addColorStop(1, '#a0a074');
  ctx.strokeStyle = g;
  ctx.lineWidth = 1.2;
  longitudinal(ctx, pts, 0, 0, 1);
  ctx.stroke();
  for (let i = 0; i < 11; i++) {
    const t = 0.85 + i * 0.012;
    const p = pts[Math.round(t * (pts.length - 1))];
    const side = i % 2 ? -1 : 1;
    const size = (1 - Math.abs(i - 4.5) / 9) * 8;
    const angle = p.a + side * 0.63;
    const x = p.x + Math.sin(angle) * size;
    const y = p.y - Math.cos(angle) * size;
    ctx.strokeStyle = 'rgba(160,163,108,0.52)';
    ctx.lineWidth = 0.55;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(x, y + 3, x + Math.sin(angle) * 4, y - 7); ctx.stroke();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const seed = ctx.createLinearGradient(-2, 0, 2, 0);
    seed.addColorStop(0, '#596447'); seed.addColorStop(0.5, '#c0bc87'); seed.addColorStop(1, '#7b8259');
    ctx.fillStyle = seed;
    ctx.beginPath(); ctx.ellipse(0, -3, 1.6, 5.4, -0.08, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/**
 * Paint a single, rooted grass clump in 1920 × 1080 design coordinates.
 * `time` is seconds; `wind` is 0–1. This function neither clears nor paints the backdrop.
 */
export function drawGrass(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, wind: number): void {
  const strength = clamp(wind, 0, 1);
  ctx.save();
  ctx.scale(width / 1920, height / 1080);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Soft, low peripheral blades provide depth without competing with the hero.
  ctx.save();
  ctx.filter = 'blur(2.3px)';
  ctx.globalAlpha = 0.23;
  const distant = [
    { length: 244, base: -53, angle: -0.33, curve: -0.59, width: 4.6, phase: 0.6, bend: 1.1, light: 0.3 },
    { length: 284, base: 55, angle: 0.27, curve: 0.82, width: 4.9, phase: 4.0, bend: 1.0, light: 0.4 },
    { length: 174, base: 76, angle: 0.38, curve: 0.91, width: 6.0, phase: 3.3, bend: 1.0, light: 0.5 },
  ];
  for (const b of distant) {
    const pts = geometry(b, time, strength * 0.8, ROOT_X, ROOT_Y + 6);
    ribbon(ctx, pts);
    ctx.fillStyle = leafGradient(ctx, pts, b.light);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(ROOT_X + 12, ROOT_Y + 2);
  ctx.scale(1, 0.34);
  const contact = ctx.createRadialGradient(0, 0, 4, 0, 0, 150);
  contact.addColorStop(0, 'rgba(1,16,16,0.58)');
  contact.addColorStop(0.35, 'rgba(1,16,16,0.17)');
  contact.addColorStop(1, 'rgba(1,16,16,0)');
  ctx.fillStyle = contact;
  ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  drawSeedStem(ctx, time, strength);
  for (const blade of blades) drawBlade(ctx, blade, time, strength);

  // Small overlapping sheaths bring all of the leaves into one credible root.
  ctx.save();
  const sheath = ctx.createLinearGradient(ROOT_X - 14, ROOT_Y, ROOT_X + 4, ROOT_Y - 70);
  sheath.addColorStop(0, '#102b25');
  sheath.addColorStop(0.65, '#385242');
  sheath.addColorStop(1, 'rgba(109,130,81,0)');
  ctx.fillStyle = sheath;
  ctx.beginPath();
  ctx.moveTo(ROOT_X - 13, ROOT_Y + 5);
  ctx.quadraticCurveTo(ROOT_X - 7, ROOT_Y - 32, ROOT_X - 5, ROOT_Y - 74);
  ctx.quadraticCurveTo(ROOT_X + 4, ROOT_Y - 24, ROOT_X + 12, ROOT_Y + 5);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(151,168,112,0.15)';
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(ROOT_X - 5, ROOT_Y - 48); ctx.quadraticCurveTo(ROOT_X, ROOT_Y - 20, ROOT_X + 3, ROOT_Y + 1); ctx.stroke();
  ctx.restore();
  ctx.restore();
}
