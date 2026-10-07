import {MobileNavClient} from "./MobileNavClient";
export function MobileNav(props:{user?:boolean;canViewEvents?:boolean;manage?:boolean;canViewBudget?:boolean;canViewDiscipline?:boolean}){return <MobileNavClient {...props}/>;}
