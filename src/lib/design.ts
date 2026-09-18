export type DesignSettings={
 primary:string; bone:string; bronze:string;
 sidebarWidth:number; sidebarEmblem:number;
 heroOverlay:number; quadWidth:number; quadTop:number;
 loginPanelWidth:number; loginEmblem:number; loginOverlay:number;
 motto:string; systemLine:string;
};
export const defaultDesign:DesignSettings={
 primary:"#a71b18",bone:"#e8ddcb",bronze:"#9a7655",
 sidebarWidth:182,sidebarEmblem:58,
 heroOverlay:42,quadWidth:560,quadTop:0,
 loginPanelWidth:510,loginEmblem:92,loginOverlay:42,
 motto:"Düzen, özgürlüğün en güçlü hâlidir.",systemLine:"SİSTEM\nİNSANLARLA\nYAŞAR."
};
export function normalizeDesign(v:any):DesignSettings{
 const n=(x:any,d:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(Number(x))?Number(x):d));
 const color=(x:any,d:string)=>/^#[0-9a-f]{6}$/i.test(String(x||""))?String(x):d;
 return {
  primary:color(v?.primary,defaultDesign.primary),bone:color(v?.bone,defaultDesign.bone),bronze:color(v?.bronze,defaultDesign.bronze),
  sidebarWidth:n(v?.sidebarWidth,182,160,260),sidebarEmblem:n(v?.sidebarEmblem,58,36,100),
  heroOverlay:n(v?.heroOverlay,42,0,80),quadWidth:n(v?.quadWidth,560,280,850),quadTop:n(v?.quadTop,0,-120,180),
  loginPanelWidth:n(v?.loginPanelWidth,510,360,720),loginEmblem:n(v?.loginEmblem,92,48,160),loginOverlay:n(v?.loginOverlay,42,0,80),
  motto:String(v?.motto||defaultDesign.motto).slice(0,120),systemLine:String(v?.systemLine||defaultDesign.systemLine).slice(0,80)
 };
}
