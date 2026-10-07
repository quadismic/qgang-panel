"use client";
import {useId,useState,type ReactNode} from "react";
import {Dialog} from "@/components/ui/Dialog";
import {OverflowMenu} from "@/components/ui/OverflowMenu";
import {Button,IconButton} from "@/components/ui/Primitives";
type Panel="create"|"propose"|"archive"|"settings";
const titles:Record<Panel,string>={create:"Etkinlik oluştur",propose:"Etkinlik öner",archive:"Tarihsel etkinlik aktarımı",settings:"Etkinlik türleri ve sıralama"};
export function EventPageActions({createForm,proposalForm,archiveForm,settingsForm}:{createForm?:ReactNode;proposalForm?:ReactNode;archiveForm?:ReactNode;settingsForm?:ReactNode}){
 const [panel,setPanel]=useState<Panel|null>(null),titleId=useId();
 const forms={create:createForm,propose:proposalForm,archive:archiveForm,settings:settingsForm};
 return <div className="eventPageActions">{proposalForm&&<Button onClick={()=>setPanel("propose")}>Etkinlik öner</Button>}{createForm&&<Button level="primary" onClick={()=>setPanel("create")}>Etkinlik oluştur</Button>}{(archiveForm||settingsForm)&&<OverflowMenu label="Etkinlik yönetimi seçenekleri">{archiveForm&&<Button level="tertiary" onClick={e=>{e.currentTarget.closest("details")?.removeAttribute("open");setPanel("archive");}}>Tarihsel aktarım</Button>}{settingsForm&&<Button level="tertiary" onClick={e=>{e.currentTarget.closest("details")?.removeAttribute("open");setPanel("settings");}}>Türler ve sıralama</Button>}</OverflowMenu>}{panel&&forms[panel]&&<Dialog open onClose={()=>setPanel(null)} labelledBy={titleId} className="eventOperationsDialog"><header><h2 id={titleId}>{titles[panel]}</h2><IconButton icon="close" label="Kapat" onClick={()=>setPanel(null)}/></header><div className="eventOperationsBody">{forms[panel]}</div></Dialog>}</div>;
}
