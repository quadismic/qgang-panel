// Rebuild from existing, approved artwork. Does not upload or modify CMS originals.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
(async()=>{
 const sources=Object.keys(JSON.parse(await fs.readFile('src/lib/performance-assets.json','utf8'))).filter(src=>src.startsWith('https://')).sort();
 await fs.mkdir('/tmp/qg-perf-originals',{recursive:true});
 for(let i=0;i<sources.length;i++){
  const source=new URL(sources[i]);
  if(source.origin!=='https://kttebbvinfmauthmayqp.supabase.co'||!source.pathname.startsWith('/storage/v1/object/public/qgang-design/'))throw Error('Unapproved source');
  const file=`/tmp/qg-perf-originals/portrait-${i}.png`;
  try{await fs.access(file)}catch{const response=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Artwork unavailable');await fs.writeFile(file,Buffer.from(await response.arrayBuffer()));}
 }
 const jobs=sources.map((url,i)=>({src:url,file:`/tmp/qg-perf-originals/portrait-${i}.png`,widths:[480,960,1440]}));
 for(const src of ['/assets/ranks/leader-crown.png','/assets/ranks/captain-frame.png','/assets/ranks/leader-frame.png','/brand/qgang-emblem.webp'])jobs.push({src,file:'public'+src,widths:[240,480,960]});
 const manifest={},measurements=[];await fs.mkdir('public/perf',{recursive:true});
 for(const job of jobs){
  const input=await fs.readFile(job.file),meta=await sharp(input).metadata(),variants=[];
  for(const width of job.widths){
   const output=await sharp(input).resize({width,withoutEnlargement:true}).webp({quality:90,alphaQuality:100,effort:6}).toBuffer();
   const hash=crypto.createHash('sha256').update(output).digest('hex').slice(0,12),name=`qg-${hash}-${width}.webp`;await fs.writeFile(path.join('public/perf',name),output);
   variants.push({width:Math.min(width,meta.width),src:'/perf/'+name,bytes:output.length});
  }
  manifest[job.src]=variants;measurements.push({source:job.src,original:input.length,variants});
 }
 await fs.writeFile('src/lib/performance-assets.json',JSON.stringify(manifest,null,2)+'\n');
 await fs.writeFile('/tmp/qg-asset-savings.json',JSON.stringify(measurements,null,2));
 for(const m of measurements)console.log(path.basename(m.source),m.original,'=>',m.variants.map(v=>`${v.width}w:${v.bytes}`).join(' '));
})().catch(e=>{console.error(e);process.exit(1)});
