import {VisualCanvas,TAU,clamp,smooth,rand,mix,glow} from './VisualCanvas';

export const TimeField=({kind}: {kind:'opening'|'probability'|'cost'|'arrow'|'closing'}) => <VisualCanvas paint={(ctx,t)=>{
 ctx.save();
 if(kind==='opening'){
  const cx=540,cy=770;glow(ctx,cx,cy,520,'rgba(136,170,181,0.075)');
  // A broken elliptical orbit becomes a trail that has only one destination.
  for(let band=0;band<58;band++){
   ctx.beginPath();for(let j=0;j<330;j++){
    const a=j/329*TAU;const radius=281+band*.42;
    const x=cx+Math.cos(a)*radius;
    const y=cy+Math.sin(a)*radius*.85+Math.cos(a+.45)*67;
    const p=smooth((t-2.2)/3.5);const stretch=Math.pow(j/329,8)*p;
    const xx=x+stretch*(350+band*.3);const yy=y-stretch*480;
    if(j===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);
   }
   ctx.lineWidth=.8;ctx.strokeStyle=`rgba(159,200,212,${.025+Math.sin(band/58*Math.PI)*.06})`;ctx.stroke();
  }
  for(let i=0;i<460;i++){
   const a=rand(i+1)*TAU;const r=283+rand(i+230)*29;const p=smooth((t-2)/3.6);const z=rand(i+330);
   const x=540+Math.cos(a)*r+Math.pow(z,5)*p*410;
   const y=770+Math.sin(a)*r*.85+Math.cos(a+.45)*67-Math.pow(z,5)*p*480;
   ctx.fillStyle=`rgba(${i%5===0?'238,188,115':'188,211,219'},${.1+rand(i+910)*.55})`;ctx.beginPath();ctx.arc(x,y,.7+rand(i+441)*1.4,0,TAU);ctx.fill();
  }
  const a=-Math.PI*.4+t*.18;const x=540+Math.cos(a)*296,y=770+Math.sin(a)*249+Math.cos(a+.45)*67;
  glow(ctx,x,y,25,'rgba(236,179,96,.6)');ctx.fillStyle='#ffe7be';ctx.beginPath();ctx.arc(x,y,2.7,0,TAU);ctx.fill();
 }
 if(kind==='probability'){
  const scatter=smooth((t-3.1)/3.8);glow(ctx,530,740,510,'rgba(110,147,164,.06)');
  for(let i=0;i<625;i++){
   const column=i%25,row=Math.floor(i/25);const gx=228+column*26,gy=425+row*26;
   const a=rand(i+13)*TAU;const rad=Math.sqrt(rand(i+42))*470;
   const x=mix(gx,540+Math.cos(a)*rad,scatter);const y=mix(gy,750+Math.sin(a)*rad*.89,scatter);
   ctx.fillStyle=`rgba(${i%13===0?'226,182,120':'176,211,224'},${mix(.7,.28+rand(i+914)*.5,scatter)})`;
   ctx.beginPath();ctx.arc(x,y,mix(2,1.15+rand(i+49)*1.8,scatter),0,TAU);ctx.fill();
   if(i%13===0)glow(ctx,x,y,8,'rgba(198,152,81,.25)');
  }
  if(scatter<.9){ctx.strokeStyle=`rgba(174,199,210,${.055*(1-scatter)})`;ctx.lineWidth=.7;for(let i=0;i<25;i++){ctx.beginPath();ctx.moveTo(228+i*26,425);ctx.lineTo(228+i*26,1049);ctx.stroke();}}
 }
 if(kind==='cost'){
  const cx=540,cy=750;glow(ctx,cx,cy,440,'rgba(217,149,65,.07)');
  // A fragile crystalline heart stays ordered while its energy escapes.
  const spin=t*.025;ctx.save();ctx.translate(cx,cy);ctx.rotate(spin);
  for(let k=0;k<15;k++){
   const r=155+k*2.8;ctx.beginPath();for(let j=0;j<=6;j++){const a=j/6*TAU-Math.PI/2;const x=Math.cos(a)*r,y=Math.sin(a)*r;if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
   ctx.strokeStyle=`rgba(233,211,161,${.03+(.27*Math.pow(1-k/15,2))})`;ctx.lineWidth=1;ctx.stroke();
  }
  for(let j=0;j<6;j++){const a=j/6*TAU-Math.PI/2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*194,Math.sin(a)*194);ctx.strokeStyle='rgba(243,225,192,.28)';ctx.stroke();}
  ctx.restore();
  for(let i=0;i<410;i++){
   const angle=rand(i+52)*TAU;const p=(rand(i+910)+t*.12)%1;const r=193+Math.pow(p,.85)*360;
   const x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*.92;
   const a=Math.sin(p*Math.PI)*(.1+rand(i+323)*.55);ctx.fillStyle=`rgba(233,168,89,${a})`;ctx.beginPath();ctx.arc(x,y,rand(i+723)*1.5+.6,0,TAU);ctx.fill();
  }
  const g=ctx.createRadialGradient(cx-50,cy-80,0,cx,cy,165);g.addColorStop(0,'rgba(241,226,194,.32)');g.addColorStop(1,'rgba(255,198,102,0)');ctx.fillStyle=g;ctx.fillRect(cx-170,cy-170,340,340);
 }
 if(kind==='arrow'){
  const p=smooth(t/5);glow(ctx,560,670,390,'rgba(201,158,91,.055)');
  for(let i=0;i<630;i++){
   const depth=rand(i+198);const y=1150-depth*820;const bend=Math.sin(depth*2.9)*110;
   const width=mix(190,4,depth);const x=540+bend+(rand(i+948)-.5)*width*2;
   const yy=y-((t*.075+rand(i+730))%1)*40;
   ctx.fillStyle=`rgba(${i%4===0?'248,205,139':'183,211,220'},${(.12+.64*depth)*(p*.6+.4)})`;ctx.beginPath();ctx.arc(x,yy,.6+depth*1.9,0,TAU);ctx.fill();
  }
  for(let j=0;j<28;j++){
   ctx.beginPath();for(let i=0;i<180;i++){const d=i/180;const y=1150-d*820;const x=540+Math.sin(d*2.9)*110+(j-14)*mix(4,.2,d);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
   ctx.strokeStyle=`rgba(217,182,126,${.01+j/28*.02})`;ctx.lineWidth=.7;ctx.stroke();
  }
  glow(ctx,571,339,22,'rgba(252,215,155,.55)');
 }
 if(kind==='closing'){
  const x=540,y=755;const fade=1-smooth((t-5.8)/1.2);const breathe=1+Math.sin(t*.8)*.06;
  ctx.globalAlpha=fade;glow(ctx,x,y,290*breathe,'rgba(198,125,51,.105)');glow(ctx,x,y,74,'rgba(220,154,78,.19)');
  const g=ctx.createRadialGradient(x-9,y-12,2,x,y,28);g.addColorStop(0,'#fff8e7');g.addColorStop(.35,'#eec790');g.addColorStop(.8,'#8f663b');g.addColorStop(1,'#493524');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,27*breathe,0,TAU);ctx.fill();
  for(let i=0;i<170;i++){const a=rand(i+898)*TAU;const r=80+rand(i+741)*355;const collapse=1-smooth(t/5.8)*.75;const xx=x+Math.cos(a)*r*collapse, yy=y+Math.sin(a)*r*collapse;ctx.fillStyle=`rgba(212,173,111,${.08+rand(i+283)*.19})`;ctx.fillRect(xx,yy,1,1);}
 }
 ctx.restore();
}}/>;
