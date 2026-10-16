// يُحقن تلقائياً في المتاجر ذات التصميم الخاص: يملأ النصوص والصور والقوائم من data.json ويربط واتساب/المحفظة/QR.
(async()=>{
const r=await(await fetch('data.json')).json(),f=(r.data&&r.data.fields)||{},ls=(r.data&&r.data.lists)||{},q=s=>[...document.querySelectorAll(s)],top=s=>q(s).filter(e=>!e.closest('[data-item]'));
const off=m=>{document.body.innerHTML='<div style="min-height:100vh;display:grid;place-content:center;text-align:center;font-family:sans-serif"><h2>المتجر متوقف مؤقتاً</h2><p>'+m+'</p></div>'};
if(r.expiresAt&&Date.now()>r.expiresAt)return off('انتهى اشتراك هذا المتجر.');
if(r.statusUrl){try{if((await(await fetch(r.statusUrl)).json()).suspended)return off('يرجى المحاولة لاحقاً.')}catch(e){}}
if(r.palette)['--a','--b','--s','--bg'].forEach((k,i)=>document.documentElement.style.setProperty(k,r.palette[i]));
SakbDesign.lists(document,ls,false);
top('[data-t]').forEach(e=>{const v=f[e.dataset.t];if(v!=null)e.textContent=v});
top('[data-i]').forEach(e=>{const v=f[e.dataset.i];if(v)SakbDesign.setImg(e,v)});
const wa=String(r.whatsapp||'').replace(/\D/g,'');
q('[data-wa]').forEach(a=>a.href='https://wa.me/'+wa+(a.dataset.wa?'?text='+encodeURIComponent(a.dataset.wa):''));
q('[data-wallet]').forEach(a=>/^https?:/.test(r.wallet||'')?a.href=r.wallet:a.remove());
const qr=q('[data-qr]');if(qr.length){const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';s.onload=()=>qr.forEach(e=>new QRCode(e,{text:location.href,width:130,height:130}));document.head.appendChild(s)}
})();
