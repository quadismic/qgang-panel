"use client";
import { createClient } from "@/lib/supabase/client";
export function AuthButtons(){
 async function oauth(provider:"google"|"discord"){
  const supabase=createClient();
  const {error}=await supabase.auth.signInWithOAuth({provider,options:{redirectTo:`${location.origin}/auth/callback`}});
  if(error) alert("Giriş başlatılamadı: "+error.message);
 }
 return <div className="authButtons"><button onClick={()=>oauth("google")}>Google ile devam et</button><button onClick={()=>oauth("discord")}>Discord ile devam et</button><a className="button" href="/auth/steam">Steam ile devam et</a></div>
}