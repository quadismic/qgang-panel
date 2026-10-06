"use client";
import {Button} from "./Primitives";
export function LoadMore({count,onClick,label="KAYIT",disabled=false}:{count:number;onClick:()=>void;label?:string;disabled?:boolean}){if(count<=0)return null;return <div className="qgLoadMore"><Button onClick={onClick} disabled={disabled}>{count} {label} DAHA GÖSTER ↓</Button></div>}
