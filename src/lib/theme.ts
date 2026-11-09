export const themeKeys=["background","surface","raised","text","muted","line","accent","action","actionText"] as const;
export type ThemeKey=typeof themeKeys[number];
export type ThemePalette=Record<ThemeKey,string>;
export const themeFonts={system:'system-ui,-apple-system,"Segoe UI",Arial,sans-serif',humanist:'"Trebuchet MS",system-ui,sans-serif',editorial:'Georgia,"Times New Roman",serif'} as const;
export type HeadingFont=keyof typeof themeFonts;
export type ThemeSettings={palette:ThemePalette;headingFont:HeadingFont;campaign:null|{palette:ThemePalette;endsOn:string}};
export const themePresets={
 classic:{background:"#100c0a",surface:"#17110e",raised:"#211713",text:"#f3e6d6",muted:"#d0b9a4",line:"#614739",accent:"#e3b27e",action:"#8e2923",actionText:"#fff4ec"},
 gtaVi:{background:"#100e1c",surface:"#1b1528",raised:"#2b1b38",text:"#fff1eb",muted:"#dcc2df",line:"#775273",accent:"#ffc08c",action:"#a32b69",actionText:"#fff5fb"},
 winter:{background:"#0b151b",surface:"#13222b",raised:"#1d3039",text:"#edf7fc",muted:"#bfd6df",line:"#4b7181",accent:"#a7ddec",action:"#245568",actionText:"#f4fbff"},
 bayram:{background:"#0d1712",surface:"#15221a",raised:"#203427",text:"#f8f1db",muted:"#d0d8b9",line:"#54745d",accent:"#f1ce85",action:"#315e44",actionText:"#fff9e8"},
} satisfies Record<string,ThemePalette>;
export const defaultTheme:ThemeSettings={palette:themePresets.classic,headingFont:"system",campaign:null};
function record(x:unknown):Record<string,unknown>{return x&&typeof x==="object"&&!Array.isArray(x)?x as Record<string,unknown>:{};}
export function readPalette(x:unknown):ThemePalette|null{
 const data=record(x);
 return themeKeys.every(k=>typeof data[k]==="string"&&/^#[\da-f]{6}$/i.test(data[k] as string))?Object.fromEntries(themeKeys.map(k=>[k,data[k]])) as ThemePalette:null;
}
function luminance(color:string){
 return [1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
}
export function contrast(a:string,b:string){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
export function accessiblePalette(p:ThemePalette){
 return [p.background,p.surface,p.raised].every(bg=>[p.text,p.muted,p.accent].every(fg=>contrast(fg,bg)>=4.5))&&contrast(p.actionText,p.action)>=4.5;
}
export function campaignExpiry(date:unknown){
 if(typeof date!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;
 const utc=new Date(date+"T00:00:00.000Z");
 if(!Number.isFinite(utc.getTime())||utc.toISOString().slice(0,10)!==date)return null;
 return utc.getTime()+21*60*60*1000;
}
export function normalizeTheme(x:unknown):ThemeSettings{
 const v=record(x),palette=readPalette(v.palette),c=record(v.campaign),campaign=readPalette(c.palette);
 return {palette:palette&&accessiblePalette(palette)?palette:defaultTheme.palette,
 headingFont:typeof v.headingFont==="string"&&Object.hasOwn(themeFonts,v.headingFont)?v.headingFont as HeadingFont:"system",
 campaign:campaign&&accessiblePalette(campaign)&&campaignExpiry(c.endsOn)!==null?{palette:campaign,endsOn:c.endsOn as string}:null};
}
export function themeVariables(theme:ThemeSettings,now=Date.now()){
 const palette=theme.campaign&&now<(campaignExpiry(theme.campaign.endsOn)??0)?theme.campaign.palette:theme.palette;
 return {...Object.fromEntries(themeKeys.map(key=>[`--qg-theme-${key}`,palette[key]])),"--qg-heading-font":themeFonts[theme.headingFont]};
}
export function parseThemeImport(input:string):ThemeSettings{
 if(input.length>8000)throw new Error("Tema ayarı 8 KB sınırını aşıyor.");
 const parsed=record(JSON.parse(input));
 const palette=readPalette(parsed.palette);
 if(!palette||!accessiblePalette(palette)||typeof parsed.headingFont!=="string"||!Object.hasOwn(themeFonts,parsed.headingFont))
  throw new Error("Renkleri, yazı tipi seçimini ve metin kontrastını kontrol et.");
 if(parsed.campaign!==null){
  const c=record(parsed.campaign),p=readPalette(c.palette);
  if(!p||!accessiblePalette(p)||campaignExpiry(c.endsOn)===null)throw new Error("Geçici temanın renklerini, kontrastını ve bitiş tarihini kontrol et.");
 }
 return normalizeTheme(parsed);
}
