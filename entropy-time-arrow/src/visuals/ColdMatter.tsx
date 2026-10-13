import {VisualCanvas, TAU, clamp, smooth, rand, mix, glow} from './VisualCanvas';

type Point = {x: number; y: number};
type Fragment = {center: Point; polygon: Point[]; seed: number};

// Every shard starts as a clipped piece of the same shaded object. Its glaze,
// rim and handle therefore retain their original shape as the cup comes apart.
const seeds: Point[] = Array.from({length: 49}, (_, i) => ({
  x: 344 + (i % 7) * 69 + rand(i + 40) * 43,
  y: 584 + Math.floor(i / 7) * 64 + rand(i + 90) * 42,
}));

const cutPolygon = (polygon: Point[], nx: number, ny: number, d: number): Point[] => {
  const result: Point[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const da = a.x * nx + a.y * ny - d;
    const db = b.x * nx + b.y * ny - d;
    if (da <= 0) result.push(a);
    if ((da <= 0) !== (db <= 0)) {
      const u = da / (da - db);
      result.push({x: mix(a.x, b.x, u), y: mix(a.y, b.y, u)});
    }
  }
  return result;
};

const fragments: Fragment[] = seeds.map((center, i) => {
  let polygon = [{x: 320, y: 560}, {x: 840, y: 560}, {x: 840, y: 1060}, {x: 320, y: 1060}];
  seeds.forEach((other, j) => {
    if (i === j) return;
    const nx = other.x - center.x;
    const ny = other.y - center.y;
    const d = (other.x ** 2 + other.y ** 2 - center.x ** 2 - center.y ** 2) / 2;
    polygon = cutPolygon(polygon, nx, ny, d);
  });
  return {center, polygon, seed: i};
});

const polygonPath = (ctx: CanvasRenderingContext2D, polygon: Point[]) => {
  ctx.beginPath();
  polygon.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.closePath();
};

const cupBody = () => {
  const p = new Path2D();
  p.moveTo(365, 645);
  p.bezierCurveTo(370, 760, 382, 894, 426, 940);
  p.bezierCurveTo(474, 972, 594, 973, 637, 940);
  p.bezierCurveTo(676, 894, 687, 762, 687, 645);
  p.bezierCurveTo(652, 605, 403, 605, 365, 645);
  p.closePath();
  return p;
};

const cupHandle = () => {
  const p = new Path2D();
  p.moveTo(678, 680);
  p.bezierCurveTo(758, 653, 807, 680, 803, 760);
  p.bezierCurveTo(799, 837, 760, 885, 672, 878);
  p.lineTo(678, 847);
  p.bezierCurveTo(734, 850, 765, 816, 769, 762);
  p.bezierCurveTo(773, 710, 745, 697, 679, 716);
  p.closePath();
  return p;
};

