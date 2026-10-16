// أدوات مشتركة: أسرار env، مصادقة الأدمن (Bearer token)، قاعدة Firebase Firestore، بناء المتجر، الرفع على فيرسل.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=[path.join(__dirname,'..'),process.env.LAMBDA_TASK_ROOT,process.cwd()].filter(Boolean).find(d=>fs.existsSync(path.join(d,'store-template','index.html')))||path.join(__dirname,'..');
// 1) جلب الأسرار: متغيرات فيرسل أولاً، ثم ملف .env كاحتياط
try{fs.readFileSync(path.join(ROOT,'.env'),'utf8').split(/\r?\n/).forEach(l=>{const m=/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(l);if(m&&process.env[m[1]]===undefined)process.env[m[1]]=m[2].replace(/^["']|["']$/g,'')})}catch(e){}
const E=process.env,h=s=>crypto.createHash('sha256').update(String(s)).digest();
const EMAIL=()=>(E.ADMIN_EMAIL||'').toLowerCase(),USER=()=>(E.ADMIN_USERNAME||'').toLowerCase(),PASS=()=>E.ADMIN_PASSWORD||'';
exports.configured=()=>PASS().length>=8&&!!(EMAIL()||USER());  // لا توجد بيانات دخول افتراضية: يجب ضبطها من env
exports.cors=(req,res)=>{const o=req.headers.origin,al=(E.ALLOWED_ORIGIN||'').split(',').map(s=>s.trim()).filter(Boolean);
  if(o&&al.includes(o)){res.setHeader('Access-Control-Allow-Origin',o);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,OPTIONS')}
  if(req.method==='OPTIONS'){res.statusCode=204;res.end();return true}return false};
const SEC=()=>E.SESSION_SECRET||crypto.createHash('sha256').update('sakb|'+EMAIL()+'|'+PASS()).digest('hex');
const sign=p=>crypto.createHmac('sha256',SEC()).update(p).digest('base64url');
// 2) مصادقة: الدخول بالبريد أو اسم المستخدم + كلمة المرور ← توكن موقّع (12 ساعة) يُرسل في Authorization: Bearer
exports.login=(id,pw)=>{if(!exports.configured()||!id||!pw)return false;const i=h(String(id).trim().toLowerCase());let m=0;if(EMAIL())m|=crypto.timingSafeEqual(i,h(EMAIL()));if(USER())m|=crypto.timingSafeEqual(i,h(USER()));return !!(crypto.timingSafeEqual(h(pw),h(PASS()))&m)};
exports.mkToken=()=>{const p=Buffer.from(JSON.stringify({exp:Date.now()+12*36e5})).toString('base64url');return p+'.'+sign(p)};
exports.isAdmin=req=>{const a=req.headers.authorization||'',t=a.startsWith('Bearer ')?a.slice(7):'',[p,s]=t.split('.');if(!p||!s)return false;
  const x=Buffer.from(sign(p)),y=Buffer.from(s);if(x.length!==y.length||!crypto.timingSafeEqual(x,y))return false;try{return JSON.parse(Buffer.from(p,'base64url')).exp>Date.now()}catch(e){return false}};
// 3) Firebase Firestore (الصور تُحفظ في وثائق فرعية لتجاوز حد 1MB للوثيقة)
let _db;const db=()=>{if(_db)return _db;const a=require('firebase-admin');
  if(!a.apps.length)a.initializeApp({credential:a.credential.cert({projectId:E.FIREBASE_PROJECT_ID,clientEmail:E.FIREBASE_CLIENT_EMAIL,privateKey:(E.FIREBASE_PRIVATE_KEY||'').replace(/\\n/g,'\n')})});return _db=a.firestore()};
const walk=(x,f)=>{for(const k in x){const v=x[k];if(v&&typeof v==='object')walk(v,f);else{const r=f(v);if(r!==undefined)x[k]=r}}};
exports.putOrder=async o=>{const c=JSON.parse(JSON.stringify(o)),imgs=[];
  walk(c.data,v=>typeof v==='string'&&v.startsWith('data:image/')?'@img:'+(imgs.push(v)-1):undefined);
  const ref=db().collection('orders').doc(o.id),b=db().batch();b.set(ref,c);imgs.forEach((v,i)=>b.set(ref.collection('imgs').doc(String(i)),{v}));await b.commit()};
exports.getOrder=async(id,full)=>{if(!/^[a-f0-9]{12}$/.test(String(id)))return null;const ref=db().collection('orders').doc(id),s=await ref.get();if(!s.exists)return null;const o=s.data();
  if(full){const q=await ref.collection('imgs').get(),m={};q.forEach(d=>m['@img:'+d.id]=d.data().v);walk(o.data,v=>m[v])}return o};
exports.allOrders=async()=>{const q=await db().collection('orders').get(),a=[];q.forEach(d=>a.push(d.data()));return a};
exports.rl=async ip=>{const ref=db().collection('rl').doc(crypto.createHash('sha1').update(ip).digest('hex')),s=await ref.get();let d=s.exists?s.data():{n:0,until:0};if(Date.now()>d.until)d={n:0,until:Date.now()+9e5};d.n++;await ref.set(d);return d.n};
exports.rlClear=ip=>db().collection('rl').doc(crypto.createHash('sha1').update(ip).digest('hex')).delete();
// 4) بناء ملفات المتجر (يحوّل صور data-URI إلى ملفات)
const EXT={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','image/svg+xml':'svg'},T=path.join(ROOT,'store-template');
const buildStore=exports.buildStore=(o,out)=>{fs.mkdirSync(path.join(out,'images'),{recursive:true});
  const dz=o.data&&o.data.design;
  if(dz){if(!/^designs\/[\w-]+$/.test(dz))throw new Error('تصميم غير صالح');  // تصميم خاص: انسخ مجلده كاملاً وحقن سكربت التعبئة
    fs.cpSync(path.join(ROOT,'public',dz),out,{recursive:true,filter:s=>!s.endsWith('.original.html')});fs.copyFileSync(path.join(T,'sakb-fields.js'),path.join(out,'sakb-fields.js'));fs.copyFileSync(path.join(ROOT,'public','sakb-design.js'),path.join(out,'sakb-design.js'));
    const ip=path.join(out,'index.html');fs.writeFileSync(ip,fs.readFileSync(ip,'utf8').replace('</body>','<script src="sakb-design.js"></script><script src="sakb-fields.js"></script></body>'))}
  else for(const f of['index.html','app.js'])fs.copyFileSync(path.join(T,f),path.join(out,f));
  const data=JSON.parse(JSON.stringify(o.data));let n=0;
  walk(data,v=>{if(typeof v!=='string'||!v.startsWith('data:image/'))return;const m=/^data:(image\/[\w+.-]+)((?:;[\w-]+)*),(.*)$/s.exec(v);if(!m)return;
    const buf=m[2].includes('base64')?Buffer.from(m[3],'base64'):Buffer.from(decodeURIComponent(m[3])),name=`images/img-${++n}.${EXT[m[1]]||'bin'}`;fs.writeFileSync(path.join(out,name),buf);return name});
  fs.writeFileSync(path.join(out,'data.json'),JSON.stringify({template:o.template,data,palette:o.palette,whatsapp:o.whatsapp,wallet:o.wallet,statusUrl:o.statusUrl,expiresAt:(o.subscriptionStart||Date.now())+30*864e5}))};
// 5) نشر متجر العميل على حسابك: DEPLOY_PROVIDER=netlify|vercel (الافتراضي: netlify إن وُجد NETLIFY_TOKEN وإلا vercel). لم يُختبرا مع المنصتين الحقيقيتين.
const list=dir=>{const a=[];(function w(d,p){for(const f of fs.readdirSync(d)){const fp=path.join(d,f);fs.statSync(fp).isDirectory()?w(fp,p+f+'/'):a.push({file:p+f,buf:fs.readFileSync(fp)})}})(dir,'');return a};
const viaVercel=async(o,fl)=>{const r=await fetch('https://api.vercel.com/v13/deployments'+(E.VERCEL_TEAM_ID?'?teamId='+E.VERCEL_TEAM_ID:''),{method:'POST',headers:{Authorization:'Bearer '+E.VERCEL_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({name:'sakb-'+o.id,files:fl.map(f=>({file:f.file,data:f.buf.toString('base64'),encoding:'base64'})),projectSettings:{framework:null},target:'production'})});
  const j=await r.json();if(!r.ok)throw new Error((j.error&&j.error.message)||'فشل الرفع على فيرسل');return 'https://'+((j.alias&&j.alias[0])||j.url)};
const viaNetlify=async(o,fl)=>{const api='https://api.netlify.com/api/v1',H={Authorization:'Bearer '+E.NETLIFY_TOKEN},J={...H,'Content-Type':'application/json'},name='sakb-'+o.id;
  let r=await fetch(`${api}/sites/${name}.netlify.app`,{headers:H}),site;
  if(r.ok)site=await r.json();else if(r.status===404){r=await fetch(api+'/sites'+(E.NETLIFY_ACCOUNT_SLUG?'?account_slug='+E.NETLIFY_ACCOUNT_SLUG:''),{method:'POST',headers:J,body:JSON.stringify({name})});if(!r.ok)throw new Error('تعذر إنشاء موقع على نتلفاي');site=await r.json()}else throw new Error('نتلفاي: '+r.status);
  const sha={};fl.forEach(f=>sha['/'+f.file]=crypto.createHash('sha1').update(f.buf).digest('hex'));
  r=await fetch(`${api}/sites/${site.id}/deploys`,{method:'POST',headers:J,body:JSON.stringify({files:sha})});if(!r.ok)throw new Error('تعذر بدء النشر على نتلفاي');
  const d=await r.json(),need=new Set(d.required||[]),sent=new Set();
  for(const f of fl){const s=sha['/'+f.file];if(!need.has(s)||sent.has(s))continue;sent.add(s);
    const u=await fetch(`${api}/deploys/${d.id}/files/${f.file.split('/').map(encodeURIComponent).join('/')}`,{method:'PUT',headers:{...H,'Content-Type':'application/octet-stream'},body:f.buf});if(!u.ok)throw new Error('فشل رفع ملف: '+f.file)}
  return site.ssl_url||site.url};
exports.deploy=async(o,origin)=>{const dir=path.join(require('os').tmpdir(),'sakb-site-'+o.id);fs.rmSync(dir,{recursive:true,force:true});
  buildStore({...o,subscriptionStart:o.subscriptionStart||Date.now(),statusUrl:(E.SITE_ORIGIN||origin)+'/api/orders?id='+o.id+'&status=1'},dir);
  const fl=list(dir),prov=E.DEPLOY_PROVIDER||(E.NETLIFY_TOKEN?'netlify':'vercel');
  return prov==='netlify'?viaNetlify(o,fl):viaVercel(o,fl)};
