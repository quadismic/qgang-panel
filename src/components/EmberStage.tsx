"use client";
import {usePathname} from "next/navigation";
export function EmberStage({children}:{children:React.ReactNode}){
 const path=usePathname();
 const modern=path.startsWith("/qgang-3");
 if(modern)return <div className="qg3-stage">{children}</div>;
 return <div className="emberStage" data-route={path}><div className="emberTrace" aria-hidden="true"/>{children}</div>;
}
