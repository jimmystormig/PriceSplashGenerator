import {calculate,decimal,money,number, type Product,type Settings} from './model';
export function render(canvas:HTMLCanvasElement,p:Product,s:Settings):string[]{
 canvas.width=s.size;canvas.height=s.size; const ctx=canvas.getContext('2d')!;ctx.scale(s.size/1000,s.size/1000);ctx.clearRect(0,0,1000,1000);
 if(s.background==='white'){ctx.fillStyle='#fff';ctx.fillRect(0,0,1000,1000);}
 const family=s.font==='default'?'Arial, sans-serif':'"SplashCustom", Arial, sans-serif';const warnings:string[]=[];
 function text(value:string,x:number,y:number,size:number,width:number,bold=true,color=s.textColor,min=22){ctx.textAlign='center';ctx.textBaseline='middle';let actual=size;ctx.font=`${bold?800:400} ${actual}px ${family}`;while(ctx.measureText(value).width>width&&actual>min){actual--;ctx.font=`${bold?800:400} ${actual}px ${family}`;}if(ctx.measureText(value).width>width)warnings.push('Texten är för lång för en läslig bild. Korta texten eller välj ett annat typsnitt.');ctx.fillStyle=color;ctx.fillText(value,x,y);return actual;}
 // Fixed, deliberately uneven points reproduce the hand-cut reference silhouette.
 const points=[[693,144],[725,212],[768,184],[769,251],[824,217],[833,279],[889,255],[866,315],[944,320],[886,357],[932,398],[866,420],[930,470],[850,468],[865,520],[809,507],[817,578],[754,532],[735,586],[691,542],[646,590],[628,532],[565,560],[565,505],[487,532],[519,472],[462,465],[500,420],[427,400],[493,367],[443,327],[508,311],[460,253],[542,267],[534,215],[589,235],[594,159],[649,214]];
 ctx.save();ctx.shadowColor='rgba(0,0,0,.40)';ctx.shadowBlur=6;ctx.shadowOffsetX=8;ctx.shadowOffsetY=11;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=s.burst;ctx.fill();ctx.restore();
 const c=calculate(p);if(c.quantity>1)text(`${c.quantity} för`,700,285,48,360,true,s.priceColor);
 text(c.price===null?'—':money(c.price),700,c.quantity>1?377:356,c.quantity>1?143:186,410,true,s.priceColor,48);
 if(p.suffix.trim())text(`/${p.suffix.trim().replace(/^\//,'').toLowerCase()}`,723,490,58,280,true,s.priceColor);
 if(c.saving!==null&&c.saving>0){ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(763,110);ctx.lineTo(925,110);ctx.lineTo(925,245);ctx.lineTo(844,293);ctx.lineTo(763,245);ctx.closePath();ctx.fill();text('Spara',844,148,48,155,true,s.priceColor);text(money(c.saving),844,211,52,150,true,s.priceColor);}
 const name=p.name.trim()||'Varans namn';ctx.font=`800 72px ${family}`;const words=name.split(/\s+/);const lines:string[]=[];let line='';for(const word of words){const trial=line?`${line} ${word}`:word;if(ctx.measureText(trial).width>870&&line){lines.push(line);line=word;}else line=trial;}if(line)lines.push(line);
 const nameLines=lines.length<=2?lines:[lines[0],lines.slice(1).join(' ')];let y=666;for(const l of nameLines){text(l,500,y,72,880,true,s.textColor,34);y+=69;}
 const details=[ [p.maker,p.weight?`${p.weight} ${p.unit}`:''].filter(Boolean).join(' '),p.regular.trim()?`Ord. ${decimal(number(p.regular)??0)}/${p.suffix||'st'}`:'',c.comparison!==null?`Jfr-pris ${decimal(c.comparison)}/${c.comparisonUnit}`:'',p.lowest.trim()?`Lägsta pris senaste 30 dagarna: ${decimal(number(p.lowest)??0)} kr`:'',p.limit.trim()?`Max ${p.limit} ${p.suffix||'st'} per hushåll`:'' ].filter(Boolean);
 const available=970-(y-12);const step=Math.min(45,available/Math.max(details.length,1));for(const detail of details){text(detail,500,y-9,Math.min(39,step-5),890,false,s.textColor,20);y+=step;}
 return [...new Set(warnings)];
}
export function png(canvas:HTMLCanvasElement):Promise<Blob>{return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Kunde inte skapa PNG.')),'image/png'));}
