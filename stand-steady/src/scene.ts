import {drawGrass} from './grass';

const W = 1920;
const H = 1080;
const random = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return v - Math.floor(v);
};

export type SceneTextures = {backdrop: HTMLCanvasElement; grain: HTMLCanvasElement};

/** A painted, out-of-focus meadow, cached instead of blurred every frame. */
export function createSceneTextures(): SceneTextures {
  const backdrop = document.createElement('canvas');
  backdrop.width = W / 2; backdrop.height = H / 2;
  const ctx = backdrop.getContext('2d')!;
  ctx.scale(0.5, 0.5);
  const base = ctx.createLinearGradient(0, 0, W, H);
  base.addColorStop(0, '#102b28');
  base.addColorStop(0.48, '#26463c');
  base.addColorStop(1, '#0c2421');
  ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);
  const sunlight = ctx.createRadialGradient(1660, 110, 40, 1450, 100, 1200);
  sunlight.addColorStop(0, 'rgba(235,225,181,0.62)');
  sunlight.addColorStop(0.28, 'rgba(162,174,131,0.34)');
  sunlight.addColorStop(0.65, 'rgba(89,126,95,0.16)');
  sunlight.addColorStop(1, 'rgba(69,105,91,0)');
  ctx.fillStyle = sunlight; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.filter = 'blur(22px)';
  for (let i = 0; i < 60; i++) {
    const x = 700 + random(i + 5) * 1450;
    const h = 170 + random(i + 67) * 670;
    const lean = (random(i + 128) - 0.45) * 220;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(164,180,122,0.13)' : 'rgba(9,38,31,0.27)';
    ctx.lineWidth = 9 + random(i + 70) * 24;
    ctx.beginPath(); ctx.moveTo(x, 1130);
    ctx.bezierCurveTo(x - 35, 990, x + lean * 0.4, 1130 - h * 0.8, x + lean, 1130 - h);
    ctx.stroke();
  }
  ctx.restore();
  ctx.save(); ctx.filter = 'blur(5px)';
  for (let i = 0; i < 28; i++) {
    const x = 930 + random(i + 222) * 1200;
    const y = random(i + 334) * 1020;
    const r = 7 + random(i + 456) * 33;
    const glow = ctx.createRadialGradient(x, y, r * 0.6, x, y, r);
    glow.addColorStop(0, 'rgba(230,223,172,0.015)');
    glow.addColorStop(0.72, 'rgba(230,223,172,0.048)');
    glow.addColorStop(1, 'rgba(230,223,172,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.save(); ctx.filter = 'blur(40px)';
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = `rgba(244,225,164,${0.022 + i * 0.003})`;
    ctx.beginPath(); ctx.moveTo(1620 + i * 100, -200);
    ctx.lineTo(1860 + i * 90, -200); ctx.lineTo(1080 + i * 120, 1120);
    ctx.lineTo(1000 + i * 100, 1120); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.save(); ctx.filter = 'blur(9px)';
  for (let i = 0; i < 170; i++) {
    const x = random(i + 901) * W;
    const y = 962 + random(i + 951) * 140;
    const r = 7 + random(i + 812) * 45;
    ctx.fillStyle = i % 4 === 0 ? 'rgba(112,132,71,0.16)' : 'rgba(9,27,23,0.42)';
    ctx.beginPath(); ctx.ellipse(x, y, r * 2, r, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  const ground = ctx.createLinearGradient(0, 875, 0, H);
  ground.addColorStop(0, 'rgba(6,20,19,0)');
  ground.addColorStop(0.44, 'rgba(6,20,19,0.18)');
  ground.addColorStop(1, 'rgba(6,20,19,0.7)');
  ctx.fillStyle = ground; ctx.fillRect(0, 875, W, H - 875);
  const grain = document.createElement('canvas');
  grain.width = 1920; grain.height = 1080;
  const gctx = grain.getContext('2d')!;
  const data = gctx.createImageData(1920, 1080);
  for (let i = 0; i < 1920 * 1080; i++) {
    const c = random(i + 19373) > 0.5 ? 225 : 18;
    data.data[i * 4] = c; data.data[i * 4 + 1] = c; data.data[i * 4 + 2] = c;
    data.data[i * 4 + 3] = 12;
  }
  gctx.putImageData(data, 0, 0);
  return {backdrop, grain};
}

export function drawScene(ctx: CanvasRenderingContext2D, textures: SceneTextures, time: number, wind: number) {
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(textures.backdrop, 0, 0, W, H);
  ctx.save();
  const camera = 1.025 + Math.sin(time / 28 * Math.PI) * 0.017;
  ctx.translate(1280, 745); ctx.scale(camera, camera); ctx.translate(-1280, -745);
  drawGrass(ctx, W, H, time, wind);
  ctx.restore();
  // A shallow foreground veil blends the leaf sheaths into damp ground.
  ctx.save(); ctx.filter = 'blur(5px)';
  for (let i = 0; i < 24; i++) {
    const x = 1130 + random(i + 2451) * 280;
    const y = 949 + random(i + 2891) * 44;
    ctx.fillStyle = i % 5 === 0 ? 'rgba(79,95,53,0.28)' : 'rgba(8,29,24,0.38)';
    ctx.beginPath(); ctx.ellipse(x, y, 10 + random(i + 2631) * 24, 4 + random(i + 2981) * 8, -0.12, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  for (let i = 0; i < 52; i++) {
    const drift = time * (3 + random(i + 881) * 4) + wind * 14;
    const x = 850 + ((random(i + 521) * 1300 + drift) % 1300);
    const y = 100 + random(i + 671) * 850 + Math.sin(time * 0.24 + i) * 12;
    const r = 0.5 + random(i + 831) * 1.3;
    ctx.fillStyle = `rgba(237,230,190,${0.055 + random(i + 726) * 0.15})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  const shade = ctx.createLinearGradient(0, 0, 1180, 0);
  shade.addColorStop(0, 'rgba(6,23,22,0.38)');
  shade.addColorStop(0.7, 'rgba(6,23,22,0.10)');
  shade.addColorStop(1, 'rgba(6,23,22,0)');
  ctx.fillStyle = shade; ctx.fillRect(0, 0, W, H);
  const vignette = ctx.createRadialGradient(1110, 490, 270, 1000, 510, 1250);
  vignette.addColorStop(0, 'rgba(5,16,15,0)');
  vignette.addColorStop(0.7, 'rgba(5,16,15,0.025)');
  vignette.addColorStop(1, 'rgba(5,16,15,0.27)');
  ctx.fillStyle = vignette; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.28;
  ctx.drawImage(textures.grain, 0, 0, W, H); ctx.restore();
}
