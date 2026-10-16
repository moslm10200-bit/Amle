// مكتبة مشتركة (المحرّر + المتجر النهائي): قوائم المنتجات القابلة للإضافة والحذف في التصاميم الخاصة.
// الصيغة: <div data-list="اسم"> <div data-item> ...عناصر data-t / data-i... </div> ...أمثلة افتراضية... </div>
window.SakbDesign={
  read(it){const o={};it.querySelectorAll('[data-t]').forEach(e=>o[e.dataset.t]=e.textContent.trim());it.querySelectorAll('[data-i]').forEach(e=>{const v=e.tagName==='IMG'?e.getAttribute('src'):(e.dataset.v||'');if(v)o[e.dataset.i]=v});return o},
  setImg(e,u){e.tagName==='IMG'?e.setAttribute('src',u):e.style.backgroundImage='url("'+u+'")'},
  fill(it,o){it.querySelectorAll('[data-t]').forEach(e=>{const v=o[e.dataset.t];if(v!=null)e.textContent=v});it.querySelectorAll('[data-i]').forEach(e=>{const v=o[e.dataset.i];if(v){this.setImg(e,v);e.dataset.v=v}})},
  render(L,rows,hook){L.box.querySelectorAll(':scope>[data-item]').forEach(e=>e.remove());rows.forEach((o,i)=>{const it=L.tpl.cloneNode(true);this.fill(it,o);L.box.appendChild(it);if(hook)hook(it,o,i)})},
  lists(doc,lists,init){const out={};doc.querySelectorAll('[data-list]').forEach(box=>{const k=box.dataset.list,its=[...box.querySelectorAll(':scope>[data-item]')];if(!its.length)return;
    const L=out[k]={box,tpl:its[0].cloneNode(true)};if(!lists[k]){if(!init)return;lists[k]=its.map(i=>this.read(i))}this.render(L,lists[k])});return out}
};
