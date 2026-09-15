"use client";
import { createClient } from "@/lib/supabase/client";

export function AuthButtons(){
 async function oauth(provider:"google"|"discord"){
   const supabase=createClient();
   if(!supabase){ alert("Q-GANG Auth yapılandırması tamamlanıyor."); return; }
   await supabase.auth.signInWithOAuth({provider,options:{redirectTo:`${location.origin}/auth/callback`}});
 }
 return <div className="authButtons">
   <button onClick={()=>oauth("google")}>Google ile devam et</button>
   <button onClick={()=>oauth("discord")}>Discord ile devam et</button>
   <a className="button" href="/auth/steam">Steam ile devam et</a>
 </div>
}
