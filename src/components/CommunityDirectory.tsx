"use client";
import {Input,Select} from "@/components/ui/Primitives";
import {useEffect,useState} from "react";
import {useRouter,useSearchParams} from "next/navigation";
import {roleLabel} from "@/lib/roles";

type Account={id:string;display_name:string;handle:string;role:string;avatar_url?:string|null;membership_status:string|null;member_no:number|null;is_suspended:boolean};
export function CommunityDirectory({selectedId}:{selectedId?:string}) {
  const router=useRouter(),params=useSearchParams();
  const [q,setQ]=useState(""),[role,setRole]=useState("all"),[status,setStatus]=useState("all"),[suspended,setSuspended]=useState("all"),[page,setPage]=useState(1);
  const [items,setItems]=useState<Account[]>([]),[hasNext,setHasNext]=useState(false),[busy,setBusy]=useState(true),[error,setError]=useState("");
  useEffect(()=>{
    const controller=new AbortController();
    const timer=setTimeout(async()=>{
      setBusy(true);setError("");setItems([]);setHasNext(false);
      try {
        const query=new URLSearchParams({q,role,status,suspended,page:String(page)});
        const response=await fetch("/api/community-directory?"+query,{signal:controller.signal});
        if(!response.ok)throw new Error("Liste yüklenemedi. Yeniden dene.");
        const data=await response.json();
        if(!controller.signal.aborted){setItems(data.items);setHasNext(data.hasNext);}
      } catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:"Liste yüklenemedi.");}
      finally{if(!controller.signal.aborted)setBusy(false);}
    },250);
    return ()=>{clearTimeout(timer);controller.abort();};
  },[q,role,status,suspended,page]);
  function choose(id:string){const next=new URLSearchParams(params.toString());next.set("manage","1");next.set("member",id);next.delete("edit");router.replace("/topluluk?"+next,{scroll:false});}
  return <section className="communityDirectory" aria-label="Kayıtlı hesaplar">
    <div className="directoryFilters">
      <label>Hesap ara<Input maxLength={80} value={q} placeholder="Ad, rumuz veya topluluk numarası" onChange={e=>{setQ(e.target.value);setPage(1);}}/></label>
      <label>Üyelik<Select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="all">Tüm hesaplar</option><option value="active">Aktif üyeler</option><option value="inactive">Pasif üyeler</option><option value="none">Üyeliği olmayanlar</option></Select></label>
      <label>Rütbe<Select value={role} onChange={e=>{setRole(e.target.value);setPage(1);}}><option value="all">Tüm rütbeler</option>{["founder","admin","moderator","creator","member","guest"].map(r=><option key={r} value={r}>{roleLabel(r)}</option>)}</Select></label>
      <label>Hesap durumu<Select value={suspended} onChange={e=>{setSuspended(e.target.value);setPage(1);}}><option value="all">Tümü</option><option value="no">Askıda olmayanlar</option><option value="yes">Askıya alınmış</option></Select></label>
    </div>
    <div role="status" aria-live="polite">{busy?"Hesaplar yükleniyor…":error||(!items.length?"Bu filtrelerde hesap bulunamadı.":`${page}. sayfa · ${items.length} hesap`)}</div>
    <div className="directoryRows" aria-busy={busy}>{items.map(p=><article key={p.id} className={selectedId===p.id?"selected":""}>
      <span className="directoryAvatar" aria-hidden="true">{p.avatar_url?<img src={p.avatar_url} alt="" loading="lazy"/>:p.display_name.slice(0,1)}</span>
      <div><strong>{p.display_name}</strong><small>@{p.handle}{p.member_no?` · #${p.member_no}`:""}</small></div>
      <span>{roleLabel(p.role)}</span><span>{p.membership_status==="active"?"Aktif üye":p.membership_status?"Pasif üye":"Platform hesabı"}{p.is_suspended?" · Askıda":""}</span>
      <button type="button" className="qgAction" aria-pressed={selectedId===p.id} onClick={()=>choose(p.id)}>Yönet</button>
    </article>)}</div>
    <nav className="directoryPagination" aria-label="Hesap sayfaları"><button className="qgAction" disabled={busy||page===1} onClick={()=>setPage(p=>p-1)}>← Önceki</button><span>Sayfa {page}</span><button className="qgAction" disabled={busy||!hasNext} onClick={()=>setPage(p=>p+1)}>Sonraki →</button></nav>
  </section>;
}
