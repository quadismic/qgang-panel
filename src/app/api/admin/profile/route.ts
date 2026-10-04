import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/access";
import { canAssign, canManage } from "@/lib/roles";
import { normalizeRich, validRich } from "@/lib/rich-text";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url), 303);
  const s = await createClient();
  const { data: actor } = await s.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!canManage(actor?.role) || !await hasPermission(user.id, "members.manage")) {
    return NextResponse.json({ error: "Bu işlem için yetkin yok." }, { status: 403 });
  }
  const form = await req.formData();
  const id = String(form.get("target_id") || "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Geçersiz üye." }, { status: 400 });
  }
  const location = `/topluluk?manage=1&edit=${id}`;
  const fail = (error: string) => NextResponse.redirect(new URL(`${location}&error=${error}`, req.url), 303);
  const { data: target } = await s.from("profiles").select("id,role").eq("id", id).maybeSingle();
  if (!target || (id !== user.id && !canAssign(actor?.role, target.role))) {
    return NextResponse.json({ error: "Bu üyenin profilini düzenleyemezsin." }, { status: 403 });
  }
  const display_name = String(form.get("display_name") || "").trim();
  const handle = String(form.get("handle") || "").trim().toLowerCase();
  const bio = normalizeRich(String(form.get("bio") || ""));
  const banner_motion = String(form.get("banner_motion") || "none");
  if (display_name.length < 2 || display_name.length > 50 || !/^[a-z0-9_]{3,24}$/.test(handle) ||
      !validRich(bio, 280) || !["none", "pan-left", "pan-right", "zoom-in", "zoom-out"].includes(banner_motion)) {
    return fail("validation");
  }
  const changes: Record<string, string> = { display_name, handle, bio, banner_motion, updated_at: new Date().toISOString() };
  const files = [["avatar", "qgang-avatars", 3145728], ["banner", "qgang-banners", 6291456]] as const;
  // Validate all images before performing any storage writes.
  for (const [key, , max] of files) {
    const file = form.get(key);
    if (file instanceof File && file.size && (file.size > max || !["image/png", "image/jpeg", "image/webp"].includes(file.type))) return fail("image");
  }
  const uploaded: { bucket: string; path: string }[] = [];
  const cleanup = async () => { for (const { bucket, path } of uploaded) await s.storage.from(bucket).remove([path]); };
  for (const [key, bucket] of files) {
    const file = form.get(key);
    if (!(file instanceof File) || !file.size) continue;
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    // Existing storage RLS requires the uploader's own folder, even when editing another profile.
    const path = `${user.id}/admin-${id}-${key}-${crypto.randomUUID()}.${ext}`;
    const { error } = await s.storage.from(bucket).upload(path, file, { contentType: file.type });
    if (error) { await cleanup(); return fail("image"); }
    uploaded.push({ bucket, path });
    changes[`${key}_url`] = s.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }
  const { data: updated, error } = await s.from("profiles").update(changes).eq("id", id).select("id").maybeSingle();
  if (error || !updated) { await cleanup(); return fail("save"); }
  return NextResponse.redirect(new URL(`${location}&saved=1`, req.url), 303);
}
