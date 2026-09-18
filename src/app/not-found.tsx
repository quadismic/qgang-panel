import Link from "next/link";import {brandTheme} from "@/config/brand-theme";

export default function NotFound(){
  return <main className="statePage stateAmbient qgangNotFound">
    <img className="qgangNotFoundSeal" src={brandTheme.emblem} alt="Q-GANG"/>
    <span className="kicker">404 · KAYIT BULUNAMADI</span>
    <h1>Bu geçit hiç açılmadı.</h1>
    <p>Aradığınız bölüm Q-GANG kayıtlarında bulunamadı.</p>
    <div><Link className="button primary" href="/">Karargâha Dön</Link></div>
  </main>
}