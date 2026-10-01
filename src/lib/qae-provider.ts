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
