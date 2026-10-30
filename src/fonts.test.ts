import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateFontData} from './model';

function header(signature:number):ArrayBuffer{
 const data=new ArrayBuffer(4);new DataView(data).setUint32(0,signature);return data;
}

test('AppleDouble metadata produces instructions for selecting the actual font',()=>{
 // The Windows screenshot reports this exact sfntVersion in decimal.
 assert.throws(()=>validateFontData(header(333319)),/Mac-metadatafil.*utan \._.*__MACOSX/);
});

test('supported font signatures proceed to browser validation',()=>{
 for(const signature of [0x4f54544f,0x00010000,0x74727565,0x774f4646,0x774f4632])assert.doesNotThrow(()=>validateFontData(header(signature)));
});

test('empty, truncated and unrelated files produce a readable format error',()=>{
 for(const data of [new ArrayBuffer(0),new ArrayBuffer(3),header(0x504b0304),header(0x3c68746d)])assert.throws(()=>validateFontData(data),/Filen innehåller inte ett typsnitt/);
});
