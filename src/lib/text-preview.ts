export function textPreview(value:string, limit:number):string {
 const text=value.trim().replace(/\s+/g," ");
 const chars=Array.from(text);
 if(chars.length<=limit)return text;
 const prefix=chars.slice(0,limit-1).join("");
 if(/\s/u.test(chars[limit-1]))return prefix.trimEnd()+"…";
 const boundary=prefix.lastIndexOf(" ");
 return (boundary>0?prefix.slice(0,boundary):prefix)+"…";
}
