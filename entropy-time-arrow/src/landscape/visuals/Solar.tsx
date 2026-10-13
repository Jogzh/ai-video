import {useCurrentFrame, useVideoConfig} from 'remotion';

const R = 470;
const TAU = Math.PI * 2;
const seeded = (n: number) => {
  const value = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};
const fixed = (n: number) => n.toFixed(2);

// The surface is built once; only its slow rotation and the active bands change per frame.
const granules = Array.from({length: 3850}, (_, i) => {
  const a = seeded(i * 7 + 19) * TAU;
  const r = Math.sqrt(seeded(i * 7 + 20)) * 467;
  const x = Math.cos(a) * r;
  const y = Math.sin(a) * r;
  const limb = Math.sqrt(Math.max(0.035, 1 - (r / R) ** 2));
  const direction = seeded(i * 7 + 21) * TAU;
  const size = 0.55 + seeded(i * 7 + 22) * 2.3;
  const dx = Math.cos(direction) * size * limb;
  const dy = Math.sin(direction) * size;
  const color = seeded(i * 7 + 23);
  const d = `M${fixed(x - dx)},${fixed(y - dy)} Q${fixed(x + dy * 0.7)},${fixed(y - dx * 0.8)} ${fixed(x + dx)},${fixed(y + dy)}`;
  return <path key={i} d={d} fill="none" stroke={color > 0.24 ? '#ffe5a2' : '#6f310e'}
    strokeWidth={0.35 + seeded(i * 7 + 24) * 0.8}
    opacity={color > 0.24 ? 0.19 + seeded(i * 7 + 25) * 0.32 : 0.05 + seeded(i * 7 + 25) * 0.07}/>;
});

const swirlPath = (cx: number, cy: number, radius: number, phase: number, turns: number, seed: number) => {
  const points: {x: number; y: number}[] = [];
  for (let j = 0; j <= 54; j++) {
    const fraction = j / 54;
    const angle = phase + fraction * turns;
    const r = radius * (0.23 + fraction * 0.77)
      * (1 + Math.sin(angle * 3.1 + seed) * 0.075 + Math.sin(angle * 7.3 - seed) * 0.025);
    points.push({x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r * 0.7});
  }
  let d = `M${fixed(points[0].x)},${fixed(points[0].y)}`;
  for (let j = 1; j < points.length - 1; j++) {
    const next = points[j + 1];
    d += ` Q${fixed(points[j].x)},${fixed(points[j].y)} ${fixed((points[j].x + next.x) / 2)},${fixed((points[j].y + next.y) / 2)}`;
  }
  return d;
};

const filamentFields = [
  {x: -206, y: -104, r: 145, phase: 1.15, bend: 2.8},
  {x: 88, y: 158, r: 161, phase: -2.7, bend: 2.5},
  {x: -88, y: -303, r: 115, phase: 0.2, bend: 2.8},
  {x: 305, y: -84, r: 142, phase: 1.9, bend: 2.1},
];

const fineFilaments = filamentFields.flatMap((field, region) => Array.from({length: 51}, (_, i) => {
  const seed = i + region * 101;
  const radius = field.r * (0.3 + seeded(seed * 3 + 2200) * 0.7);
  const phase = field.phase + seeded(seed * 3 + 2201) * 2.8;
  const d = swirlPath(field.x + seeded(seed + 88) * 15, field.y + seeded(seed + 39) * 10,
    radius, phase, field.bend, seed);
  return <path key={`${region}-${i}`} d={d} fill="none" stroke={i % 7 === 0 ? '#fff3cc' : '#ffb968'}
    strokeWidth={i % 7 === 0 ? 0.85 : 0.35 + seeded(seed + 90) * 0.4}
    strokeLinecap="round" opacity={i % 7 === 0 ? 0.24 : 0.05 + seeded(seed + 116) * 0.11}/>;
}));

const brightFilaments = Array.from({length: 31}, (_, i) => {
  const startX = -332 + seeded(i * 3 + 370) * 137;
  const startY = -242 + seeded(i * 3 + 371) * 119;
  const reach = 45 + seeded(i * 3 + 372) * 89;
  const d = `M${fixed(startX)},${fixed(startY)} C${fixed(startX + reach * 0.18)},${fixed(startY - 48)} ${fixed(startX + reach * 0.78)},${fixed(startY - 13)} ${fixed(startX + reach)},${fixed(startY + 19)} C${fixed(startX + reach * 1.13)},${fixed(startY + 52)} ${fixed(startX + reach * 0.96)},${fixed(startY + 71)} ${fixed(startX + reach * 1.19)},${fixed(startY + 79)}`;
  return <path key={i} d={d} fill="none" stroke={i % 5 === 0 ? '#fff5d1' : '#ffc277'}
    strokeWidth={i % 5 === 0 ? 1.05 : 0.5} opacity={i % 5 === 0 ? 0.65 : 0.28}
    strokeLinecap="round"/>;
});

