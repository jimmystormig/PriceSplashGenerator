export interface Product {
 id:string; name:string; supplier:string; deposit:boolean; depositError?:string; weight:string; unit:string; price:string; regular:string;
 comparison:string; comparisonUnit:string; suffix:string; multi:string; lowest:string; limit:string; saving:string;
}
export interface Settings {burst:string;priceColor:string;textColor:string;background:string;size:number;font:string;fontWeight:number}
export interface StoredFont {name:string;data:ArrayBuffer;weight?:number}
export const defaults:Settings={burst:'#ffe600',priceColor:'#e60012',textColor:'#101010',background:'transparent',size:1000,font:'default',fontWeight:700};
export const blank=():Product=>({id:crypto.randomUUID(),name:'',supplier:'',deposit:false,weight:'',unit:'g',price:'',regular:'',comparison:'',comparisonUnit:'kg',suffix:'frp',multi:'',lowest:'',limit:'',saving:''});
export const example=():Product=>({...blank(),name:'Janssons frestelse',weight:'450',price:'45',regular:'74,95'});
export function number(value:string):number|null {if(!value.trim())return null; const v=value.trim().replace(/\s/g,'').replace(',','.'); return /^\d+(\.\d+)?$/.test(v)&&Number.isFinite(Number(v))?Number(v):null;}
export function money(n:number):string {const cents=Math.round((n+Number.EPSILON)*100);return cents%100===0?`${cents/100}:-`:`${Math.floor(cents/100)}:${String(cents%100).padStart(2,'0')}`;}
export function decimal(n:number):string{return n.toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2});}
export function calculate(p:Product){
 const price=number(p.price),regular=number(p.regular),quantity=number(p.multi)??1,weight=number(p.weight);
 const factors:Record<string,{factor:number;unit:string}>={g:{factor:.001,unit:'kg'},hg:{factor:.1,unit:'kg'},kg:{factor:1,unit:'kg'},ml:{factor:.001,unit:'liter'},cl:{factor:.01,unit:'liter'},dl:{factor:.1,unit:'liter'},liter:{factor:1,unit:'liter'},l:{factor:1,unit:'liter'}};
 const conversion=factors[p.unit];
 const autoSaving=price!==null&&regular!==null?Math.max(0,Math.round((regular*quantity-price)*100)/100):null;
 const autoComparison=price!==null&&weight!==null&&weight>0&&conversion?price/(weight*conversion.factor*quantity):null;
 return {saving:p.saving.trim()?number(p.saving):autoSaving,comparison:p.comparison.trim()?number(p.comparison):autoComparison,comparisonUnit:p.comparison.trim()?p.comparisonUnit:conversion?.unit??p.comparisonUnit,quantity,price,autoSaving,autoComparison};
}
export function validate(p:Product):string[]{
 const errors:string[]=[];if(p.depositError)errors.push(p.depositError);if(!p.name.trim())errors.push('Varans namn saknas.');if(number(p.price)===null)errors.push('Pris måste vara ett positivt tal eller noll.');
 for(const [key,label] of [['weight','Vikt/volym'],['regular','Ordinarie pris'],['comparison','Jämförpris'],['lowest','30-dagarspris'],['saving','Besparing']] as const)if(p[key].trim()&&number(p[key])===null)errors.push(`${label} måste vara ett positivt tal eller noll.`);
 if(!['st','frp'].includes(p.suffix))errors.push('Enhet efter priset måste vara st eller frp.');
 if(!['g','hg','kg','ml','cl','dl','liter','st'].includes(p.unit))errors.push('Enhet måste vara g, hg, kg, ml, cl, dl, liter eller st.');
 if(p.comparison.trim()&&!['kg','liter'].includes(p.comparisonUnit))errors.push('Jämförprisenhet måste vara kg eller liter.');
 if(p.weight.trim()&&number(p.weight)===0)errors.push('Vikt/volym måste vara större än noll.');
 if(p.multi.trim()&&(!Number.isInteger(number(p.multi))||(number(p.multi)??0)<2))errors.push('Multiprisets antal måste vara ett heltal från 2.');
 if(p.limit.trim()&&(!Number.isInteger(number(p.limit))||(number(p.limit)??0)<1))errors.push('Maxköp måste vara ett heltal från 1.');
 return errors;
}
export function filename(p:Product,index:number):string{return `${String(index+1).padStart(3,'0')}-${p.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'produkt'}.png`;}
export const fields:[keyof Omit<Product,'id'|'depositError'>,string][]=[['name','Varans namn'],['supplier','Leverantör'],['deposit','Pant tillkommer'],['weight','Varans vikt'],['unit','Viktenhet'],['price','Pris'],['regular','Ordinarie pris'],['comparison','Jämförpris'],['comparisonUnit','Jämförprisenhet'],['suffix','Enhet'],['multi','Multipris antal'],['lowest','30-dagarspris'],['limit','Maxköp'],['saving','Besparing']];
export function rowsToProducts(rows:unknown[][],mapping:Record<string,number>):Product[]{return rows.filter(row=>row.some(v=>v!==undefined&&v!==null&&String(v).trim())).map(row=>{const p=blank();for(const [key]of fields){const i=mapping[key];if(i!==undefined&&i>=0&&row[i]!==undefined&&row[i]!==null){if(key==='deposit'){const result=parseDeposit(row[i]);p.deposit=result.value;p.depositError=result.error;}else p[key]=String(row[i]).trim();}}p.unit=p.unit.toLowerCase();if(p.unit==='l')p.unit='liter';p.comparisonUnit=p.comparisonUnit.toLowerCase();if(p.comparisonUnit==='l')p.comparisonUnit='liter';return p;});}

