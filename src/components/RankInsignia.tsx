import {roleLabel} from "@/lib/roles";

const diamonds:Record<string,{cx:number;cy:number;r:number}[]>={
 member:[{cx:24,cy:24,r:5.5}],
 creator:[{cx:16,cy:24,r:4.5},{cx:32,cy:24,r:4.5}],
 moderator:[{cx:12,cy:24,r:3.5},{cx:24,cy:24,r:5.5},{cx:36,cy:24,r:3.5}],
 admin:[{cx:9,cy:28,r:3},{cx:18,cy:19,r:4.5},{cx:30,cy:19,r:4.5},{cx:39,cy:28,r:3}],
 founder:[{cx:12,cy:12,r:3.5},{cx:36,cy:12,r:3.5},{cx:24,cy:24,r:5.5},{cx:12,cy:36,r:3.5},{cx:36,cy:36,r:3.5}]
};

export function RankInsignia({role,size="md",label=false,className=""}:{role?:string|null;size?:"xs"|"sm"|"md"|"lg";label?:boolean;className?:string}){
 if(!role||!diamonds[role])return null;
 return <span className={`rankInsignia rankInsignia-${size} ${className}`.trim()} title={roleLabel(role)}>
   <svg viewBox="0 0 48 48" role="img" aria-label={roleLabel(role)+" rütbe işareti"} focusable="false">
    {diamonds[role].map(({cx,cy,r},i)=><path key={i} d={`M ${cx} ${cy-r} L ${cx+r} ${cy} L ${cx} ${cy+r} L ${cx-r} ${cy} Z`}/>) }
   </svg>
   {label&&<b>{roleLabel(role)}</b>}
 </span>
}
