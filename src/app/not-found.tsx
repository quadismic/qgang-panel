"use client";
import Link from "next/link";
import {useEffect} from "react";

export default function NotFound(){
 useEffect(()=>{const id=window.setTimeout(()=>location.assign("/"),2400);return()=>window.clearTimeout(id)},[]);
 return <main className="qgangReturnPage">
  <Link href="/" className="qgangReturnMessage" aria-label="Karargâha dön">
   <h1>Geri dön.</h1>
   <p>Burada bir şey yok.</p>
   <span>Karargâha dönülüyor…</span>
  </Link>
 </main>
}