import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import {createTemplate} from './excel';
import {mapColumns,rowsToProducts,validate} from './model';

test('generated Excel template has ordered headers, text EAN and usable dropdowns',async()=>{
 const data=await createTemplate();
 const zip=await JSZip.loadAsync(data);
 const xml=await zip.file('xl/worksheets/sheet1.xml')!.async('string');
 assert.match(xml,/<dataValidations count="2">/);
 for(const [range,options] of [['F2:F5001','frp,st,kg,hg'],['O2:O5001','ja,nej']]){
  const rule=xml.match(new RegExp(`<dataValidation [^>]*sqref="${range}"[^>]*>.*?</dataValidation>`))?.[0];
  assert.ok(rule);assert.ok(rule.includes(`<formula1>"${options}"</formula1>`));
  assert.match(rule,/type="list"/);assert.match(rule,/showErrorMessage="1"/);assert.ok(!rule.includes('showDropDown="1"'));
 }
 const workbook=XLSX.read(data,{type:'array',cellNF:true});
 assert.deepEqual(workbook.SheetNames,['Varor','Instruktioner']);
 const sheet=workbook.Sheets.Varor;
 const rows=XLSX.utils.sheet_to_json<unknown[]>(sheet,{header:1,defval:'',blankrows:true});
 const headers=['EAN','Varans namn','Leverantör','Varans vikt','Viktenhet','Enhet','Multipris antal','Maxköp','Pris','Ordinarie pris','Jämförpris','Jämförprisenhet','30-dagars pris','Besparing','Pant tillkommer'];
 assert.deepEqual(rows[0],headers);assert.equal(rows[1][14],'nej');assert.equal(rows[1][5],'frp');
 for(const row of [2,2500,5001])assert.equal(sheet[`A${row}`].z,'@');
 assert.equal(rows.length,5001);
 const products=rowsToProducts(rows.slice(1),mapColumns(headers));
 assert.equal(products.length,1);assert.equal(products[0].deposit,false);assert.deepEqual(validate(products[0]),[]);
 // Simulate saving an entered EAN in Excel and importing the workbook again.
 sheet.A2={...sheet.A2,t:'s',v:'0012345678901'};
 const saved=XLSX.read(XLSX.write(workbook,{type:'array',bookType:'xlsx'}),{type:'array'});
 const entered=XLSX.utils.sheet_to_json<unknown[]>(saved.Sheets.Varor,{header:1,defval:''});
 assert.equal(rowsToProducts(entered.slice(1),mapColumns(headers))[0].ean,'0012345678901');
});
