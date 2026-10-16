// خادم Node بلا مكتبات إضافية: يعمل على أي استضافة Node (Render, Railway, Hostinger, VPS...). التشغيل: npm start
// يقدّم مجلد public ويربط /api/orders و/api/admin. (على فيرسل لا حاجة له: تعمل api/ كدوال مباشرة.)
const http=require('http'),fs=require('fs'),path=require('path');
const PUB=path.join(__dirname,'public'),MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2'};
const routes={'/api/orders':require('./api/orders'),'/api/admin':require('./api/admin')};
http.createServer(async(req,res)=>{try{
  const u=new URL(req.url,'http://x');req.query=Object.fromEntries(u.searchParams);
  res.status=c=>{res.statusCode=c;return res};res.json=o=>{res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(o))};
  const h=routes[u.pathname.replace(/\/$/,'')];
  if(h){let b='';for await(const c of req){b+=c;if(b.length>6e6){res.statusCode=413;return res.end()}}
    try{req.body=b?JSON.parse(b):{}}catch(e){req.body={}}res.setHeader('Cache-Control','no-store');return await h(req,res)}
  let f=path.normalize(path.join(PUB,decodeURIComponent(u.pathname)));
  if(f!==PUB&&!f.startsWith(PUB+path.sep)){res.statusCode=403;return res.end()}
  if(fs.existsSync(f)&&fs.statSync(f).isDirectory()){if(!u.pathname.endsWith('/')){res.statusCode=301;res.setHeader('Location',u.pathname+'/');return res.end()}f=path.join(f,'index.html')}
  if(!fs.existsSync(f)||path.basename(f).startsWith('.')){res.statusCode=404;return res.end('Not found')}
  res.setHeader('Content-Type',MIME[path.extname(f).toLowerCase()]||'application/octet-stream');if(f.includes(path.sep+'admin'+path.sep))res.setHeader('X-Robots-Tag','noindex');
  fs.createReadStream(f).pipe(res)}
catch(e){res.statusCode=500;res.end('Server error')}}).listen(process.env.PORT||3000,()=>console.log('SAKB running on :'+(process.env.PORT||3000)));
