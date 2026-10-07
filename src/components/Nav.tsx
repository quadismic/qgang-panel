import {NavClient} from "./NavClient";
export function Nav({manage=false,identity=null,canViewBudget=false,canViewEvents=false}:{manage?:boolean;canViewEvents?:boolean;canViewBudget?:boolean;identity?:any}){return <NavClient canViewEvents={canViewEvents} manage={manage} identity={identity} canViewBudget={canViewBudget}/>}
