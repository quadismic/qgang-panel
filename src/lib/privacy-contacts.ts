import {cache} from "react";import {createClient} from "@/lib/supabase/server";
const defaultContacts=["ofkarabul@gmail.com","quadismic@gmail.com"];
const validEmail=(value:unknown):value is string=>typeof value==="string"&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
export const privacyContacts=cache(async()=>{const s=await createClient();const {data}=await s.rpc("get_privacy_contacts");const contacts=Array.isArray(data)?data.filter(validEmail):[];const additional=(process.env.QGANG_PRIVACY_CONTACT_EMAILS||"").split(/[,;\n]/).map(v=>v.trim()).filter(validEmail);return Array.from(new Set([...(contacts.length?contacts:defaultContacts),...additional]));});
