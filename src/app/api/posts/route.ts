import {normalizeRich,validRich} from "@/lib/rich-text";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const s = await createClient(); const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?next=/", req.url), 303);
  const form = await req.formData(); const body = normalizeRich(String(form.get("body") ?? ""));
  if (!validRich(body, 2000, 1)) return NextResponse.redirect(new URL("/?error=post", req.url), 303);
  const { data: profile } = await s.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const { data: permission } = await s.from("role_permissions").select("enabled").eq("role", profile?.role ?? "guest").eq("permission", "post.create").maybeSingle();
  if (profile?.role !== "founder" && !permission?.enabled) return NextResponse.redirect(new URL("/?error=post-permission", req.url), 303);
  const { error } = await s.from("posts").insert({ author_id: user.id, body });
  return NextResponse.redirect(new URL(error ? "/?error=post" : "/?posted=1#nabiz", req.url), 303);
}
