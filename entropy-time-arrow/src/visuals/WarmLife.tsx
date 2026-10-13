import {VisualCanvas, type Painter, TAU, clamp, smooth, rand, mix, glow} from './VisualCanvas';

type WarmLifeProps = {kind: 'sun' | 'rings' | 'human'};

const disk = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
};

const sunGrains = Array.from({length: 5700}, (_, i) => ({
  latitude: Math.acos(1 - 2 * rand(i * 5 + 7)),
  longitude: rand(i * 5 + 8) * TAU,
  weight: rand(i * 5 + 9),
  phase: rand(i * 5 + 10) * TAU,
}));

const paintSun: Painter = (ctx, time) => {
  const cx = 540;
  const cy = 748;
  const radius = 312;
  const pulse = 0.94 + Math.sin(time * 0.85) * 0.045;

  glow(ctx, cx, cy, 480, 'rgba(225,99,23,0.16)', pulse);
  glow(ctx, cx - 15, cy, 397, 'rgba(255,160,43,0.21)', pulse);

  // Magnetic arches run behind the photosphere, with fine parallel filaments.
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 18; i++) {
    const angle = i * TAU / 18 + 0.24 + Math.sin(time * 0.14 + i) * 0.035;
    const span = 0.11 + rand(i + 44) * 0.25;
    const reach = 348 + rand(i + 76) * 66 + Math.sin(time * 0.5 + i) * 13;
    for (let thread = 0; thread < 4; thread++) {
      const a = angle - span;
      const b = angle + span;
      const peak = reach + thread * 3.2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 306, cy + Math.sin(a) * 306);
      ctx.bezierCurveTo(
        cx + Math.cos(a - 0.025) * peak,
        cy + Math.sin(a - 0.025) * peak,
        cx + Math.cos(b + 0.025) * peak,
        cy + Math.sin(b + 0.025) * peak,
        cx + Math.cos(b) * 306,
        cy + Math.sin(b) * 306,
      );
      ctx.strokeStyle = `rgba(255,${153 + thread * 12},73,${0.13 + rand(i + 3) * 0.16})`;
      ctx.lineWidth = thread === 0 ? 1.8 : 0.75;
      ctx.shadowColor = '#e98029';
      ctx.shadowBlur = thread === 0 ? 8 : 0;
      ctx.stroke();
    }
  }
  ctx.restore();

  const surface = ctx.createRadialGradient(cx - 92, cy - 101, 20, cx + 5, cy + 13, radius + 3);
  surface.addColorStop(0, '#ffcf83');
  surface.addColorStop(0.23, '#fbb361');
  surface.addColorStop(0.55, '#dc792c');
  surface.addColorStop(0.86, '#ae3c0f');
  surface.addColorStop(0.985, '#f9b452');
  surface.addColorStop(1, '#ffe6ab');
  disk(ctx, cx, cy, radius);
  ctx.fillStyle = surface;
  ctx.fill();

  ctx.save();
  disk(ctx, cx, cy, radius - 1);
  ctx.clip();

  // Project a rotating sphere. A grain changes its projected position, not its seed.
  for (const grain of sunGrains) {
    const longitude = grain.longitude + time * 0.036;
    const st = Math.sin(grain.latitude);
    const x = st * Math.cos(longitude);
    const z = st * Math.sin(longitude);
    const y = Math.cos(grain.latitude);
    if (z < 0) continue;
    const px = cx + x * radius;
    const py = cy + y * radius;
    const flare = Math.sin(grain.phase + time * 0.58) * 0.5 + 0.5;
    const brightness = clamp(0.34 + 0.5 * z - 0.16 * x - 0.15 * y);
    const length = 1.8 + grain.weight * 4.5;
    const slant = grain.phase + Math.sin(y * 9 + time * 0.12) * 0.55;
    ctx.beginPath();
    ctx.moveTo(px - Math.cos(slant) * length, py - Math.sin(slant) * length * 0.6);
    ctx.quadraticCurveTo(px, py - 1.6, px + Math.cos(slant) * length, py + Math.sin(slant) * length * 0.6);
    ctx.lineWidth = 0.7 + grain.weight * 1.05;
    ctx.strokeStyle = grain.weight > 0.42
      ? `rgba(255,230,151,${brightness * (0.24 + flare * 0.2)})`
      : `rgba(63,15,4,${0.18 + grain.weight * 0.36})`;
    ctx.stroke();
  }

  // Larger filament currents give the granulation a visible, flowing scale.
  for (let i = 0; i < 88; i++) {
    const x = cx - 284 + rand(i * 7 + 1200) * 565;
    const y = cy - 285 + rand(i * 7 + 1201) * 565;
    const reach = 17 + rand(i * 7 + 1202) * 57;
    const angle = rand(i * 7 + 1203) * TAU + time * 0.027;
    ctx.beginPath();
    for (let p = 0; p <= 15; p++) {
      const fraction = p / 15;
      const a = angle + fraction * 1.25;
      const r = reach * Math.sin(fraction * Math.PI);
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (p === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = `rgba(255,226,159,${0.06 + rand(i + 90) * 0.14})`;
    ctx.stroke();
  }
  const limb = ctx.createRadialGradient(cx, cy, radius - 19, cx, cy, radius);
  limb.addColorStop(0, 'rgba(255,183,75,0)');
  limb.addColorStop(0.8, 'rgba(255,200,108,0.32)');
  limb.addColorStop(1, 'rgba(255,245,207,0.85)');
  ctx.fillStyle = limb;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = 'rgba(255,216,143,0.65)';
  ctx.lineWidth = 1.35;
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#f4ab4e';
  disk(ctx, cx, cy, radius + 0.5);
  ctx.stroke();
  ctx.restore();

  for (let i = 0; i < 124; i++) {
    const angle = rand(i * 3 + 860) * TAU;
    const cycle = (rand(i * 3 + 861) + time * (0.025 + rand(i * 3 + 862) * 0.045)) % 1;
    const r = 319 + cycle * 119;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    ctx.fillStyle = `rgba(255,204,127,${Math.sin(cycle * Math.PI) * 0.36})`;
    disk(ctx, x, y, 0.6 + rand(i + 420) * 1.1);
    ctx.fill();
  }
};

const woodRadius = (angle: number, level: number) => {
  const radius = 16 + level * 343;
  const ripple = Math.sin(angle * 3 + level * 2.1) * 6
    + Math.sin(angle * 5 - 0.75 + level * 7) * 4
    + Math.sin(angle * 9 + level * 3.2) * 1.65
    + Math.sin(angle * 17 - level * 12) * 0.8;
  return radius + ripple * (0.4 + level * 0.6);
};

const ringPoint = (angle: number, level: number) => {
  const r = woodRadius(angle, level);
  return {x: 518 + Math.cos(angle) * r * 1.04 + level * 22,
    y: 760 + Math.sin(angle) * r * 0.96 - level * 11};
};

const ringPath = (ctx: CanvasRenderingContext2D, level: number, start = 0, end = TAU) => {
  const steps = Math.max(2, Math.ceil((end - start) * 51));
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const point = ringPoint(mix(start, end, i / steps), level);
    if (i === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
  }
};

const paintRings: Painter = (ctx, time) => {
  glow(ctx, 540, 757, 475, 'rgba(187,113,43,0.08)');
  ringPath(ctx, 1.02);
  ctx.closePath();
  ctx.save();
  ctx.shadowBlur = 34;
  ctx.shadowColor = 'rgba(0,0,0,0.95)';
  ctx.fillStyle = '#261911';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ringPath(ctx, 1.005);
  ctx.closePath();
  ctx.clip();
  const wood = ctx.createRadialGradient(475, 690, 25, 530, 754, 405);
  wood.addColorStop(0, '#4e3220');
  wood.addColorStop(0.4, '#61432a');
  wood.addColorStop(0.77, '#3e2c1f');
  wood.addColorStop(1, '#21170f');
  ctx.fillStyle = wood;
  ctx.fillRect(120, 360, 840, 800);

  const growth = smooth(time / 5.3);
  const oldest = 0.08;
  const newest = mix(oldest, 0.98, growth);
  for (let i = 0; i < 94; i++) {
    const level = (i + 1) / 96;
    const formed = smooth((newest - level + 0.1) / 0.12);
    ringPath(ctx, level);
    ctx.lineWidth = i % 3 === 0 ? 1.85 : 0.75;
    ctx.strokeStyle = `rgba(216,170,109,${0.11 + formed * 0.25 + rand(i + 580) * 0.13})`;
    ctx.stroke();
    ringPath(ctx, level + 0.0039);
    ctx.lineWidth = i % 3 === 0 ? 2.4 : 0.8;
    ctx.strokeStyle = `rgba(10,9,7,${0.12 + rand(i + 790) * 0.25})`;
    ctx.stroke();
  }

  // Radial medullary rays and pores prevent the rings becoming perfect diagram circles.
  for (let i = 0; i < 290; i++) {
    const angle = rand(i * 4 + 690) * TAU;
    const begin = rand(i * 4 + 691) * 0.86;
    const end = Math.min(1.01, begin + 0.08 + rand(i * 4 + 692) * 0.2);
    ctx.beginPath();
    for (let j = 0; j <= 20; j++) {
      const level = mix(begin, end, j / 20);
      const point = ringPoint(angle + Math.sin(level * 9 + i) * 0.005, level);
      if (j === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
    }
    ctx.lineWidth = 0.4 + rand(i * 4 + 693) * 1.05;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(230,192,137,0.15)' : 'rgba(5,7,8,0.19)';
    ctx.stroke();
  }

  for (let i = 0; i < 3100; i++) {
    const a = rand(i * 3 + 9500) * TAU;
    const level = Math.sqrt(rand(i * 3 + 9501));
    const point = ringPoint(a, level);
    ctx.fillStyle = i % 4 === 0 ? 'rgba(225,188,132,0.15)' : 'rgba(5,6,5,0.24)';
    ctx.fillRect(point.x, point.y, 0.7 + rand(i * 3 + 9502) * 1.25, 0.6);
  }

  // A moving glint traces the growth front, leaving the complete wood grain visible.
  const turn = time * 0.73 - 0.7;
  for (let j = 0; j < 36; j++) {
    const start = turn - j * 0.032;
    ringPath(ctx, newest, start, start + 0.038);
    ctx.lineWidth = 1.3 + (1 - j / 36) * 1.25;
    ctx.strokeStyle = `rgba(255,214,146,${(1 - j / 36) * 0.76})`;
    ctx.shadowColor = '#e7a85e';
    ctx.shadowBlur = 8;
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  const glint = ringPoint(turn, newest);
  glow(ctx, glint.x, glint.y, 23, 'rgba(255,216,151,0.57)');

  // Uneven checks in the wood reach inward from the bark.
  for (let i = 0; i < 8; i++) {
    const angle = 0.3 + i * 0.79 + rand(i + 302) * 0.15;
    ctx.beginPath();
    for (let j = 0; j <= 20; j++) {
      const level = 1.02 - j / 20 * (0.12 + rand(i + 130) * 0.22);
      const point = ringPoint(angle + Math.sin(j * 0.81 + i) * 0.006, level);
      if (j === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
    }
    ctx.strokeStyle = 'rgba(3,6,7,0.7)';
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }
  ctx.restore();
  ringPath(ctx, 1.01);
  ctx.strokeStyle = 'rgba(191,151,102,0.29)';
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ringPath(ctx, 1.02);
  ctx.strokeStyle = 'rgba(143,99,56,0.15)';
  ctx.lineWidth = 5;
  ctx.stroke();
};

const humanPath = () => {
  const path = new Path2D();
  path.moveTo(539, 376);
  path.bezierCurveTo(486, 372, 450, 407, 448, 476);
  path.bezierCurveTo(431, 471, 428, 497, 440, 521);
  path.bezierCurveTo(442, 557, 451, 596, 481, 630);
  path.bezierCurveTo(490, 643, 497, 649, 504, 652);
  path.lineTo(502, 691);
  path.bezierCurveTo(491, 719, 440, 732, 390, 748);
  path.bezierCurveTo(325, 770, 286, 811, 273, 897);
  path.lineTo(258, 1104);
  path.bezierCurveTo(354, 1140, 444, 1152, 540, 1152);
  path.bezierCurveTo(636, 1152, 726, 1140, 822, 1104);
  path.lineTo(807, 897);
  path.bezierCurveTo(794, 811, 755, 770, 690, 748);
  path.bezierCurveTo(640, 732, 589, 719, 578, 691);
  path.lineTo(576, 652);
  path.bezierCurveTo(583, 649, 590, 643, 599, 630);
  path.bezierCurveTo(629, 596, 638, 557, 640, 521);
  path.bezierCurveTo(652, 497, 649, 471, 632, 476);
  path.bezierCurveTo(630, 407, 594, 372, 539, 376);
  path.closePath();
  return path;
};

const bodyPoints = Array.from({length: 6400}, (_, i) => ({
  x: 257 + rand(i * 4 + 13000) * 566,
  y: 374 + rand(i * 4 + 13001) * 778,
  radius: 0.45 + rand(i * 4 + 13002) * 0.94,
  phase: rand(i * 4 + 13003) * TAU,
}));

const curvePoint = (p: number, x0: number, y0: number, x1: number, y1: number,
  x2: number, y2: number, x3: number, y3: number) => {
  const q = 1 - p;
  return {x: q * q * q * x0 + 3 * q * q * p * x1 + 3 * q * p * p * x2 + p * p * p * x3,
    y: q * q * q * y0 + 3 * q * q * p * y1 + 3 * q * p * p * y2 + p * p * p * y3};
};

const paintHuman: Painter = (ctx, time) => {
  const path = humanPath();
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.4 - 0.8);
  glow(ctx, 541, 855, 340, 'rgba(105,161,167,0.055)');
  glow(ctx, 536, 883, 167, 'rgba(243,178,92,0.09)', 0.55 + pulse * 0.4);

  // Incoming light follows gently converging curves into the living system.
  for (let i = 0; i < 28; i++) {
    const y = 729 + rand(i * 5 + 85) * 209;
    const ty = 836 + rand(i * 5 + 86) * 137;
    const x0 = 125 + rand(i * 5 + 87) * 39;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.bezierCurveTo(255, y - 37, 340, ty + 20, 502, ty);
    ctx.lineWidth = 0.45;
    ctx.strokeStyle = 'rgba(226,181,114,0.095)';
    ctx.stroke();
    const p = (rand(i * 5 + 88) + time * (0.13 + rand(i + 120) * 0.04)) % 1;
    const point = curvePoint(p, x0, y, 255, y - 37, 340, ty + 20, 502, ty);
    const alpha = Math.sin(p * Math.PI) * 0.65;
    ctx.fillStyle = `rgba(255,219,164,${alpha})`;
    disk(ctx, point.x, point.y, 1 + rand(i + 66) * 1.5);
    ctx.fill();
    if (i % 7 === 0) glow(ctx, point.x, point.y, 10, 'rgba(240,194,121,0.22)', alpha);
  }

  ctx.save();
  ctx.clip(path);
  const body = ctx.createLinearGradient(264, 720, 790, 800);
  body.addColorStop(0, 'rgba(181,210,212,0.08)');
  body.addColorStop(0.24, 'rgba(125,179,190,0.11)');
  body.addColorStop(0.52, 'rgba(72,119,135,0.035)');
  body.addColorStop(0.9, 'rgba(225,190,130,0.12)');
  body.addColorStop(1, 'rgba(242,219,174,0.04)');
  ctx.fillStyle = body;
  ctx.fillRect(255, 370, 575, 792);

  glow(ctx, 486, 513, 172, 'rgba(164,206,216,0.12)');
  glow(ctx, 604, 575, 123, 'rgba(238,196,129,0.075)');
  glow(ctx, 489, 893, 160, 'rgba(238,192,118,0.075)', pulse * 0.35 + 0.7);

  // Fine sections bend around the face and torso like a luminous scan of skin.
  for (let i = 0; i < 54; i++) {
    const y = 391 + i * 5.5;
    const relative = (y - 516) / 142;
    const width = Math.sqrt(Math.max(0, 1 - relative * relative)) * 89;
    if (width < 5) continue;
    ctx.beginPath();
    for (let j = 0; j <= 48; j++) {
      const x = mix(540 - width, 540 + width, j / 48);
      const faceCurve = Math.sin(j / 48 * Math.PI) * 8.5;
      const nose = Math.exp(-Math.pow((x - 539) / 17, 2)) * Math.exp(-Math.pow((y - 547) / 48, 2)) * -12;
      const eye = (Math.exp(-Math.pow((x - 501) / 20, 2)) + Math.exp(-Math.pow((x - 579) / 20, 2)))
        * Math.exp(-Math.pow((y - 499) / 18, 2)) * 9;
      const py = y + faceCurve + nose + eye + Math.sin(j * 0.6 + i) * 0.5;
      if (j === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
    }
    ctx.strokeStyle = `rgba(205,225,222,${i % 4 === 0 ? 0.2 : 0.065})`;
    ctx.lineWidth = i % 4 === 0 ? 0.7 : 0.45;
    ctx.stroke();
  }

  for (let i = 0; i < 68; i++) {
    const y = 719 + i * 6.2;
    const widen = Math.min(270, 56 + (y - 704) * 1.2);
    ctx.beginPath();
    for (let j = 0; j <= 72; j++) {
      const x = mix(540 - widen, 540 + widen, j / 72);
      const normal = (x - 540) / widen;
      const shoulder = (1 - normal * normal) * (y < 842 ? -27 : 15);
      const chest = Math.sin(j / 72 * TAU) * (y > 814 ? 12 : 5);
      const breathing = Math.sin(time * 1.05) * (y > 806 ? 1.4 : 0.5);
      const py = y + shoulder + chest + breathing;
      if (j === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
    }
    ctx.strokeStyle = `rgba(${i % 5 === 0 ? '228,206,165' : '161,204,213'},${i % 5 === 0 ? 0.15 : 0.055})`;
    ctx.lineWidth = i % 5 === 0 ? 0.75 : 0.45;
    ctx.stroke();
  }

  // Structured points are denser along cheekbones, clavicles and the sternum.
  for (const point of bodyPoints) {
    const face = point.y < 668;
    const cheek = face ? Math.exp(-Math.pow((point.y - 546) / 76, 2)) * Math.abs(point.x - 540) / 102 : 0;
    const sternum = Math.exp(-Math.pow((point.x - 540) / 46, 2)) * Math.exp(-Math.pow((point.y - 893) / 165, 2));
    const collar = Math.exp(-Math.pow((point.y - (779 - Math.abs(point.x - 540) * 0.12)) / 14, 2));
    const bright = clamp(0.12 + cheek * 0.26 + collar * 0.42 + sternum * (0.14 + pulse * 0.1));
    const twinkle = 0.72 + Math.sin(point.phase + time * 0.7) * 0.2;
    ctx.fillStyle = point.phase < 1.4
      ? `rgba(246,213,165,${bright * twinkle})`
      : `rgba(204,229,232,${bright * twinkle})`;
    disk(ctx, point.x + Math.sin(time * 0.7 + point.phase) * 0.36, point.y, point.radius);
    ctx.fill();
  }

  // A few precise facial planes make the light field recognisably human.
  ctx.strokeStyle = 'rgba(208,229,229,0.21)';
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.moveTo(469, 491);
  ctx.quadraticCurveTo(488, 481, 513, 491);
  ctx.moveTo(567, 491);
  ctx.quadraticCurveTo(592, 481, 611, 491);
  ctx.moveTo(536, 502);
  ctx.bezierCurveTo(533, 526, 529, 542, 526, 557);
  ctx.quadraticCurveTo(538, 564, 552, 558);
  ctx.moveTo(519, 586);
  ctx.quadraticCurveTo(539, 591, 562, 586);
  ctx.moveTo(516, 600);
  ctx.quadraticCurveTo(540, 606, 564, 600);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(209,227,223,0.19)';
  ctx.beginPath();
  ctx.moveTo(500, 675);
  ctx.bezierCurveTo(503, 719, 517, 753, 536, 773);
  ctx.moveTo(579, 675);
  ctx.bezierCurveTo(576, 719, 563, 753, 544, 773);
  ctx.moveTo(340, 792);
  ctx.bezierCurveTo(407, 765, 473, 764, 525, 794);
  ctx.moveTo(740, 792);
  ctx.bezierCurveTo(673, 765, 607, 764, 555, 794);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(191,220,222,0.38)';
  ctx.lineWidth = 1.2;
  ctx.shadowBlur = 8;
  ctx.shadowColor = 'rgba(142,196,208,0.4)';
  ctx.stroke(path);
  ctx.restore();

  // Dispersed heat expands into many weak paths beyond the body boundary.
  for (let i = 0; i < 118; i++) {
    const seed = rand(i * 5 + 2800);
    const fromHead = i % 4 === 0;
    const side = i % 3 === 0 ? -1 : 1;
    const startX = fromHead ? 539 + side * 96 : 540 + side * (210 + rand(i * 5 + 2801) * 62);
    const startY = fromHead ? 437 + rand(i * 5 + 2802) * 152 : 808 + rand(i * 5 + 2802) * 251;
    const t = (seed + time * (0.075 + rand(i * 5 + 2803) * 0.04)) % 1;
    const distance = 39 + rand(i * 5 + 2804) * 152;
    const x = startX + side * distance * t + Math.sin(t * 4 + i) * 12 * t;
    const y = startY - (55 + rand(i + 682) * 116) * t;
    const opacity = Math.sin(t * Math.PI) * 0.5 * (1 - t * 0.6);
    ctx.fillStyle = i % 4 === 0 ? `rgba(243,185,104,${opacity})` : `rgba(221,222,205,${opacity * 0.68})`;
    disk(ctx, x, y, 0.65 + rand(i + 777) * 1.4);
    ctx.fill();
  }
};

const painters: Record<WarmLifeProps['kind'], Painter> = {sun: paintSun, rings: paintRings, human: paintHuman};

export const WarmLife = ({kind}: WarmLifeProps) => <VisualCanvas paint={painters[kind]}/>;
