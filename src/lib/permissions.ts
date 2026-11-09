import {getViewerProfile,getRolePermissions} from "@/lib/viewer";
import {cache} from "react";
import { getCurrentUser } from "@/lib/supabase/server";

export const getPermissions = cache(async function getPermissions() {
  const user = await getCurrentUser();
  if (!user) return { user: null, role: "guest", permissions: new Set<string>() };
  const profile=await getViewerProfile(user.id);
  if(profile?.is_suspended)return {user,role:"guest",permissions:new Set<string>()};
  const role = profile?.role ?? "guest";
  if (role === "founder") return { user, role, permissions: new Set(["*"]) };
  return { user, role, permissions: await getRolePermissions(role) };
});

export function allows(permissions: Set<string>, permission: string) {
  return permissions.has("*") || permissions.has(permission);
}
