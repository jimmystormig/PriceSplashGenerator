import {test} from 'node:test';import assert from 'node:assert/strict';
import {priceLayout,render} from './render';import {defaults,example,priceParts} from './model';
test('price groups fit both dimensions and preserve superscript proportions',()=>{
 // Exercise narrow and wide font metrics independently of the browser font engine.
 for(const widthFactor of [.55,.9])for(const amount of [5,5.2,45.2,99.95,100.5,9999.95])for(const [initial,width,height]of [[186,400,180],[143,400,145],[52,148,53]]){
 const layout=priceLayout(amount,initial,width,height,(value,size)=>({width:value.length*size*widthFactor,ascent:size*.8,descent:size*.15}));
 assert.ok(layout.width<=width+.01);assert.ok(layout.height<=height+.01);assert.ok(Math.abs(layout.smallSize/layout.size-.4)<1e-10);
 if(layout.ore){assert.match(layout.main,/^\d+$/);assert.match(layout.ore,/^\d{2}$/);}else assert.match(layout.main,/:\-$/);
 }
});
test('single-digit prices start fifteen percent larger when space permits',()=>{
 const measure=(value:string,size:number)=>({width:value.length*size*.3,ascent:size*.6,descent:0});
 assert.ok(Math.abs(priceLayout(5.2,100,400,180,measure).size-115)<1e-10);
 assert.deepEqual(priceParts(45.2),{kronor:'45',ore:'20'});assert.deepEqual(priceParts(9.999),{kronor:'10',ore:null});
});
test('renderer uppercases Swedish names without changing the product and uses compact rows',()=>{
 const drawn:{text:string;font:string}[]=[];const context={font:'',measureText(value:string){const size=Number(this.font.match(/([\d.]+)px/)?.[1]??30);return {width:value.length*size*.5,actualBoundingBoxAscent:size*.7,actualBoundingBoxDescent:size*.1,actualBoundingBoxLeft:0,actualBoundingBoxRight:value.length*size*.5};},fillText(text:string){drawn.push({text,font:this.font});},scale(){},clearRect(){},fillRect(){},save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){}};
 const p={...example(),name:'Ål och räkor',supplier:'Grossisten',deposit:true,limit:'2'};const canvas={getContext:()=>context}as unknown as HTMLCanvasElement;
 assert.deepEqual(render(canvas,p,defaults),[]);assert.ok(drawn.some(d=>d.text==='ÅL OCH RÄKOR'));assert.equal(p.name,'Ål och räkor');assert.ok(drawn.some(d=>d.text==='Ediths Grossisten 450 g'&&d.font.includes('31px')));assert.ok(drawn.some(d=>d.text==='pant tillkommer'));assert.ok(drawn.some(d=>d.text==='Max 2 köp'));
 assert.ok(drawn.some(d=>d.text==='29,95'));
 drawn.length=0;render(canvas,{...p,price:'45,20',saving:'30'},defaults);
 assert.ok(drawn.some(d=>d.text==='30,00'));assert.ok(drawn.some(d=>d.text==='45'));assert.ok(drawn.some(d=>d.text==='20'));assert.ok(!drawn.some(d=>d.text==='45,20'));
});
