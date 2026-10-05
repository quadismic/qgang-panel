// Input is already sanitized by richHtml. Keep Q-GANG-hosted media immediate.
export function deferredContent(html:string,enabled:ReadonlySet<string>):string{
 return html.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>|<img\b[^>]*>/gi,markup=>{
 const source=markup.match(/\bsrc="([^"]*)"/)?.[1];if(!source||enabled.has(source))return markup;
 const video=markup.startsWith("<iframe");
 if(!video){try{const host=new URL(source,"https://q-gang.com").hostname;if(["q-gang.com","www.q-gang.com","qgang-panel.vercel.app","kttebbvinfmauthmayqp.supabase.co"].includes(host)||source.startsWith("/"))return markup;}catch{return "";}}
 return `<span class="qgExternalContent"><span>${video?"Bu video YouTube tarafından sunulur.":"Bu görsel dış bir sağlayıcıdan yüklenir."} Yüklediğinde sağlayıcıya bağlantı kurulur.</span><button type="button" class="qgAction" data-external-src="${source}">${video?"Videoyu":"Görseli"} yükle</button><a href="/gizlilik/cerezler">Dış içerik bilgisi</a></span>`;
 });
}
