import {useId, useMemo} from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

type Point = {x: number; y: number};
type LivingProps = {kind: 'rings' | 'human'};
const TAU = Math.PI * 2;
const fraction = (value: number) => value - Math.floor(value);
const noise = (seed: number) => fraction(Math.sin(seed * 127.1 + 311.7) * 43758.5453);
const round = (value: number) => value.toFixed(2);
const easing = Easing.bezier(0.16, 1, 0.3, 1);

const curvePoint = (a: Point, b: Point, c: Point, d: Point, t: number): Point => {
  const q = 1 - t;
  return {
    x: q ** 3 * a.x + 3 * q * q * t * b.x + 3 * q * t * t * c.x + t ** 3 * d.x,
    y: q ** 3 * a.y + 3 * q * q * t * b.y + 3 * q * t * t * c.y + t ** 3 * d.y,
  };
};

// The centre migrates as the tree grows; the wound bends nearby growth lines.
const woodPoint = (radius: number, angle: number, variation = 0): Point => {
  const r = radius;
  const wrapped = Math.atan2(Math.sin(angle + 0.92), Math.cos(angle + 0.92));
  const wound = Math.exp(-wrapped * wrapped / 0.071) * Math.exp(-((r - 0.66) ** 2) / 0.038);
  const contour = 1 + 0.035 * Math.sin(angle * 2 - 0.8)
    + 0.022 * Math.sin(angle * 3 + 0.6) + 0.013 * Math.sin(angle * 7 + 0.4)
    + 0.007 * Math.sin(angle * 13 + r * 9)
    + variation * (0.36 * Math.sin(angle * 17 + r * 41) + 0.2 * Math.cos(angle * 23 - r * 17));
  const rr = r * contour + wound * 0.055;
  return {
    x: 1430 - 43 * (1 - r) + 339 * rr * Math.cos(angle) + 7 * r * Math.sin(angle * 4),
    y: 535 + 36 * (1 - r) + 354 * rr * Math.sin(angle) + 9 * r * Math.cos(angle * 3),
  };
};

const woodPath = (radius: number, variation = 0, start = -Math.PI / 2): string => {
  const points = Array.from({length: 193}, (_, i) => woodPoint(radius, start + i / 192 * TAU, variation));
  return points.map((point, i) => `${i ? 'L' : 'M'}${round(point.x)} ${round(point.y)}`).join(' ') + ' Z';
};

const makeWood = () => {
  const widths = Array.from({length: 56}, (_, i) => 0.009 + noise(i + 30) * 0.014 + (i % 9 === 0 ? 0.009 : 0));
  const total = widths.reduce((sum, value) => sum + value, 0);
  let cumulative = 0.028;
  const rings = widths.map((width, i) => {
    cumulative += width / total * 0.91;
    return {r: cumulative, d: woodPath(cumulative, 0.004 + noise(i + 80) * 0.006), dark: i % 4 === 0};
  });
  const pores = Array.from({length: 480}, (_, i) => {
    const angle = noise(i * 4 + 502) * TAU;
    const p = woodPoint(0.065 + Math.sqrt(noise(i * 4 + 503)) * 0.885, angle);
    return {...p, angle, width: 0.45 + noise(i * 4 + 504) * 1.0, height: 0.65 + noise(i * 4 + 505) * 2.0};
  });
  const fibres = Array.from({length: 160}, (_, i) => {
    const angle = noise(i * 4 + 1210) * TAU;
    const radius = 0.07 + noise(i * 4 + 1211) * 0.75;
    const a = woodPoint(radius, angle);
    const b = woodPoint(radius + 0.025 + noise(i * 4 + 1212) * 0.14, angle + 0.01 * Math.sin(i));
    return `M${round(a.x)} ${round(a.y)} Q${round((a.x + b.x) / 2 + 2)} ${round((a.y + b.y) / 2 - 3)} ${round(b.x)} ${round(b.y)}`;
  });
  const bark = Array.from({length: 90}, (_, i) => {
    const angle = i / 90 * TAU;
    const width = 0.025 + noise(i + 600) * 0.025;
    const p = [woodPoint(0.979 + noise(i + 610) * 0.021, angle),
      woodPoint(1.025 + noise(i + 620) * 0.018, angle + 0.009),
      woodPoint(1.027 + noise(i + 630) * 0.014, angle + width),
      woodPoint(0.982, angle + width + 0.011)];
    return p.map((point, index) => `${index ? 'L' : 'M'}${round(point.x)} ${round(point.y)}`).join(' ') + ' Z';
  });
  const cracks = [-2.73, -1.73, -0.22, 0.83, 1.64, 2.53].map((angle, i) => {
    const a = woodPoint(1.006, angle);
    const b = woodPoint(0.88 - noise(i + 800) * 0.06, angle + 0.016);
    const c = woodPoint(0.72 - noise(i + 810) * 0.16, angle - 0.037);
    const d = woodPoint(0.65 - noise(i + 820) * 0.09, angle + 0.029);
    const branch = woodPoint(0.76, angle + 0.1);
    return {
      d: `M${round(a.x)} ${round(a.y)} L${round(b.x)} ${round(b.y)} L${round(c.x)} ${round(c.y)} L${round(d.x)} ${round(d.y)}`,
      branch: `M${round(b.x)} ${round(b.y)} L${round(branch.x)} ${round(branch.y)}`,
      width: 1.8 + noise(i + 830) * 2.5,
    };
  });
  return {rings, pores, fibres, bark, cracks};
};

