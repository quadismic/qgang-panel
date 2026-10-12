export const PUBLICATION_TYPES = [
 ["thought", "Düşünce"], ["game", "Oyun"], ["technology", "Teknoloji"],
 ["video", "Video"], ["research", "Araştırma"], ["cinema", "Sinema"],
] as const;
export const PUBLICATION_LABELS:Record<string,string>=Object.fromEntries(PUBLICATION_TYPES);
export const PUBLICATION_BADGE_LABELS:Record<string,string>=Object.fromEntries(PUBLICATION_TYPES.map(([key,label])=>[key,key==="cinema"?label:label.toLocaleUpperCase("tr-TR")]));
export const PUBLICATION_STATUSES:Record<string,string>={draft:"Taslak",published:"Yayında"};
export function publicationStatus(value:unknown){return value==="published"?"published":"draft";}
export function publicationKind(value:string,youtube?:string|null){return value==="cinema"?value:youtube?"video":value;}
