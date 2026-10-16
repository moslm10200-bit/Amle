// يحوّل معالجات (req,res) المشتركة إلى دوال نتلفاي: event → req ، res → {statusCode,headers,body}
module.exports=h=>async event=>{
  const hd={};for(const k in event.headers||{})hd[k.toLowerCase()]=event.headers[k];
  let body={};if(event.body){try{body=JSON.parse(event.isBase64Encoded?Buffer.from(event.body,'base64').toString('utf8'):event.body)}catch(e){}}
  const req={method:event.httpMethod,headers:hd,query:event.queryStringParameters||{},body};
  return new Promise(ok=>{const out={statusCode:200,headers:{'Cache-Control':'no-store'},body:''};let done=0;
    const fin=()=>{if(!done++)ok({statusCode:out.statusCode,headers:out.headers,body:out.body})};
    const res={get statusCode(){return out.statusCode},set statusCode(v){out.statusCode=v},setHeader:(k,v)=>{out.headers[k]=v},status(c){out.statusCode=c;return res},
      json(o){out.headers['Content-Type']='application/json; charset=utf-8';out.body=JSON.stringify(o);fin()},end(b){if(b)out.body=String(b);fin()}};
    Promise.resolve(h(req,res)).then(fin,()=>{out.statusCode=500;out.body=JSON.stringify({error:'خطأ في الخادم'});fin()})})};
