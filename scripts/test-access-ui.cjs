const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  // Check browser availability before creating any QA route or starting a server.
  const browser = await chromium.launch({ executablePath: process.env.QG_BROWSER_PATH || undefined, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const route = 'src/app/qa-access';
  let server;
  try {
    assert.ok(!fs.existsSync(route), 'Refusing to overwrite an existing QA route');
    fs.mkdirSync(route);
    fs.writeFileSync(route + '/page.tsx', `import {AccessMatrixEditor} from '@/components/AccessMatrixEditor';\nexport default function QA(){return <main><AccessMatrixEditor rows={[{role:'member',permission:'members.view',enabled:true},{role:'moderator',permission:'maintenance.access',enabled:true}]}/></main>}`);
    const log = fs.openSync('/tmp/qgang-access-ui-server.log', 'w');
    server = spawn('node', ['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3101'], { stdio:['ignore',log,log], env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54321',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'qa-local-only',NEXT_TELEMETRY_DISABLED:'1'} });
    fs.closeSync(log);
    let ready = false;
    for(let i=0;i<120;i++) { try { const r=await fetch('http://127.0.0.1:3101/qa-access'); if(r.ok){ready=true;break;} } catch {} await new Promise(r=>setTimeout(r,500)); }
    assert.ok(ready, 'QA server did not become ready');
    const page=await browser.newPage();
    const errors=[]; const requests=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('dialog',dialog=>dialog.accept());
    let fail=false;
    await page.route('**/api/control/access',async route=>{
      requests.push(route.request().postDataJSON());
      if(fail) return route.abort();
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,rows:[{role:'member',permission:'members.view',enabled:true},{role:'member',permission:'budget.view',enabled:true},{role:'moderator',permission:'maintenance.access',enabled:true}]})});
    });
    await page.goto('http://127.0.0.1:3101/qa-access',{waitUntil:'networkidle'});
    const confirm=page.getByRole('button',{name:'DEĞİŞİKLİKLERİ ONAYLA',exact:true});
    const cancel=page.getByRole('button',{name:'DEĞİŞİKLİKLERİ İPTAL ET',exact:true});
    const budget=page.getByRole('button',{name:'ÜYE Bütçeyi Görüntüle',exact:true});
    const memberView=page.getByRole('button',{name:'ÜYE Üyeleri Görüntüle',exact:true});
    assert.ok(await confirm.isDisabled());
    for(const name of ['LİDER Üyeleri Görüntüle','VEKİLHARÇ Erişim Merkezini Yönet','KAPTAN Bakım Moduna Erişim','ÜYE Yaptırım Uygula','KAPTAN Karar / İtiraz İncele']) assert.ok(await page.getByRole('button',{name,exact:true}).isDisabled(),name);
    await budget.click(); assert.equal(requests.length,0); assert.ok(await confirm.isEnabled());
    await cancel.click(); assert.match(await budget.getAttribute('class'),/permissionOff/); assert.ok(await confirm.isDisabled());
    await page.getByRole('button',{name:'VARSAYILANLARA DÖN',exact:true}).click();
    assert.equal(requests.length,0); await cancel.click(); assert.ok(await confirm.isDisabled());
    await budget.click(); await confirm.click(); await page.getByText('Yetki matrisi güncellendi.',{exact:true}).waitFor();
    assert.deepEqual(requests[0].changes,[{role:'member',permission:'budget.view',enabled:true}]); assert.ok(await confirm.isDisabled());
    fail=true; await memberView.click(); await confirm.click(); await page.getByText(/Bağlantı kurulamadı/).waitFor();
    assert.match(await memberView.getAttribute('class'),/permissionOff/); assert.ok(await confirm.isEnabled());
    await cancel.click(); assert.match(await memberView.getAttribute('class'),/permissionOn/);
    for(const width of [390,1366]) {
      await page.setViewportSize({width,height:900});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page should not overflow at '+width);
      await page.screenshot({path:'/tmp/qgang-access-'+width+'.png',fullPage:true});
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: draft-only switches, confirm batch, cancel, defaults, protected cells, saved rows, network-error draft retention and mobile/desktop overflow.');
  } finally {
    await browser.close();
    if(server) { server.kill('SIGTERM'); await new Promise(resolve=>{server.once('exit',resolve);setTimeout(resolve,5000);}); }
    if(server) fs.rmSync(route,{recursive:true,force:true});
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