const drawCup = (ctx: CanvasRenderingContext2D) => {
  const handle = cupHandle();
  const body = cupBody();
  const hg = ctx.createLinearGradient(675, 685, 807, 849);
  hg.addColorStop(0, '#6b8995');
  hg.addColorStop(0.22, '#d5e3e4');
  hg.addColorStop(0.48, '#677c85');
  hg.addColorStop(0.71, '#263943');
  hg.addColorStop(1, '#b3c6cc');
  ctx.fillStyle = hg;
  ctx.fill(handle);
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = 'rgba(207,231,235,0.48)';
  ctx.stroke(handle);
  const ceramic = ctx.createLinearGradient(366, 650, 693, 815);
  ceramic.addColorStop(0, '#293e4b');
  ceramic.addColorStop(0.1, '#8da7b2');
  ceramic.addColorStop(0.25, '#dce7e7');
  ceramic.addColorStop(0.39, '#eef2ed');
  ceramic.addColorStop(0.58, '#b4c9ce');
  ceramic.addColorStop(0.8, '#637c88');
  ceramic.addColorStop(1, '#253c49');
  ctx.fillStyle = ceramic;
  ctx.fill(body);
  ctx.save();
  ctx.clip(body);
  const shade = ctx.createLinearGradient(530, 650, 530, 984);
  shade.addColorStop(0, 'rgba(12,28,39,0)');
  shade.addColorStop(0.65, 'rgba(12,28,39,0.02)');
  shade.addColorStop(1, 'rgba(6,19,29,0.78)');
  ctx.fillStyle = shade;
  ctx.fillRect(350, 600, 360, 390);
  const light = ctx.createLinearGradient(430, 720, 477, 720);
  light.addColorStop(0, 'rgba(244,250,242,0)');
  light.addColorStop(0.45, 'rgba(244,250,242,0.27)');
  light.addColorStop(1, 'rgba(244,250,242,0)');
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.moveTo(433, 664);
  ctx.bezierCurveTo(438, 757, 440, 829, 461, 900);
  ctx.lineTo(480, 909);
  ctx.bezierCurveTo(463, 812, 462, 732, 466, 660);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // A dark interior and two luminous ellipses make the porcelain lip legible.
  const inside = ctx.createRadialGradient(508, 638, 13, 526, 644, 164);
  inside.addColorStop(0, '#101c24');
  inside.addColorStop(0.72, '#263841');
  inside.addColorStop(1, '#869eaa');
  ctx.fillStyle = inside;
  ctx.beginPath();
  ctx.ellipse(526, 645, 158, 39, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#dae6e5';
  ctx.lineWidth = 5.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(526, 645, 151.8, 34.2, 0, 0, TAU);
  ctx.strokeStyle = 'rgba(147,179,194,0.74)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(526, 645, 157.5, 39, 0, Math.PI * 0.02, Math.PI * 0.88);
  ctx.strokeStyle = 'rgba(249,250,238,0.84)';
  ctx.lineWidth = 2.1;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(532, 940, 105, 21, 0, 0.15, Math.PI - 0.15);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(171,205,217,0.41)';
  ctx.stroke();
};

const paintCup = (ctx: CanvasRenderingContext2D, time: number) => {
  const age = Math.max(0, time - 1.55);
  const opening = smooth(age / 0.52);
  const drift = 1 - Math.exp(-age * 0.43);
  glow(ctx, 502, 740, 348, 'rgba(49,87,104,0.17)');
  ctx.save();
  ctx.scale(1, 0.16);
  glow(ctx, 557, 6450, 275 + drift * 130, 'rgba(30,52,65,0.46)', 1 - drift * 0.6);
  ctx.restore();
  if (age === 0) {
    drawCup(ctx);
    return;
  }
  fragments.forEach(({center, polygon, seed}) => {
    if (polygon.length < 3) return;
    const rawDx = (center.x - 552) * 0.82 + (rand(seed + 180) - 0.5) * 185;
    const rawDy = (center.y - 767) * 0.39 + (rand(seed + 270) - 0.55) * 191;
    const dx = clamp(center.x + rawDx, 160, 928) - center.x;
    const dy = clamp(center.y + rawDy, 395, 1095) - center.y;
    const twist = (rand(seed + 310) - 0.5) * 2.5;
    ctx.save();
    ctx.translate(center.x + dx * drift, center.y + dy * drift + 18 * drift ** 2);
    ctx.rotate(twist * drift);
    ctx.scale(1 - rand(seed + 390) * drift * 0.12, 1);
    ctx.translate(-center.x, -center.y);
    polygonPath(ctx, polygon);
    ctx.clip();
    drawCup(ctx);
    // Thin matte fracture edges contrast against each piece's glossy surface.
    [cupBody(), cupHandle()].forEach((silhouette) => {
      ctx.save();
      ctx.clip(silhouette);
      polygonPath(ctx, polygon);
      ctx.lineWidth = 2.2 * opening;
      ctx.strokeStyle = 'rgba(19,34,42,0.82)';
      ctx.stroke();
      ctx.translate(-0.8, -0.8);
      polygonPath(ctx, polygon);
      ctx.lineWidth = 0.7 * opening;
      ctx.strokeStyle = 'rgba(220,237,233,0.8)';
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  });
  for (let i = 0; i < 34; i++) {
    const a = rand(i + 480) * TAU;
    const radius = drift * (80 + rand(i + 600) * 230);
    const x = 536 + Math.cos(a) * radius;
    const y = 777 + Math.sin(a) * radius * 0.73;
    ctx.fillStyle = `rgba(209,225,225,${opening * (0.13 + rand(i + 510) * 0.25)})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.7 + rand(i + 530) * 1.3, 0, TAU);
    ctx.fill();
  }
};

const smokePoint = (s: number, strand: number, time: number, spread: number): Point => {
  const phase = rand(strand + 910) * TAU;
  const depth = rand(strand + 940) - 0.5;
  const aperture = 8 + s ** 1.48 * (64 + spread * 194);
  const curl = Math.sin(s * 8.6 - time * 0.28) * (15 + 92 * s ** 1.4);
  const flutter = Math.sin(s * 18.7 + phase + time * 0.19) * (3 + s * 21);
  const x = 551 + curl + depth * aperture * 1.65 + flutter
    + Math.sin(s * 3.5 + phase) * aperture * 0.38;
  const y = 1035 - s * (493 + spread * 115)
    + Math.cos(s * 11 + phase + time * 0.16) * (s * 24);
  return {x, y};
};

const paintSmoke = (ctx: CanvasRenderingContext2D, time: number) => {
  const spread = smooth(time / 6.6);
  glow(ctx, 525, 729, 285, 'rgba(68,109,128,0.13)');
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  // Broad, translucent ribbons establish the body; individual wisps supply
  // the fine turbulent edge. All sample positions are analytic in scene time.
  for (let ribbon = 0; ribbon < 38; ribbon++) {
    ctx.beginPath();
    for (let j = 0; j <= 65; j++) {
      const s = j / 65;
      const p = smokePoint(s, ribbon * 4, time, spread);
      const width = Math.sin(s * Math.PI) * (4 + spread * 11);
      if (j === 0) ctx.moveTo(p.x - width, p.y);
      else ctx.lineTo(p.x - width, p.y);
    }
    for (let j = 65; j >= 0; j--) {
      const s = j / 65;
      const p = smokePoint(s, ribbon * 4, time, spread);
      const width = Math.sin(s * Math.PI) * (4 + spread * 11);
      ctx.lineTo(p.x + width, p.y);
    }
    ctx.closePath();
    const tint = 164 + Math.floor(rand(ribbon + 1100) * 43);
    ctx.fillStyle = `rgba(${tint - 32},${tint - 8},${tint + 8},${0.013 - spread * 0.003})`;
    ctx.fill();
  }
  for (let strand = 0; strand < 238; strand++) {
    const fade = 0.017 + rand(strand + 1160) * 0.028;
    const start = rand(strand + 1190) * 0.24;
    const end = 0.65 + rand(strand + 1210) * 0.35;
    ctx.beginPath();
    for (let j = 0; j <= 60; j++) {
      const s = mix(start, end, j / 60);
      const p = smokePoint(s, strand, time, spread);
      if (j === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    const gradient = ctx.createLinearGradient(540, 1035, 540, 410);
    gradient.addColorStop(0, `rgba(220,231,231,${fade * 0.58})`);
    gradient.addColorStop(0.36, `rgba(176,204,217,${fade})`);
    gradient.addColorStop(0.72, `rgba(151,184,205,${fade * 0.73})`);
    gradient.addColorStop(1, 'rgba(119,163,186,0)');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 0.7 + rand(strand + 1250) * 2.9;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  ctx.restore();
  const emberAlpha = 0.73 - spread * 0.35;
  glow(ctx, 552, 1041, 27, 'rgba(189,105,46,0.16)', emberAlpha);
  ctx.fillStyle = `rgba(217,143,69,${emberAlpha})`;
  ctx.beginPath();
  ctx.ellipse(552, 1041, 3.6, 1.8, -0.15, 0, TAU);
  ctx.fill();
};

const paintPhotons = (ctx: CanvasRenderingContext2D, time: number) => {
  const unfold = smooth(time / 6.2);
  const cx = 540;
  const cy = 755;
  // Distant nebula pockets give the light somewhere to disappear into.
  for (let i = 0; i < 24; i++) {
    const a = rand(i + 1360) * TAU;
    const r = 190 + rand(i + 1390) * 229;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r * 0.82;
    glow(ctx, x, y, 80 + rand(i + 1420) * 95, 'rgba(48,78,104,0.05)');
  }
  for (let i = 0; i < 117; i++) {
    const x = 130 + rand(i + 1470) * 820;
    const y = 370 + rand(i + 1510) * 755;
    const alpha = 0.05 + rand(i + 1550) * 0.25;
    ctx.fillStyle = `rgba(158,183,205,${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.35 + rand(i + 1600) * 0.75, 0, TAU);
    ctx.fill();
  }
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 260; i++) {
    const a = rand(i + 1630) * TAU;
    const phase = rand(i + 1680);
    const velocity = 38 + rand(i + 1710) * 52;
    const age = time + phase * 2.35;
    const r = 21 + age * velocity;
    const aspect = 0.81;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r * aspect;
    const edgeFade = clamp((470 - r) / 115);
    const alpha = (0.1 + rand(i + 1740) * 0.51) * edgeFade;
    const length = 6 + velocity * 0.19 + unfold * 15;
    const tx = cx + Math.cos(a) * Math.max(16, r - length);
    const ty = cy + Math.sin(a) * Math.max(16, r - length) * aspect;
    const trail = ctx.createLinearGradient(tx, ty, x, y);
    trail.addColorStop(0, 'rgba(91,157,190,0)');
    trail.addColorStop(0.83, `rgba(159,203,220,${alpha * 0.64})`);
    trail.addColorStop(1, `rgba(228,237,228,${alpha})`);
    ctx.strokeStyle = trail;
    ctx.lineWidth = 0.7 + rand(i + 1780) * 0.8;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (i % 11 === 0) glow(ctx, x, y, 8, 'rgba(147,189,209,0.16)', edgeFade);
  }
  // A few subtle diffraction rays keep the nuclear source small and bright.
  const coreRadius = 22 - unfold * 6;
  glow(ctx, cx, cy, 150 - unfold * 25, 'rgba(204,129,57,0.26)');
  glow(ctx, cx, cy, 65, 'rgba(246,205,132,0.62)');
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 4 + 0.14;
    const dx = Math.cos(a) * 163;
    const dy = Math.sin(a) * 163;
    const ray = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
    ray.addColorStop(0, 'rgba(212,226,228,0)');
    ray.addColorStop(0.49, 'rgba(222,229,220,0.04)');
    ray.addColorStop(0.5, 'rgba(255,232,177,0.31)');
    ray.addColorStop(0.51, 'rgba(222,229,220,0.04)');
    ray.addColorStop(1, 'rgba(212,226,228,0)');
    ctx.strokeStyle = ray;
    ctx.lineWidth = i % 2 ? 1 : 2;
    ctx.beginPath();
    ctx.moveTo(cx - dx, cy - dy);
    ctx.lineTo(cx + dx, cy + dy);
    ctx.stroke();
  }
  const nucleus = ctx.createRadialGradient(cx - 3, cy - 4, 1, cx, cy, coreRadius);
  nucleus.addColorStop(0, '#fffdef');
  nucleus.addColorStop(0.6, '#ffefd0');
  nucleus.addColorStop(0.87, '#f2bc66');
  nucleus.addColorStop(1, 'rgba(219,131,51,0)');
  ctx.fillStyle = nucleus;
  ctx.beginPath();
  ctx.arc(cx, cy, coreRadius, 0, TAU);
  ctx.fill();
  ctx.restore();
};

export const ColdMatter = ({kind}: {kind: 'cup' | 'smoke' | 'photons'}) => (
  <VisualCanvas paint={(ctx, time) => {
    if (kind === 'cup') paintCup(ctx, time);
    else if (kind === 'smoke') paintSmoke(ctx, time);
    else paintPhotons(ctx, time);
  }}/>
);
