// لوحة الإدارة: /api/admin?op=login|logout|orders|action
const {login,mkToken,isAdmin,configured,cors,rl,rlClear,getOrder,putOrder,allOrders,deploy}=require('../_lib');
module.exports=async(req,res)=>{
  if(cors(req,res))return;
  const op=req.query.op,body=req.body||{};
  if(op==='login'&&req.method==='POST'){
    if(!configured())return res.status(503).json({error:'لم تُضبط بيانات الأدمن (ADMIN_EMAIL / ADMIN_PASSWORD) في إعدادات الخادم'});
    const ip=String(req.headers['x-forwarded-for']||'x').split(',')[0].trim();let n=0;
    try{n=await rl(ip)}catch(e){}
    if(n>5)return res.status(429).json({error:'محاولات كثيرة، انتظر 15 دقيقة'});
    if(!login(body.id||body.email||'',String(body.password||'')))return res.status(401).json({error:'البريد أو كلمة المرور غير صحيحة'});
    try{await rlClear(ip)}catch(e){}
    return res.json({ok:true,token:mkToken()})}
  if(op==='logout')return res.json({ok:true});
  if(!isAdmin(req))return res.status(401).json({error:'unauth'});
  if(op==='orders'){const a=await allOrders();return res.json({orders:a.sort((x,y)=>y.createdAt-x.createdAt).map(o=>({id:o.id,brand:(o.data&&o.data.brand)||'',template:o.template,status:o.status,whatsapp:o.whatsapp,wallet:o.wallet,url:o.url||'',createdAt:o.createdAt}))})}
  if(op==='action'&&req.method==='POST'){
    const{id,action}=body,text=String(body.text||'').slice(0,500),o=await getOrder(id);
    if(!o)return res.status(404).json({error:'الطلب غير موجود'});o.messages=o.messages||[];const msg=t=>o.messages.push({ts:Date.now(),text:t});
    try{
      if(action==='approve'){if(o.status!=='pending')throw new Error('الطلب ليس قيد الانتظار');const st=Date.now();o.url=await deploy({...(await getOrder(id,true)),subscriptionStart:st},'https://'+req.headers.host);o.status='live';o.subscriptionStart=st;msg('تمت الموافقة على مشروعك وهو يعمل الآن ✓')}
      else if(action==='reject'){if(o.status!=='pending')throw new Error('الطلب ليس قيد الانتظار');o.status='rejected';msg(text||'تم رفض طلبك، تواصل مع الدعم الفني')}
      else if(action==='suspend'){if(o.status!=='live')throw new Error('المتجر ليس في وضع التشغيل');o.status='suspended';msg(text||'تم إيقاف متجرك مؤقتاً، تواصل مع الدعم الفني')}
      else if(action==='resume'){if(o.status!=='suspended')throw new Error('المتجر ليس موقوفاً');o.status='live';msg('تم تشغيل متجرك من جديد ✓')}
      else if(action==='message'){if(!text)throw new Error('الرسالة فارغة');msg(text)}
      else throw new Error('إجراء غير معروف');
    }catch(e){return res.status(400).json({error:e.message})}
    await putOrder(o);return res.json({ok:true,status:o.status,url:o.url||''})}
  res.status(404).end()};
