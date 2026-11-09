import type {QGIconName} from "@/components/QGIcon";
type Item=readonly [string,QGIconName,string];
export type LobbyNavAccess={canViewEvents?:boolean;manage?:boolean;canViewBudget?:boolean;canManageDiscipline?:boolean;canManageMembers?:boolean;canViewDiscipline?:boolean};
export function lobbyNavigation(access:LobbyNavAccess){
 const primary:Item[]=[["/","headquarters","Lobi"],...(access.canViewEvents?[["/etkinlikler","calendar","Oyun & Etkinlikler"] as const]:[]),["/topluluk","community","Topluluk"]];
 const management:Item[]=[...(access.manage?[["/yonetim","control","Yönetim merkezi"] as const]:[]),...(access.canManageMembers?[["/topluluk?manage=1","people","Üye yönetimi"] as const]:[]),...(access.canViewBudget?[["/butce","treasury","Bütçe"] as const]:[]),...(access.canManageDiscipline?[["/yonetim/moderasyon","discipline","Disiplin yönetimi"] as const]:[])];
 return {primary,management};
}
export function lobbyNavActive(path:string,href:string){
 if(href==="/")return path==="/";
 if(href==="/topluluk"&&/^\/(yayinlar|publications|members)(\/|$)/.test(path))return true;
 return !href.includes("?")&&(path===href||path.startsWith(href+"/"));
}
