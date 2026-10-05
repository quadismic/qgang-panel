"use client";
import {useState} from "react";
export function BirthDateFields(){
 const [day,setDay]=useState(""),[month,setMonth]=useState(""),[year,setYear]=useState("");
 const today=new Date(),currentYear=today.getFullYear();
 const days=month&&year?new Date(Number(year),Number(month),0).getDate():31;
 const date=day&&month&&year?`${year}-${month.padStart(2,"0")}-${day.padStart(2,"0")}`:"";
 return <fieldset className="identityBirthFields"><legend>DOĞUM TARİHİ</legend><input type="hidden" name="birth_date" value={date}/><div>
 <label><span>Gün</span><select required aria-label="Doğum günü" value={day} onChange={e=>setDay(e.target.value)}><option value="">Gün</option>{Array.from({length:days},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label>
 <label><span>Ay</span><select required aria-label="Doğum ayı" value={month} onChange={e=>{const value=e.target.value;setMonth(value);if(year&&Number(day)>new Date(Number(year),Number(value),0).getDate())setDay("");}}><option value="">Ay</option>{["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"].map((name,i)=><option key={name} value={i+1}>{name}</option>)}</select></label>
 <label><span>Yıl</span><select required aria-label="Doğum yılı" value={year} onChange={e=>{const value=e.target.value;setYear(value);if(month&&Number(day)>new Date(Number(value),Number(month),0).getDate())setDay("");}}><option value="">Yıl</option>{Array.from({length:currentYear-1899},(_,i)=><option key={currentYear-i} value={currentYear-i}>{currentYear-i}</option>)}</select></label>
 </div><p>Özel bilgidir; profilinde yayınlanmaz.</p></fieldset>;
}
