"use client";
import { createClient } from "@/lib/supabase/client";

export function DiscordConnectButton() {
  async function connect() {
    const supabase = createClient();
    const { error } = await supabase.auth.linkIdentity({
      provider: "discord",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/profile` },
    });
    if (error) window.alert("Discord bağlantısı başlatılamadı: " + error.message);
  }
  return <button type="button" className="accountLink" onClick={connect}>Discord'u Bağla</button>;
}
