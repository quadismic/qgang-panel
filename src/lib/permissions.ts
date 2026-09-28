import { createClient, getCurrentUser } from "@/lib/supabase/server";

export async function getPermissions() {
  const s = await createClient();
  const user = await getCurrentUser();
  if (!user) return { user: null, role: "guest", permissions: new Set<string>() };
  const { data: profile } = await s.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role ?? "guest";
  if (role === "founder") return { user, role, permissions: new Set(["*"]) };
  const { data } = await s.from("role_permissions").select("permission,enabled").eq("role", role).eq("enabled", true);
  return { user, role, permissions: new Set((data ?? []).map((item: any) => item.permission)) };
}

export function allows(permissions: Set<string>, permission: string) {
  return permissions.has("*") || permissions.has(permission);
}
