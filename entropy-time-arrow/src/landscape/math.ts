export const TAU=Math.PI*2;
export const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export const smooth=(n:number)=>{const p=clamp(n);return p*p*(3-2*p);};
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export const rand=(seed:number)=>{const n=Math.sin(seed*127.1+311.7)*43758.5453123;return n-Math.floor(n);};
export const path=(points:{x:number;y:number}[])=>points.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
