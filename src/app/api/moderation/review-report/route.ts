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
  const form = await req.formData(),
    reportId = String(form.get("report_id") || ""),
    status = String(form.get("status") || ""),
    note = normalizeRich(String(form.get("review_note") || "")),
    actionId = String(form.get("action_id") || "");
  if (
    !reportId ||
    !["reviewing", "resolved", "dismissed"].includes(status) ||
    !validRich(note,1000,5)
  )
    return NextResponse.redirect(
      new URL("/penalties?report_error=validation", req.url),
      303,
    );
  const [{ data: reviewer }, { data: report }] = await Promise.all([
    s.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    s
      .from("reports")
      .select("id,reported_user_id,status")
      .eq("id", reportId)
      .in("status", ["open", "reviewing"])
      .maybeSingle(),
  ]);
  if (!reviewer || !canModerate(reviewer.role) || !report)
    return NextResponse.redirect(
      new URL("/penalties?report_error=permission", req.url),
      303,
    );
  if (status === "resolved") {
    if (!actionId)
      return NextResponse.redirect(
        new URL("/penalties?report_error=action", req.url),
        303,
      );
    const { data: action } = await s
      .from("moderation_actions")
      .select("id")
      .eq("id", actionId)
      .eq("target_user_id", report.reported_user_id)
      .maybeSingle();
    if (!action)
      return NextResponse.redirect(
        new URL("/penalties?report_error=action", req.url),
        303,
      );
  }
  const { error } = await s
    .from("reports")
    .update({
      status,
      reviewed_by: user.id,
      review_note: note,
      reviewed_at: new Date().toISOString(),
      moderation_action_id: status === "resolved" ? actionId : null,
    })
    .eq("id", report.id);
  return NextResponse.redirect(
    new URL(
      error ? "/penalties?report_error=save" : "/penalties?report_reviewed=1",
      req.url,
    ),
    303,
  );
}
