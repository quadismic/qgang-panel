import {redirect} from "next/navigation";
export default async function LegacyCommunity({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const params=new URLSearchParams({manage:"1"});for(const [key,value] of Object.entries(await searchParams)){if(typeof value==="string"&&key!=="manage")params.set(key,value);}redirect(`/topluluk?${params}`);}
