// طبقة الربط: كل اتصال بالخادم/القاعدة يمر من هنا فقط.
const J=async(u,m,b)=>{const r=await fetch(SAKB_CONFIG.apiBase+u,{method:m,headers:{'Content-Type':'application/json'},body:b&&JSON.stringify(b)});if(!r.ok)throw 0;return r.json()};
window.SakbAdapter={
  async getConfig(){if(!SAKB_CONFIG.apiBase)return null;try{return await J(SAKB_CONFIG.endpoints.orders+'?config=1','GET')}catch(e){return null}},
  async loadTemplates(){if(!SAKB_CONFIG.apiBase)return null;try{return await J(SAKB_CONFIG.endpoints.templates,'GET')}catch(e){return null}},
  // POST /orders → {id}
  async submitOrder(o){if(SAKB_CONFIG.apiBase)return await J(SAKB_CONFIG.endpoints.orders,'POST',o);  // عند فشل الخادم يُرمى خطأ ولا يُنشأ مشروع وهمي
    return{id:'p'+Date.now().toString(36),queued:true}},
  // GET /orders/:id → {status:'pending'|'live', url, subscriptionStart?}  (url = رابط فيرسل للمشروع)
  async getStatus(id,p){if(SAKB_CONFIG.apiBase){try{return await J(SAKB_CONFIG.endpoints.orders+'?id='+id,'GET')}catch(e){return null}}
    return SAKB_CONFIG.demoApprove&&Date.now()-(p.created||0)>6000?{status:'live',url:`https://sakb-${id}.vercel.app`}:null},
  // PUT /orders/:id — تعديل مشروع مفعّل (بدون دفع أو موافقة)
  async updateProject(id,b){if(SAKB_CONFIG.apiBase){try{return await J(SAKB_CONFIG.endpoints.orders+'?id='+id,'PUT',b)}catch(e){}}return{ok:true}}
};
