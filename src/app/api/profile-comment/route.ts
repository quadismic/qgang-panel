import {normalizeRich,validRich} from "@/lib/rich-text";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function destination(raw: string, req: Request) {
  return new URL(raw.startsWith("/") && !raw.startsWith("//") ? raw : "/", req.url);
}

function respond(
  raw: string,
  req: Request,
  key: "commented" | "comment_error",
  value: string,
) {
  const url = destination(raw, req);
  url.searchParams.set(key, value);
  return NextResponse.redirect(url, 303);
}

export async function POST(req: Request) {
  const s = await createClient();
  const {
    data: { user },
  } = await s.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url), 303);

  const form = await req.formData();
  const profileId = String(form.get("profile_id") ?? "").trim();
  const body = normalizeRich(String(form.get("body") ?? ""));
  const returnTo = String(form.get("return_to") ?? "/");

  if (!profileId || profileId === user.id || !validRich(body, 500, 2))
    return respond(returnTo, req, "comment_error", "validation");

  const { error } = await s.from("profile_comments").insert({
    profile_id: profileId,
    author_id: user.id,
    body,
  });
  return error
    ? respond(returnTo, req, "comment_error", "save")
    : respond(returnTo, req, "commented", "1");
}
