import {useLayoutEffect, useRef} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';

export type Painter = (ctx: CanvasRenderingContext2D, time: number) => void;
export const W = 1080;
export const H = 1920;
export const TAU = Math.PI * 2;
export const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
export const smooth = (v: number) => {const p = clamp(v); return p*p*(3-2*p);};
export const rand = (n: number) => {const s = Math.sin(n*127.1+311.7)*43758.5453123; return s-Math.floor(s);};
export const mix = (a: number, b: number, t: number) => a+(b-a)*t;
export const glow = (ctx: CanvasRenderingContext2D, x:number, y:number, r:number, color:string, alpha=1) => {
  ctx.save(); ctx.globalAlpha=alpha;
  const g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();
};
export const VisualCanvas = ({paint}: {paint: Painter}) => {
  const ref=useRef<HTMLCanvasElement>(null);
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  useLayoutEffect(() => {
    const ctx=ref.current?.getContext('2d'); if(!ctx)return;
    ctx.clearRect(0,0,W,H);ctx.save();paint(ctx,frame/fps);ctx.restore();
  },[frame,fps,paint]);
  return <canvas ref={ref} width={W} height={H} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/>;
};
