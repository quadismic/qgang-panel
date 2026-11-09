import {DisciplineDesk,type DisciplineQuery} from "../../penalties/DisciplineDesk";
export const metadata={title:"Disiplin yönetimi"};
export default function Moderation({searchParams}:{searchParams:Promise<DisciplineQuery>}){
 return <DisciplineDesk searchParams={searchParams} manage/>;
}