const Wood = ({id, frame, fps}: {id: string; frame: number; fps: number}) => {
  const wood = useMemo(makeWood, []);
  const progress = interpolate(frame, [0.6 * fps, 5.55 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tip = woodPoint(0.969, -Math.PI / 2 + progress * TAU);
  const tipOpacity = interpolate(frame, [0.25 * fps, 0.8 * fps, 5.45 * fps, 6.2 * fps], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <g opacity={interpolate(frame, [0, 1.1 * fps], [0.4, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing})}>
    <defs>
      <radialGradient id={`${id}-wood`} cx="37%" cy="38%" r="71%">
        <stop offset="0" stopColor="#887556"/>
        <stop offset="0.31" stopColor="#776445"/>
        <stop offset="0.64" stopColor="#645138"/>
        <stop offset="0.91" stopColor="#453b2b"/>
        <stop offset="1" stopColor="#241e19"/>
      </radialGradient>
      <linearGradient id={`${id}-cut-light`} x1="1110" y1="240" x2="1720" y2="835" gradientUnits="userSpaceOnUse">
        <stop stopColor="#e2cc9a" stopOpacity="0.19"/>
        <stop offset="0.4" stopColor="#a89870" stopOpacity="0.04"/>
        <stop offset="1" stopColor="#000000" stopOpacity="0.25"/>
      </linearGradient>
      <radialGradient id={`${id}-grain-glow`}>
        <stop stopColor="#ffebbf" stopOpacity="0.92"/>
        <stop offset="0.13" stopColor="#eaca83" stopOpacity="0.63"/>
        <stop offset="0.45" stopColor="#c9a363" stopOpacity="0.12"/>
        <stop offset="1" stopColor="#c9a363" stopOpacity="0"/>
      </radialGradient>
      <clipPath id={`${id}-wood-clip`}><path d={woodPath(0.993)}/></clipPath>
    </defs>
    <path d={woodPath(1.038, 0.012)} fill="#181a19" stroke="#b7a178" strokeOpacity="0.09" strokeWidth="1.4"/>
    {wood.bark.map((d, i) => <path key={`b${i}`} d={d} fill={i % 3 ? '#312c22' : '#504331'} stroke="#9b825b" strokeWidth="0.7" strokeOpacity={0.08 + noise(i + 900) * 0.16}/>) }
    <path d={woodPath(0.993)} fill={`url(#${id}-wood)`}/>
    <g clipPath={`url(#${id}-wood-clip)`}>
      {wood.rings.map((ring, i) => <g key={`r${i}`}>
        <path d={ring.d} fill="none" stroke={ring.dark ? '#271e16' : '#37291c'} strokeWidth={ring.dark ? 2.5 : 1.0 + noise(i + 250) * 1.0} opacity={ring.dark ? 0.42 : 0.38}/>
        <path d={woodPath(ring.r - 0.0036, 0.003)} fill="none" stroke="#cab18b" strokeWidth="0.62" opacity={0.16 + noise(i + 290) * 0.17}/>
        {i % 7 === 0 ? <path d={woodPath(ring.r + 0.0065, 0.003)} fill="none" stroke="#b4986d" strokeWidth="3.5" opacity="0.045"/> : null}
      </g>)}
      {wood.fibres.map((d, i) => <path key={`f${i}`} d={d} fill="none" stroke={i % 3 ? '#d1bd92' : '#171a17'} strokeWidth={i % 3 ? 0.75 : 0.5} opacity={i % 3 ? 0.065 : 0.13}/>)}
      {wood.pores.map((p, i) => <ellipse key={`p${i}`} cx={p.x} cy={p.y} rx={p.width} ry={p.height} transform={`rotate(${p.angle * 180 / Math.PI + 90} ${p.x} ${p.y})`} fill={i % 5 ? '#282b20' : '#d5bb91'} opacity={i % 5 ? 0.2 : 0.11}/>)}
      <path d="M1513 313 C1532 296 1560 304 1568 327 C1577 349 1568 381 1544 390 C1525 394 1511 375 1509 354 C1506 336 1504 324 1513 313 Z" fill="#342d22" opacity="0.76"/>
      <path d="M1521 322 C1538 309 1555 321 1558 339 C1561 361 1552 378 1539 380 C1523 378 1517 365 1517 348 C1516 337 1517 329 1521 322 Z" fill="none" stroke="#b59864" strokeWidth="1.2" opacity="0.46"/>
      <path d="M1529 332 C1543 323 1551 337 1549 351 C1548 365 1541 370 1534 365 C1527 359 1524 342 1529 332 Z" fill="#1f211b" opacity="0.7"/>
      <path d="M1517 309 L1530 280 L1528 263 M1565 356 L1590 372 L1615 379" fill="none" stroke="#25271e" strokeWidth="2.1" opacity="0.5"/>
      <path d={woodPath(0.025, 0.024)} fill="#342b22" stroke="#ba9e73" strokeWidth="0.7" strokeOpacity="0.42"/>
      <path d={woodPath(0.061, 0.008)} fill="none" stroke="#403222" strokeWidth="2.3" opacity="0.52"/>
      {wood.cracks.map((crack, i) => <g key={`c${i}`}>
        <path d={crack.d} fill="none" stroke="#171c18" strokeWidth={crack.width} strokeLinecap="round"/>
        <path d={crack.branch} fill="none" stroke="#1b201a" strokeWidth="1.25"/>
        <path d={crack.d} fill="none" stroke="#c2a273" strokeWidth="0.6" opacity="0.25" transform="translate(1.7 -1)"/>
      </g>)}
      <path d={woodPath(0.993)} fill={`url(#${id}-cut-light)`}/>
      <path d={woodPath(0.969)} pathLength="1000" fill="none" stroke="#c7a773" strokeWidth="1.1" opacity="0.9" strokeDasharray="1000" strokeDashoffset={1000 * (1 - progress)} strokeLinecap="round"/>
      <path d={woodPath(0.979)} fill="none" stroke="#ab8d5a" strokeWidth="0.7" opacity={interpolate(frame, [4.7 * fps, 6.2 * fps], [0, 0.38], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}/>
    </g>
    <circle cx={tip.x} cy={tip.y} r="39" fill={`url(#${id}-grain-glow)`} opacity={tipOpacity}/>
    <circle cx={tip.x} cy={tip.y} r="2.1" fill="#f9e8bb" opacity={tipOpacity * 0.86}/>
    <path d={woodPath(1.025, 0.004)} fill="none" stroke="#c8b17e" strokeWidth="0.8" opacity="0.15"/>
  </g>;
};

// A hand-drawn left-facing profile, with a quiet eye and a sculptural shoulder.
const portrait = 'M1560 183 C1490 142 1430 146 1384 193 C1354 226 1346 265 1341 300 C1336 326 1322 340 1307 354 C1300 364 1293 374 1281 386 C1273 394 1268 405 1275 414 C1284 424 1305 423 1322 427 C1324 444 1314 453 1312 461 C1314 469 1325 472 1334 475 C1324 481 1317 488 1320 495 C1324 506 1339 509 1352 513 C1355 542 1372 568 1403 580 C1435 594 1461 586 1488 568 C1494 628 1474 675 1440 707 C1397 746 1315 761 1240 792 C1161 824 1104 870 1069 936 L1778 936 C1760 843 1690 795 1631 773 C1570 749 1550 701 1560 651 C1572 604 1603 573 1625 522 C1665 439 1662 351 1634 276 C1621 239 1592 206 1560 183 Z';
const rim = 'M1560 183 C1490 142 1430 146 1384 193 C1354 226 1346 265 1341 300 C1336 326 1322 340 1307 354 C1300 364 1293 374 1281 386 C1273 394 1268 405 1275 414 C1284 424 1305 423 1322 427 C1324 444 1314 453 1312 461 C1314 469 1325 472 1334 475 C1324 481 1317 488 1320 495 C1324 506 1339 509 1352 513 C1355 542 1372 568 1403 580 C1435 594 1461 586 1488 568 C1494 628 1474 675 1440 707 C1397 746 1315 761 1240 792 C1161 824 1104 870 1069 936';

const Human = ({id, frame, fps}: {id: string; frame: number; fps: number}) => {
  const seconds = frame / fps;
  const breathe = 1 + Math.sin(seconds * 0.95 - 0.35) * 0.075;
  const appear = interpolate(frame, [0, 1.4 * fps], [0.24, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
  const grain = useMemo(() => Array.from({length: 245}, (_, i) => ({
    x: 1110 + noise(i * 4 + 2100) * 585,
    y: 176 + noise(i * 4 + 2101) * 755,
    width: 0.5 + noise(i * 4 + 2102) * 2,
    height: 0.3 + noise(i * 4 + 2103) * 0.8,
  })), []);
  return <g opacity={appear}>
    <defs>
      <linearGradient id={`${id}-sculpture`} x1="1240" y1="385" x2="1720" y2="700" gradientUnits="userSpaceOnUse">
        <stop stopColor="#5c625c"/>
        <stop offset="0.2" stopColor="#3a4644"/>
        <stop offset="0.49" stopColor="#222f31"/>
        <stop offset="1" stopColor="#101b20"/>
      </linearGradient>
      <linearGradient id={`${id}-edge`} x1="1195" y1="510" x2="1570" y2="775" gradientUnits="userSpaceOnUse">
        <stop stopColor="#e4cfa4" stopOpacity="0.95"/>
        <stop offset="0.43" stopColor="#c5a77a" stopOpacity="0.63"/>
        <stop offset="1" stopColor="#a4855e" stopOpacity="0"/>
      </linearGradient>
      <radialGradient id={`${id}-cheek`}>
        <stop stopColor="#b2ad91" stopOpacity="0.25"/>
        <stop offset="0.62" stopColor="#a6ab95" stopOpacity="0.05"/>
        <stop offset="1" stopColor="#8d998e" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id={`${id}-forehead`} x1="1320" y1="230" x2="1457" y2="478" gradientUnits="userSpaceOnUse">
        <stop stopColor="#bcb693" stopOpacity="0.25"/>
        <stop offset="0.46" stopColor="#9d9f89" stopOpacity="0.05"/>
        <stop offset="1" stopColor="#bec0a5" stopOpacity="0.15"/>
      </linearGradient>
      <radialGradient id={`${id}-warm-pulse`}>
        <stop stopColor="#c7af7a" stopOpacity="0.38"/>
        <stop offset="0.25" stopColor="#9e855e" stopOpacity="0.12"/>
        <stop offset="1" stopColor="#d5b273" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id={`${id}-base-fade`} x1="0" y1="700" x2="0" y2="948" gradientUnits="userSpaceOnUse">
        <stop stopColor="white"/>
        <stop offset="0.57" stopColor="white"/>
        <stop offset="1" stopColor="black"/>
      </linearGradient>
      <filter id={`${id}-rim-soft`} x="-30%" y="-10%" width="160%" height="130%"><feGaussianBlur stdDeviation="4.5"/></filter>
      <filter id={`${id}-shadow-soft`}><feGaussianBlur stdDeviation="10"/></filter>
      <clipPath id={`${id}-portrait-clip`}><path d={portrait}/></clipPath>
      <mask id={`${id}-portrait-mask`}><path d={portrait} fill={`url(#${id}-base-fade)`}/></mask>
    </defs>

    <g mask={`url(#${id}-portrait-mask)`}>
      <path d={portrait} fill={`url(#${id}-sculpture)`}/>
      <g clipPath={`url(#${id}-portrait-clip)`}>
        <path d="M1384 193 C1348 265 1348 332 1323 374 C1339 404 1368 426 1375 477 C1387 530 1433 556 1478 555 C1425 572 1376 556 1352 513 C1301 490 1336 451 1322 427 C1291 418 1266 411 1281 386 C1329 329 1346 242 1384 193 Z" fill={`url(#${id}-forehead)`}/>
        <ellipse cx="1442" cy="446" rx="113" ry="157" fill={`url(#${id}-cheek)`} transform="rotate(-17 1442 446)"/>
        <ellipse cx="1401" cy="360" rx="71" ry="24" fill="#0b171c" opacity="0.23" filter={`url(#${id}-shadow-soft)`}/>
        <path d="M1520 585 C1515 628 1492 692 1450 730 C1418 751 1401 778 1391 829 C1458 763 1514 734 1550 734 C1531 676 1545 628 1560 583 Z" fill="#070f14" opacity="0.24"/>
        <path d="M1478 575 C1480 626 1459 672 1423 709 C1392 738 1346 755 1300 779 C1366 768 1446 733 1481 690 C1505 649 1507 610 1501 579 Z" fill="#b8b399" opacity="0.1"/>
        <path d="M1209 829 C1296 784 1373 775 1441 793 C1491 808 1537 822 1580 809" fill="none" stroke="#a0a795" strokeWidth="12" strokeLinecap="round" opacity="0.06" filter={`url(#${id}-rim-soft)`}/>
        <path d="M1226 824 C1302 790 1374 789 1433 803 C1474 813 1507 819 1534 816" fill="none" stroke="#c1b89c" strokeWidth="1.2" opacity="0.23"/>
        <path d="M1441 794 C1462 770 1494 750 1523 751 C1542 752 1562 765 1577 780" fill="none" stroke="#091419" strokeWidth="10" opacity="0.3" filter={`url(#${id}-rim-soft)`}/>
        <ellipse cx="1433" cy="781" rx={82 * breathe} ry={99 * breathe} fill={`url(#${id}-warm-pulse)`} opacity="0.7"/>
        {grain.map((p, i) => <ellipse key={i} cx={p.x} cy={p.y} rx={p.width} ry={p.height} fill={i % 3 ? '#c8c8b4' : '#060d11'} opacity={i % 3 ? 0.07 : 0.16}/>)}
      </g>
      <path d={rim} fill="none" stroke={`url(#${id}-edge)`} strokeWidth="10" opacity="0.26" filter={`url(#${id}-rim-soft)`}/>
      <path d={rim} fill="none" stroke={`url(#${id}-edge)`} strokeWidth="1.9" opacity="0.85"/>
      <path d="M1343 325 C1361 315 1381 318 1397 326" fill="none" stroke="#bec0a5" strokeWidth="1.9" strokeLinecap="round" opacity="0.21"/>
      <path d="M1340 346 C1358 352 1379 352 1396 344" fill="none" stroke="#111d20" strokeWidth="3.5" strokeLinecap="round" opacity="0.82"/>
      <path d="M1342 350 C1359 355 1378 355 1392 350" fill="none" stroke="#b8b49a" strokeWidth="0.9" strokeLinecap="round" opacity="0.26"/>
      <path d="M1328 365 C1327 384 1333 406 1346 418" fill="none" stroke="#a3a58f" strokeWidth="1" opacity="0.23"/>
      <path d="M1290 416 C1300 419 1315 419 1326 424" fill="none" stroke="#141e20" strokeWidth="2.2" opacity="0.85"/>
      <path d="M1321 474 C1334 475 1346 479 1360 477" fill="none" stroke="#131d20" strokeWidth="2.4" strokeLinecap="round" opacity="0.94"/>
      <path d="M1326 488 C1338 491 1349 492 1359 487" fill="none" stroke="#ada48b" strokeWidth="1.1" opacity="0.27"/>
      <path d="M1365 527 C1396 561 1434 574 1462 565" fill="none" stroke="#a7af9c" strokeWidth="1" opacity="0.16"/>
      <path d="M1538 350 C1561 331 1580 351 1578 384 C1576 414 1562 441 1546 443 C1532 442 1528 426 1533 414" fill="none" stroke="#869b92" strokeWidth="1.8" opacity="0.3"/>
      <path d="M1540 367 C1554 350 1569 366 1563 388 C1559 401 1546 401 1544 416" fill="none" stroke="#111d22" strokeWidth="3" opacity="0.8"/>
      <path d="M1550 389 C1540 386 1537 393 1542 402" fill="none" stroke="#b3b3a0" strokeWidth="1" opacity="0.19"/>
      <path d="M1613 284 C1637 347 1644 416 1624 479" fill="none" stroke="#91a59e" strokeWidth="0.85" opacity="0.11"/>
    </g>

    {/* Incoming light remains outside the text area and enters the shoulder. */}
    {Array.from({length: 14}, (_, i) => {
      const s = noise(i + 3200);
      const t = fraction(seconds * (0.125 + noise(i + 3210) * 0.02) + s);
      const a = {x: 989 + noise(i + 3220) * 70, y: 550 + noise(i + 3230) * 275};
      const b = {x: 1145, y: a.y - 34};
      const c = {x: 1295, y: 806 + noise(i + 3240) * 25};
      const d = {x: 1431, y: 780 + noise(i + 3250) * 23};
      const p = curvePoint(a, b, c, d, t);
      const tail = curvePoint(a, b, c, d, Math.max(0, t - 0.044));
      const opacity = Math.sin(Math.PI * t) * (0.43 + noise(i + 3260) * 0.36);
      return <g key={`in${i}`} opacity={opacity}>
        <path d={`M${tail.x} ${tail.y} L${p.x} ${p.y}`} stroke="#d0c6a0" strokeWidth="0.85" opacity="0.42"/>
        <circle cx={p.x} cy={p.y} r={1.1 + noise(i + 3270) * 1.6} fill="#ddd7b5"/>
      </g>;
    })}

    {/* Many smaller, warmer particles disperse behind the body. */}
    {Array.from({length: 105}, (_, i) => {
      const s = noise(i + 4100);
      const t = fraction(seconds * (0.095 + noise(i + 4110) * 0.064) + s);
      const a = {x: 1540 + noise(i + 4120) * 48, y: 704 + noise(i + 4130) * 106};
      const b = {x: 1660 + noise(i + 4140) * 35, y: a.y - 44 + noise(i + 4150) * 88};
      const d = {x: 1762 + noise(i + 4160) * 100, y: 480 + noise(i + 4170) * 455};
      const c = {x: d.x - 69, y: d.y - 50 + noise(i + 4180) * 100};
      const p = curvePoint(a, b, c, d, t);
      const tail = curvePoint(a, b, c, d, Math.max(0, t - 0.022));
      const opacity = Math.sin(Math.PI * t) * (0.19 + noise(i + 4190) * 0.35);
      return <g key={`out${i}`} opacity={opacity}>
        <path d={`M${tail.x} ${tail.y} L${p.x} ${p.y}`} stroke="#b09264" strokeWidth="0.65" opacity="0.31"/>
        <circle cx={p.x} cy={p.y} r={0.62 + noise(i + 4200) * 1.08} fill={i % 4 ? '#bb9463' : '#c7b48a'}/>
      </g>;
    })}
  </g>;
};

export const Living = ({kind}: LivingProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const unique = useId().replace(/:/g, '');
  const id = `living-${unique}-${kind}`;
  return <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible'}} xmlns="http://www.w3.org/2000/svg">
    {kind === 'rings' ? <Wood id={id} frame={frame} fps={fps}/> : <Human id={id} frame={frame} fps={fps}/>}
  </svg>;
};
