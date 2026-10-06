import {MobileNavClient} from "./MobileNavClient";
export function MobileNav(props:{user?:boolean;manage?:boolean;canViewBudget?:boolean;canViewDiscipline?:boolean}){return <MobileNavClient {...props}/>;}
