import {NavClient,type LobbyIdentity} from "./NavClient";
import type {LobbyNavAccess} from "@/lib/lobby-navigation";
export function Nav(props:LobbyNavAccess&{identity?:LobbyIdentity|null}){return <NavClient {...props}/>;}
