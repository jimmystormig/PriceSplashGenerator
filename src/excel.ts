import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import {example,fields,priceUnits} from './model';

export async function createTemplate():Promise<ArrayBuffer>{
 const workbook=XLSX.utils.book_new();
 const p=example();
 const sheet=XLSX.utils.aoa_to_sheet([
  fields.map(([,label])=>label),
  fields.map(([key])=>key==='deposit'?(p.deposit?'ja':'nej'):p[key])
 ]);
 sheet['!cols']=fields.map(()=>({wch:22}));
 // Preformat every supported EAN row so Excel preserves leading zeroes on entry.
 for(let row=2;row<=5001;row++)sheet[`A${row}`]={t:'s',v:'',z:'@'};
 sheet['!ref']='A1:O5001';
 XLSX.utils.book_append_sheet(workbook,sheet,'Varor');
 const notes=XLSX.utils.aoa_to_sheet([
  ['Så använder du mallen'],
  ['En vara per rad, högst 5 000 varor. Varans namn och Pris är obligatoriska.'],
  ['EAN: valfri referens. Kolumnen är textformaterad för inledande nollor. Visas inte på prisskylten.'],
  ['Multipris antal: t.ex. 2. Pris: totalpriset för erbjudandet, t.ex. 99.'],
  ['Ordinarie pris och Varans vikt avser en vara.'],
  ['Viktenhet: g, hg, kg, ml, cl, dl, liter eller st.'],
  ['Enhet: välj frp, st, kg eller hg i rullistan (visas efter priset). Standard är frp.'],
  ['Jämförpris och Besparing: lämna tomt för automatisk beräkning.'],
  ['Jämförprisenhet: kg eller liter (vid manuellt jämförpris).'],
  ['Maxköp: heltal, visas som Max 2 köp.'],
  ['Leverantör: valfri, visas tillsammans med vikt.'],
  ['Pant tillkommer: välj ja eller nej i rullistan. Standard är nej; tomt betyder nej.'],
  ['Behåll kolumnrubrikerna. Typsnitt väljs i appen för hela batchen.']
 ]);
 notes['!cols']=[{wch:110}];
 XLSX.utils.book_append_sheet(workbook,notes,'Instruktioner');
 // SheetJS CE does not write data validation; add it to the generated worksheet XML.
 const zip=await JSZip.loadAsync(XLSX.write(workbook,{type:'array',bookType:'xlsx'}));
 const path='xl/worksheets/sheet1.xml';
 const xml=await zip.file(path)!.async('string');
 const rules=[['F',priceUnits],['O',['ja','nej']]] as const;
 const validations=rules.map(([column,options])=>`<dataValidation type="list" allowBlank="1" showErrorMessage="1" errorStyle="stop" sqref="${column}2:${column}5001"><formula1>"${options.join(',')}"</formula1></dataValidation>`).join('');
 zip.file(path,xml.replace('</sheetData>',`</sheetData><dataValidations count="2">${validations}</dataValidations>`));
 return zip.generateAsync({type:'arraybuffer',compression:'DEFLATE'});
}
