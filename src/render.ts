import {calculate,decimal,detailLines,priceParts,type Product,type Settings} from './model';

export interface PriceMetrics {width:number;ascent:number;descent:number}
export function priceLayout(amount:number,initialSize:number,maxWidth:number,maxHeight:number,measure:(value:string,size:number)=>PriceMetrics){
 const parts=priceParts(amount);const main=parts.kronor+(parts.ore?'':':-');
 let size=initialSize*(parts.kronor.length===1?1.15:1);
 for(let i=0;i<12;i++){const big=measure(main,size),small=parts.ore?measure(parts.ore,size*.4):{width:0,ascent:0,descent:0};const gap=parts.ore?size*.035:0;const width=big.width+gap+small.width;const height=Math.max(big.ascent+big.descent,small.ascent+small.descent);const scale=Math.min(1,maxWidth/width,maxHeight/height);if(scale>=.9999)return {main,ore:parts.ore,size,smallSize:size*.4,big,small,gap,width,height};size*=scale*.999;}
 throw new Error('Priset kunde inte passas in.');
}

export function render(canvas:HTMLCanvasElement,p:Product,s:Settings):string[]{
 canvas.width=s.size;canvas.height=s.size; const ctx=canvas.getContext('2d')!;ctx.scale(s.size/1000,s.size/1000);ctx.clearRect(0,0,1000,1000);
 if(s.background==='white'){ctx.fillStyle='#fff';ctx.fillRect(0,0,1000,1000);}
 const family=s.font==='default'?'Arial, sans-serif':'"SplashCustom", Arial, sans-serif';const weight=s.font==='default'?700:s.fontWeight;const warnings:string[]=[];
 function text(value:string,x:number,y:number,size:number,width:number,bold=true,color=s.textColor,min=22){ctx.textAlign='center';ctx.textBaseline='middle';let actual=size;ctx.font=`${s.font==='default'?(bold?700:400):weight} ${actual}px ${family}`;while(ctx.measureText(value).width>width&&actual>min){actual--;ctx.font=`${s.font==='default'?(bold?700:400):weight} ${actual}px ${family}`;}if(ctx.measureText(value).width>width)warnings.push('Texten är för lång för en läslig bild. Korta texten eller välj ett annat typsnitt.');ctx.fillStyle=color;ctx.fillText(value,x,y);return actual;}
 // Keep the splash group slightly smaller and further right than the product text.
 ctx.save();ctx.translate(725,365);ctx.scale(.9,.9);ctx.translate(-700,-365);
 // Fixed, deliberately uneven points reproduce the hand-cut reference silhouette.
 const points=[[693,144],[725,212],[768,184],[769,251],[824,217],[833,279],[889,255],[866,315],[944,320],[886,357],[932,398],[866,420],[930,470],[850,468],[865,520],[809,507],[817,578],[754,532],[735,586],[691,542],[646,590],[628,532],[565,560],[565,505],[487,532],[519,472],[462,465],[500,420],[427,400],[493,367],[443,327],[508,311],[460,253],[542,267],[534,215],[589,235],[594,159],[649,214]];
 ctx.save();ctx.shadowColor='rgba(0,0,0,.40)';ctx.shadowBlur=6;ctx.shadowOffsetX=8;ctx.shadowOffsetY=11;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=s.burst;ctx.fill();ctx.restore();
 function price(amount:number,x:number,y:number,size:number,width:number,height:number){
  const measure=(value:string,fontSize:number)=>{ctx.font=`${weight} ${fontSize}px ${family}`;const m=ctx.measureText(value);return {width:Math.max(m.width,m.actualBoundingBoxLeft+m.actualBoundingBoxRight),ascent:m.actualBoundingBoxAscent,descent:m.actualBoundingBoxDescent};};
  const layout=priceLayout(amount,size,width,height,measure);const left=x-layout.width/2,top=y-layout.height/2;
  ctx.save();ctx.fillStyle=s.priceColor;ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font=`${weight} ${layout.size}px ${family}`;ctx.fillText(layout.main,left,top+layout.big.ascent);
  if(layout.ore){ctx.font=`${weight} ${layout.smallSize}px ${family}`;ctx.fillText(layout.ore,left+layout.big.width+layout.gap,top+layout.small.ascent);}
  ctx.restore();
 }
 // Use actual ink metrics for the offer label; middle baselines vary between fonts.
 function inkText(value:string,x:number,top:number,size:number,maxWidth:number,maxHeight:number){
  let metrics:TextMetrics;for(let i=0;i<12;i++){ctx.font=`${weight} ${size}px ${family}`;metrics=ctx.measureText(value);const width=Math.max(metrics.width,metrics.actualBoundingBoxLeft+metrics.actualBoundingBoxRight);const height=metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;const ratio=Math.min(1,maxWidth/width,maxHeight/height);if(ratio>=.9999)break;size*=ratio*.999;}
  ctx.save();ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillStyle=s.priceColor;ctx.fillText(value,x,top+metrics!.actualBoundingBoxAscent);ctx.restore();
 }
 const c=calculate(p);
 if(c.quantity>1)inkText(`${c.quantity} för`,700,265,48,360,38);
 if(c.price===null)text('—',700,400,240,460,true,s.priceColor);else price(c.price,700,c.quantity>1?410:397,c.quantity>1?215:250,priceParts(c.price).kronor.length>=4?400:440,c.quantity>1?180:205);
 if(p.suffix.trim())inkText(`/${p.suffix.trim().replace(/^\//,'').toLowerCase()}`,710,521,58,280,48);
 if(c.saving!==null&&c.saving>0){ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(763,110);ctx.lineTo(925,110);ctx.lineTo(925,245);ctx.lineTo(844,293);ctx.lineTo(763,245);ctx.closePath();ctx.fill();text('Spara',844,148,48,155,true,s.priceColor);text(decimal(c.saving),844,211,52,148,true,s.priceColor);}
 ctx.restore();
 const name=(p.name.trim()||'Varans namn').toLocaleUpperCase('sv-SE');ctx.font=`${weight} 72px ${family}`;const words=name.split(/\s+/);const lines:string[]=[];let line='';for(const word of words){const trial=line?`${line} ${word}`:word;if(ctx.measureText(trial).width>870&&line){lines.push(line);line=word;}else line=trial;}if(line)lines.push(line);
 const nameLines=lines.length<=2?lines:[lines[0],lines.slice(1).join(' ')];let y=666;for(const l of nameLines){text(l,500,y,72,880,true,s.textColor,34);y+=69;}
 const details=detailLines(p);
 const available=965-(y-12);const step=Math.min(38,available/Math.max(details.length,1));for(const detail of details){text(detail,500,y-17,Math.min(31,step-5),890,false,s.textColor,20);y+=step;}
 return [...new Set(warnings)];
}
export function png(canvas:HTMLCanvasElement):Promise<Blob>{return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Kunde inte skapa PNG.')),'image/png'));}
