import {normalizeRich,validRich} from "@/lib/rich-text";
import { NextResponse } from "next/server";
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
  const form = await req.formData(),
    appealId = String(form.get("appeal_id") || ""),
    decision = String(form.get("decision") || ""),
    note = normalizeRich(String(form.get("review_note") || ""));
  if (!validRich(note,1000) || !appealId || !["accepted", "rejected"].includes(decision))
    return NextResponse.redirect(
      new URL("/penalties?appeal_error=validation", req.url),
      303,
    );
  const [{ data: reviewer }, { data: appeal }] = await Promise.all([
    s.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    s
      .from("moderation_appeals")
      .select("id,action_id,status")
      .eq("id", appealId)
      .eq("status", "open")
      .maybeSingle(),
  ]);
  if (!appeal || !reviewer)
    return NextResponse.redirect(
      new URL("/penalties?appeal_error=missing", req.url),
      303,
    );
  const { data: action } = await s
    .from("moderation_actions")
    .select("id,moderator_id")
    .eq("id", appeal.action_id)
    .maybeSingle();
  if (!action)
    return NextResponse.redirect(
      new URL("/penalties?appeal_error=missing", req.url),
      303,
    );
  const { data: actor } = await s
    .from("profiles")
    .select("role")
    .eq("id", action.moderator_id)
    .maybeSingle();
  const permitted =
    (actor?.role === "moderator" &&
      ["admin", "founder"].includes(reviewer.role)) ||
    (actor?.role === "admin" && reviewer.role === "founder");
  if (!permitted)
    return NextResponse.redirect(
      new URL("/penalties?appeal_error=permission", req.url),
      303,
    );
  const { error: appealError } = await s
    .from("moderation_appeals")
    .update({
      status: decision,
      reviewed_by: user.id,
      review_note: note || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", appeal.id);
  if (appealError)
    return NextResponse.redirect(
      new URL("/penalties?appeal_error=save", req.url),
      303,
    );
  if (decision === "accepted") {
    const { error } = await s
      .from("moderation_actions")
      .update({ status: "revoked" })
      .eq("id", action.id);
    if (error)
      return NextResponse.redirect(
        new URL("/penalties?appeal_error=save", req.url),
        303,
      );
  }
  return NextResponse.redirect(
    new URL("/penalties?appeal_reviewed=1", req.url),
    303,
  );
}
