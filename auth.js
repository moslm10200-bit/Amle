// ===== ربط التوكن بالـAPI: تخزين، إرسال Bearer، مراقبة الانتهاء، وتسجيل خروج تلقائي =====
// لربط اللوحة بخادم آخر عيّن قبل هذا السكربت: window.ADMIN_API='https://موقعك.vercel.app/api/admin'
window.Auth={
  base:window.ADMIN_API||'/api/admin',
  get t(){try{return sessionStorage.sakbTok||''}catch(x){return ''}},
  store(t){try{t?sessionStorage.sakbTok=t:sessionStorage.removeItem('sakbTok')}catch(x){}clearTimeout(this._h);
    if(t){const ms=this.exp()-Date.now();if(ms>0)this._h=setTimeout(()=>{this.clear();dispatchEvent(new Event('sakb-auth-expired'))},ms)}},
  clear(){this.store('')},
  exp(){try{return JSON.parse(atob(this.t.split('.')[0].replace(/-/g,'+').replace(/_/g,'/'))).exp||0}catch(x){return 0}},
  valid(){return this.exp()>Date.now()},
  async call(op,body){
    const r=await fetch(this.base+'?op='+op,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(this.t?{Authorization:'Bearer '+this.t}:{})},body:body&&JSON.stringify(body)});
    const j=await r.json().catch(()=>({}));
    if(r.status===401&&op!=='login'){this.clear();throw Object.assign(new Error('انتهت الجلسة'),{auth:1})}
    if(!r.ok)throw new Error(j.error||'خطأ');
    if(j.token)this.store(j.token);return j}
};
if(Auth.valid())Auth.store(Auth.t);
