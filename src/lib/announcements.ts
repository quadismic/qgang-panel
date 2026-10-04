export function announcementType(category?: string | null): "DUYURU" | "KARAR" {
  const value = (category || "").toLocaleUpperCase("tr-TR").split(" · ")[0].trim();
  return ["KARAR", "RÜTBE EMRİ", "ATAMA", "TAKDİR"].includes(value) ? "KARAR" : "DUYURU";
}
export const announcementPriorityLabel: Record<string, string> = {
  normal: "NORMAL", important: "ÖNEMLİ", critical: "KRİTİK",
};

export const announcementTypeLabel = (category: string) => category === "KARAR" ? "İCRA KARARI" : "DUYURU";
export const announcementLink = (item: {id:string;regulation_id?:string|null}) => item.regulation_id ? `/kodeks?rule=${item.regulation_id}` : `/duyurular#duyuru-${item.id}`;
