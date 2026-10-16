#!/usr/bin/env node
// يعلّم تصميمك تلقائياً (data-t / data-i / data-wa / قوائم المنتجات) ويضيفه إلى products.js.
// الاستخدام: node tools/add-design.js اسم-المجلد "اسم يظهر للعميل" "السعر"
// المجلد المطلوب: public/designs/اسم-المجلد/index.html (+ preview.jpg اختياري كصورة البطاقة)
const fs=require('fs'),path=require('path');
const [,,id,name='تصميم جديد',price='50$']=process.argv;
if(!id||!/^[\w-]+$/.test(id)){console.log('الاستخدام: node tools/add-design.js <id> "الاسم" "السعر"');process.exit(1)}
const pub=path.join(__dirname,'..','public'),dir=path.join(pub,'designs',id),f=path.join(dir,'index.html');
if(!fs.existsSync(f)){console.log('لم أجد '+f);process.exit(1)}
const VOID=new Set('area base br col embed hr img input link meta source track wbr'.split(' ')),SKIP=new Set(['head','title','svg','noscript','select','option','textarea']);
function mark(h){
  const re=/<!--[\s\S]*?-->|<(script|style)\b[\s\S]*?<\/\1\s*>|<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>|[^<]+/g,root={tag:'#',ch:[],text:'',attrs:''},st=[root],ins=[];let m;
  while((m=re.exec(h))){
    if(m[1]||m[0].startsWith('<!--'))continue;
    if(m[3]===undefined){const t=m[0].trim();if(t)st[st.length-1].text+=t;continue}
    const tag=m[3].toLowerCase();
    if(m[2]){for(let i=st.length-1;i>0;i--)if(st[i].tag===tag){st.length=i;break}continue}
    const n={tag,attrs:m[4],pos:m.index+m[0].length-(m[5]?2:1),ch:[],text:''};st[st.length-1].ch.push(n);if(!VOID.has(tag)&&!m[5])st.push(n)}
  const has=(n,a)=>new RegExp('(^|\\s)'+a+'(=|\\s|$)').test(n.attrs),cls=n=>(n.attrs.match(/class\s*=\s*["']([^"']+)/)||[])[1]||'';
  const hasContent=n=>n.tag==='img'||n.text||n.ch.some(hasContent);
  let LK=0,stat={t:0,i:0,l:0,w:0};
  (function walk(n,skip,ctr){
    const kids=n.ch,isList=!skip&&kids.length>=2&&kids.every(c=>c.tag===kids[0].tag&&cls(c)&&cls(c)===cls(kids[0])&&!VOID.has(c.tag)&&hasContent(c));
    if(isList){ins.push([n.pos,` data-list="l${++LK}"`]);stat.l++}
    for(const c of kids){
      const sk=skip||SKIP.has(c.tag),cc=isList?{t:0,i:0}:ctr;
      if(isList)ins.push([c.pos,' data-item']);
      if(!sk){
        if(c.tag==='img'&&!has(c,'data-i')){ins.push([c.pos,` data-i="i${++cc.i}"`]);stat.i++}
        else if(/background(-image)?\s*:[^;"']*url\(/.test(c.attrs)&&!has(c,'data-i')){ins.push([c.pos,` data-i="i${++cc.i}"`]);stat.i++}
        if(c.tag==='a'&&/wa\.me|whatsapp/i.test(c.attrs)&&!has(c,'data-wa')){ins.push([c.pos,' data-wa=""']);stat.w++}
        if(!c.ch.length&&c.text&&!VOID.has(c.tag)&&!has(c,'data-t')){ins.push([c.pos,` data-t="t${++cc.t}"`]);stat.t++}
      }
      walk(c,sk,cc)}
  })(root,false,{t:0,i:0});
  ins.sort((a,b)=>b[0]-a[0]);for(const[p,s]of ins)h=h.slice(0,p)+s+h.slice(p);return[h,stat]}
let html=fs.readFileSync(f,'utf8');
if(/data-(t|i|list)=/.test(html))console.log('التصميم موسوم مسبقاً — تخطيت الوسم.');
else{const[o,s]=mark(html);fs.writeFileSync(path.join(dir,'index.original.html'),html);fs.writeFileSync(f,o);
  console.log(`وُسمت: ${s.t} نص، ${s.i} صورة، ${s.l} قائمة، ${s.w} رابط واتساب. الأصل محفوظ في index.original.html — راجع النتيجة وعدّل الوسوم يدوياً إن لزم.`)}
const pj=path.join(pub,'products.js');let p=fs.readFileSync(pj,'utf8');
if(p.includes(`design:'designs/${id}'`))console.log('مسجّل في products.js مسبقاً.');
else{const i=p.indexOf('window.PROJECTS=['),j=p.indexOf('];',i),pv=['jpg','png','webp','svg'].map(e=>'preview.'+e).find(x=>fs.existsSync(path.join(dir,x))),q=s=>s.replace(/'/g,"\\'");
  p=p.slice(0,j).replace(/\s*$/,'')+`,\n  {id:'${id}',name:'${q(name)}',price:'${q(price)}',image:${pv?`'designs/${id}/${pv}'`:'IMG.ph'},design:'designs/${id}'}\n`+p.slice(j);fs.writeFileSync(pj,p);console.log('أُضيف إلى products.js ✓')}
