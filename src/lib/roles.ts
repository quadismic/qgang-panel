export type AppRole="founder"|"admin"|"moderator"|"creator"|"member"|"guest";
export const ROLE_LABEL:Record<AppRole,string>={founder:"LİDER",admin:"VEKİLHARÇ",moderator:"KAPTAN",creator:"TEĞMEN",member:"ÜYE",guest:"PLATFORM"};
export const ROLE_LEVEL:Record<AppRole,number>={founder:50,admin:40,moderator:30,creator:20,member:10,guest:0};
export const PERMISSIONS=[
 ["members.view","Üyeleri Görüntüle"],["members.manage","Üyeleri Yönet"],["members.delete","Üyeyi Kalıcı Sil"],
 ["discipline.view","Disiplini Görüntüle"],["discipline.issue","Yaptırım Uygula"],["discipline.review","Karar / İtiraz İncele"],
 ["announcements.publish","Duyuru / Karar Yayınla"],["budget.view","Bütçeyi Görüntüle"],["budget.manage","Bütçeyi Yönet"],
 ["design.manage","Tasarımı Yönet"],["access.manage","Erişim Merkezini Yönet"]
] as const;
export type Permission=(typeof PERMISSIONS)[number][0];
export function roleLabel(role?:string|null){return ROLE_LABEL[(role||"member") as AppRole]??"ÜYE"}
export function canManage(role?:string|null){return role==="founder"||role==="admin"}
export function canModerate(role?:string|null){return role==="founder"||role==="admin"||role==="moderator"}
export function canAssign(actor?:string|null,target?:string|null){if(actor==="founder")return target!=="founder";if(actor==="admin")return target==="moderator"||target==="creator"||target==="member"||target==="guest";return false}
