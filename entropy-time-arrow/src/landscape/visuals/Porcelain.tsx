import {useId} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';

type Point = {x: number; y: number};

const random = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
};
const limit = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const soften = (v: number) => {const p = limit(v); return p * p * (3 - 2 * p);};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const BODY = 'M -158 -288 C -155 -174 -137 -43 -101 -13 C -62 11 58 13 105 -13 C 145 -47 156 -171 158 -288 C 122 -335 -116 -341 -158 -288 Z';
const HANDLE = 'M 147 -265 C 225 -294 280 -263 279 -191 C 278 -107 234 -61 138 -73 L 144 -108 C 211 -102 241 -136 243 -191 C 245 -237 220 -248 149 -229 Z';

const bezier = (a: Point, b: Point, c: Point, d: Point, t: number): Point => {
  const q = 1 - t;
  return {x: q ** 3 * a.x + 3 * q ** 2 * t * b.x + 3 * q * t ** 2 * c.x + t ** 3 * d.x,
    y: q ** 3 * a.y + 3 * q ** 2 * t * b.y + 3 * q * t ** 2 * c.y + t ** 3 * d.y};
};

const sampleCurves = (start: Point, segments: [Point, Point, Point][]) => {
  let previous = start;
  const points = [start];
  segments.forEach(([a, b, end]) => {
    for (let i = 1; i <= 18; i++) points.push(bezier(previous, a, b, end, i / 18));
    previous = end;
  });
  return points;
};

const bodyOutline = sampleCurves({x: -158, y: -288}, [
  [{x: -155, y: -174}, {x: -137, y: -43}, {x: -101, y: -13}],
  [{x: -62, y: 11}, {x: 58, y: 13}, {x: 105, y: -13}],
  [{x: 145, y: -47}, {x: 156, y: -171}, {x: 158, y: -288}],
  [{x: 122, y: -335}, {x: -116, y: -341}, {x: -158, y: -288}],
]);
const handleOutline = sampleCurves({x: 147, y: -265}, [
  [{x: 225, y: -294}, {x: 280, y: -263}, {x: 279, y: -191}],
  [{x: 278, y: -107}, {x: 234, y: -61}, {x: 138, y: -73}],
  [{x: 140, y: -84}, {x: 142, y: -96}, {x: 144, y: -108}],
  [{x: 211, y: -102}, {x: 241, y: -136}, {x: 243, y: -191}],
  [{x: 245, y: -237}, {x: 220, y: -248}, {x: 149, y: -229}],
]);
const rimOutline: Point[] = Array.from({length: 72}, (_, i) => ({
  x: Math.cos(i / 72 * Math.PI * 2) * 159,
  y: -289 + Math.sin(i / 72 * Math.PI * 2) * 51,
}));

const seeds: Point[] = [
  {x: -121, y: -296}, {x: -47, y: -310}, {x: 48, y: -304}, {x: 125, y: -285},
  {x: -117, y: -225}, {x: -35, y: -236}, {x: 52, y: -224}, {x: 131, y: -205},
  {x: -91, y: -143}, {x: -5, y: -152}, {x: 95, y: -128},
  {x: -66, y: -63}, {x: 13, y: -77}, {x: 92, y: -51},
  {x: -63, y: -12}, {x: 29, y: -11},
  {x: 180, y: -258}, {x: 254, y: -237}, {x: 266, y: -160},
  {x: 224, y: -103}, {x: 158, y: -83},
].map((p, i) => ({x: p.x + (random(i + 25) - 0.5) * 19, y: p.y + (random(i + 51) - 0.5) * 17}));

const clipPolygon = (polygon: Point[], nx: number, ny: number, d: number): Point[] => {
  const output: Point[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const da = a.x * nx + a.y * ny - d;
    const db = b.x * nx + b.y * ny - d;
    if (da <= 0) output.push(a);
    if ((da <= 0) !== (db <= 0)) {
      const amount = da / (da - db);
      output.push({x: lerp(a.x, b.x, amount), y: lerp(a.y, b.y, amount)});
    }
  }
  return output;
};

const pieces = seeds.map((seed, index) => {
  let polygon = [{x: -180, y: -360}, {x: 300, y: -360}, {x: 300, y: 35}, {x: -180, y: 35}];
  let body = bodyOutline;
  let handle = handleOutline;
  let rim = rimOutline;
  seeds.forEach((other, otherIndex) => {
    if (index === otherIndex) return;
    const nx = other.x - seed.x;
    const ny = other.y - seed.y;
    const d = (other.x ** 2 + other.y ** 2 - seed.x ** 2 - seed.y ** 2) / 2;
    polygon = clipPolygon(polygon, nx, ny, d);
    body = clipPolygon(body, nx, ny, d);
    handle = clipPolygon(handle, nx, ny, d);
    rim = clipPolygon(rim, nx, ny, d);
  });
  const outline = [...body, ...handle, ...rim];
  const points = outline.length ? outline : polygon;
  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));
  return {polygon, points, center: {x: (minX + maxX) / 2, y: (minY + maxY) / 2}, width: maxX - minX, index};
});

