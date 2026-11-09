import {cookies} from "next/headers";
import {randomBytes,timingSafeEqual} from "node:crypto";
import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

const OPENID="https://steamcommunity.com/openid/login";
const LIFETIME=600;
export async function GET(request:Request){
 const url=new URL(request.url);
 const origin=process.env.NEXT_PUBLIC_SITE_URL?new URL(process.env.NEXT_PUBLIC_SITE_URL).origin:url.origin;
 const callback=new URL("/auth/steam",origin);
 callback.searchParams.set("action","callback");
 const store=await cookies();
 const secure=origin.startsWith("https:");
 const cookieName=secure?"__Host-qg-steam-link":"qg-steam-link";
 const cookieOptions={httpOnly:true,secure,sameSite:"lax" as const,path:"/"};
 const s=await createClient();
 const {data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.redirect(new URL("/login?next=/account",origin));
 const fail=()=>NextResponse.redirect(new URL("/account?error=steam",origin));
 if(url.searchParams.get("action")!=="callback"){
  const state=randomBytes(32).toString("hex");
  store.set(cookieName,JSON.stringify({state,userId:user.id,expires:Date.now()+LIFETIME*1000}),{...cookieOptions,maxAge:LIFETIME});
  callback.searchParams.set("state",state);
  const auth=new URL(OPENID);
  for(const [key,value]of Object.entries({ns:"http://specs.openid.net/auth/2.0",mode:"checkid_setup",return_to:callback.toString(),realm:origin+"/",identity:"http://specs.openid.net/auth/2.0/identifier_select",claimed_id:"http://specs.openid.net/auth/2.0/identifier_select"}))auth.searchParams.set("openid."+key,value);
  return NextResponse.redirect(auth);
 }
 const stored=store.get(cookieName)?.value;
 // Consume the challenge on every callback, including failed attempts. Same path as creation.
 store.set(cookieName,"",{...cookieOptions,maxAge:0});
 let saved:{state?:string;userId?:string;expires?:number}|undefined;
 try{saved=JSON.parse(stored||"")}catch{}
 const state=url.searchParams.get("state")||"";
 if(!saved||saved.userId!==user.id||typeof saved.expires!=="number"||saved.expires<Date.now()||!/^[a-f0-9]{64}$/.test(state)||typeof saved.state!=="string"||saved.state.length!==state.length||!timingSafeEqual(Buffer.from(saved.state),Buffer.from(state)))return fail();
 callback.searchParams.set("state",state);
 const signed=new Set((url.searchParams.get("openid.signed")||"").split(","));
 const nonce=url.searchParams.get("openid.response_nonce")||"",nonceTime=Date.parse(nonce.slice(0,20));
 if(url.searchParams.get("openid.return_to")!==callback.toString()||url.searchParams.get("openid.op_endpoint")!==OPENID||url.searchParams.get("openid.mode")!=="id_res"||url.searchParams.get("openid.identity")!==url.searchParams.get("openid.claimed_id")||!["return_to","claimed_id","identity","response_nonce","op_endpoint"].every(k=>signed.has(k))||!Number.isFinite(nonceTime)||Math.abs(Date.now()-nonceTime)>LIFETIME*1000)return fail();
 const verify=new URLSearchParams();
 for(const [key,value]of url.searchParams)if(key.startsWith("openid."))verify.set(key,value);
 verify.set("openid.mode","check_authentication");
 let valid=false;
 try{
  const verification=await fetch(OPENID,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:verify.toString(),cache:"no-store",signal:AbortSignal.timeout(10000)});
  valid=verification.ok&&(await verification.text()).split(/\r?\n/).includes("is_valid:true");
 }catch{return fail()}
 const steamId=(url.searchParams.get("openid.claimed_id")||"").match(/^https?:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/)?.[1];
 if(!valid||!steamId)return fail();
 let handle:string|null=null,profileUrl="https://steamcommunity.com/profiles/"+steamId,metadata:Record<string,unknown>={};
 const apiKey=process.env.STEAM_WEB_API_KEY;
 if(apiKey)try{
  const api=new URL("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/");
  api.searchParams.set("key",apiKey);api.searchParams.set("steamids",steamId);
  const response=await fetch(api,{cache:"no-store",signal:AbortSignal.timeout(5000)});
  if(response.ok){
   const json=await response.json(),player=json?.response?.players?.[0];
   if(player){handle=player.personaname??null;profileUrl=player.profileurl??profileUrl;metadata={avatar:player.avatarfull??player.avatarmedium??null,persona_state:player.personastate??null,game_id:player.gameid??null,game_name:player.gameextrainfo??null,last_logoff:player.lastlogoff??null}}
  }
 }catch{}
 const {error}=await s.from("connected_accounts").upsert({user_id:user.id,provider:"steam",provider_user_id:steamId,provider_handle:handle,profile_url:profileUrl,metadata},{onConflict:"user_id,provider"});
 return NextResponse.redirect(new URL(error?"/account?error=steam-save":"/account?linked=steam",origin));
}
