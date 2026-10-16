const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const C=SAKB_CONFIG;
const PAL=[['#6b4226','#b07d4b','#f5ece2','#faf6f1'],['#5b21b6','#a855f7','#f3e8ff','#faf7ff'],['#0f4c5c','#2a9d8f','#e0f4f1','#f5fbfa'],['#0b3d91','#2f8bff','#e8f1ff','#f6f9ff'],['#111111','#b8892b','#f3efe6','#fafaf8'],['#9f1239','#fb7185','#ffe4e8','#fff8f9']];
const get=(o,p)=>p.split('.').reduce((a,k)=>a[k],o),set=(o,p,v)=>{let a=o;const k=p.split('.');while(k.length>1)a=a[k.shift()];a[k[0]]=v};
const ls={g:(k,d)=>{try{return JSON.parse(localStorage[k])}catch(e){return d}},s:(k,v)=>{try{localStorage[k]=JSON.stringify(v);return 1}catch(e){return 0}}};
let S={},mine=ls.g('sakbMine',[]);
if(C.apiBase){const n=mine.length;mine=mine.filter(p=>/^[a-f0-9]{12}$/.test(p.id));if(mine.length!==n){ls.s('sakbMine',mine);if(!mine.some(p=>p.status=='live'))ls.s('sakbSub',0)}}  // حذف المشاريع التجريبية القديمةconst saveMine=()=>ls.s('sakbMine',mine);
const toast=m=>{const t=$('#toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2000)};
function qr(el,t,n){el.innerHTML='';if(window.QRCode)new QRCode(el,{text:t,width:n,height:n,correctLevel:QRCode.CorrectLevel.M});else el.textContent=t}
function show(v){$$('.view').forEach(e=>e.classList.toggle('on',e.id===v));$$('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));document.body.classList.toggle('home',v==='home');scrollTo(0,0)}
$$('nav button').forEach(b=>b.onclick=()=>show(b.dataset.v));
function sheet(t,u){$('#sht').textContent=t;qr($('#shq'),u,200);$('#shl').value=u;$('#sheet').classList.add('on')}
$('#shc').onclick=async()=>{try{await navigator.clipboard.writeText($('#shl').value)}catch(e){$('#shl').select();document.execCommand('copy')}$('#shc').textContent='تم النسخ ✓';setTimeout(()=>$('#shc').textContent='نسخ الرابط',1500)};
$('#shx').onclick=()=>$('#sheet').classList.remove('on');
$('#sq').onclick=()=>sheet('رمز موقع السكب',C.siteUrl||location.href);
const closeD=()=>{$('#drawer').classList.remove('open');$('#scrim').classList.remove('on')};
$('#menu').onclick=()=>{$('#drawer').classList.add('open');$('#scrim').classList.add('on');renderMsgs(true)};$('#scrim').onclick=closeD;

let subWarn=false;const msgs=()=>ls.g('sakbMsgs',[]),esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const dotU=()=>{$('#dot').style.display=(subWarn||msgs().some(x=>!x.seen))?'block':'none'};
function renderMsgs(seen){const a=msgs();$('#msgs').innerHTML=a.length?'<h4>رسائل من الإدارة</h4>'+a.slice().reverse().map(x=>`<div class="mg${x.seen?'':' nw'}">${esc(x.text)}<small>${new Date(x.ts).toLocaleDateString('ar')}</small></div>`).join(''):'';if(seen){a.forEach(x=>x.seen=1);ls.s('sakbMsgs',a);dotU()}}
function sub(){const st=ls.g('sakbSub',0),q=+new URLSearchParams(location.search).get('day'),d=q||(st?Math.floor((Date.now()-st)/864e5)+1:0);
  const m=d>30?'انتهى اشتراكك، جدّد الآن لاستمرار متجرك':d>=29?'تحذير : متبقي يوم واحد لانتهاء الاشتراك':d==28?'تحذير : متبقي يومين لانتهاء الاشتراك':d==27?'تحذير : متبقي 3 أيام لانتهاء الاشتراك':'';
  $('#warn').textContent=m;subWarn=!!m;dotU()}
function lists(){
  $('#shows').innerHTML=SHOWCASE.map(s=>`<figure><img src="${s.image}"><figcaption>${s.name}</figcaption></figure>`).join('');
  $('#plist').innerHTML=PROJECTS.map(p=>`<div class="pc" data-id="${p.id}"><div class="pi"><h3>${p.name}</h3><small>BY السكب</small><b>${p.price}</b><button>تصفح</button></div><img src="${p.image}"></div>`).join('');mineList()}
function mineList(){$('#mc').textContent=mine.length||'';$('#mine').innerHTML=mine.length?mine.map((p,i)=>`<div class="mc"><div><h3>${p.name}</h3><small class="${p.status}">${{live:'يعمل ✓',pending:'قيد التنفيذ',suspended:'موقوف مؤقتاً',rejected:'مرفوض'}[p.status]||''}</small></div>${p.status=='live'?`<button data-o="${i}">تعديل</button><button class="b2" data-l="${i}">الرابط</button>`:''}</div>`).join(''):'<p class="em">لا توجد مشاريع بعد</p>'}
$$('.seg b').forEach(b=>b.onclick=()=>{$$('.seg b').forEach(x=>x.classList.toggle('on',x===b));$('#plist').hidden=b.dataset.t=='mine';$('#mine').hidden=b.dataset.t!='mine'});
$('#plist').onclick=e=>{const c=e.target.closest('.pc');c&&openTpl(c.dataset.id)};
$('#mine').onclick=e=>{const o=e.target.dataset.o,l=e.target.dataset.l;if(o!=null)openProj(+o);if(l!=null)sheet(mine[l].name,mine[l].url)};
$('#go').onclick=()=>show('create');
$('#pals').innerHTML=PAL.map((p,i)=>`<i data-i="${i}" style="background:linear-gradient(135deg,${p[0]},${p[1]},${p[2]})"></i>`).join('');
$('#pals').onclick=e=>{if(e.target.dataset.i){S.pal=+e.target.dataset.i;applyPal()}};
$('#pal').onclick=()=>$('#pals').classList.toggle('on');
$('#close').onclick=()=>{$('#editor').classList.remove('on');S={}};$('#lk').onclick=()=>sheet('رابط موقعي',S.url);
const norm=d=>{d.ic1=d.ic1||'▦';d.ic2=d.ic2||'🛒';d.qc=d.qc||'امسح الرمز لزيارة المتجر';d.items.forEach(x=>{x.buy=x.buy||'شراء';if(x.ci==null)x.ci=Math.max(0,d.cats.indexOf(x.cat))});return d};
function openEd(){$('#next').style.display='';$('#next').disabled=false;$('#editor').classList.add('on');draw()}
function openTpl(id){const pr=PROJECTS.find(x=>x.id===id);if(pr&&pr.design)return openDesign(pr);const t=TEMPLATES[id];S={id,step:0,d:norm(structuredClone(t)),pal:t.pal||0,wa:'',wl:''};openEd()}
function openDesign(p){S={id:p.id,design:p.design,step:0,d:{design:p.design,brand:p.name,fields:{}},pal:-1,wa:'',wl:''};openEd()}
function openProj(i){const p=mine[i];S={id:p.tpl,oid:p.id,url:p.url,edit:1,step:0,design:p.data&&p.data.design,d:(p.data&&p.data.design)?p.data:norm(p.data||structuredClone(TEMPLATES[p.tpl])),pal:p.pal||0,wa:p.wa,wl:p.wl};openEd()}
function applyPal(){if(S.pal<0)return;const p=PAL[S.pal],s=$('#stage').style;s.setProperty('--a',p[0]);s.setProperty('--b',p[1]);s.setProperty('--s',p[2]);s.setProperty('--bg',p[3]);const fd=$('#fr')&&$('#fr').contentDocument;if(fd)['--a','--b','--s','--bg'].forEach((k,i)=>fd.documentElement.style.setProperty(k,p[i]))}
const im=(p,c='')=>`<div class="im ${c}" data-p="${p}"><img src="${get(S.d,p)}"><button class="eb">تعديل</button></div>`;
const tx=(p,t='div')=>`<${t} contenteditable="plaintext-only" data-p="${p}">${get(S.d,p)}</${t}>`;
function store(){const d=S.d;return `<div class="st"><div class="sth">${tx('ic1','i')}<div class="br">${tx('icon','span')}${tx('brand','span')}</div>${tx('ic2','i')}</div><div class="bn"><div class="bt">${tx('bt','h2')}${tx('bs','p')}${tx('cta','span')}</div>${im('bi','bi')}</div><div class="sr">🔍 ${tx('sp','span')}</div><div class="ch">${d.cats.map((c,i)=>`<b data-i="${i}" class="${i?'':'on'}">${tx('cats.'+i,'span')}${i?`<u data-delc="${i}">✕</u>`:''}</b>`).join('')}<b class="ad" data-addc>＋</b></div><h3>${tx('sh','span')}</h3><div class="gr">${d.items.map((x,i)=>`<article data-ci="${x.ci}"><u class="dl" data-del="${i}">✕</u>${im('items.'+i+'.img')}${tx('items.'+i+'.name','h4')}${tx('items.'+i+'.price','em')}<div class="by">${tx('items.'+i+'.buy','span')}</div></article>`).join('')}<article class="add" data-add>＋<br>إضافة منتج</article></div><section class="qrs"><div class="qrc">${S.url?'':`<img src="${IMG.storeQR}">`}</div>${tx('qc','p')}</section></div>`}
function draw(){const st=S.step;$('#editor').classList.toggle('edit',!!S.edit);$('#lk').style.display=S.edit&&S.url?'block':'';
  $('#steps').innerHTML=[0,1,2].map(i=>`<i class="${i<=st?'d':''}"></i>`).join('');$('#pal').style.visibility=st?'hidden':'';$('#pals').classList.remove('on');
  let h;
  if(st==0)h=S.design?'<iframe id="fr"></iframe>':store();
  else if(st==1)h=`<div class="fm"><input id="wa" type="tel" inputmode="numeric" placeholder="رقم الواتساب" value="${S.wa}"><small>ادخل رقم الوتس اب الصحيح لوضعه لموقعك</small><input id="wl" placeholder="اسم محفظتك أو رابطها" value="${S.wl}"><small>ضع اسم محفظتك أو رابطها</small><p class="er" id="er"></p></div>`;
  else h=`<div class="fm"><h2>الدفع</h2><div class="pay"><div><img src="${IMG.payShamQR}"><b>شام كاش</b></div><div><img src="${IMG.payUsdtQR}"><b>USDT</b></div></div></div>`;
  $('#stage').innerHTML=h;$('#next').textContent=S.edit?'حفظ التعديلات':st==2?'إتمام الشراء':'التالي';applyPal();if(S.url&&st==0&&!S.design)qr($('.qrc'),S.url,130);if(S.design&&st==0)loadFr()}
const redraw=()=>{const y=$('#stage').scrollTop;draw();$('#stage').scrollTop=y};
$('#stage').addEventListener('input',e=>{const p=e.target.dataset.p;if(p)set(S.d,p,e.target.innerText.trim())});
$('#stage').addEventListener('click',e=>{const t=e.target,k=a=>t.closest('['+a+']');let x;
  if(x=k('data-del')){S.d.items.splice(+x.dataset.del,1);return redraw()}
  if(k('data-add')){S.d.items.push({name:'منتج جديد',price:'0 ل.س',buy:'شراء',ci:0,img:IMG.ph});return redraw()}
  if(x=k('data-delc')){const n=+x.dataset.delc;S.d.cats.splice(n,1);S.d.items.forEach(i=>i.ci==n?i.ci=0:i.ci>n&&i.ci--);return redraw()}
  if(k('data-addc')){S.d.cats.push('تصنيف');return redraw()}
  const c=t.closest('.ch b[data-i]');if(c){const n=+c.dataset.i;$$('.ch b[data-i]').forEach(b=>b.classList.toggle('on',b===c));$$('.gr article[data-ci]').forEach(a=>a.style.display=(!n||+a.dataset.ci===n)?'':'none');return}
  const w=t.closest('.im');$$('.im.sel').forEach(y=>y!==w&&y.classList.remove('sel'));if(!w)return;t.classList.contains('eb')?pick(w):w.classList.toggle('sel')});
function readImg(cb){const f=$('#file');f.onchange=()=>{const fl=f.files[0];if(!fl)return;const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,700/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.72))};i.src=r.result};r.readAsDataURL(fl);f.value=''};f.click()}
function pick(w){readImg(u=>{set(S.d,w.dataset.p,u);w.querySelector('img').src=u;w.classList.remove('sel')})}
// ===== تصميم خاص: يُحمَّل داخل iframe وتُفعَّل عناصر data-t (نص) وdata-i (صورة) =====
function loadFr(){const fr=$('#fr');fr.onload=()=>prep(fr.contentDocument);fr.src=S.design+'/index.html'}
function prep(d){const f=S.d.fields;S.d.lists=S.d.lists||{};const st=d.createElement('style');
  st.textContent='[data-t]{outline:1px dashed #0004;outline-offset:2px}[data-i]{cursor:pointer;outline:1px dashed #0004}.sk-b{position:absolute;top:6px;left:6px;z-index:9;width:30px;height:30px;border:0;border-radius:50%;background:#dc2626;color:#fff;font:700 14px sans-serif}.sk-add{display:block;margin:12px auto;border:2px dashed #888;background:#fff;color:#333;border-radius:14px;padding:12px 22px;font:700 15px sans-serif}';d.head.appendChild(st);
  const top=s=>[...d.querySelectorAll(s)].filter(e=>!e.closest('[data-item]'));
  top('[data-t]').forEach(e=>{const k=e.dataset.t;if(f[k]!=null)e.textContent=f[k];e.contentEditable='plaintext-only';e.oninput=()=>{f[k]=e.innerText.trim();if(k==='brand')S.d.brand=f[k]||S.d.brand}});
  top('[data-i]').forEach(e=>{if(f[e.dataset.i])SakbDesign.setImg(e,f[e.dataset.i])});
  // قوائم المنتجات: إضافة وحذف
  const LS=SakbDesign.lists(d,S.d.lists,true);
  for(const k in LS){const L=LS[k],rows=S.d.lists[k];
    const draw=()=>SakbDesign.render(L,rows,(it,o,i)=>{if(d.defaultView.getComputedStyle(it).position==='static')it.style.position='relative';
      it.querySelectorAll('[data-t]').forEach(e=>{e.contentEditable='plaintext-only';e.oninput=()=>o[e.dataset.t]=e.innerText.trim()});
      const b=d.createElement('button');b.className='sk-b';b.textContent='✕';b.onclick=ev=>{ev.stopPropagation();rows.splice(i,1);draw()};it.appendChild(b)});
    const a=d.createElement('button');a.className='sk-add';a.textContent='＋ إضافة منتج';a.onclick=()=>{rows.push(SakbDesign.read(L.tpl));draw()};L.box.after(a);draw()}
  d.addEventListener('click',ev=>{if(ev.target.closest('a'))ev.preventDefault();d.querySelectorAll('.sk-eb').forEach(b=>b.remove());const t=ev.target.closest('[data-i]');if(!t)return;
    const r=t.getBoundingClientRect(),w=d.defaultView,b=d.createElement('button');b.className='sk-eb';b.textContent='تعديل';
    b.style.cssText='position:absolute;z-index:99999;left:'+(r.left+w.scrollX+r.width/2-34)+'px;top:'+(r.top+w.scrollY+r.height/2-18)+'px;background:#000b;color:#fff;border:0;border-radius:14px;padding:9px 20px;font:inherit';
    b.onclick=e2=>{e2.stopPropagation();readImg(u=>{const it=t.closest('[data-item]');if(it){const box=it.parentElement,idx=[...box.querySelectorAll(':scope>[data-item]')].indexOf(it);S.d.lists[box.dataset.list][idx][t.dataset.i]=u}else f[t.dataset.i]=u;SakbDesign.setImg(t,u);t.dataset.v=u;b.remove()})};d.body.appendChild(b)},true);
  applyPal()}
