// إعدادات الربط — عبّئها عند جاهزية الخادم. الموقع يعمل بدونها (وضع تجريبي).
window.SAKB_CONFIG={
  support:"",             // يُقرأ من الخادم (SUPPORT_PHONE)
  siteUrl:"",            // رابط موقعك الرسمي على فيرسل (يُولَّد منه QR أيقونة الأعلى). فارغ = الرابط الحالي
  apiBase:"/api",       // الخادم على نفس موقعك في فيرسل (داخل تطبيق بلاي: الرابط الكامل https://موقعك.vercel.app/api). فارغ = وضع تجريبي
  endpoints:{orders:"/orders",templates:"/templates"},
  demoApprove:false,     // true = موافقة وهمية تلقائية للتجربة فقط (لا تفعّله على الموقع الحقيقي)
  firebase:null
};
