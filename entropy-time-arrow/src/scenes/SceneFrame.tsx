import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C,serif,sans} from '../design';
import {VisualCanvas,glow,rand} from '../visuals/VisualCanvas';

export const Words=({lines,delay=0.6,size=80,accent=-1,top=1320}: {lines:string[];delay?:number;size?:number;accent?:number;top?:number})=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();
 return <div style={{position:'absolute',left:112,right:100,top,fontFamily:serif}}>{lines.map((line,i)=><div key={i} style={{fontSize:size,lineHeight:1.55,whiteSpace:'nowrap',fontWeight:400,letterSpacing:3,color:i===accent?C.gold:C.ivory,opacity:interpolate(frame,[(delay+i*0.24)*fps,(delay+0.8+i*0.24)*fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),translate:interpolate(frame,[(delay+i*0.24)*fps,(delay+1.0+i*0.24)*fps],['0px 25px','0px 0px'],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(0.16,1,0.3,1)})}}>{line}</div>)}</div>;
};

export const SceneFrame=({children,chapter,warm=false}: {children:React.ReactNode;chapter:string;warm?:boolean})=>{
 const frame=useCurrentFrame();const {fps}=useVideoConfig();
 return <AbsoluteFill style={{background:C.ink,color:C.ivory,fontFamily:serif,overflow:'hidden'}}>
  <VisualCanvas paint={(ctx,t)=>{
   glow(ctx,540,760,730,warm?'rgba(66,38,18,0.20)':'rgba(28,45,58,0.18)');
   for(let i=0;i<260;i++){const x=rand(i+100)*1080;const y=rand(i+660)*1900;ctx.fillStyle=`rgba(218,227,226,${0.022+rand(i+500)*0.065})`;ctx.fillRect(x,y+Math.sin(t*.12+i)*3,1.2,1.2);}
  }}/>
  {children}
  <div style={{position:'absolute',left:112,top:134,fontFamily:sans,fontSize:30,letterSpacing:9,color:warm?C.gold:C.blue,opacity:interpolate(frame,[0,.6*fps],[0,.56],{extrapolateRight:'clamp'})}}>{chapter}</div>
  <div style={{position:'absolute',left:112,bottom:156,width:42,height:1,background:warm?C.gold:C.blue,opacity:.48}}/>
 </AbsoluteFill>;
};
