"use client";
import "./globals.css";
export default function GlobalError({reset}:{error:Error&{digest?:string};reset:()=>void}){
 return <html lang="tr"><body><main className="qgangSystemError"><section><small>SİSTEM YANIT VERMEDİ</small><h1>Bağlantı koptu.</h1><p>Karargâh şu anda isteği tamamlayamadı.</p><div><button onClick={()=>reset()}>YENİDEN DENE</button><a href="/">KARARGÂHA DÖN</a></div></section></main></body></html>
}