const darkVortices = [
  'M-149,156 C-194,126 -191,82 -151,72 C-109,62 -79,94 -100,125 C-125,157 -151,145 -144,117 C-137,98 -116,103 -116,121',
  'M161,-168 C131,-198 160,-242 198,-224 C224,-212 224,-176 204,-165 C183,-153 165,-172 178,-190',
  'M248,248 C278,217 312,242 298,267 C280,294 254,276 270,259',
];

const prominencePaths = Array.from({length: 16}, (_, i) => {
  const startX = -351 + seeded(i * 4 + 640) * 38;
  const startY = -313 - seeded(i * 4 + 641) * 36;
  const tipX = -387 - seeded(i * 4 + 642) * 87;
  const tipY = -390 - seeded(i * 4 + 643) * 128;
  return `M${fixed(startX)},${fixed(startY)} C${fixed(startX - 34)},${fixed(startY - 19)} ${fixed(tipX - 24)},${fixed(tipY + 74)} ${fixed(tipX)},${fixed(tipY)} C${fixed(tipX + 5)},${fixed(tipY - 18)} ${fixed(tipX + 20)},${fixed(tipY - 24)} ${fixed(tipX + 29)},${fixed(tipY - 13)}`;
});

const prominenceBranches = Array.from({length: 7}, (_, i) => {
  const x = -376 - seeded(i * 3 + 760) * 20;
  const y = -362 - seeded(i * 3 + 761) * 29;
  const reach = 24 + seeded(i * 3 + 762) * 47;
  return `M${fixed(x)},${fixed(y)} C${fixed(x - 29)},${fixed(y - 7)} ${fixed(x - reach)},${fixed(y - 42)} ${fixed(x - reach - 8)},${fixed(y - 72)}`;
});

const quietCorona = Array.from({length: 72}, (_, i) => {
  const a = seeded(i * 5 + 4990) * TAU;
  const r = 478 + seeded(i * 5 + 4991) * 27;
  const x = Math.cos(a) * r;
  const y = Math.sin(a) * r;
  const length = 5 + seeded(i * 5 + 4992) * 20;
  const b = a + 0.16 + seeded(i * 5 + 4993) * 0.08;
  const d = `M${fixed(x)},${fixed(y)} Q${fixed(Math.cos(a + 0.06) * (r + length))},${fixed(Math.sin(a + 0.06) * (r + length))} ${fixed(Math.cos(b) * (r + length * 0.26))},${fixed(Math.sin(b) * (r + length * 0.26))}`;
  return <path key={i} d={d} fill="none" stroke="#f9b366" opacity={0.02 + seeded(i * 5 + 4994) * 0.055}
    strokeWidth={0.6} strokeLinecap="round"/>;
});

