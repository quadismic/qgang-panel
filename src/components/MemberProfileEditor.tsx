
import {Input,Select,Button} from "@/components/ui/Primitives";
import { RichTextEditor } from "@/components/RichTextEditor";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/access";
import { canAssign, canManage } from "@/lib/roles";
import { redirect, notFound } from "next/navigation";


export async function MemberProfileEditor({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/topluluk?manage=1&edit=${id}`)}`);
  const s = await createClient();
  const { data: actor } = await s.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!canManage(actor?.role) || !await hasPermission(user.id, "members.manage")) redirect("/");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const { data: p } = await s.from("profiles").select("id,display_name,handle,bio,banner_motion,role").eq("id", id).maybeSingle();
  if (!p) notFound();
  if (id !== user.id && !canAssign(actor?.role, p.role)) redirect("/topluluk?manage=1");
  const q = await searchParams;
  return <section className="memberProfileEditor">
    <section className="utilityHero"><span className="kicker">Q-GANG · YETKİLİ DÜZENLEME</span><h2>{p.display_name}</h2><p>@{p.handle} üyesinin herkese açık kimlik alanlarını düzenle.</p></section>
    {q.error && <p className="notice" role="alert">{q.error === "image" ? "Görsel yüklenemedi. Dosya türünü ve boyutunu kontrol et." : q.error === "validation" ? "Kullanıcı adı, rumuz veya metin sınırını kontrol et." : "Profil kaydedilemedi. Rumuzun kullanılabilirliğini ve yetkini kontrol et."}</p>}
    {q.saved && <p className="notice success" role="status">Üye profili kaydedildi.</p>}
    <form className="panel identitySettingsForm" action="/api/admin/profile" method="post" encType="multipart/form-data">
      <input type="hidden" name="target_id" value={p.id}/>
      <div className="identityFieldGrid">
        <label>Kullanıcı Adı<Input name="display_name" defaultValue={p.display_name} minLength={2} maxLength={50} required/></label>
        <label>Rumuz<Input name="handle" defaultValue={p.handle} minLength={3} maxLength={24} required pattern="[a-z0-9_]{3,24}"/></label>
        <div className="full qgEditorField"><span>Hakkında</span><RichTextEditor label="Hakkında" density="compact" rows={2} name="bio" defaultValue={p.bio || ""} maxLength={280}/></div>
        <label>Avatar (en fazla 3 MB)<Input type="file" name="avatar" accept="image/png,image/jpeg,image/webp"/></label>
        <label>Banner (en fazla 6 MB)<Input type="file" name="banner" accept="image/png,image/jpeg,image/webp"/></label>
        <label>Banner hareketi<Select name="banner_motion" defaultValue={p.banner_motion || "none"}><option value="none">Sabit</option><option value="pan-left">Soldan sağa</option><option value="pan-right">Sağdan sola</option><option value="zoom-in">Yakınlaş</option><option value="zoom-out">Uzaklaş</option></Select></label>
      </div>
      <Button type="submit" level="primary" className="">Üye Profilini Kaydet</Button> <a href="/topluluk?manage=1" className="qgAction">Topluluk Yönetimine Dön</a>
    </form>
  </section>;
}
