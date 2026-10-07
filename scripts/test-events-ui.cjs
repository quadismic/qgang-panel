const {chromium}=require('playwright'),{spawn}=require('node:child_process'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const route='src/app/qa-events';assert(!fs.existsSync(route));fs.mkdirSync(route);fs.copyFileSync('tests/fixtures/events-page.tsx.fixture',route+'/page.tsx');
 const log=fs.openSync('/tmp/qgang-events-server.log','w');
 const server=spawn('node',['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3113'],{env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54321',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'qa-local-only',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore',log,log]});let browser;
 try{
  for(let i=0;i<100;i++){try{await fetch('http://127.0.0.1:3113/qa-events');break;}catch{await new Promise(r=>setTimeout(r,500));}}
  browser=await chromium.launch({executablePath:process.env.QG_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'],headless:true});
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3113/qa-events',{waitUntil:'networkidle'});
  await page.route('**/api/events',route=>route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({error:'Yetki testi'})}));
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:1000});
   const bounds=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,upcoming:getComputedStyle(document.querySelector('.eventUpcomingGrid')).gridTemplateColumns.split(' ').length,feed:getComputedStyle(document.querySelector('.homeEditorialGrid')).gridTemplateColumns.split(' ').length,form:getComputedStyle(document.querySelector('.eventForm')).gridTemplateColumns.split(' ').length,controls:[...document.querySelectorAll('.eventForm input:not([type=hidden]),.eventForm select,.eventForm button')].map(e=>e.getBoundingClientRect().toJSON())}));
   assert(bounds.scroll<=width);assert.equal(bounds.upcoming,width===390?1:3);assert.equal(bounds.feed,width===390?1:3);assert.equal(bounds.form,width===390?1:2);assert(bounds.controls.every(r=>r.height>=44&&r.left>=0&&r.right<=width));
   await page.screenshot({path:`/tmp/qgang-events-${width}.png`,fullPage:true});console.log('PASS actual event components',JSON.stringify(bounds));
  }
  await page.locator('input[name=title]').fill('Korunan etkinlik önerisi');await page.locator('textarea[name=description]').fill('Bağlantı hatasında korunması gereken açıklama.');await page.getByRole('button',{name:'Öneriyi Gönder'}).click();await page.getByRole('alert').waitFor();assert.equal(await page.locator('input[name=title]').inputValue(),'Korunan etkinlik önerisi');assert.equal(await page.locator('textarea[name=description]').inputValue(),'Bağlantı hatasında korunması gereken açıklama.');
  assert.deepEqual(errors,[]);console.log('PASS event submission denial preserves form values; no browser errors.');
 }finally{fs.unlinkSync(route+'/page.tsx');fs.rmdirSync(route);server.kill('SIGTERM');fs.closeSync(log);if(browser)await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
