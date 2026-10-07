const {chromium}=require('playwright'),{spawn}=require('node:child_process'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const route='src/app/qa-codex-composer';assert(!fs.existsSync(route));fs.mkdirSync(route);fs.copyFileSync('tests/fixtures/codex-composer-page.tsx.fixture',route+'/page.tsx');
 const log=fs.openSync('/tmp/qgang-codex-composer-server.log','w');
 const server=spawn('node',['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3112'],{env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54321',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'qa-local-only',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore',log,log]});let browser;
 try{
  for(let i=0;i<100;i++){try{await fetch('http://127.0.0.1:3112/qa-codex-composer');break;}catch{await new Promise(r=>setTimeout(r,500));}}
  browser=await chromium.launch({executablePath:process.env.QG_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'],headless:true});
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3112/qa-codex-composer',{waitUntil:'networkidle'});
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});await page.getByRole('button',{name:'HÜKMÜ DÜZENLE',exact:true}).click();await page.locator('.qgWritingArea').waitFor();
   const bounds=await page.evaluate(()=>{const d=document.querySelector('.qgDialog.codexComposerOverlay'),drawer=d.querySelector('.codexComposerDrawer');return {width:innerWidth,dialog:d.getBoundingClientRect().toJSON(),drawer:drawer.getBoundingClientRect().toJSON(),style:{dialogWidth:getComputedStyle(d).width,dialogMax:getComputedStyle(d).maxWidth,drawerWidth:getComputedStyle(drawer).width,drawerFlex:getComputedStyle(drawer).flex,dialogDisplay:getComputedStyle(d).display},overflow:drawer.scrollWidth-drawer.clientWidth,fields:[...d.querySelectorAll('.codexComposerMeta input,.codexComposerMeta select,.codexWriting')].map(e=>e.getBoundingClientRect().toJSON()),close:d.querySelector('.qgIconButton').getBoundingClientRect().toJSON()}});
   if(width===390){assert.equal(bounds.dialog.x,0);assert.equal(bounds.dialog.width,390);assert.equal(bounds.drawer.width,390);}else{assert.equal(bounds.dialog.width,1120);assert.equal(bounds.dialog.right,1440);}
   assert(bounds.overflow<=1,JSON.stringify(bounds));assert(bounds.fields.filter(r=>r.width>0).every(r=>r.left>=bounds.dialog.left&&r.right<=bounds.dialog.right+1));assert(bounds.close.width>=44&&bounds.close.height>=44);
   assert.equal(await page.locator('input[name="title"]').getAttribute('placeholder'),'Arşivleme kolaylığı için "Kişi/Konu · İşlem" başlık biçimini kullan.');assert.equal(await page.locator('.codexComposerMeta').count(),0);if(width===1440){await page.mouse.click(20,450);assert.equal(await page.locator('dialog').count(),1);}assert.equal(await page.locator('input[name="title"]').inputValue(),'Renovich · Vekilharçlığa Atama');
   await page.screenshot({path:`/tmp/qgang-codex-composer-${width}.png`});console.log('PASS actual Codex composer',JSON.stringify(bounds));
   await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'detached'});assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  }
  assert.deepEqual(errors,[]);console.log('PASS actual dialog close/reopen, title hint, editor loading and no browser errors.');
 }finally{fs.unlinkSync(route+'/page.tsx');fs.rmdirSync(route);server.kill('SIGTERM');fs.closeSync(log);if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
