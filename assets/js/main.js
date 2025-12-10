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
        }
    });
});