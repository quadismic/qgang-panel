export type AppRole="founder"|"admin"|"moderator"|"creator"|"member";
export const ROLE_LABEL:Record<AppRole,string>={founder:"LİDER",admin:"VEKİLHARÇ",moderator:"KAPTAN",creator:"TEĞMEN",member:"ÜYE"};
export const ROLE_LEVEL:Record<AppRole,number>={founder:50,admin:40,moderator:30,creator:20,member:10};
export function roleLabel(role?:string|null){return ROLE_LABEL[(role||"member") as AppRole]??"ÜYE"}
export function canManage(role?:string|null){return role==="founder"||role==="admin"}
export function canModerate(role?:string|null){return role==="founder"||role==="admin"||role==="moderator"}
export function canAssign(actor?:string|null,target?:string|null){if(actor==="founder")return target!=="founder";if(actor==="admin")return target==="moderator"||target==="creator"||target==="member";return false}