$('#next').onclick=async()=>{
  if(S.edit){const p=mine.find(m=>m.id==S.oid);Object.assign(p,{data:S.d,pal:S.pal,name:S.d.brand});saveMine();mineList();await SakbAdapter.updateProject(S.oid,{data:S.d,palette:PAL[S.pal]});return toast('تم حفظ التعديلات ✓')}
  if(S.step==1){S.wa=$('#wa').value.trim();S.wl=$('#wl').value.trim();if(!/^\+?\d{8,15}$/.test(S.wa.replace(/\s/g,''))||!S.wl){$('#er').textContent='يجب تعبئة الحقلين بشكل صحيح';return}}
  if(S.step<2){S.step++;draw();return}
  $('#next').disabled=true;
  let r;try{r=await SakbAdapter.submitOrder({template:S.id,data:S.d,palette:PAL[S.pal],whatsapp:S.wa,wallet:S.wl,createdAt:Date.now()})}catch(e){$('#next').disabled=false;return toast('تعذر إرسال الطلب، تأكد من الاتصال وحاول مجدداً')}
  mine.unshift({id:r.id,tpl:S.id,name:S.d.brand,status:'pending',url:'',data:S.d,pal:S.pal,wa:S.wa,wl:S.wl,created:Date.now()});saveMine();mineList();
  $('#stage').innerHTML='<div class="fm done"><div>⏳</div><h2>مشروعك قيد التنفيذ</h2><p>لا تقلق إن أخذ بعض الوقت، ستجده في «مشاريعي»</p><button class="gm" id="gm">عرض مشاريعي</button></div>';$('#next').style.display='none';
  $('#gm').onclick=()=>{$('#editor').classList.remove('on');S={};show('create');$$('.seg b')[1].click()}};
