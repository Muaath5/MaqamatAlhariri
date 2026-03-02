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

// ===== تبديل الفاصل =====
// Characters after which a separator * is inserted
const SEPARATOR_CHARS = ['.', '۔', '。', '?', '؟', '!', '⁉', '⁈'];
let separatorActive = false;
let originalContentHTML = null;

function toggleSeparator() {
    const btn = document.getElementById('separatorToggle');
    const content = document.querySelector('.maqama-content');
    if (!content) return;

    separatorActive = !separatorActive;
    btn.classList.toggle('active', separatorActive);

    if (separatorActive) {
        if (!originalContentHTML) {
            originalContentHTML = content.innerHTML;
        }
        insertSeparators(content);
    } else {
        if (originalContentHTML) {
            content.innerHTML = originalContentHTML;
            if (harakatActive) {
                removeHarakat(content);
            }
        }
    }
}

function insertSeparators(container) {
    // Build a regex that matches any separator char (escaped for regex)
    const escaped = SEPARATOR_CHARS.map(function(c) {
        return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('');
    const regex = new RegExp('([' + escaped + '])', 'g');

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(function(node) {
        if (!regex.test(node.textContent)) return;
        regex.lastIndex = 0; // reset after test()

        const span = document.createElement('span');
        const parts = node.textContent.split(regex);
        parts.forEach(function(part) {
            if (SEPARATOR_CHARS.includes(part)) {
                // Keep the original character, then add the red *
                span.appendChild(document.createTextNode(part));
                const sep = document.createElement('span');
                sep.className = 'separator-dot';
                sep.textContent = ' * ';
                span.appendChild(sep);
            } else {
                span.appendChild(document.createTextNode(part));
            }
        });
        node.parentNode.replaceChild(span, node);
    });
}

// ===== إزالة الحركات =====
let harakatActive = false;
const harakatRegex = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0890\u0891\u08D3-\u08FF]/g;

function toggleHarakat() {
    const btn = document.getElementById('harakatToggle');
    const content = document.querySelector('.maqama-content');
    if (!content) return;

    harakatActive = !harakatActive;
    btn.classList.toggle('active', harakatActive);

    if (harakatActive) {
        // Save original if not saved yet
        if (!originalContentHTML) {
            originalContentHTML = content.innerHTML;
        }
        removeHarakat(content);
    } else {
        // Restore original
        if (originalContentHTML) {
            content.innerHTML = originalContentHTML;
            // Re-apply separator if it's active
            if (separatorActive) {
                insertSeparators(content);
            }
        }
    }
}


function removeHarakat(container) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(function(node) {
        node.textContent = node.textContent.replace(harakatRegex, '');
    });
}