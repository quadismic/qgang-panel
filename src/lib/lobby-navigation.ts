import type {QGIconName} from "@/components/QGIcon";
type Item=readonly [string,QGIconName,string];
export type LobbyNavAccess={manage?:boolean;canManageMembers?:boolean};
export function lobbyNavigation(access:LobbyNavAccess){
 const primary:Item[]=[["/","headquarters","Ana Sayfa"],["/topluluk","community","Üyeler"],["/etkinlikler","calendar","Etkinlikler"],["/kodeks","rules","Kodeks"]];
 // Keep management entry points compact; each destination still enforces its own permissions.
 const management:Item[]=[...(access.manage?[["/yonetim","control","Yönetim Paneli"] as const]:[]),...(access.canManageMembers&&!access.manage?[["/topluluk?manage=1","people","Üye yönetimi"] as const]:[])];
 return {primary,management};
}
export function lobbyNavActive(path:string,href:string){
 if(href==="/")return path==="/";
 if(href==="/topluluk"&&/^\/(yayinlar|publications|members)(\/|$)/.test(path))return true;
 if(href==="/kodeks"&&/^\/(rules|kodeks)(\/|$)/.test(path))return true;
 return !href.includes("?")&&(path===href||path.startsWith(href+"/"));
}
