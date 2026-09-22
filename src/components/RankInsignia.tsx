import {roleLabel} from "@/lib/roles";

const assets:Record<string,string>={
 member:"/brand/ranks/member.webp",
 creator:"/brand/ranks/lieutenant.webp",
 moderator:"/brand/ranks/captain.webp",
 admin:"/brand/ranks/deputy.webp",
 founder:"/brand/ranks/leader.webp"
};

export function RankInsignia({role,size="md",label=false,className=""}:{role?:string|null;size?:"xs"|"sm"|"md"|"lg";label?:boolean;className?:string}){
 if(!role||!assets[role])return null;
 return <span className={`rankInsignia rankInsignia-${size} ${className}`.trim()} title={roleLabel(role)}>
   <img src={assets[role]} alt={roleLabel(role)+" rütbe nişanı"}/>
   {label&&<b>{roleLabel(role)}</b>}
 </span>
}