import type { Campfire, FeedPost } from "./types";

export const campfires: Campfire[] = [
  { id:"valheim", slug:"valheim", name:"Valheim", description:"Keşfet, inşa et, savaş. Ateşin başında diğer Vikingleri bul.", member_count: 12 },
  { id:"cs2", slug:"counter-strike-2", name:"Counter-Strike 2", description:"Takımını bul, maçını konuş, birlikte gir.", member_count: 8 },
  { id:"crimson", slug:"crimson-desert", name:"Crimson Desert", description:"Pywel kıtasındaki yolculuğu birlikte keşfet.", member_count: 5 }
];

export const posts: FeedPost[] = [
  { id:"1", author:"Quadismic", handle:"@quadismic", body:"Q-GANG ateşi yanıyor. İlk hedefimiz basit: aynı oyunu seven insanları buluşturmak.", campfire:"Q-GANG", created_at:"Şimdi", reactions:18, comments:4 },
  { id:"2", author:"Lillycha", handle:"@lillycha", body:"Valheim ateşinde kimler var? Yeni dünyaya başlamak için ekip arıyoruz.", campfire:"Valheim", created_at:"12 dk", reactions:9, comments:7 }
];
