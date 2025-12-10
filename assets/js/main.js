// تحميل الخط المحفوظ
document.addEventListener('DOMContentLoaded', function() {
    const fontSelect = document.getElementById('fontSelect');
    const savedFont = localStorage.getItem('selectedFont') || 'amiri';
    
    // تطبيق الخط المحفوظ
    document.body.className = 'font-' + savedFont;
    fontSelect.value = savedFont;
    
    // حفظ الخط عند التغيير
    fontSelect.addEventListener('change', function() {
        const selectedFont = this.value;
        document.body.className = 'font-' + selectedFont;
        localStorage.setItem('selectedFont', selectedFont);
    });
});

// ===== شرح الكلمات والعبارات =====
document.addEventListener('DOMContentLoaded', function() {
    // إنشاء عناصر الشرح
    const explainElements = document.querySelectorAll('.explain');
    
    explainElements.forEach(function(element) {
        const explanationText = element.getAttribute('data-explain');
        
        if (explanationText) {
            // إنشاء نافذة الشرح
            const popup = document.createElement('span');
            popup.className = 'explain-popup';
            popup.textContent = explanationText;
            element.appendChild(popup);
            
            // معالجة الضغط على الجوال
            element.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // إغلاق أي نوافذ شرح أخرى مفتوحة
                document.querySelectorAll('.explain.active').forEach(function(other) {
                    if (other !== element) {
                        other.classList.remove('active');
                    }
                });
                
                // تبديل حالة العنصر الحالي
                element.classList.toggle('active');
                
                // تعديل موضع النافذة إذا كانت خارج الشاشة
                setTimeout(function() {
                    adjustPopupPosition(element, popup);
                }, 10);
            });
            
            // معالجة hover للكمبيوتر
            element.addEventListener('mouseenter', function() {
                adjustPopupPosition(element, popup);
            });
        }
    });
    
    // إغلاق الشرح عند الضغط خارجه
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.explain')) {
            document.querySelectorAll('.explain.active').forEach(function(element) {
                element.classList.remove('active');
            });
        }
    });
    
    // دالة لتعديل موضع النافذة المنبثقة
    function adjustPopupPosition(element, popup) {
        const rect = element.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        
        // إزالة أي class سابق
        popup.classList.remove('align-left', 'align-right');
        
        // فحص إذا كانت النافذة خارج الشاشة من اليمين
        if (rect.left + popupRect.width / 2 > windowWidth - 20) {
            popup.classList.add('align-right');
        }
        // فحص إذا كانت النافذة خارج الشاشة من اليسار
        else if (rect.left - popupRect.width / 2 < 20) {
            popup.classList.add('align-left');
        }
    }
});