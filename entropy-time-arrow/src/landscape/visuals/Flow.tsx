import {useId} from 'react';
import {useCurrentFrame,useVideoConfig} from 'remotion';
import {TAU,smooth,rand,mix,path} from '../math';
export const Flow=({kind}: {kind:'time'|'smoke'|'light'|'probability'|'cost'|'arrow'|'closing'})=>{
 const frame=useCurrentFrame();const{fps}=useVideoConfig();const t=frame/fps;
 const id=useId().replace(/:/g,'');
 const svgStyle={position:'absolute' as const,inset:0,width:'100%',height:'100%'};
 return <svg viewBox="0 0 1920 1080" style={svgStyle} aria-hidden="true">
  <defs>
   <radialGradient id={`${id}-halo`}><stop stopColor="#d5ab70" stopOpacity=".25"/><stop offset=".23" stopColor="#b07b42" stopOpacity=".12"/><stop offset="1" stopColor="#80603b" stopOpacity="0"/></radialGradient>
   <linearGradient id={`${id}-thread`} x1="0" y1="1" x2="1" y2="0"><stop stopColor="#718fa0" stopOpacity=".1"/><stop offset=".46" stopColor="#bad1d7" stopOpacity=".58"/><stop offset="1" stopColor="#f6d59e" stopOpacity=".92"/></linearGradient>
   <linearGradient id={`${id}-smoke`} x1="0" y1="1" x2="0" y2="0"><stop stopColor="#748a98" stopOpacity="0"/><stop offset=".22" stopColor="#9bb4c4" stopOpacity=".5"/><stop offset=".72" stopColor="#c5d6dc" stopOpacity=".22"/><stop offset="1" stopColor="#7d9cac" stopOpacity="0"/></linearGradient>
   <filter id={`${id}-soft`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  {kind==='time'&&<>
   <ellipse cx="1490" cy="520" rx="570" ry="430" fill={`url(#${id}-halo)`} opacity=".25"/>
   {Array.from({length:110},(_,j)=>{
    const pts=Array.from({length:190},(_,i)=>{const u=i/189;const a=u*TAU*1.19+t*.025;const radius=290+j*1.2;return{x:1415+Math.cos(a)*radius+Math.pow(u,8)*smooth((t-1)/4)*325,y:530+Math.sin(a)*radius*.43+Math.cos(a)*100-Math.pow(u,8)*smooth((t-1)/4)*240};});
    return <path key={j} d={path(pts)} fill="none" stroke={`url(#${id}-thread)`} strokeWidth={j%9===0?1:.43} opacity={.18+Math.sin(j/110*Math.PI)*.18}/>;
   })}
   {Array.from({length:230},(_,i)=>{const a=rand(i+9)*TAU;const r=300+rand(i+183)*122;return<circle key={i} cx={1415+Math.cos(a+t*.024)*r} cy={530+Math.sin(a+t*.024)*r*.43+Math.cos(a+t*.024)*100} r={.7+rand(i+32)*1.3} fill={i%8===0?'#edc18b':'#a8c8d2'} opacity={.1+rand(i+129)*.35}/>;})}
  </>}
  {kind==='smoke'&&<>
   {Array.from({length:178},(_,j)=>{
    const pts=Array.from({length:138},(_,i)=>{const u=i/137;const spread=(20+Math.pow(u,1.45)*208)*(1+smooth(t/5)*.5);const offset=(j/177-.5)*spread;const curl=Math.sin(u*8.3-t*.34)*Math.pow(u,1.5)*85+Math.sin(u*15+t*.23)*u*19;
     return{x:1398+u*131+offset*Math.cos(u*4.2-t*.1)+curl,y:892-u*740+Math.sin(u*6.5+j*.07)*u*28};});
    return <path key={j} d={path(pts)} stroke={`url(#${id}-smoke)`} strokeWidth={j%11===0?3.2:.72} opacity={j%11===0?.22:.26+rand(j+187)*.21} filter={j%11===0?`url(#${id}-soft)`:undefined} fill="none"/>;
   })}
   <ellipse cx="1398" cy="892" rx="2.6" ry="1.6" fill="#c69a66" opacity=".5"/>
  </>}
  {kind==='light'&&<>
   <circle cx="1400" cy="530" r="290" fill={`url(#${id}-halo)`}/>
   {Array.from({length:500},(_,i)=>{const a=rand(i+630)*TAU;const p=(rand(i+621)+t*.028)%1;const r=36+Math.pow(p,.8)*570;const z=rand(i+818);const x=1400+Math.cos(a)*r,y=530+Math.sin(a)*r*.65;return <g key={i} opacity={Math.sin(p*Math.PI)*(.18+z*.68)}><path d={`M${x},${y} l${Math.cos(a)*(3+z*18)},${Math.sin(a)*(3+z*18)*.65}`} stroke={i%6===0?'#e8c694':'#a3bdca'} strokeWidth={.5+z*.5}/><circle cx={x} cy={y} r={.6+z} fill="#d9e2e1"/></g>;})}
   <circle cx="1400" cy="530" r="7" fill="#ffe8c4"/><circle cx="1400" cy="530" r="18" fill="#e0bb7c" opacity=".3" filter={`url(#${id}-soft)`}/>
  </>}
  {kind==='probability'&&<>
   {Array.from({length:625},(_,i)=>{
    const scatter=smooth((t-2.6)/4.7);const a=rand(i+131)*TAU;const r=Math.sqrt(rand(i+311))*405;
    const x=mix(1122+i%25*24,1430+Math.cos(a)*r,scatter),y=mix(244+Math.floor(i/25)*24,550+Math.sin(a)*r*.84,scatter);
    return <g key={i}><circle cx={x} cy={y} r={i%13===0?5.5:2} fill={i%13===0?'#d4af7b':'#adc8d3'} opacity={i%13===0?.13:.32+rand(i+84)*.45}/>{i%13===0&&<circle cx={x} cy={y} r="1.9" fill="#f7d6a5" opacity=".87"/>}</g>;
   })}
   {Array.from({length:16},(_,i)=><path key={i} d={`M${1134+i*35},250V842`} stroke="#9fb8c5" strokeWidth=".5" opacity={(1-smooth((t-2.6)/4.7))*.1}/>)}
  </>}
  {kind==='cost'&&<>
   <ellipse cx="1420" cy="536" rx="490" ry="410" fill={`url(#${id}-halo)`} opacity=".35"/>
   {Array.from({length:86},(_,j)=>{const pts=Array.from({length:170},(_,i)=>{const a=i/169*TAU;const b=j/86*TAU;const r=211+Math.cos(a*3+b+t*.09)*39;return{x:1420+Math.cos(a)*r+Math.sin(b)*83,y:540+Math.sin(a)*r*.76+Math.cos(b)*84};});return <path key={j} d={path(pts)} fill="none" stroke={j%8===0?'#ffe3b5':'#c09562'} strokeWidth={j%8===0?.9:.4} opacity={j%8===0?.5:.19}/>;})}
   {Array.from({length:320},(_,i)=>{const a=rand(i+419)*TAU;const p=(rand(i+744)+t*.11)%1;const r=260+Math.pow(p,.7)*210;return <circle key={i} cx={1420+Math.cos(a)*r} cy={540+Math.sin(a)*r*.8} r={.8+rand(i+514)*1.25} fill="#d9ac71" opacity={Math.sin(p*Math.PI)*(.2+rand(i+143)*.4)}/>;})}
  </>}
  {kind==='arrow'&&<>
   {Array.from({length:58},(_,j)=>{const pts=Array.from({length:160},(_,i)=>{const u=i/159;return{x:1080+u*640,y:785-u*435+Math.sin(u*Math.PI)*80+(j-29)*Math.pow(1-u,2)*6};});return<path key={j} d={path(pts)} stroke={`url(#${id}-thread)`} fill="none" strokeWidth=".65" opacity=".25"/>;})}
   {Array.from({length:360},(_,i)=>{const p=(rand(i+826)+t*.045)%1;return<circle key={i} cx={1080+p*640} cy={785-p*435+Math.sin(p*Math.PI)*80+(rand(i+327)-.5)*Math.pow(1-p,2)*370} r={.6+rand(i+111)*1.3} fill={i%5===0?'#f2cd99':'#afc9d1'} opacity={.14+Math.pow(p,2)*.72}/>;})}
   <circle cx="1720" cy="350" r="30" fill={`url(#${id}-halo)`}/><circle cx="1720" cy="350" r="2.8" fill="#ffe7bf"/>
  </>}
  {kind==='closing'&&<>
   <ellipse cx="960" cy="522" rx="650" ry="180" fill={`url(#${id}-halo)`} opacity=".22"/>
   {Array.from({length:42},(_,j)=>{const pts=Array.from({length:180},(_,i)=>{const u=i/179;return{x:245+u*1430,y:528+Math.sin(u*Math.PI)*Math.sin(u*5.6+j*.045+t*.03)*29+(j-21)*.23};});return<path key={j} d={path(pts)} stroke="#d8b27e" fill="none" strokeWidth=".65" opacity=".06"/>;})}
   {Array.from({length:130},(_,i)=><circle key={i} cx={330+rand(i+752)*1260} cy={160+rand(i+163)*760} r={.7+rand(i+932)*.6} fill="#d7bb90" opacity={.07+rand(i+111)*.21}/>)}
  </>}
 </svg>;
};
