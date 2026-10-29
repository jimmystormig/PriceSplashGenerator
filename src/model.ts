export interface Product {
 id:string; name:string; maker:string; weight:string; unit:string; price:string; regular:string;
 comparison:string; comparisonUnit:string; suffix:string; multi:string; lowest:string; limit:string; saving:string;
}
export interface Settings {burst:string;priceColor:string;textColor:string;background:string;size:number;font:string}
export interface StoredFont {name:string;data:ArrayBuffer}
export const defaults:Settings={burst:'#ffe600',priceColor:'#e60012',textColor:'#101010',background:'transparent',size:1000,font:'default'};
export const blank=():Product=>({id:crypto.randomUUID(),name:'',maker:'',weight:'',unit:'g',price:'',regular:'',comparison:'',comparisonUnit:'kg',suffix:'frp',multi:'',lowest:'',limit:'',saving:''});
export const example=():Product=>({...blank(),name:'Janssons frestelse',maker:'Ediths',weight:'450',price:'45',regular:'74,95'});
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
 const errors:string[]=[];if(!p.name.trim())errors.push('Varans namn saknas.');if(number(p.price)===null)errors.push('Pris måste vara ett positivt tal eller noll.');
 for(const [key,label] of [['weight','Vikt/volym'],['regular','Ordinarie pris'],['comparison','Jämförpris'],['lowest','30-dagarspris'],['saving','Besparing']] as const)if(p[key].trim()&&number(p[key])===null)errors.push(`${label} måste vara ett positivt tal eller noll.`);
 if(!['g','hg','kg','ml','cl','dl','liter','st'].includes(p.unit))errors.push('Enhet måste vara g, hg, kg, ml, cl, dl, liter eller st.');
 if(p.comparison.trim()&&!['kg','liter'].includes(p.comparisonUnit))errors.push('Jämförprisenhet måste vara kg eller liter.');
 if(p.weight.trim()&&number(p.weight)===0)errors.push('Vikt/volym måste vara större än noll.');
 if(p.multi.trim()&&(!Number.isInteger(number(p.multi))||(number(p.multi)??0)<2))errors.push('Multiprisets antal måste vara ett heltal från 2.');
 if(p.limit.trim()&&(!Number.isInteger(number(p.limit))||(number(p.limit)??0)<1))errors.push('Maxköp måste vara ett heltal från 1.');
 return errors;
}
export function filename(p:Product,index:number):string{return `${String(index+1).padStart(3,'0')}-${p.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'produkt'}.png`;}
export const fields:[keyof Omit<Product,'id'>,string][]=[['name','Varans namn'],['maker','Tillverkare'],['weight','Varans vikt'],['unit','Enhet'],['price','Pris'],['regular','Ordinarie pris'],['comparison','Jämförpris'],['comparisonUnit','Jämförprisenhet'],['suffix','Prissuffix'],['multi','Multipris antal'],['lowest','30-dagarspris'],['limit','Maxköp'],['saving','Besparing']];
export function rowsToProducts(rows:unknown[][],mapping:Record<string,number>):Product[]{return rows.filter(row=>row.some(v=>v!==undefined&&v!==null&&String(v).trim())).map(row=>{const p=blank();for(const [key]of fields){const i=mapping[key];if(i!==undefined&&i>=0&&row[i]!==undefined&&row[i]!==null)p[key]=String(row[i]).trim();}p.unit=p.unit.toLowerCase();if(p.unit==='l')p.unit='liter';p.comparisonUnit=p.comparisonUnit.toLowerCase();if(p.comparisonUnit==='l')p.comparisonUnit='liter';return p;});}
