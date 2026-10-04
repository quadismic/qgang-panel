import {redirect} from "next/navigation";
export default async function LegacyPublicationStudio({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const params=new URLSearchParams({studio:"1"});for(const [key,value] of Object.entries(await searchParams)){if(typeof value==="string"&&key!=="studio")params.set(key,value);}redirect(`/yayinlar?${params}`);}
