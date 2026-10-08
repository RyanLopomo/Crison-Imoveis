import { createServer } from 'node:http';
import { createServer as netServer } from 'node:net';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import EmbeddedPostgres from 'embedded-postgres';
import { hash } from 'bcryptjs';
import { decodeJwt, SignJWT } from 'jose';
import { chromium } from 'playwright';
import sharp from 'sharp';

const freePort = async () => { const s = netServer(); await new Promise(r=>s.listen(0,'127.0.0.1',r)); const port=s.address().port; await new Promise(r=>s.close(r)); return port; };
const digest = value => createHash('sha256').update(value).digest('hex');
const temporary = await mkdtemp(path.join(tmpdir(), 'crison-security-'));
const dbPort = await freePort(), appPort = await freePort();
let password = randomBytes(24).toString('hex')+'aA!';
const email = 'audit-admin@example.invalid', otherEmail = 'other-admin@example.invalid';
const dbPassword = randomBytes(24).toString('hex'), authSecret = randomBytes(32).toString('hex');
const database = new EmbeddedPostgres({ databaseDir:path.join(temporary,'db'), port:dbPort, user:'audit', password:dbPassword, persistent:true, postgresFlags:['-h','127.0.0.1'], onLog:()=>{}, onError:()=>{} });
let child, db, browser;
let serverOutput="";
const sent=[];
const mail = createServer(async (req,res) => {
 try {
  const chunks=[];for await(const c of req)chunks.push(c);const body=JSON.parse(Buffer.concat(chunks).toString());
  assert.equal(req.method,'POST');assert.equal(req.url,'/emails');sent.push(body);
  res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({id:randomUUID()}));
 } catch {res.writeHead(400);res.end('{}');}
});
let checks=0;
function check(condition,message){assert.ok(condition,message);checks++;}
try {
 await database.initialise();await database.start();await database.createDatabase('crison_audit');
 db=database.getPgClient('crison_audit','127.0.0.1');await db.connect();
 for(const folder of (await readdir('prisma/migrations')).filter(x=>/^\d/.test(x)).sort())await db.query(await readFile(path.join('prisma/migrations',folder,'migration.sql'),'utf8'));
 await db.query('INSERT INTO "Admin" (id,name,email,"passwordHash","updatedAt") VALUES ($1,$2,$3,$4,NOW()),($5,$6,$7,$8,NOW())',['audit-admin','Audit Admin',email,await hash(password,12),'other-admin','Other Admin',otherEmail,await hash(randomBytes(32).toString('hex'),12)]);
 await new Promise(r=>mail.listen(0,'127.0.0.1',r));
 const dbURL=`postgresql://audit:${dbPassword}@127.0.0.1:${dbPort}/crison_audit`;
 const base=`http://127.0.0.1:${appPort}`;
 child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p',String(appPort),'--hostname','127.0.0.1'],{cwd:process.cwd(),env:{...process.env,NODE_ENV:'production',VERCEL:'',DATABASE_URL:dbURL,DIRECT_URL:dbURL,AUTH_SECRET:authSecret,ADMIN_EMAIL:'unused-bootstrap@example.invalid',ADMIN_PASSWORD_HASH:await hash(randomBytes(32).toString('hex'),12),RESEND_API_KEY:randomBytes(24).toString('hex'),BLOB_READ_WRITE_TOKEN:'',NEXT_PUBLIC_APP_URL:`https://localhost:${appPort}`,EMAIL_FROM:'Audit <sender@example.invalid>',RESEND_BASE_URL:`http://127.0.0.1:${mail.address().port}`,NODE_OPTIONS:`--require="${path.resolve('tests/security/mail-preload.cjs').split(path.sep).join('/')}"`},stdio:['ignore','pipe','pipe']});
 child.stdout.on('data',c=>{serverOutput+=c.toString()});child.stderr.on('data',c=>{serverOutput+=c.toString()});
 let ready=false;for(let i=0;i<120;i++){try{await fetch(base+'/admin/login');ready=true;break;}catch{await new Promise(r=>setTimeout(r,250));}}if(!ready)console.log(serverOutput.slice(-4000).split(authSecret).join('[redacted]').split(dbPassword).join('[redacted]').split(password).join('[redacted]'));assert.ok(ready,'Local server unavailable');
 async function request(url,body,cookie,method,extra={}){
  return fetch(base+url,{method:method||(body===undefined?'GET':'POST'),headers:{Origin:base,...(body===undefined?{}:{'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{}),...extra},...(body===undefined?{}:{body:JSON.stringify(body)}),redirect:'manual'});
 }
 const clearLimits=()=>db.query('DELETE FROM "AuthRateLimit"');
 async function login(){await clearLimits();const r=await request('/api/admin/login',{email,password});check(r.status===200,'Valid login');const header=r.headers.get('set-cookie');check(/httponly/i.test(header)&&/secure/i.test(header)&&/samesite=strict/i.test(header),'Cookie flags');return header.split(';')[0];}
 const status=async(url,expected,body,cookie,method,extra)=>{const r=await request(url,body,cookie,method,extra);const responseText=await r.text();check(r.status===expected,`${method||'request'} ${url}: expected ${expected}, got ${r.status}${r.status!==expected ? ' '+responseText : ''}`);};
 for(const page of ['/admin','/admin/novo-imovel','/admin/imoveis','/admin/configuracoes'])await status(page,307);
 for(const endpoint of ['/api/admin/properties','/api/admin/upload'])await status(endpoint,401,endpoint.endsWith('upload')?{}:undefined);
 await status('/api/properties',401,{},undefined,'POST');await status('/api/properties/audit-missing',401,{},undefined,'PATCH');await status('/api/properties/audit-missing',401,{},undefined,'DELETE');
 for(const action of ['profile','password','email'])await status('/api/admin/account/'+action,401,{});
 await status('/api/admin/properties',401,undefined,'crison_admin_session=forged');
 await status('/_next/image?url='+encodeURIComponent(base+'/admin/configuracoes')+'&w=64&q=75',400);
 for(const method of ['PUT','DELETE'])await status('/api/admin/account/password',405,{},undefined,method);
 await clearLimits();await status('/api/admin/login',400,{email:{$ne:null},password:['unexpected']});
 let cookie=await login();
 const secondCookie=await login();check(cookie!==secondCookie,'Login rotates session identifier');await status('/api/admin/logout',200,{},cookie);await status('/api/admin/properties',401,undefined,cookie);await status('/api/admin/properties',200,undefined,secondCookie);cookie=secondCookie;
 check((await db.query('SELECT count(*)::int AS n FROM "Admin"')).rows[0].n===2,'Bootstrap cannot create third admin');
 await status('/api/admin/properties',401,undefined,'crison_admin_session='+cookie.slice(cookie.indexOf('=')+1).slice(0,-3)+'xyz');
 await status('/api/properties',403,{},cookie,'POST',{Origin:'https://attacker.invalid'});
 await status('/api/admin/account/password',403,{},cookie,'POST',{Origin:'https://attacker.invalid'});
 await status('/api/properties/audit-missing',403,{},cookie,'PATCH',{Origin:'https://attacker.invalid'});await status('/api/properties/audit-missing',403,{},cookie,'DELETE',{Origin:'https://attacker.invalid'});
 await status('/api/admin/account/email',403,{},cookie,'POST',{Origin:'https://attacker.invalid'});
 const oversized=await fetch(base+'/api/admin/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email,password,padding:'x'.repeat(5000)})});check(oversized.status===413,'Bounded account request body');
 const property={title:'<img src=x onerror="window.__auditXss=1">',description:'<script>window.__auditXss=1</script>',price:100,type:'Casa',category:'Alto Padr\u00e3o',city:'"><svg onload="window.__auditXss=1">',neighborhood:'Audit',imageUrl:'https://audit.public.blob.vercel-storage.com/test.jpg',status:'Dispon\u00edvel',featured:false};
 let r=await request('/api/properties',property,cookie);check(r.status===201,'Authorized property create');const propertyId=(await r.json()).id;
 await status('/api/properties',400,{...property,adminId:'other-admin'},cookie);
 for(const imageUrl of ['http://127.0.0.1','http://169.254.169.254/latest/meta-data','https://attacker.invalid/img.jpg','https://user:pass@audit.public.blob.vercel-storage.com/test.jpg']){
  const rr=await request('/api/properties',{...property,imageUrl},cookie);check(rr.status===400,'Unsafe URL rejected');
 }
 await status('/api/properties/'+encodeURIComponent("' OR 1=1 --"),404,property,cookie,'PATCH');
 await status('/api/properties/'+propertyId,200,{...property,title:'Audit updated'},cookie,'PATCH');
 await status('/api/properties/'+propertyId,401,{...property,title:'Unauthorized'},undefined,'PATCH',{'x-middleware-subrequest':'proxy:proxy:proxy:proxy:proxy'});
 await status('/api/admin/account/profile',400,{name:'Attacker',email:otherEmail,sessionVersion:900},cookie);
 await status('/api/admin/account/email',400,{email:otherEmail},cookie);
 await status('/api/admin/account/password',400,{currentPassword:password,newPassword:'weak',confirmPassword:'weak'},cookie);
 await status('/api/admin/account/reset-password',400,{token:'f'.repeat(64),newPassword:password,confirmPassword:password});
 // Real decoder rejects MIME spoofing and executable bodies before any Blob service call.
 async function upload(content,type,filename){const form=new FormData();form.set('file',new File([content],filename,{type}));return fetch(base+'/api/admin/upload',{method:'POST',headers:{Origin:base,Cookie:cookie},body:form});}
 for(const [content,type,filename] of [['<script>1</script>','image/jpeg','evil.jpg'],['<svg onload="alert(1)"></svg>','image/svg+xml','evil.svg'],['hello','image/png','evil.html.png'],['hello','image/png','../evil.png']])check((await upload(content,type,filename)).status===400,'Malicious upload rejected');
 check((await upload(Buffer.alloc(4*1024*1024+65537),'image/png','large.png')).status===413,'Oversized upload body rejected');
 const validPng=await sharp({create:{width:1,height:1,channels:3,background:'white'}}).png().toBuffer();check((await upload(validPng,'image/jpeg','fake.jpg')).status===400,'Real MIME mismatch rejected');
 const validUpload=await upload(validPng,'image/png','valid.png');check((await validUpload.json()).message==='N\u00e3o foi poss\u00edvel concluir a opera\u00e7\u00e3o.','Valid PNG passes image validation and reaches the unconfigured Blob boundary');
 // Public responses reveal no credentials; rendered strings remain escaped and CSP blocks injected handlers.
 const publicProperties=await (await request('/api/properties')).text();check(!/passwordHash|tokenHash|sessionVersion/.test(publicProperties),'No credentials in public API');
 const browserOptions=process.platform==='win32'?{executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}:{};
 browser=await chromium.launch({headless:true,...browserOptions});const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.route('**/*',route=>{const u=new URL(route.request().url());return ['localhost','127.0.0.1'].includes(u.hostname)?route.continue():route.abort();});
 await context.addCookies([{name:'crison_admin_session',value:cookie.slice(cookie.indexOf('=')+1),url:base,httpOnly:true,sameSite:'Strict'}]);const page=await context.newPage();
 await db.query('UPDATE "Property" SET title=$1 WHERE id=$2',[property.title,propertyId]);
 const navigation=await page.goto(base+'/admin/imoveis');check(navigation.status()===200,'Authenticated page');
 await page.getByRole('button',{name:'Abrir menu'}).click();check(await page.locator('dialog').isVisible(),'Nonce permits legitimate hydration');await page.keyboard.press('Escape');
 check(await page.evaluate(()=>window.__auditXss)!==1,'Stored XSS does not execute');check(await page.locator('h3').filter({hasText:property.title}).count()===1,'Stored XSS rendered as text');
 await page.goto(base+'/imoveis');check(await page.locator('h3').filter({hasText:property.title}).count()===1,'Public property title rendered as text');check(await page.evaluate(()=>window.__auditXss)!==1,'Public stored XSS does not execute');await page.goto(base+'/admin/reset-password?token='+encodeURIComponent('"><svg onload=window.__auditXss=1>'));check(await page.evaluate(()=>window.__auditXss)!==1,'Reflected token XSS does not execute');await page.goto(base+'/admin/imoveis');
 const csp=navigation.headers()['content-security-policy'];check(csp.includes("'nonce-")&&!csp.includes("'unsafe-eval'")&&csp.includes("frame-ancestors 'none'"),'Production CSP');check(navigation.headers()['strict-transport-security']==='max-age=31536000','HSTS header');
 for(const route of ['/admin/novo-imovel','/admin/configuracoes','/admin']){await page.getByRole('button',{name:'Abrir menu'}).click();await page.locator(`dialog nav a[href="${route}"]`).click();await page.waitForURL(base+route);check(await page.locator('h1').count()===1,'CSP keeps client navigation working');}
 await context.close();await browser.close();browser=undefined;
 // Capture recovery at the local transport sink, without touching Resend infrastructure.
 await clearLimits();const before=sent.length;await status('/api/admin/account/forgot-password',200,{email:'  '+email.toUpperCase()+'  '});
 for(let i=0;i<80&&sent.length===before;i++)await new Promise(r=>setTimeout(r,100));check(sent.length===before+1,'Recovery reached POST /emails');check(sent.at(-1).to[0]===email,'Recipient from database');
 const token=new URL(sent.at(-1).text.match(/https:\/\/[^\s]+/)[0]).searchParams.get('token');let tokens=await db.query('SELECT * FROM "AccountToken" WHERE "adminId"=$1',['audit-admin']);check(tokens.rows.length===1&&tokens.rows[0].tokenHash===digest(token)&&tokens.rows[0].expiresAt>new Date(),'Only hashed token and expiry persisted');
 r=await request('/admin/reset-password?token='+token);check(r.status===200,'Reset link page');check(r.headers.get('referrer-policy')==='no-referrer','Recovery link cannot leak via Referer');
 const unknown=await request('/api/admin/account/forgot-password',{email:'unknown@example.invalid'});check(JSON.stringify(await unknown.json())===JSON.stringify({message:'Se existir uma conta associada a este e-mail, enviaremos as instru\u00e7\u00f5es de recupera\u00e7\u00e3o.'}),'Generic recovery response');
 const newPassword=randomBytes(24).toString('hex')+'Aa!';
 const race=await Promise.all([request('/api/admin/account/reset-password',{token,newPassword,confirmPassword:newPassword}),request('/api/admin/account/reset-password',{token,newPassword,confirmPassword:newPassword})]);check(race.map(x=>x.status).sort().join(',')==='200,400','Concurrent token consumption only succeeds once');password=newPassword;
 await status('/api/admin/account/reset-password',400,{token,newPassword,confirmPassword:newPassword});await status('/api/admin/properties',401,undefined,cookie);
 cookie=await login();
 async function seedToken(purpose='reset',expiresAt=new Date(Date.now()+1200000),newEmail=null,adminId='audit-admin'){const t=randomBytes(32).toString('hex');await db.query('INSERT INTO "AccountToken" (id,"adminId",purpose,"tokenHash","expiresAt","newEmail") VALUES ($1,$2,$3,$4,$5,$6)',[randomUUID(),adminId,purpose,digest(t),expiresAt.toISOString(),newEmail]);return t;}
 const expired=await seedToken('reset',new Date(Date.now()-1000));await status('/api/admin/account/reset-password',400,{token:expired,newPassword:password,confirmPassword:password});
 const prior=await seedToken();const previousCookie=cookie;const nextPassword=randomBytes(24).toString('hex')+'Aa!';await status('/api/admin/account/password',200,{currentPassword:password,newPassword:nextPassword,confirmPassword:nextPassword},cookie);password=nextPassword;
 await status('/api/admin/properties',401,undefined,previousCookie);await status('/api/admin/account/reset-password',400,{token:prior,newPassword:password,confirmPassword:password});cookie=await login();
 const beforeEmail=sent.length;await status('/api/admin/account/email',200,{currentPassword:password,email:'  CONFIRMED@example.invalid  '},cookie);for(let i=0;i<80&&sent.length===beforeEmail;i++)await new Promise(r=>setTimeout(r,100));check(sent.at(-1).to[0]==='confirmed@example.invalid','Email change sent only to new email');check((await db.query('SELECT email FROM \"Admin\" WHERE id=$1',['audit-admin'])).rows[0].email===email,'Email unchanged before confirmation');const emailToken=new URL(sent.at(-1).text.match(/https:\/\/[^\s]+/)[0]).searchParams.get('token');await status('/api/admin/account/confirm-email',200,{token:emailToken,adminId:'other-admin',email:'attacker@example.invalid'});check((await db.query('SELECT email FROM "Admin" WHERE id=$1',['audit-admin'])).rows[0].email==='confirmed@example.invalid','Email confirmation uses token-bound values');check((await db.query('SELECT email FROM "Admin" WHERE id=$1',['other-admin'])).rows[0].email===otherEmail,'Other admin unchanged');await status('/api/admin/account/confirm-email',400,{token:emailToken});
 // Restore only synthetic fixture email for the remaining checks.
 await db.query('UPDATE "Admin" SET email=$1 WHERE id=$2',[email,'audit-admin']);cookie=await login();
 const expiredEmail=await seedToken('email',new Date(Date.now()-1000),'expired@example.invalid');await status('/api/admin/account/confirm-email',400,{token:expiredEmail});
 // Simulate exhausted buckets directly in local DB; no brute force or high-volume traffic.
 for(const [key,limit,url,body] of [['login:'+email,8,'/api/admin/login',{email,password}],['ip:reset-password:local',10,'/api/admin/account/reset-password',{token:'0'.repeat(64),newPassword:password,confirmPassword:password}],['account:email:audit-admin',5,'/api/admin/account/email',{currentPassword:password,email:'pending@example.invalid'}],['mutation:properties:audit-admin',30,'/api/properties',property]]){await clearLimits();const bucket=Math.floor(Date.now()/900000);await db.query('INSERT INTO "AuthRateLimit" (key,count,"expiresAt") VALUES ($1,$2,$3)',[digest(key+':'+bucket),limit,new Date(Date.now()+900000).toISOString()]);await status(url,429,body,cookie);}
 await clearLimits();const recoveryKey=digest('recovery:'+email+':'+Math.floor(Date.now()/900000));await db.query('INSERT INTO \"AuthRateLimit\" (key,count,\"expiresAt\") VALUES ($1,3,$2)',[recoveryKey,new Date(Date.now()+900000).toISOString()]);const sentBeforeLimit=sent.length;await status('/api/admin/account/forgot-password',200,{email});for(let i=0;i<30;i++){const row=(await db.query('SELECT count FROM \"AuthRateLimit\" WHERE key=$1',[recoveryKey])).rows[0];if(row?.count===4)break;await new Promise(r=>setTimeout(r,100));}check(sent.length===sentBeforeLimit,'Recovery account quota blocks spam with generic response');
 await clearLimits();await status('/api/properties/'+propertyId,200,{},cookie,'DELETE');
 await status('/api/admin/logout',200,{},cookie);await status('/api/admin/properties',401,undefined,cookie);
 const session=decodeJwt(cookie.slice(cookie.indexOf('=')+1));check(session.exp-session.iat<=28800,'JWT expires within 8h');
 const noExpiry=await new SignJWT({role:'admin',version:session.version}).setSubject(session.sub).setJti(randomBytes(32).toString('hex')).setProtectedHeader({alg:'HS256'}).sign(new TextEncoder().encode(authSecret));await status('/api/admin/properties',401,undefined,'crison_admin_session='+noExpiry);
 console.log(`SECURITY REGRESSION: ${checks} checks passed (real local PostgreSQL; local email transport; no third-party attacks).`);
} finally {
 if(browser)await browser.close().catch(()=>{});
 if(child&&!child.killed)child.kill();
 if(db)await db.end().catch(()=>{});
 await new Promise(r=>mail.close(r));await database.stop().catch(()=>{});
 const resolved=path.resolve(temporary);if(resolved.startsWith(path.resolve(tmpdir())+path.sep)&&path.basename(resolved).startsWith('crison-security-'))await rm(resolved,{recursive:true,force:true,maxRetries:20,retryDelay:250});
}
