import {test} from 'node:test';
import assert from 'node:assert/strict';
import {example,calculate,validate,number,money,rowsToProducts,filename} from './model';
test('reference sample calculates saving and comparison',()=>{const c=calculate(example());assert.equal(c.saving,29.95);assert.equal(c.comparison,100);assert.deepEqual(validate(example()),[]);});
test('multiprice uses bundle saving and total volume',()=>{const p={...example(),price:'99',regular:'74,95',multi:'2',weight:'500',unit:'ml'};const c=calculate(p);assert.equal(c.saving,50.9);assert.equal(c.comparison,99);assert.equal(c.comparisonUnit,'liter');});
test('manual zero and comparison overrides are respected',()=>{const c=calculate({...example(),saving:'0',comparison:'12,50',comparisonUnit:'liter'});assert.equal(c.saving,0);assert.equal(c.comparison,12.5);assert.equal(c.comparisonUnit,'liter');});
test('weight and volume conversions',()=>{for(const [unit,weight]of [['g','1000'],['hg','10'],['kg','1'],['ml','1000'],['cl','100'],['dl','10'],['liter','1']])assert.equal(calculate({...example(),unit,weight}).comparison,45);assert.equal(calculate({...example(),unit:'st'}).comparison,null);});
test('numbers and validation reject malformed data',()=>{assert.equal(number(' 74,95 '),74.95);assert.equal(number('74.95'),74.95);for(const x of ['-1','Infinity','45abc','1,2,3'])assert.equal(number(x),null);assert.match(validate({...example(),multi:'1.5'}).join(),/Multipris/);assert.match(validate({...example(),limit:'0'}).join(),/Maxköp/);assert.match(validate({...example(),name:'',price:''}).join(),/namn/);});
test('price formatting rounds before deciding whole-price notation',()=>{assert.equal(money(45),'45:-');assert.equal(money(29.95),'29:95');assert.equal(money(9.999),'10:-');});
test('100-row mapping preserves invalid data for correction and unique filenames',()=>{const rows=Array.from({length:100},(_,i)=>['Samma vara',i===99?'fel':'45,00']);const products=rowsToProducts(rows,{name:0,price:1});assert.equal(products.length,100);assert.equal(products.filter(p=>!validate(p).length).length,99);assert.equal(new Set(products.map(filename)).size,100);});

test('supplier and deposit migrate without changing existing data',async()=>{
 const {hydrateProduct}=await import('./model');const old=example();delete (old as Partial<typeof old>).supplier;delete (old as Partial<typeof old>).deposit;
 const migrated=hydrateProduct(old);assert.equal(migrated.supplier,'');assert.equal(migrated.deposit,false);assert.equal(migrated.id,old.id);assert.equal('maker' in migrated,false);assert.equal(migrated.price,'45');
});
test('deposit accepts spreadsheet boolean forms and retains invalid rows',()=>{
 for(const raw of ['ja','JA',true,'true',1]){const [p]=rowsToProducts([['Kaffe','20',raw,'Leverantör']],{name:0,price:1,deposit:2,supplier:3});assert.equal(p.deposit,true);assert.equal(p.supplier,'Leverantör');assert.deepEqual(validate(p),[]);}
 for(const raw of ['nej',false,'false',0,''])assert.equal(rowsToProducts([['Kaffe','20',raw]],{name:0,price:1,deposit:2})[0].deposit,false);
 const [invalid]=rowsToProducts([['Kaffe','20','kanske']],{name:0,price:1,deposit:2});assert.match(validate(invalid).join(),/Pant tillkommer.*kanske/);
 delete invalid.depositError;invalid.deposit=true;assert.deepEqual(validate(invalid),[]);
});
test('compact centered detail lines show supplier and weight and omit optional gaps',async()=>{
 const {detailLines}=await import('./model');const p={...example(),supplier:'Löfbergs',weight:'500',price:'20',regular:'45',comparison:'40',limit:'2'};
 assert.deepEqual(detailLines(p),['Löfbergs 500 g','Ord. 45,00/frp Jfr. 40,00/kg','Max 2 köp']);
 assert.equal(detailLines({...p,lowest:'40',deposit:true})[2],'30-dgr-pris. 40,00/frp / pant tillkommer');
 assert.equal(detailLines({...p,deposit:true})[2],'pant tillkommer');
 assert.equal(detailLines({...p,lowest:'40'})[2],'30-dgr-pris. 40,00/frp');
 assert.equal(detailLines({...p,supplier:'Grossisten'})[0],'Grossisten 500 g');
});

test('new and legacy Excel headers distinguish weight unit from price unit',async()=>{
 const {mapColumns}=await import('./model');
 for(const headers of [['Varans namn','Pris','Viktenhet','Enhet'],['Varans namn','Pris','Enhet','Prissuffix']]){
  const [p]=rowsToProducts([['Kaffe','45','g','st']],mapColumns(headers));assert.equal(p.unit,'g');assert.equal(p.suffix,'st');assert.deepEqual(validate(p),[]);
 }
 assert.match(validate({...example(),suffix:'kg'}).join(),/Enhet efter priset/);
});

test('saved manufacturer is discarded while all other product data survives',async()=>{
 const {hydrateProduct,detailLines}=await import('./model');
 const product={...example(),supplier:'Grossisten',deposit:true};
 const migrated=hydrateProduct({...product,maker:'Gammal tillverkare'});
 assert.deepEqual(migrated,product);assert.equal('maker' in migrated,false);
 assert.equal(detailLines(migrated)[0],'Grossisten 450 g');
 assert.equal(detailLines(hydrateProduct({...example(),maker:'Gammal tillverkare'}))[0],'450 g');
});
test('Excel fields omit manufacturer and legacy manufacturer columns are ignored',async()=>{
 const {fields,mapColumns}=await import('./model');
 assert.ok(!fields.some(([key,label])=>String(key)==='maker'||label==='Tillverkare'));
 const mapping=mapColumns(['Varans namn','Tillverkare','Pris','Leverantör']);
 assert.equal('maker' in mapping,false);
 const [p]=rowsToProducts([['Kaffe','Gammal tillverkare','20','Grossisten']],{...mapping,maker:1});
 assert.equal('maker' in p,false);assert.equal(p.supplier,'Grossisten');assert.equal(p.price,'20');assert.deepEqual(validate(p),[]);
});
