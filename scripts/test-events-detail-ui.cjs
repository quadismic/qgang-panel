const {chromium}=require('playwright'),{spawn}=require('node:child_process'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const route='src/app/qa-event-detail';assert(!fs.existsSync(route));fs.mkdirSync(route);fs.copyFileSync('tests/fixtures/event-detail.tsx.fixture',route+'/page.tsx');
 const log=fs.openSync('/tmp/qgang-events-server.log','w');
 const server=spawn('node',['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3113'],{env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54321',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'qa-local-only',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore',log,log]});let browser;
 try{
  for(let i=0;i<100;i++){try{await fetch('http://127.0.0.1:3113/qa-event-detail');break;}catch{await new Promise(r=>setTimeout(r,500));}}
  browser=await chromium.launch({executablePath:process.env.QG_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'],headless:true});
  const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const width of [390,1440])for(const admin of [false,true])for(const empty of [false,true]){
   await page.setViewportSize({width,height:1000});await page.goto(`http://127.0.0.1:3113/qa-event-detail?admin=${admin?1:0}&empty=${empty?1:''}`,{waitUntil:'networkidle'});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert((await page.locator('.eventBackLink,.eventDetailActions button,.eventDetailActions summary').evaluateAll(es=>es.filter(e=>e.checkVisibility()).map(e=>e.getBoundingClientRect().height))).every(h=>h>=44));
   assert.equal(await page.getByText('Tamamlandı',{exact:true}).count(),1);
   assert.equal(await page.getByText('Etkinliklere Dön',{exact:true}).count(),0);
   assert.equal(await page.locator('.eventBackLink').getAttribute('href'),'/etkinlikler?view=archive&type=bbq-gang&from=2026-01-01');
   assert.equal(await page.locator('.eventAttendance li').count(),empty?0:2);
   const bounds=await page.evaluate(()=>{const h=document.querySelector('.eventHero').getBoundingClientRect(),a=document.querySelector('.eventAttendancePanel').getBoundingClientRect();return {left:h.left,right:h.right,archiveLeft:a.left,archiveRight:a.right,height:a.height};});assert.equal(bounds.left,bounds.archiveLeft);assert.equal(bounds.right,bounds.archiveRight);if(empty)assert(bounds.height<150);
   assert.equal(await page.getByRole('button',{name:'Düzenle',exact:true}).count(),admin?1:0);
   await page.screenshot({path:`/tmp/qgang-detail-${width}-${admin?'admin':'member'}-${empty?'empty':'full'}.png`,fullPage:true});
   if(admin){await page.locator('summary').click();const menu=page.locator('.qgOverflowContent');assert(await menu.evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&e.contains(document.elementFromPoint(r.left+r.width/2,r.top+20));}));await page.screenshot({path:`/tmp/qgang-detail-menu-${width}.png`,fullPage:true});for(const name of ['Yayın ve durum','Yoklama ve katılım','Tarihsel üye eşleştirmeleri']){if(!(await page.locator('details').getAttribute('open')!==null))await page.locator('summary').click();await page.getByRole('button',{name,exact:true}).click();const dialog=page.getByRole('dialog');await dialog.waitFor();assert(await dialog.evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth}));assert((await dialog.locator('input,button').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height))).every(h=>h>=44));await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});}}
   console.log('PASS detail',width,admin,empty,bounds);
  }
  assert.deepEqual(errors,[]);console.log('PASS detail menus, viewport, context, empty/full and permission presentation; no browser errors.');
 }finally{fs.unlinkSync(route+'/page.tsx');fs.rmdirSync(route);server.kill('SIGTERM');fs.closeSync(log);if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