export function parseDeposit(raw:unknown):{value:boolean;error?:string}{
 const value=String(raw??'').trim().toLocaleLowerCase('sv-SE');
 if(['ja','true','1'].includes(value))return {value:true};
 if(['','nej','false','0'].includes(value))return {value:false};
 return {value:false,error:`Pant tillkommer: ”${String(raw)}” är ogiltigt. Ange ja/nej, true/false eller 1/0.`};
}
export function hydrateProduct({maker:_maker,...saved}:Partial<Product>&{maker?:unknown}):Product{return {...blank(),...saved,supplier:saved.supplier??'',deposit:saved.deposit??false};}
export function priceParts(amount:number){const cents=Math.round((amount+Number.EPSILON)*100);return {kronor:String(Math.floor(cents/100)),ore:cents%100?String(cents%100).padStart(2,'0'):null};}
export function detailLines(p:Product):string[]{
 const c=calculate(p);const suffix=p.suffix.trim().replace(/^\//,'')||'st';
 return [
 [p.supplier.trim(),p.weight.trim()?`${p.weight.trim()} ${p.unit}`:''].filter(Boolean).join(' '),
 [p.regular.trim()?`Ord. ${decimal(number(p.regular)??0)}/${suffix}`:'',c.comparison!==null?`Jfr. ${decimal(c.comparison)}/${c.comparisonUnit}`:''].filter(Boolean).join(' '),
 [p.lowest.trim()?`30-dgr-pris. ${decimal(number(p.lowest)??0)}/${suffix}`:'',p.deposit?'pant tillkommer':''].filter(Boolean).join(' / '),
 p.limit.trim()?`Max ${p.limit.trim()} köp`:''
 ].filter(Boolean);
}
// Check the file contents before handing them to the browser's font sanitizer.
export function validateFontData(data:ArrayBuffer):void{
 const signature=data.byteLength>=4?new DataView(data).getUint32(0):null;
 if(signature===0x00051607)throw Error('Filen är en Mac-metadatafil, inte ett typsnitt. Välj den riktiga typsnittsfilen utan ._ i början av filnamnet och utanför mappen __MACOSX.');
 if(signature===null||![0x4f54544f,0x00010000,0x74727565,0x774f4646,0x774f4632].includes(signature))throw Error('Filen innehåller inte ett typsnitt i OTF-, TTF-, WOFF- eller WOFF2-format. Välj den ursprungliga typsnittsfilen.');
 // FontFace.load() still validates the complete font, including its tables.
}
// TrueType/OpenType OS/2 usWeightClass, with a consistent bold fallback for webfonts.
export function fontWeight(data:ArrayBuffer):number{
 try{const view=new DataView(data);const count=view.getUint16(4);for(let i=0;i<count;i++){const start=12+i*16;if(view.getUint32(start)===0x4f532f32){const offset=view.getUint32(start+8);const weight=view.getUint16(offset+4);return weight>=1&&weight<=1000?weight:700;}}}catch{/* Compressed webfonts are validated by FontFace. */}
 return 700;
}

export function mapColumns(headers:string[]):Record<string,number>{
 const normalized=headers.map(h=>h.trim().toLocaleLowerCase('sv-SE'));
 const mapping:Record<string,number>={};for(const [key,label]of fields)mapping[key]=normalized.indexOf(label.toLocaleLowerCase('sv-SE'));
 // Older templates used Enhet for weight and Prissuffix for the price unit.
 if(!normalized.includes('viktenhet')){mapping.unit=normalized.indexOf('enhet');mapping.suffix=normalized.indexOf('prissuffix');}
 return mapping;
}