const polygonData = (points: Point[]) => points.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + ' Z';

export const Porcelain = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const prefix = `porcelain-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const url = (name: string) => `url(#${prefix}-${name})`;
  const falling = limit((time - 1.6) / 1.1);
  const baseline = 716 + 111 * falling ** 2;
  const age = Math.max(0, time - 2.7);
  const intact = time < 2.7;
  const cupAngle = -2.7 * (1 - falling);
  const states = pieces.map((piece) => {
    const {index, center} = piece;
    const flight = 1.11 + random(index + 108) * 0.63;
    const progress = limit(age / flight);
    const turn = (random(index + 126) - 0.5) * 4.8;
    const finalScaleX = 0.74 + random(index + 165) * 0.3;
    const curvedShard = [4, 7, 10, 19].includes(index);
    const finalScaleY = curvedShard ? 0.41 + random(index + 185) * 0.075 : 0.17 + random(index + 185) * 0.145;
    const maxBottom = Math.max(...piece.points.map((p) => (
      (Math.sin(turn) * (p.x - center.x) * finalScaleX + Math.cos(turn) * (p.y - center.y)) * finalScaleY
    )));
    // A stable permutation spaces the large pieces without a central pile.
    // Perspective compression happens after rotation so they rest on a plane.
    const landingRank = (index * 8) % pieces.length;
    const finalX = 1138 + landingRank / (pieces.length - 1) * 623 + (random(index + 209) - 0.5) * 23;
    const groundY = 811 + random(index + 228) * 31;
    const extrusionBottom = Math.max(0, (Math.sin(turn) * 3.9 * finalScaleX + Math.cos(turn) * 9.4) * finalScaleY);
    const finalY = groundY - maxBottom - extrusionBottom;
    const originalX = 1420 + center.x;
    const originalY = 827 + center.y;
    const gravity = 720;
    const vy = (finalY - originalY - gravity * flight ** 2 / 2) / flight;
    const airborneAge = Math.min(age, flight);
    const x = lerp(originalX, finalX, progress);
    const ballisticY = originalY + vy * airborneAge + gravity * airborneAge ** 2 / 2;
    const bounceAge = age - flight;
    const bounce = bounceAge > 0 && bounceAge < 0.18 ? Math.sin(bounceAge / 0.18 * Math.PI) * (4 + random(index + 240) * 7) : 0;
    const settle = Math.max(0, age - flight);
    const rock = settle < 0.19 ? Math.sin(settle * 24) * Math.exp(-settle * 19) * 0.09 : 0;
    return {piece, x, y: ballisticY - bounce, groundY, rotation: turn * soften(progress) + rock,
      sx: lerp(1, finalScaleX, soften(progress)), sy: lerp(1, finalScaleY, soften(progress)),
      shadowWidth: Math.max(17, piece.width * finalScaleX * 0.47),
      shadowOpacity: 0.1 + 0.24 * progress ** 3};
  });

  return <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`${prefix}-glaze`} x1="-165" y1="-190" x2="163" y2="-207" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#687d89"/><stop offset="0.055" stopColor="#b0bdc3"/>
        <stop offset="0.16" stopColor="#e2e7e5"/><stop offset="0.34" stopColor="#fffdf0"/>
        <stop offset="0.56" stopColor="#eaece6"/><stop offset="0.79" stopColor="#bbc9cc"/>
        <stop offset="0.94" stopColor="#6e8490"/><stop offset="1" stopColor="#435e6e"/>
      </linearGradient>
      <linearGradient id={`${prefix}-lowerShade`} x1="0" y1="-284" x2="0" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#162833" stopOpacity="0"/><stop offset="0.67" stopColor="#162833" stopOpacity="0.02"/>
        <stop offset="0.9" stopColor="#122938" stopOpacity="0.14"/><stop offset="1" stopColor="#102430" stopOpacity="0.44"/>
      </linearGradient>
      <linearGradient id={`${prefix}-handleGlaze`} x1="146" y1="-239" x2="284" y2="-126" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#829ca8"/><stop offset="0.24" stopColor="#e6ece7"/><stop offset="0.48" stopColor="#becdcf"/>
        <stop offset="0.67" stopColor="#647c88"/><stop offset="0.84" stopColor="#e0e7e3"/><stop offset="1" stopColor="#506c7b"/>
      </linearGradient>
      <linearGradient id={`${prefix}-rim`} x1="-85" y1="-340" x2="127" y2="-253" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#e1e9e8"/><stop offset="0.37" stopColor="#fffdf1"/><stop offset="0.7" stopColor="#c0cfd0"/><stop offset="1" stopColor="#78919e"/>
      </linearGradient>
      <linearGradient id={`${prefix}-inside`} x1="0" y1="-331" x2="0" y2="-250" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#314b59"/><stop offset="0.14" stopColor="#526e7d"/><stop offset="0.52" stopColor="#8098a2"/>
        <stop offset="0.91" stopColor="#b6c2c3"/><stop offset="1" stopColor="#bdc9c7"/>
      </linearGradient>
      <linearGradient id={`${prefix}-reflection`} x1="-109" y1="0" x2="-51" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0"/><stop offset="0.37" stopColor="#ffffff" stopOpacity="0.46"/>
        <stop offset="0.63" stopColor="#ffffff" stopOpacity="0.25"/><stop offset="1" stopColor="#ffffff" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id={`${prefix}-sideReflect`} x1="123" y1="0" x2="157" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#bdd6df" stopOpacity="0"/><stop offset="0.75" stopColor="#bfd8e1" stopOpacity="0.31"/><stop offset="1" stopColor="#bfd8e1" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id={`${prefix}-fracture`} x1="-160" y1="-300" x2="165" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#8b9a9b"/><stop offset="0.32" stopColor="#475d65"/><stop offset="0.74" stopColor="#81908f"/><stop offset="1" stopColor="#263e49"/>
      </linearGradient>
      <radialGradient id={`${prefix}-groundShadow`}><stop offset="0" stopColor="#000000" stopOpacity="0.72"/><stop offset="0.5" stopColor="#000000" stopOpacity="0.31"/><stop offset="1" stopColor="#000000" stopOpacity="0"/></radialGradient>
      <radialGradient id={`${prefix}-dust`}><stop offset="0" stopColor="#b3bdbe" stopOpacity="0.16"/><stop offset="0.65" stopColor="#859aa6" stopOpacity="0.055"/><stop offset="1" stopColor="#859aa6" stopOpacity="0"/></radialGradient>
      <filter id={`${prefix}-softShadow`} x="-60%" y="-200%" width="220%" height="500%"><feGaussianBlur stdDeviation="6"/></filter>
      <filter id={`${prefix}-dustSoft`} x="-40%" y="-120%" width="180%" height="340%"><feGaussianBlur stdDeviation="8"/></filter>
      <clipPath id={`${prefix}-bodyClip`}><path d={BODY}/></clipPath>
      <clipPath id={`${prefix}-silhouette`}><path d={BODY}/><path d={HANDLE}/><ellipse cx="0" cy="-289" rx="159" ry="51"/></clipPath>
      {pieces.map((piece) => <clipPath key={piece.index} id={`${prefix}-piece-${piece.index}`}><path d={polygonData(piece.polygon)}/></clipPath>)}
      <g id={`${prefix}-cup`}>
        <path d={HANDLE} fill={url('handleGlaze')} stroke="#b7c9cc" strokeWidth="0.65"/>
        <path d="M 162 -258 C 229 -279 265 -249 265 -192 C 263 -125 229 -85 157 -87" fill="none" stroke="#f2f2e7" strokeWidth="2.2" strokeOpacity="0.44"/>
        <path d="M 164 -232 C 223 -253 243 -232 243 -189 C 241 -134 211 -104 151 -107" fill="none" stroke="#253e4a" strokeWidth="2.7" strokeOpacity="0.55"/>
        <path d={BODY} fill={url('glaze')} stroke="#c2d1d3" strokeWidth="0.7"/>
        <g clipPath={url('bodyClip')}>
          <path d={BODY} fill={url('lowerShade')}/>
          <path d="M -107 -289 C -110 -220 -106 -111 -82 -36 L -47 -25 C -69 -108 -66 -215 -59 -300 Z" fill={url('reflection')}/>
          <path d="M 130 -281 C 130 -198 118 -78 93 -29 L 111 -21 C 145 -88 156 -208 158 -286 Z" fill={url('sideReflect')}/>
          <path d="M -154 -276 C -148 -171 -133 -64 -102 -24" fill="none" stroke="#ebf4f2" strokeWidth="1.6" strokeOpacity="0.58"/>
          <path d="M -112 -56 C -73 -18 59 -12 112 -51" fill="none" stroke="#bfd0d1" strokeWidth="0.9" strokeOpacity="0.17"/>
          <ellipse cx="2" cy="-5" rx="91" ry="13" fill="#233b47" opacity="0.13"/>
          <path d="M -99 -11 C -58 6 62 8 102 -13" fill="none" stroke="#d2dedd" strokeWidth="1.2" strokeOpacity="0.51"/>
        </g>
        <ellipse cx="0" cy="-289" rx="159" ry="51" fill={url('rim')} stroke="#d6e2df" strokeWidth="1.2"/>
        <ellipse cx="0" cy="-290" rx="146" ry="41" fill={url('inside')} stroke="#8ba1a9" strokeWidth="0.8"/>
        <path d="M -143 -294 C -121 -339 114 -338 144 -294" fill="none" stroke="#566f7b" strokeWidth="2.5" strokeOpacity="0.48"/>
        <path d="M -158 -289 C -137 -224 134 -222 159 -289" fill="none" stroke="#f8f8ec" strokeWidth="3.8" strokeOpacity="0.75"/>
        <path d="M -145 -289 C -124 -241 121 -238 145 -289" fill="none" stroke="#f0f2e8" strokeWidth="1.1" strokeOpacity="0.68"/>
        <path d="M -130 -310 C -71 -337 53 -337 115 -313" fill="none" stroke="#fffdf0" strokeWidth="1.4" strokeOpacity="0.85"/>
      </g>
    </defs>

    <ellipse cx="1468" cy="839" rx="263" ry="34" fill="#9cbfce" opacity="0.022"/>
    {intact ? <>
      <ellipse cx="1443" cy="836" rx={194 - 36 * falling} ry={27 - 7 * falling} fill={url('groundShadow')} opacity={0.42 + 0.4 * falling} filter={url('softShadow')}/>
      <g transform={`translate(1420 ${baseline}) rotate(${cupAngle})`}><use href={`#${prefix}-cup`}/></g>
    </> : <>
      {states.map((state) => <ellipse key={`shadow-${state.piece.index}`} cx={state.x + 9} cy={state.groundY + 5} rx={state.shadowWidth} ry="8.8" fill={url('groundShadow')} opacity={state.shadowOpacity} filter={url('softShadow')}/>)}
      <ellipse cx="1453" cy="824" rx={87 + Math.min(age, 2) * 89} ry={16 + Math.min(age, 2) * 10} fill={url('dust')} opacity={Math.exp(-age * 1.36)} filter={url('dustSoft')}/>
      {[...states].sort((a, b) => a.groundY - b.groundY).map(({piece, x, y, rotation, sx, sy}) => <g key={piece.index} transform={`translate(${x} ${y}) scale(1 ${sy}) rotate(${rotation * 180 / Math.PI}) scale(${sx} 1) translate(${-piece.center.x} ${-piece.center.y})`}>
        <g transform={`translate(${3.9 * soften(age / 0.13)} ${9.4 * soften(age / 0.13)})`} clipPath={url('silhouette')}>
          <path d={polygonData(piece.polygon)} fill={url('fracture')} stroke="#243e49" strokeWidth="1"/>
        </g>
        <g clipPath={url(`piece-${piece.index}`)}><use href={`#${prefix}-cup`}/></g>
        <g clipPath={url('silhouette')} opacity={soften(age / 0.16)}>
          <path d={polygonData(piece.polygon)} fill="none" stroke="#425963" strokeWidth="1.75"/>
          <path d={polygonData(piece.polygon)} transform="translate(-0.55 -0.55)" fill="none" stroke="#f4f3e6" strokeWidth="0.76" strokeOpacity="0.83"/>
        </g>
      </g>)}
      {Array.from({length: 43}, (_, i) => {
        const speedX = (random(i + 311) - 0.5) * 327;
        const speedY = -(102 + random(i + 348) * 289);
        const duration = -2 * speedY / 770;
        const a = Math.min(age, duration);
        const x = 1437 + speedX * a;
        const y = 827 + speedY * a + 385 * a ** 2;
        const fade = age < duration ? 0.56 * Math.exp(-age * 0.57) : 0.34 * Math.exp(-(age - duration) * 1.55);
        const size = 1.1 + random(i + 378) * 3.8;
        return <g key={`dust-${i}`} transform={`translate(${x} ${y}) rotate(${(i * 49 + age * speedX) % 360})`} opacity={fade}>
          <path d={`M ${-size} 0 L ${-size * 0.24} ${-size * 0.72} L ${size} ${-size * 0.18} L ${size * 0.42} ${size * 0.49} Z`} fill={i % 3 ? '#b8c7c8' : '#e5e8dd'} stroke="#dce4df" strokeWidth="0.35"/>
        </g>;
      })}
    </>}
  </svg>;
};
