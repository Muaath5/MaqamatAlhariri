# موقع مقامات الحريري

موقع ثابت (Static) لعرض مقامات الحريري باستخدام Jekyll، مع تصميم بسيط وجميل وعرض مميز للقصائد.

## إضافة مقامة جديدة

1. أنشئ ملف جديد في مجلد `_maqamat` باسم مثل: `04-baghdadiya.md`
2. أضف المحتوى التالي:

```markdown
---
title: المقامة البغدادية
number: 4
---

محتوى المقامة هنا...

للقصائد، استخدم:

<div class="poem">
<div class="verse">
<div class="right-hemistich">الشطر الأول</div>
<div class="left-hemistich">الشطر الثاني</div>
</div>

<div class="verse">
<div class="right-hemistich">بيت آخر - شطر أول</div>
<div class="left-hemistich">بيت آخر - شطر ثاني</div>
</div>
</div>

باقي النص العادي...
```

## إضافة خط جديد

### 1. أضف الخط في ملف `assets/css/style.css`:

```css
/* في بداية الملف */
@import url('https://fonts.googleapis.com/css2?family=FONT_NAME:wght@400;700&display=swap');

/* في قسم الخطوط */
body.font-newfont { font-family: 'Font Name', serif; }
```

### 2. أضف خيار الخط في `_layouts/default.html`:

```html
<select id="fontSelect">
    <option value="amiri">Amiri</option>
    <option value="scheherazade">Scheherazade</option>
    <option value="lateef">Lateef</option>
    <option value="cairo">Cairo</option>
    <option value="newfont">الخط الجديد</option>
</select>
```