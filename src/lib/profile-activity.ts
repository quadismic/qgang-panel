export type ProfileActivityEntry = {
  id: string;
  kind: "publication" | "comment" | "badge";
  title: string;
  href: string;
  date: string;
};

export function sortProfileActivity(entries: ProfileActivityEntry[], limit = 20) {
  return entries.filter(entry => Number.isFinite(Date.parse(entry.date)))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.id.localeCompare(a.id))
    .slice(0, limit);
}