export const Solar = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps;
  const rotation = time * 0.23;
  const activity = 0.76 + Math.sin(time * 0.65 - 0.6) * 0.12;

  return <svg viewBox="0 0 1920 1080" width="1920" height="1080"
    style={{position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden'}}>
    <defs>
      <clipPath id="solar-disc"><circle r={R}/></clipPath>
      <radialGradient id="solar-base" cx="29%" cy="29%" r="78%">
        <stop offset="0" stopColor="#ffe4a7"/>
        <stop offset="0.21" stopColor="#f5b56b"/>
        <stop offset="0.47" stopColor="#d46c2b"/>
        <stop offset="0.74" stopColor="#ae4f1e"/>
        <stop offset="0.93" stopColor="#602c14"/>
        <stop offset="1" stopColor="#d77529"/>
      </radialGradient>
      <radialGradient id="solar-hotspot" cx="39%" cy="29%" r="69%">
        <stop offset="0" stopColor="#fff0c2" stopOpacity="0.47"/>
        <stop offset="0.35" stopColor="#ffa64a" stopOpacity="0.1"/>
        <stop offset="0.68" stopColor="#3b1408" stopOpacity="0.15"/>
        <stop offset="1" stopColor="#170f0b" stopOpacity="0.39"/>
      </radialGradient>
      <radialGradient id="solar-corona">
        <stop offset="0.71" stopColor="#e67b32" stopOpacity="0"/>
        <stop offset="0.835" stopColor="#f18f41" stopOpacity="0.035"/>
        <stop offset="0.87" stopColor="#ffb864" stopOpacity="0.12"/>
        <stop offset="0.915" stopColor="#d56323" stopOpacity="0.035"/>
        <stop offset="1" stopColor="#c66f32" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="solar-spot">
        <stop offset="0" stopColor="#241109" stopOpacity="0.84"/>
        <stop offset="0.25" stopColor="#3c1b0b" stopOpacity="0.65"/>
        <stop offset="0.58" stopColor="#7d350f" stopOpacity="0.22"/>
        <stop offset="1" stopColor="#8b411c" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="solar-limb">
        <stop offset="0.945" stopColor="#ffb962" stopOpacity="0"/>
        <stop offset="0.985" stopColor="#ffb962" stopOpacity="0.04"/>
        <stop offset="0.998" stopColor="#ffe1a0" stopOpacity="0.35"/>
        <stop offset="1" stopColor="#fff2ca" stopOpacity="0.76"/>
      </radialGradient>
      <linearGradient id="solar-edge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff3ce" stopOpacity="0.88"/>
        <stop offset="0.45" stopColor="#ffd184" stopOpacity="0.55"/>
        <stop offset="0.76" stopColor="#e0a267" stopOpacity="0.12"/>
        <stop offset="1" stopColor="#eea153" stopOpacity="0.36"/>
      </linearGradient>
      <filter id="solar-photosphere" x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.105 0.13" numOctaves="3" seed="37" result="granulation"/>
        <feColorMatrix in="granulation" type="saturate" values="0" result="grain"/>
        <feComponentTransfer in="grain" result="thermal">
          <feFuncR type="table" tableValues="0.055 0.28 0.86 1 1"/>
          <feFuncG type="table" tableValues="0.012 0.075 0.43 0.8 0.98"/>
          <feFuncB type="table" tableValues="0.003 0.014 0.075 0.32 0.75"/>
          <feFuncA type="table" tableValues="1 1"/>
        </feComponentTransfer>
        <feDiffuseLighting in="grain" surfaceScale="0.35" diffuseConstant="1.02" lightingColor="#fff0c7" result="microRelief">
          <feDistantLight azimuth="224" elevation="78"/>
        </feDiffuseLighting>
        <feBlend in="thermal" in2="microRelief" mode="soft-light" result="luminousGrain"/>
        <feBlend in="luminousGrain" in2="SourceGraphic" mode="multiply" result="surface"/>
        <feComposite in="surface" in2="SourceGraphic" operator="in"/>
      </filter>
      <filter id="solar-active-field" x="-12%" y="-12%" width="124%" height="124%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.014 0.017" numOctaves="2" seed="8" result="motion"/>
        <feDisplacementMap in="SourceGraphic" in2="motion" scale="9" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="solar-prominence-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.4"/>
      </filter>
      <filter id="solar-fibre-glow" x="-8%" y="-8%" width="116%" height="116%">
        <feGaussianBlur stdDeviation="2.2"/>
      </filter>
    </defs>

    <g transform="translate(1570 560)">
      <circle r="543" fill="url(#solar-corona)" opacity={0.86 + Math.sin(time * 0.41) * 0.06}/>
      <g transform={`rotate(${rotation * 0.7})`}>
        {quietCorona}
        <g opacity={activity}>
          <g filter="url(#solar-prominence-glow)" fill="none" stroke="#ed963e" strokeWidth="3.2" opacity="0.24">
            {prominencePaths.map((d, i) => <path key={i} d={d}/>)}
          </g>
          {prominencePaths.map((d, i) => <g key={i} opacity={0.31 + Math.sin(time * 0.5 + i * 1.9) * 0.12}>
            <path d={d} fill="none" stroke={i % 5 === 0 ? '#ffe1a4' : '#ffb75e'} strokeWidth={i % 5 === 0 ? 1.05 : 0.58}/>
          </g>)}
          <g fill="none" stroke="#ffbf70" strokeWidth="0.45" opacity="0.24">
            {prominenceBranches.map((d, i) => <path key={i} d={d}/>)}
          </g>
        </g>
      </g>

      <g clipPath="url(#solar-disc)">
        <g transform={`rotate(${rotation})`}>
          <circle r={R} fill="url(#solar-base)"/>
          <circle r={R} fill="url(#solar-base)" filter="url(#solar-photosphere)" opacity="0.93"/>
          <g>{granules}</g>
          <g filter="url(#solar-active-field)">
            <ellipse cx="-145" cy="117" rx="70" ry="53" fill="url(#solar-spot)" transform="rotate(-23 -145 117)"/>
            <ellipse cx="191" cy="-195" rx="39" ry="29" fill="url(#solar-spot)" transform="rotate(31 191 -195)"/>
            <ellipse cx="282" cy="262" rx="38" ry="27" fill="url(#solar-spot)"/>
            <g fill="none" stroke="#61280d" strokeWidth="1.05" opacity="0.23">
              {darkVortices.map((d, i) => <path key={i} d={d}/>)}
            </g>
            <g>{fineFilaments}</g>
          </g>
          <g opacity={activity * 0.66} filter="url(#solar-fibre-glow)">{brightFilaments}</g>
          <g opacity={activity}>{brightFilaments}</g>
          <circle r={R} fill="url(#solar-hotspot)"/>
        </g>
        <circle r={R} fill="url(#solar-limb)"/>
      </g>
      <circle r="469.4" fill="none" stroke="url(#solar-edge)" strokeWidth="1.35"/>
      <path d="M-407,-234 A469.5,469.5 0 0 1 -235,-407" fill="none" stroke="#ffe5ae" strokeWidth="2.2" opacity="0.46"/>
      <path d="M-457,-105 A469.5,469.5 0 0 1 -429,-190" fill="none" stroke="#fff0c4" strokeWidth="1.4" opacity="0.45"/>
    </g>
  </svg>;
};
