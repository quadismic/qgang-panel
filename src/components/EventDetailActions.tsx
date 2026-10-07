"use client";
import {useId,useState,type ReactNode} from "react";
import {Dialog} from "@/components/ui/Dialog";
import {OverflowMenu} from "@/components/ui/OverflowMenu";
import {Button,IconButton} from "@/components/ui/Primitives";
type Panel="edit"|"status"|"attendance"|"links";
const titles={edit:"Etkinliği düzenle",status:"Yayın ve durum",attendance:"Yoklama ve katılım",links:"Tarihsel üye eşleştirmeleri"};
export function EventDetailActions({editForm,statusForm,attendanceForm,linksForm}:{editForm?:ReactNode;statusForm?:ReactNode;attendanceForm?:ReactNode;linksForm?:ReactNode}){
 const [panel,setPanel]=useState<Panel|null>(null),titleId=useId(),forms={edit:editForm,status:statusForm,attendance:attendanceForm,links:linksForm};
 if(!Object.values(forms).some(Boolean))return null;
 return <div className="eventDetailActions">{editForm&&<Button onClick={()=>setPanel("edit")}>Düzenle</Button>}{(statusForm||attendanceForm||linksForm)&&<div className="eventManagementMenu"><span>Yönetim</span><OverflowMenu label="Etkinlik yönetimi">{(["status","attendance","links"] as const).map(key=>forms[key]&&<Button key={key} level="tertiary" onClick={e=>{e.currentTarget.closest("details")?.removeAttribute("open");setPanel(key);}}>{titles[key]}</Button>)}</OverflowMenu></div>}{panel&&forms[panel]&&<Dialog open onClose={()=>setPanel(null)} labelledBy={titleId} className="eventOperationsDialog"><header><h2 id={titleId}>{titles[panel]}</h2><IconButton icon="close" label="Kapat" onClick={()=>setPanel(null)}/></header><div className="eventOperationsBody">{forms[panel]}</div></Dialog>}</div>;
}
