import React,{useId} from 'react';
import {AbsoluteFill,Easing,interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {serif,sans} from '../design';
import {rand} from './math';
export const palette={ink:'#080d13',paper:'#eee5d5',gold:'#d1a46a',blue:'#a7bdc7',muted:'#86918e'};
export const Stage=({children,warm=false}: {children:React.ReactNode;warm?:boolean})=>{
 const id=useId().replace(/:/g,'');
 return <AbsoluteFill style={{background:palette.ink,color:palette.paper,fontFamily:serif,overflow:'hidden'}}>
  <svg viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,width:'100%',height:'100%'}} aria-hidden="true">
   <defs>
    <radialGradient id={`${id}-space`} cx="75%" cy="52%" r="68%"><stop stopColor={warm?'#302018':'#172731'} stopOpacity=".45"/><stop offset="1" stopColor={palette.ink} stopOpacity="0"/></radialGradient>
    <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="2" seed="7"/><feColorMatrix type="saturate" values="0"/></filter>
    <pattern id={`${id}-texture`} width="150" height="150" patternUnits="userSpaceOnUse"><rect width="150" height="150" filter={`url(#${id}-grain)`} opacity=".09"/></pattern>
   </defs>
   <rect width="1920" height="1080" fill={`url(#${id}-space)`}/>
   {Array.from({length:86},(_,i)=><circle key={i} cx={rand(i+420)*1920} cy={rand(i+901)*1080} r={.4+rand(i+381)*.65} fill="#d6dcd8" opacity={.035+rand(i+124)*.09}/>)}
   <rect width="1920" height="1080" fill={`url(#${id}-texture)`} opacity=".24"/>
  </svg>
  {children}
 </AbsoluteFill>;
};
export const Heading=({children,warm=false}: {children:React.ReactNode;warm?:boolean})=> <div style={{position:'absolute',left:146,top:198,fontFamily:sans,fontSize:29,letterSpacing:10,color:warm?palette.gold:palette.blue,opacity:.7}}>{children}</div>;
export const Copy=({lines,top=411,left=145,size=83,delay=.65,accent=-1,width=900,center=false}: {lines:string[];top?:number;left?:number;size?:number;delay?:number;accent?:number;width?:number;center?:boolean})=>{
 const frame=useCurrentFrame();const{fps}=useVideoConfig();
 return <div style={{position:'absolute',left,top,width,textAlign:center?'center':'left',fontFamily:serif}}>{lines.map((line,i)=><div key={line} style={{fontSize:size,lineHeight:1.48,letterSpacing:2.2,fontWeight:400,whiteSpace:'nowrap',color:i===accent?palette.gold:palette.paper,opacity:interpolate(frame,[(delay+i*.3)*fps,(delay+.9+i*.3)*fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),translate:interpolate(frame,[(delay+i*.3)*fps,(delay+1.2+i*.3)*fps],['0px 24px','0px 0px'],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.16,1,.3,1)})}}>{line}</div>)}</div>;
};
export const Note=({children,delay=2.6,top=718}: {children:React.ReactNode;delay?:number;top?:number})=>{
 const frame=useCurrentFrame();const{fps}=useVideoConfig();return <div style={{position:'absolute',left:149,top,fontFamily:sans,fontSize:36,lineHeight:1.6,letterSpacing:2,color:palette.muted,opacity:interpolate(frame,[delay*fps,(delay+.8)*fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>{children}</div>;
};
