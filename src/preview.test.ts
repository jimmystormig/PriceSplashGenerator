import {test} from 'node:test';
import assert from 'node:assert/strict';
import {previewBackground} from './preview';

test('transparent preview chooses the higher contrast backdrop for text',()=>{
 for(const textColor of ['#ffffff','#eeeeee','#ffff00','#00ff00','#ffaaaa']){
  assert.equal(previewBackground({background:'transparent',textColor}),'#222222');
 }
 for(const textColor of ['#000000','#101010','#0000ff','#800080','#ff0000']){
  assert.equal(previewBackground({background:'transparent',textColor}),'#ffffff');
 }
});

test('opaque preview always matches the selected export background',()=>{
 for(const textColor of ['#ffffff','#000000','#ff0000']){
  assert.equal(previewBackground({background:'white',textColor}),'#ffffff');
  assert.equal(previewBackground({background:'black',textColor}),'#000000');
 }
});
