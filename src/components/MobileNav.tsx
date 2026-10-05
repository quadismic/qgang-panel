import {MobileNavClient} from "./MobileNavClient";
export function MobileNav(props:{user?:boolean;manage?:boolean;canViewBudget?:boolean}){return <MobileNavClient {...props}/>;}
