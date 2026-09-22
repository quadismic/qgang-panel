import {NavClient} from "./NavClient";
export function Nav({manage=false,identity=null,canViewBudget=false}:{manage?:boolean;canViewBudget?:boolean;identity?:any}){return <NavClient manage={manage} identity={identity} canViewBudget={canViewBudget}/>}
