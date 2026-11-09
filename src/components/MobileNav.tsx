import {MobileNavClient} from "./MobileNavClient";
import type {LobbyNavAccess} from "@/lib/lobby-navigation";
export function MobileNav(props:LobbyNavAccess&{user?:boolean}){return <MobileNavClient {...props}/>;}