async function poll(){for(const p of mine){const r=await SakbAdapter.getStatus(p.id,p);if(!r)continue;let ch=0;
  (r.messages||[]).forEach(m=>{const a=msgs(),k=p.id+m.ts;if(!a.some(x=>x.k===k)){a.push({k,text:m.text,ts:m.ts});ls.s('sakbMsgs',a);ch=1}});
  if(r.status&&r.status!==p.status){const was=p.status;p.status=r.status;if(r.url)p.url=r.url;ch=1;
    if(r.status=='live'&&was=='pending'){if(r.subscriptionStart)ls.s('sakbSub',r.subscriptionStart);else if(!ls.g('sakbSub',0))ls.s('sakbSub',Date.now());sheet('🎉 مشروعك جاهز',p.url)}}
  if(ch){saveMine();mineList();sub();renderMsgs(false);dotU()}}}
(async()=>{const cf=await SakbAdapter.getConfig();if(cf){if(cf.support){C.support=cf.support;$('#sup').textContent=cf.support;$('#sup').href='tel:+'+cf.support.replace(/\D/g,'')}if(cf.shamQR)IMG.payShamQR=cf.shamQR;if(cf.usdtQR)IMG.payUsdtQR=cf.usdtQR}
  const r=await SakbAdapter.loadTemplates();if(r){r.templates&&Object.assign(TEMPLATES,r.templates);r.projects&&(window.PROJECTS=r.projects);r.showcase&&(window.SHOWCASE=r.showcase)}lists();sub();renderMsgs(false);dotU();poll();setInterval(poll,8000)})();
