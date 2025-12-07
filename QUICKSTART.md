# دليل البدء السريع

## رفع الموقع على GitHub Pages

### الخطوة 1: إنشاء مستودع
1. اذهب إلى https://github.com/new
2. اسم المستودع: `maqamat-hariri` (أو أي اسم تريده)
3. اجعله Public
4. اضغط "Create repository"

### الخطوة 2: رفع الملفات
افتح Terminal أو Command Prompt في مجلد الموقع واكتب:

```bash
git init
git add .
git commit -m "إضافة موقع مقامات الحريري"
git branch -M main
git remote add origin https://github.com/اسمك/maqamat-hariri.git
git push -u origin main
```

### الخطوة 3: تفعيل GitHub Pages
1. في صفحة المستودع، اضغط على Settings
2. من القائمة الجانبية، اختر Pages
3. في قسم "Source"، اختر branch: `main`
4. اضغط Save
5. انتظر دقيقة، ثم سيظهر رابط الموقع: `https://اسمك.github.io/maqamat-hariri`

---

## إضافة مقامة جديدة

1. افتح مجلد `_maqamat`
2. انسخ ملف `00-template.md` وغيّر اسمه (مثال: `04-baghdadiya.md`)
3. عدّل المحتوى:
   - غيّر `title` و `number`
   - اكتب النص العادي
   - للقصائد استخدم التنسيق الموجود في الملف

---

## إضافة خط جديد

### في ملف `assets/css/style.css`:

```css
/* أضف في البداية */
@import url('https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400;700&display=swap');

/* أضف في قسم الخطوط */
body.font-reem { font-family: 'Reem Kufi', sans-serif; }
```

### في ملف `_layouts/default.html`:

```html
<!-- أضف خياراً جديداً -->
<option value="reem">Reem Kufi</option>
```

---

## التشغيل المحلي (اختياري)

```bash
# تثبيت Jekyll
gem install bundler jekyll

# تشغيل الموقع
bundle install
bundle exec jekyll serve

# افتح: http://localhost:4000
```

---

## نصائح

✅ استخدم أرقاماً متسلسلة للمقامات (01, 02, 03...)
✅ احفظ الملفات بصيغة UTF-8
✅ القصائد على الكمبيوتر: شطرين جنب بعض
✅ القصائد على الجوال: شطر تحت شطر
✅ الخط المختار يُحفظ تلقائياً
