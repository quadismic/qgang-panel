import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const s = await createClient(); const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?next=/announcements", req.url), 303);
  const [{ data: profile }, form] = await Promise.all([s.from("profiles").select("role").eq("id", user.id).maybeSingle(), req.formData()]);
  const { data: permission } = await s.from("role_permissions").select("enabled").eq("role", profile?.role ?? "guest").eq("permission", "announcements.delete").maybeSingle();
  if (profile?.role !== "founder" && !permission?.enabled) return NextResponse.redirect(new URL("/announcements?error=permission", req.url), 303);
  const id = String(form.get("id") ?? ""); if (!id) return NextResponse.redirect(new URL("/announcements?error=delete", req.url), 303);
  const { error } = await s.from("announcements").delete().eq("id", id).eq("category","DUYURU");
  return NextResponse.redirect(new URL(error ? "/announcements?error=delete" : "/announcements?deleted=1", req.url), 303);
}
