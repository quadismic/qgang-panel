import {hasPermission} from "@/lib/access";
import {isEffective} from "@/lib/codex";
import {normalizeRich,validRich} from "@/lib/rich-text";
import { NextResponse } from "next/server";
import { canModerate } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const s = await createClient(),
    {
      data: { user },
    } = await s.auth.getUser();
  if (!user)
    return NextResponse.redirect(
      new URL("/login?next=/penalties", req.url),
      303,
    );
  const { data: me } = await s
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!canModerate(me?.role) || !await hasPermission(user.id,"discipline.issue"))
    return NextResponse.redirect(
      new URL("/penalties?error=permission", req.url),
      303,
    );
  const form = await req.formData(),
    target = String(form.get("target_id") || ""),
    action = String(form.get("action") || ""),
    reason = normalizeRich(String(form.get("reason") || "")),
    rule = String(form.get("regulation_id") || ""),
    evidence = normalizeRich(String(form.get("evidence") || "")),
    hours = Math.max(0, Number(form.get("hours") || 0));
  if (
    !target || !rule || !Number.isFinite(hours) || hours > 87600 ||
    !["warning", "restriction", "mute", "suspension", "ban"].includes(action) ||
    !validRich(reason,500,5) || !validRich(evidence,2000)
  )
    return NextResponse.redirect(
      new URL("/penalties?error=validation", req.url),
      303,
    );
  if ((action === "suspension" || action === "ban") && me?.role === "moderator")
    return NextResponse.redirect(
      new URL("/penalties?error=permission", req.url),
      303,
    );
  const {data:basis}=await s.from("regulations").select("id,kind,status,effective_at").eq("id",rule).maybeSingle();
  if(!basis || !["KURAL","YÖNERGE"].includes(basis.kind) || !isEffective(basis)) return NextResponse.redirect(new URL("/penalties?error=basis",req.url),303);
  const expires = hours
    ? new Date(Date.now() + hours * 3600000).toISOString()
    : null;
  const { error } = await s
    .from("moderation_actions")
    .insert({
      moderator_id: user.id,
      target_user_id: target,
      action,
      reason,
      regulation_id: rule,
      evidence: evidence || null,
      expires_at: expires,
      status: "active",
    });
  return NextResponse.redirect(
    new URL(
      error ? "/penalties?error=save" : "/penalties?sanctioned=1",
      req.url,
    ),
    303,
  );
}
