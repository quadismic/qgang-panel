import {AppShell} from "@/components/AppShell";
import {ProfileEditor} from "@/components/ProfileEditor";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
export const dynamic="force-dynamic";
export const metadata={title:"Profili düzenle"};
export default async function EditProfile({searchParams}:{searchParams:Promise<{error?:string}>}){
 const user=await getCurrentUser();
 if(!user)redirect("/login?next=/profile/edit");
 const s=await createClient();
 const {data:profile,error}=await s.from("profiles").select("id,display_name,handle,bio,avatar_url,banner_url,banner_motion,comments_enabled,onboarding_completed_at").eq("id",user.id).maybeSingle();
 if(error)throw new Error("Profil düzenleme bilgileri yüklenemedi.");
 if(!profile?.onboarding_completed_at)redirect("/onboarding?next=/profile/edit");
 const {data:birth,error:birthError}=await s.rpc("get_profile_birthday",{target_user:user.id}).maybeSingle();
 if(birthError)throw new Error("Doğum tarihi bilgileri yüklenemedi.");
 const q=await searchParams;
 const messages:Record<string,string>={validation:"Alanları kontrol edin. Rumuz 3–24 küçük harf, rakam veya alt çizgiden oluşmalı; doğum tarihi geçerli olmalıdır.",image:"Görsel yüklenemedi. Dosya türünü ve boyutunu kontrol edin.",handle:"Profil kaydedilemedi. Rumuz başka bir hesap tarafından kullanılıyor olabilir."};
 return <AppShell right={false}><main className="profileEditPageContainer">{q.error&&<p className="notice" role="alert">{messages[q.error]||"Profil kaydedilemedi. Tekrar deneyin."}</p>}<ProfileEditor profile={{...profile,...(birth&&typeof birth==="object"?birth:{birthday_visibility:"private"})}}/></main></AppShell>;
}
