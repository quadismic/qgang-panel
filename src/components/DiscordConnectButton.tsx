"use client";
import { createClient } from "@/lib/supabase/client";

export function DiscordConnectButton() {
  async function connect() {
    const supabase = createClient();
    const { error } = await supabase.auth.linkIdentity({
      provider: "discord",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/account")}` },
    });
    if (error) window.location.assign("/account?error=discord");
  }
  return <button type="button" className="accountLink" onClick={connect}>Discord'u Bağla</button>;
}
