# السكب — الموقع ولوحة الإدارة والخادم

## الملفات
```
sakb-site/
├─ README-ar.md  .env.example  .gitignore  package.json
├─ netlify.toml  netlify/functions/   ← لنتلفاي   |   vercel.json ← لفيرسل   |   server.js ← لأي استضافة Node
├─ public/                 ← الموقع / التطبيق (تطبيق بلاي يستخدم هذا المجلد)
│  ├─ index.html styles.css app.js images.js products.js templates.js firebase-adapter.js firebase-config.js sakb-design.js
│  ├─ designs/cafe/        ← تصميم خاص جاهز كمثال
│  └─ admin/               ← الأدمن: index.html admin.css admin.js auth.js  (يفتح على /admin)
├─ api/                    ← الخادم
│  ├─ _lib.js  orders/index.js (التطبيق)  admin/index.js (الأدمن)
├─ store-template/         ← قالب المتجر النهائي للعميل
└─ tools/add-design.js     ← وسم التصاميم الخاصة تلقائياً
```

## الخصوصية: لا توجد أي معلومات خاصة داخل الملفات
- **لا كلمات مرور ولا بريد ولا مفاتيح ولا أرقام** في أي ملف. كل شيء من متغيرات البيئة في إعدادات الاستضافة (انظر `.env.example`).
- **بيانات الأدمن:** `ADMIN_EMAIL` أو `ADMIN_USERNAME` + `ADMIN_PASSWORD` (8 أحرف فأكثر). إن لم تُضبط، لا يمكن لأحد الدخول.
- **معلوماتك التي يراها العميل:** `SUPPORT_PHONE` (الدعم الفني) و`PAY_SHAM_QR` و`PAY_USDT_QR` (رابط صورة رمز الدفع) — يقرؤها التطبيق من الخادم.
- **بيانات العملاء** (رقم الواتساب، المحفظة، النصوص، الصور) تُحفظ في Firebase فقط، ولا تُكتب في أي ملف. (متجر العميل المنشور يحوي رقمه ليعمل زر الطلب فقط.)
- لا ترفع ملف `.env` إلى أي مكان.

## رحلة الطلب (واتساب والمحفظة)
المرحلة 2: العميل يكتب رقم واتساب واسم/رابط محفظته (إلزاميان) ← المرحلة 3: الدفع ← «إتمام الشراء» يرسل الطلب كاملاً ← يظهر في الأدمن «قيد الانتظار» مع **رقم الواتساب** (رابط محادثة مباشر) و**اسم/رابط المحفظة** ← عند «موافقة» ينشر الخادم المتجر ويصل العميل الـQR والرابط.

## النشر على نتلفاي (Netlify)
1. ارفع المجلد كاملاً إلى مستودع GitHub (بدون ملف `.env`) ثم من نتلفاي: Add new site → Import from Git. الإعدادات تُقرأ تلقائياً من `netlify.toml`. (أو بالأمر `netlify deploy --prod` من Netlify CLI.) **لا تستخدم السحب والإفلات** لأن مكتبة `firebase-admin` تحتاج تثبيتاً.
2. Site configuration → Environment variables: أضف متغيرات `.env.example`، مع `DEPLOY_PROVIDER=netlify` و`NETLIFY_TOKEN` (User settings → Applications → Personal access tokens) لتُنشر متاجر العملاء على حسابك في نتلفاي.
3. افتح `https://موقعك.netlify.app/admin`.
- دوال نتلفاي تستدعي نفس كود `api/`؛ المسارات `/api/orders` و`/api/admin` تُحوَّل تلقائياً.
- حد زمن الدالة 10 ثوانٍ في الخطة المجانية (قد لا تكفي «الموافقة» مع صور كثيرة؛ أعد الضغط أو ارفع الحد من إعدادات نتلفاي).

## النشر
**أ) فيرسل:** ارفع المجلد كاملاً (يقرأ `api/` و`vercel.json` تلقائياً). ضع المتغيرات في Settings → Environment Variables.

**ب) أي استضافة Node** (Render, Railway, Hostinger, VPS...): ارفع المجلد كاملاً، أمر التثبيت `npm install` والتشغيل `npm start` (يشغّل `server.js` الذي يقدّم الموقع والـAPI معاً). ضع المتغيرات في إعدادات المنصة.

**ج) منصة ملفات ثابتة فقط** (Netlify/GitHub Pages...): ارفع `public/` وحده، وشغّل الخادم (أ أو ب) في مكان آخر. ثم في `public/firebase-config.js` ضع `apiBase:"https://خادمك/api"`، وفي الخادم ضع `ALLOWED_ORIGIN=https://موقعك` (وللوحة الأدمن عيّن `window.ADMIN_API` في `admin/index.html` إن كانت على نطاق مختلف).

متاجر العملاء تُنشر على حسابك في المنصة التي تحددها `DEPLOY_PROVIDER` (`netlify` أو `vercel`) بتوكنها. على فيرسل الاستخدام التجاري يتطلب خطة Pro.

## Firebase
Project settings → Service accounts → Generate new private key، وانسخ `project_id` و`client_email` و`private_key` إلى `FIREBASE_PROJECT_ID` و`FIREBASE_CLIENT_EMAIL` و`FIREBASE_PRIVATE_KEY` (بين علامتي اقتباس مع بقاء `\n`). فعّل Firestore.

## الأدمن
الدخول بالبريد أو اسم المستخدم + كلمة المرور ← توكن موقّع 12 ساعة (يُرسل `Authorization: Bearer`). حظر 5 محاولات خاطئة لـ15 دقيقة. موافقة · رفض · إيقاف/تشغيل · رسالة حرة للعميل تظهر في قائمته ☰ (مع «حفظ كقالب» لجملك المتكررة).

## الاشتراك
27 يوماً: نقطة حمراء + «متبقي 3 أيام»، 28: «يومين»، 29–30: «يوم واحد»، بعد 30: «انتهى». للتجربة `?day=27`.

## إضافة نموذج
**نفس التصميم:** `templates.js` ← `products.js` ← `images.js`.
**تصميم جديد كلياً:** ضع مجلده في `public/designs/اسم/index.html` ثم `node tools/add-design.js اسم "الاسم" "السعر"` (يوسمه تلقائياً ويسجّله؛ الأصل في `index.original.html`). الوسوم: `data-t` نص · `data-i` صورة · `data-wa` واتساب العميل · `data-wallet` محفظته · `data-qr` رمز الموقع · `data-list` + `data-item` قائمة منتجات يضيف العميل عليها ويحذف. استعمل تصاميمك أنت فقط.

## تنبيهات
- جرّبت الخادم والدورة كاملة محلياً بقاعدة Firebase وهمية؛ لم أختبر Firebase وVercel وبقية المنصات الحقيقية، ولم أفتح المحرّر في متصفح حقيقي.
- حجم الطلب الواحد حتى ~4.5MB على فيرسل (و6MB في `server.js`).
