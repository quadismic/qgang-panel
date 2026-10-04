import {normalizeRich,validRich} from "@/lib/rich-text";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function destination(raw: string, req: Request) {
  const base=new URL(req.url);
  const target=new URL(raw.startsWith("/") && !raw.startsWith("//") ? raw : "/",base);
  return target.origin===base.origin && /^\/publications\/[a-z0-9-]+$/.test(target.pathname)?target:new URL("/publications",base);
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
  if(form.get("action")==="delete"){
 const id=String(form.get("comment_id")||"");const {data,error}=await s.from("publication_comments").delete().eq("id",id).select("id");return respond(String(form.get("return_to")||"/"),req,error||!data?.length?"comment_error":"commented",error||!data?.length?"delete":"1");
 }
 const publicationId = String(form.get("publication_id") ?? "").trim();
  const body = normalizeRich(String(form.get("body") ?? ""));
  const returnTo = String(form.get("return_to") ?? "/");

  if (!publicationId || !validRich(body, 500, 2))
    return respond(returnTo, req, "comment_error", "validation");

  const { error } = await s.from("publication_comments").insert({
    publication_id: publicationId,
    author_id: user.id,
    body,
  });
  return error
    ? respond(returnTo, req, "comment_error", error.message.includes("comment_rate_limit") ? "rate" : "save")
    : respond(returnTo, req, "commented", "1");
}
