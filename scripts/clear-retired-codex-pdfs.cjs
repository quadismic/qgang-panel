const {createClient}=require("@supabase/supabase-js");
async function main(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error("Supabase URL and service role key are required.");
 const bucket=createClient(url,key,{auth:{persistSession:false}}).storage.from("qgang-documents");
 async function paths(prefix=""){
  const found=[];
  for(let offset=0;;offset+=100){
   const {data,error}=await bucket.list(prefix,{limit:100,offset,sortBy:{column:"name",order:"asc"}});
   if(error)throw error;
   for(const item of data){
    const path=prefix?prefix+"/"+item.name:item.name;
    if(item.id)found.push(path);else found.push(...await paths(path));
   }
   if(data.length<100)return found;
  }
 }
 const files=await paths();
 if(!process.argv.includes("--execute")){console.log(`${files.length} objects in retired Codex bucket (dry run).`);return;}
 for(let index=0;index<files.length;index+=100){
  const {error}=await bucket.remove(files.slice(index,index+100));
  if(error)throw error;
 }
 if((await paths()).length)throw new Error("Retired Codex bucket is not empty.");
 console.log(`Removed ${files.length} retired Codex objects; bucket verified empty.`);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
