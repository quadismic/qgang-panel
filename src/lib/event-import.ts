import {EVENT_TYPES} from "@/lib/events";
export type LegacyEvent={id:string;type:string;date:string;deleted?:boolean;status?:string;names?:string;attendance?:string|null;attendanceConfirmed?:boolean};
export type EventIdentity={id:string;handle:string;display_name:string};
export type EventLink={name:string;user_id:string};
export const eventIdentityKey=(name:string)=>name.normalize("NFKC").trim().replace(/^@/,"").toLocaleLowerCase("tr-TR");
export function previewEventImport(events:LegacyEvent[],profiles:EventIdentity[],links:EventLink[]) {
 const seen=new Set<string>();return events.map(e=>{
  const problems:string[]=[];if(!e.id||seen.has(e.id))problems.push("duplicate_source");seen.add(e.id);
  const validDate=/^\d{4}-\d{2}-\d{2}$/.test(e.date)&&Number.isFinite(Date.parse(e.date))&&new Date(e.date).toISOString().slice(0,10)===e.date;
  if(!validDate)problems.push("invalid_date");
  if(validDate&&e.date>new Date().toLocaleDateString("en-CA",{timeZone:"Europe/Istanbul"}))problems.push("future_event");
  if(e.deleted)problems.push("deleted");
  if(!["puan_onaylandi","tamamlandi","completed"].includes(e.status||""))problems.push("completion_review");
  const type=EVENT_TYPES.find(t=>t.name===e.type.trim().toUpperCase());
  let rollcall:Record<string,unknown>={};try {const parsed=JSON.parse(e.attendance||"{}");if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))rollcall=parsed;else problems.push("invalid_rollcall");}catch{problems.push("invalid_rollcall")}
  const raw=(e.names||"").split(",").map(n=>n.trim()).filter(Boolean);
  if(e.attendanceConfirmed)raw.push(...Object.keys(rollcall).filter(n=>rollcall[n]==="present"));
  const participants=[...new Map(raw.map(n=>[eventIdentityKey(n),n])).values()].map(name=>{
   const key=eventIdentityKey(name),verifiedLinks=links.filter(l=>eventIdentityKey(l.name)===key&&profiles.some(p=>p.id===l.user_id));
   const uniqueLinks=[...new Set(verifiedLinks.map(l=>l.user_id))];
   const candidates=profiles.filter(p=>eventIdentityKey(p.handle)===key||eventIdentityKey(p.display_name)===key);
   const values=Object.entries(rollcall).filter(([n])=>eventIdentityKey(n)===key).map(([,v])=>v);
   const attended=e.attendanceConfirmed&&values.length===1?(values[0]==="present"?true:values[0]==="absent"?false:null):null;
   return {name,user_id:uniqueLinks.length===1?uniqueLinks[0]:null,candidates:candidates.map(p=>p.id),match:uniqueLinks.length===1?"verified_link":candidates.length===1?"candidate":candidates.length>1?"ambiguous":"unmatched",attended};
  });
  if(participants.some(p=>p.attended===null))problems.push("attendance_review");
  if(!type)problems.push("legacy_type_preserved");
  return {source_id:e.id,type_id:type?.id??null,legacy_type:type?null:e.type,date:e.date,participants,problems,eligible:!problems.some(p=>["deleted","duplicate_source","invalid_date","completion_review","invalid_rollcall","future_event"].includes(p))};
 });
}
