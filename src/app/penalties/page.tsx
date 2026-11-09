import {DisciplineDesk,type DisciplineQuery} from "./DisciplineDesk";
import {pageMeta} from "@/lib/design";

export const metadata=pageMeta.discipline;
export default function Penalties({searchParams}:{searchParams:Promise<DisciplineQuery>}){
 return <DisciplineDesk searchParams={searchParams}/>;
}
