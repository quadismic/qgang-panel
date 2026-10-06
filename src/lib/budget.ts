import type {SupabaseClient} from "@supabase/supabase-js";
export type BudgetRecord={id:string;kind:string;amount:number|string;title:string;description:string|null;category:string|null;supporter_name:string|null;is_anonymous:boolean;created_at:string};
export type BudgetScope={kind:"all"|"support"|"expense";from?:string;to?:string};
export function budgetCategory(value:string|null){return (value||"GENEL").trim().toLocaleUpperCase("tr-TR")==="DİĞER"?"Diğer":value||"GENEL";}
export function amountCents(value:number|string){const amount=Number(value);if(!Number.isFinite(amount)||amount<0||!Number.isSafeInteger(Math.round(amount*100)))throw new Error("Invalid budget amount");return Math.round(amount*100);}
export function budgetTotals(rows:BudgetRecord[]){let income=0,expense=0;for(const row of rows){const cents=amountCents(row.amount);if(row.kind==="support")income+=cents;else if(row.kind==="expense")expense+=cents;else throw new Error("Invalid budget kind");}if(!Number.isSafeInteger(income)||!Number.isSafeInteger(expense))throw new Error("Budget total overflow");return {income,expense,balance:income-expense};}
export function parseBudgetScope(params:URLSearchParams):BudgetScope{
 const kind=params.get("kind")||"all",from=params.get("from")||undefined,to=params.get("to")||undefined;
 if(!["all","support","expense"].includes(kind))throw new Error("Geçersiz kapsam.");
 for(const date of [from,to])if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date))throw new Error("Geçersiz tarih.");
 if(from&&to&&from>to)throw new Error("Başlangıç tarihi bitiş tarihinden sonra olamaz.");
 return {kind:kind as BudgetScope["kind"],from,to};
}
export async function readBudgetRecords(client:SupabaseClient,scope:BudgetScope={kind:"all"},cutoff=new Date().toISOString()):Promise<BudgetRecord[]>{
 const result:BudgetRecord[]=[];const batch=500;
 for(let offset=0;;offset+=batch){let query=client.from("fund_transactions").select("id,kind,amount,title,description,category,supporter_name,is_anonymous,created_at").is("reversed_at",null).lte("created_at",cutoff).order("created_at",{ascending:false}).order("id",{ascending:false});
 if(scope.kind!=="all")query=query.eq("kind",scope.kind);
 if(scope.from)query=query.gte("created_at",scope.from+"T00:00:00+03:00");
 if(scope.to)query=query.lte("created_at",scope.to+"T23:59:59.999+03:00");
 const {data,error}=await query.range(offset,offset+batch-1);if(error)throw new Error("Bütçe kayıtları okunamadı.");
 const rows=(data||[]) as BudgetRecord[];result.push(...rows.map(row=>({...row,supporter_name:row.is_anonymous?null:row.supporter_name})));if(rows.length<batch)break;
 }return result;
}
