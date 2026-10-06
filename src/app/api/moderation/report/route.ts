import {normalizeRich,validRich} from "@/lib/rich-text";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function returnUrl(raw: string, req: Request) {
  const path = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  return new URL(path, req.url);
}

function redirectWith(
  raw: string,
  req: Request,
  key: "reported" | "report_error",
  value: string,
) {
  const url = returnUrl(raw, req);
  url.searchParams.set(key, value);
  return NextResponse.redirect(url, 303);
}

export async function POST(req: Request) {
  const s = await createClient();
  const {
    data: { user },
  } = await s.auth.getUser();
  if (!user)
    return NextResponse.redirect(new URL("/login", req.url), 303);

  const {data:actor}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle();
  if(!actor||actor.role==="guest")return redirectWith("/disiplin",req,"report_error","permission");
  const form = await req.formData();
  const target = String(form.get("target_id") ?? "").trim();
  const reason = normalizeRich(String(form.get("reason") ?? ""));
  const returnTo = String(form.get("return_to") ?? "/");

  if (!target || target === user.id || !validRich(reason,500,5))
    return redirectWith(returnTo, req, "report_error", "validation");

  const [{ data: member }, { data: existing }] = await Promise.all([
    s.from("profiles").select("id").eq("id", target).maybeSingle(),
    s
      .from("reports")
      .select("id")
      .eq("reporter_id", user.id)
      .eq("reported_user_id", target)
      .in("status", ["open", "reviewing"])
      .maybeSingle(),
  ]);
  if (!member) return redirectWith(returnTo, req, "report_error", "missing");
  if (existing) return redirectWith(returnTo, req, "report_error", "duplicate");

  const { error } = await s.from("reports").insert({
    reporter_id: user.id,
    reported_user_id: target,
    reason,
    status: "open",
  });
  return error
    ? redirectWith(returnTo, req, "report_error", "save")
    : redirectWith(returnTo, req, "reported", "1");
}
