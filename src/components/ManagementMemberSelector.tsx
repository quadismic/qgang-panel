"use client";
import {useRouter,useSearchParams} from "next/navigation";
import {MemberPicker,type MemberChoice} from "@/components/MemberPicker";
export function ManagementMemberSelector({initialMember}:{initialMember:MemberChoice|null}){
 const router=useRouter(),params=useSearchParams();
 return <div className="managementMemberSelector"><MemberPicker name="selected_member" label="Düzenlenecek üye / hesap" scope="management" required={false} initialMember={initialMember} onChange={member=>{const next=new URLSearchParams(params.toString());next.set("manage","1");next.delete("edit");if(member)next.set("member",member.id);else next.delete("member");router.replace("/topluluk?"+next.toString(),{scroll:false});}}/></div>;
}
