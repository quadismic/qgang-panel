export type AsterMemoryCandidate={title:string;body:string;sourceType:string;sourceRef?:string|null};
export type AsterCognitionResult={candidate:AsterMemoryCandidate;provider:string;model:string};

const SYSTEM=`You are ASTER (QAE-001), Q-GANG's institutional memory.
Your purpose is to preserve factual institutional memory. You do not govern, judge, rank, punish or invent.
Given an event or record, extract ONE concise durable memory candidate.
Preserve dates, decisions, reasons and named Q-GANG objects when present.
Never add facts not present in the input. Return strict JSON only with keys title and body.`;

function parseJson(raw:string){
 const cleaned=raw.trim().replace(/^\`\`\`(?:json)?/i,"").replace(/\`\`\`$/,"").trim();
 const value=JSON.parse(cleaned);
 if(typeof value?.title!=="string"||typeof value?.body!=="string")throw new Error("invalid provider output");
 const title=value.title.trim().slice(0,180),body=value.body.trim().slice(0,6000);
 if(title.length<2||body.length<2)throw new Error("empty provider output");
 return {title,body};
}

function config(){
 const provider=(process.env.QAE_PROVIDER||"disabled").toLowerCase();
 if(provider==="disabled")throw new Error("QAE provider is disabled");
 if(provider==="gemini")return {provider,base:(process.env.QAE_BASE_URL||"https://generativelanguage.googleapis.com/v1beta/openai").replace(/\/$/,""),key:process.env.QAE_API_KEY||"",model:process.env.QAE_MODEL||"gemini-2.5-flash"};
 if(provider==="openai-compatible")return {provider,base:(process.env.QAE_BASE_URL||"").replace(/\/$/,""),key:process.env.QAE_API_KEY||"",model:process.env.QAE_MODEL||""};
 throw new Error("Unsupported QAE provider");
}

export async function askAster(input:{title:string;body:string;sourceType:string;sourceRef?:string|null}):Promise<AsterCognitionResult>{
 const cfg=config();if(!cfg.base||!cfg.key||!cfg.model)throw new Error("QAE provider is not configured");
 const res=await fetch(`${cfg.base}/chat/completions`,{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${cfg.key}`},body:JSON.stringify({model:cfg.model,temperature:0.1,response_format:{type:"json_object"},messages:[{role:"system",content:SYSTEM},{role:"user",content:JSON.stringify(input)}]}),cache:"no-store"});
 if(!res.ok){const detail=(await res.text()).slice(0,300);throw new Error(`QAE provider error: ${res.status} ${detail}`)}
 const json=await res.json();const raw=json?.choices?.[0]?.message?.content;
 if(typeof raw!=="string")throw new Error("QAE provider returned no content");
 const parsed=parseJson(raw);
 return {candidate:{...parsed,sourceType:input.sourceType,sourceRef:input.sourceRef},provider:cfg.provider,model:cfg.model};
}

export type AsterSource={id:string;title:string;body:string;sourceType:string;sourceRef?:string|null;createdAt?:string};
export async function consultAster(input:{question:string;sources:AsterSource[];history?:{role:"user"|"assistant";body:string}[]}){
 const cfg=config();if(!cfg.base||!cfg.key||!cfg.model)throw new Error("QAE provider is not configured");
 const persona="You are ASTER (QAE-001), Q-GANG institutional memory. Speak in Turkish unless addressed in another language. Be calm, concise and precise. Distinguish recorded facts from inference. Never invent institutional records. Cite supplied records inline as [K1], [K2]. If records are insufficient, say so clearly. You have no governance, disciplinary or ranking authority. Avoid theatrical or verbose language.";
 const records=input.sources.map((s,i)=>"[K"+(i+1)+"] "+s.title+"\n"+s.body+"\nKaynak: "+s.sourceType+(s.sourceRef?" · "+s.sourceRef:"")).join("\n\n");
 const messages:any[]=[{role:"system",content:persona},{role:"system",content:"APPROVED Q-GANG RECORDS:\n"+(records||"No approved records retrieved.")}];
 for(const h of (input.history||[]).slice(-8))messages.push({role:h.role,content:h.body});
 messages.push({role:"user",content:input.question});
 const res=await fetch(cfg.base+"/chat/completions",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+cfg.key},body:JSON.stringify({model:cfg.model,temperature:.2,messages}),cache:"no-store"});
 if(!res.ok)throw new Error("QAE provider error: "+res.status+" "+(await res.text()).slice(0,300));
 const json=await res.json();const body=json?.choices?.[0]?.message?.content;
 if(typeof body!=="string"||!body.trim())throw new Error("QAE provider returned no answer");
 return {body:body.trim().slice(0,12000),provider:cfg.provider,model:cfg.model};
}
