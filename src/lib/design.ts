export type CouncilSlot={id:string;enabled:boolean;scale:number;x:number;y:number;src:string};
export type DesignSettings={
 primary:string; bone:string; bronze:string;
 sidebarWidth:number; sidebarEmblem:number;
 heroOverlay:number; quadScale:number; quadY:number;
 commandBackground:string;quadSrc:string;emblemSrc:string;loginBackground:string;
 roomCodex:string;roomRegistry:string;roomDecrees:string;roomTribunal:string;roomTreasury:string;
 council:CouncilSlot[];
 loginPanelWidth:number; loginEmblem:number; loginOverlay:number;
 motto:string; systemLine:string; favicon:string; siteTitle:string; siteDescription:string; pageDescriptions:Record<string,string>;
};
export const councilIds=["left-1","left-2","right-1","right-2"] as const;
const councilDefaultSrc:Record<string,string>={"left-1":"/brand/command/council-left-1.webp","left-2":"/brand/command/council-left-2.webp","right-1":"/brand/command/council-right-1.webp","right-2":"/brand/command/council-right-2.webp"};
const defaultCouncil:CouncilSlot[]=councilIds.map(id=>({id,enabled:false,scale:100,x:0,y:0,src:councilDefaultSrc[id]}));
export const defaultDesign:DesignSettings={
 primary:"#a71b18",bone:"#e8ddcb",bronze:"#9a7655",sidebarWidth:182,sidebarEmblem:58,
 heroOverlay:42,quadScale:100,quadY:0,commandBackground:"/brand/command/background.webp",quadSrc:"/brand/command/quad.webp",
 emblemSrc:"/brand/qgang-emblem.webp",loginBackground:"/brand/login/background.webp",
 roomCodex:"/brand/rooms/codex.webp",roomRegistry:"/brand/rooms/registry.webp",roomDecrees:"/brand/rooms/decrees.webp",roomTribunal:"/brand/rooms/tribunal.webp",roomTreasury:"/brand/rooms/treasury.webp",
 council:defaultCouncil,loginPanelWidth:510,loginEmblem:92,loginOverlay:42,
 motto:"Düzen, özgürlüğün en güçlü hâlidir.",systemLine:"SİSTEM\nİNSANLARLA\nYAŞAR.",favicon:"/brand/qgang-emblem.webp",siteTitle:"Q-GANG",siteDescription:"Q-GANG topluluk karargâhı.",pageDescriptions:{home:"Q-GANG Karargâhı",rules:"Q-GANG kuralları ve düzeni",members:"Q-GANG topluluğu",announcements:"Q-GANG duyuruları",discipline:"Q-GANG disiplin kayıtları",budget:"Q-GANG hazine kayıtları"}
};
export function normalizeDesign(v:any):DesignSettings{
 const n=(x:any,d:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(Number(x))?Number(x):d));
 const color=(x:any,d:string)=>/^#[0-9a-f]{6}$/i.test(String(x||""))?String(x):d;
 const path=(x:any,d:string)=>{const s=String(x||"");return (s.startsWith("/")||s.startsWith("https://"))?s.slice(0,1000):d};
 const oldScale=n(v?.quadWidth,560,280,850)/560*100,rawCouncil=Array.isArray(v?.council)?v.council:[];
 const council=councilIds.map(id=>{const x=rawCouncil.find((z:any)=>z?.id===id);return {id,enabled:Boolean(x?.enabled),scale:n(x?.scale,100,50,160),x:n(x?.x,0,-30,30),y:n(x?.y,0,-30,30),src:path(x?.src,councilDefaultSrc[id])}});
 return {
  primary:color(v?.primary,defaultDesign.primary),bone:color(v?.bone,defaultDesign.bone),bronze:color(v?.bronze,defaultDesign.bronze),
  sidebarWidth:n(v?.sidebarWidth,182,160,260),sidebarEmblem:n(v?.sidebarEmblem,58,36,100),
  heroOverlay:n(v?.heroOverlay,42,0,80),quadScale:n(v?.quadScale,oldScale,65,140),quadY:n(v?.quadY,v?.quadTop??0,-30,30),
  commandBackground:path(v?.commandBackground,defaultDesign.commandBackground),quadSrc:path(v?.quadSrc,defaultDesign.quadSrc),emblemSrc:path(v?.emblemSrc,defaultDesign.emblemSrc),loginBackground:path(v?.loginBackground,defaultDesign.loginBackground),
  roomCodex:path(v?.roomCodex,defaultDesign.roomCodex),roomRegistry:path(v?.roomRegistry,defaultDesign.roomRegistry),roomDecrees:path(v?.roomDecrees,defaultDesign.roomDecrees),roomTribunal:path(v?.roomTribunal,defaultDesign.roomTribunal),roomTreasury:path(v?.roomTreasury,defaultDesign.roomTreasury),
  council,loginPanelWidth:n(v?.loginPanelWidth,510,360,720),loginEmblem:n(v?.loginEmblem,92,48,160),loginOverlay:n(v?.loginOverlay,42,0,80),
  motto:String(v?.motto||defaultDesign.motto).slice(0,120),systemLine:String(v?.systemLine||defaultDesign.systemLine).slice(0,80),favicon:path(v?.favicon,defaultDesign.favicon),siteTitle:String(v?.siteTitle||defaultDesign.siteTitle).slice(0,60),siteDescription:String(v?.siteDescription||defaultDesign.siteDescription).slice(0,180),pageDescriptions:{...defaultDesign.pageDescriptions,...(v?.pageDescriptions&&typeof v.pageDescriptions==="object"?v.pageDescriptions:{})}
 };
}