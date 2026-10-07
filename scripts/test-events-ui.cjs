const {chromium}=require('playwright'),{spawn}=require('node:child_process'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const route='src/app/qa-events';assert(!fs.existsSync(route));fs.mkdirSync(route);fs.copyFileSync('tests/fixtures/events-page.tsx.fixture',route+'/page.tsx');
 const log=fs.openSync('/tmp/qgang-events-server.log','w');
 const server=spawn('node',['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3113'],{env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54321',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'qa-local-only',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore',log,log]});let browser;
 try{
  for(let i=0;i<100;i++){try{await fetch('http://127.0.0.1:3113/qa-events');break;}catch{await new Promise(r=>setTimeout(r,500));}}
  browser=await chromium.launch({executablePath:process.env.QG_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'],headless:true});
  const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3113/qa-events',{waitUntil:'networkidle'});
  await page.route('**/api/events',route=>route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({error:'Yetki testi'})}));
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:1000});
   for(const admin of [false,true])for(const empty of [false,true]){
    await page.goto(`http://127.0.0.1:3113/qa-events?admin=${admin?1:0}&empty=${empty?1:''}`,{waitUntil:'networkidle'});
    await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
    const bounds=await page.evaluate(()=>{const hero=document.querySelector('.eventHero').getBoundingClientRect(),ledger=document.querySelector('.eventLedger').getBoundingClientRect();return {scroll:document.documentElement.scrollWidth,hero:{left:hero.left,right:hero.right},ledger:{left:ledger.left,right:ledger.right},feed:getComputedStyle(document.querySelector('.homeEditorialGrid')).gridTemplateColumns.split(' ').length,row:document.querySelector('.eventLedgerRow')?getComputedStyle(document.querySelector('.eventLedgerRow')).gridTemplateColumns.split(' ').length:null,controls:[...document.querySelectorAll('.eventPageToolbar .qgButton,.eventPageToolbar summary,.eventFilters select,.eventFilters button')].filter(e=>e.checkVisibility()).map(e=>e.getBoundingClientRect().toJSON())};});
    assert(bounds.scroll<=width);assert.equal(bounds.hero.left,bounds.ledger.left);assert.equal(bounds.hero.right,bounds.ledger.right);if(width===1440)assert(bounds.hero.right-bounds.hero.left>=800);assert.equal(bounds.feed,width===390?1:2);if(!empty)assert.equal(bounds.row,width===390?1:3);assert(bounds.controls.every(r=>r.height>=44&&r.left>=0&&r.right<=width));
    assert.equal(await page.getByRole('button',{name:'Etkinlik oluştur',exact:true}).count(),admin?1:0);
    assert.equal(await page.locator('summary[aria-label="Etkinlik yönetimi seçenekleri"]').count(),admin?1:0);
    assert.equal(await page.locator('.homeUpcomingList .eventLedgerRow').count(),empty?0:2);assert.equal(await page.locator('.commandRail a[href="/etkinlikler"] .qgIcon-calendar').count(),1);
    if(!empty){await page.getByText('Yanıtın: Katılacağım').waitFor();assert.equal(await page.getByText('Katılımın doğrulandı').count(),0);}
    await page.screenshot({path:`/tmp/qgang-events-${width}-${admin?'admin':'member'}-${empty?'empty':'full'}.png`,fullPage:true});
    if(!empty){await page.getByRole('button',{name:'Etkinlik öner',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.waitFor();const r=await dialog.boundingBox();assert(r.x>=0&&r.x+r.width<=width);const targets=await dialog.locator('input:not([type=hidden]):not([type=checkbox]),select,button').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));assert(targets.every(h=>h>=44));
     await dialog.locator('input[name=title]').fill('Korunan etkinlik önerisi');await dialog.locator('textarea[name=description]').fill('Bağlantı hatasında korunması gereken açıklama.');await dialog.getByRole('button',{name:'Öneriyi Gönder'}).click();await dialog.getByRole('alert').waitFor();assert.equal(await dialog.locator('input[name=title]').inputValue(),'Korunan etkinlik önerisi');await page.screenshot({path:`/tmp/qgang-events-dialog-${width}.png`,fullPage:true});await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
     if(admin){await page.getByRole('button',{name:'Etkinlik oluştur',exact:true}).click();await page.getByRole('dialog').waitFor();assert.equal(await page.getByRole('dialog').locator('.eventForm').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),width===390?1:2);await page.keyboard.press('Escape');await page.locator('summary[aria-label="Etkinlik yönetimi seçenekleri"]').click();await page.getByRole('button',{name:'Türler ve sıralama',exact:true}).click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');await page.locator('summary[aria-label="Etkinlik yönetimi seçenekleri"]').click();await page.getByRole('button',{name:'Tarihsel aktarım',exact:true}).click();await page.getByRole('dialog').locator('input[type=file]').waitFor();assert(await page.getByRole('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));await page.keyboard.press('Escape');}
    }
    console.log('PASS',width,admin?'admin':'member',empty?'empty':'full',JSON.stringify(bounds));
   }
   await page.goto('http://127.0.0.1:3113/qa-events?archive=1',{waitUntil:'networkidle'});assert.equal(await page.locator('input[type=date]').count(),2);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  assert.deepEqual(errors,[]);console.log('PASS event submission denial preserves form values; no browser errors.');
 }finally{fs.unlinkSync(route+'/page.tsx');fs.rmdirSync(route);server.kill('SIGTERM');fs.closeSync(log);if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
