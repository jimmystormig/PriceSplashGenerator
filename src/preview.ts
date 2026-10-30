import type {Settings} from './model';

function luminance(color:string):number{
 const channels=[1,3,5].map(start=>{
  const value=parseInt(color.slice(start,start+2),16)/255;
  return value<=.04045?value/12.92:((value+.055)/1.055)**2.4;
 });
 return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
}

export function previewBackground(settings:Pick<Settings,'background'|'textColor'>):string{
 if(settings.background==='white')return '#ffffff';
 if(settings.background==='black')return '#000000';
 const text=luminance(settings.textColor),dark=luminance('#222222');
 const onWhite=1.05/(text+.05);
 const onDark=(Math.max(text,dark)+.05)/(Math.min(text,dark)+.05);
 return onDark>onWhite?'#222222':'#ffffff';
}
