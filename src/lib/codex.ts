export type CodexRule = {
  parent_rule_id?:string|null; id: string; title: string; body: string | null; kind: string | null;
  number: string | null; section_number: string | null; status: string | null;
  published_at: string | null; effective_at: string | null; revision: number | null;
  updated_at: string | null; created_by: string | null; basis_rule_id: string | null;
  basis_revision: number | null; change_reason: string | null;
  application_scope?: string | null; decision_priority?: string; decision_pinned?: boolean; legacy_announcement_id?: string | null;
};
export const isSecondary = (rule: Pick<CodexRule, "kind">) => ["YÖNERGE", "KARAR"].includes(rule.kind || "");
export function isEffective(rule: Pick<CodexRule, "status" | "effective_at">, now = Date.now()) {
  return rule.status === "yururlukte" && (!rule.effective_at || new Date(rule.effective_at).getTime() <= now);
}
export function canEditRule(role: string | null | undefined, userId: string | undefined, rule: CodexRule, issuerRole?: string | null) {
  if (role === "founder") return true;
  if (!["YÖNERGE","KARAR"].includes(rule.kind||"") || !userId) return false;
  return (role === "moderator" && rule.created_by === userId) ||
    (role === "admin" && (rule.created_by === userId || issuerRole === "moderator"));
}

export const codexKindLabel = (kind?: string | null) => kind === "KARAR" ? "İCRA KARARI" : kind || "KURAL";
export const codexTab = (rule: Pick<CodexRule,"kind">) => rule.kind === "KARAR" ? "decisions" : rule.kind === "YÖNERGE" ? "directives" : "primary";
