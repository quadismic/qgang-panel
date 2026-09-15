import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OPENID = "https://steamcommunity.com/openid/login";

function originOf(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return configured || new URL(request.url).origin;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = originOf(request);
  const callback = new URL("/auth/steam", origin);
  callback.searchParams.set("action", "callback");

  if (url.searchParams.get("action") !== "callback") {
    const s = await createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return NextResponse.redirect(new URL("/login?next=/profile", origin));

    const auth = new URL(OPENID);
    auth.searchParams.set("openid.ns", "http://specs.openid.net/auth/2.0");
    auth.searchParams.set("openid.mode", "checkid_setup");
    auth.searchParams.set("openid.return_to", callback.toString());
    auth.searchParams.set("openid.realm", origin + "/");
    auth.searchParams.set("openid.identity", "http://specs.openid.net/auth/2.0/identifier_select");
    auth.searchParams.set("openid.claimed_id", "http://specs.openid.net/auth/2.0/identifier_select");
    return NextResponse.redirect(auth);
  }

  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?next=/profile", origin));

  const verify = new URLSearchParams();
  for (const [key, value] of url.searchParams) {
    if (key.startsWith("openid.")) verify.set(key, value);
  }
  verify.set("openid.mode", "check_authentication");

  const verification = await fetch(OPENID, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: verify.toString(),
    cache: "no-store"
  });
  const body = await verification.text();
  const claimed = url.searchParams.get("openid.claimed_id") || "";
  const steamId = claimed.match(/^https?:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/)?.[1];

  if (!verification.ok || !body.includes("is_valid:true") || !steamId) {
    return NextResponse.redirect(new URL("/profile?steam=error", origin));
  }

  let handle: string | null = null;
  let profileUrl = "https://steamcommunity.com/profiles/" + steamId;
  let metadata: Record<string, unknown> = {};

  const apiKey = process.env.STEAM_WEB_API_KEY;
  if (apiKey) {
    try {
      const api = new URL("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/");
      api.searchParams.set("key", apiKey);
      api.searchParams.set("steamids", steamId);
      const response = await fetch(api, { cache: "no-store" });
      if (response.ok) {
        const json = await response.json();
        const player = json?.response?.players?.[0];
        if (player) {
          handle = player.personaname ?? null;
          profileUrl = player.profileurl ?? profileUrl;
          metadata = {
            avatar: player.avatarfull ?? player.avatarmedium ?? null,
            persona_state: player.personastate ?? null,
            game_id: player.gameid ?? null,
            game_name: player.gameextrainfo ?? null,
            last_logoff: player.lastlogoff ?? null
          };
        }
      }
    } catch {}
  }

  const { error } = await s.from("connected_accounts").upsert({
    user_id: user.id,
    provider: "steam",
    provider_user_id: steamId,
    provider_handle: handle,
    profile_url: profileUrl,
    metadata
  }, { onConflict: "user_id,provider" });

  return NextResponse.redirect(new URL(error ? "/profile?steam=save-error" : "/profile?steam=connected", origin));
}
