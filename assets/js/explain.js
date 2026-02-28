/**
 * Maqamat Annotator Tool
 * A tool for adding word explanations to Maqamat Alhariri
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        containerSelector: '.maqama-content',
        annotationClass: 'explain',
        buttonId: 'annotator-export-btn',
        modalId: 'annotator-modal',
        overlayId: 'annotator-overlay'
    };

    // State
    let selectedRange = null;
    let annotatorEnabled = true;

    // Initialize the annotator
    function init() {
        // Only run on maqama pages
        const container = document.querySelector(CONFIG.containerSelector);
        if (!container) return;

        createUI();
        attachEventListeners();
        makeExistingAnnotationsEditable();
    }

    // Create UI elements
    function createUI() {
        // Create toolbar
        const toolbar = document.createElement('div');
        toolbar.id = 'annotator-toolbar';
        toolbar.innerHTML = `
            <div class="annotator-toolbar-content">
                <button id="${CONFIG.buttonId}" class="annotator-btn annotator-export">
                    تصدير المحتوى
                </button>
                <button id="annotator-toggle" class="annotator-btn annotator-toggle">
                    إيقاف الأداة
                </button>
                <span class="annotator-status">الأداة مفعلة</span>
            </div>
        `;
        document.body.appendChild(toolbar);

        // Create modal for explanation input
        const modal = document.createElement('div');
        modal.id = CONFIG.modalId;
        modal.innerHTML = `
            <div class="annotator-modal-content">
                <h3>إضافة شرح</h3>
                <p class="annotator-selected-text"></p>
                <label for="annotator-explanation">الشرح:</label>
                <input type="text" id="annotator-explanation" placeholder="أدخل الشرح هنا" dir="rtl">
                <div class="annotator-modal-buttons">
                    <button id="annotator-save" class="annotator-btn annotator-primary">حفظ</button>
                    <button id="annotator-cancel" class="annotator-btn">إلغاء</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = CONFIG.overlayId;
        document.body.appendChild(overlay);

        // Inject CSS
        injectStyles();
    }

    // Inject CSS styles
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #annotator-toolbar {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: #2c3e50;
                color: white;
                padding: 10px;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
                direction: rtl;
            }

            .annotator-toolbar-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .annotator-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s;
                font-family: inherit;
            }

            .annotator-btn:hover {
                opacity: 0.9;
                transform: translateY(-1px);
            }

            .annotator-export {
                background: #27ae60;
                color: white;
            }

            .annotator-toggle {
                background: #e74c3c;
                color: white;
            }

            .annotator-toggle.disabled {
                background: #95a5a6;
            }

            .annotator-primary {
                background: #3498db;
                color: white;
            }

            .annotator-status {
                margin-right: auto;
                font-size: 14px;
                color: #ecf0f1;
            }

            #${CONFIG.modalId} {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 1002;
                min-width: 400px;
                direction: rtl;
            }

            #${CONFIG.modalId}.show {
                display: block;
            }

            .annotator-modal-content h3 {
                margin-top: 0;
                color: #2c3e50;
            }

            .annotator-selected-text {
                background: #f8f9fa;
                padding: 10px;
                border-radius: 4px;
                margin: 10px 0;
                color: #2c3e50;
                font-weight: bold;
            }

            .annotator-modal-content label {
                display: block;
                margin-bottom: 8px;
                color: #34495e;
                font-weight: bold;
            }

            .annotator-modal-content input {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-bottom: 20px;
                font-size: 16px;
                box-sizing: border-box;
                direction: rtl;
            }

            .annotator-modal-buttons {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }

            #${CONFIG.overlayId} {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1001;
            }

            #${CONFIG.overlayId}.show {
                display: block;
            }

            .maqama-content {
                user-select: text;
                -webkit-user-select: text;
                -moz-user-select: text;
                -ms-user-select: text;
                padding-bottom: 80px;
            }

            span.${CONFIG.annotationClass} {
                background-color: #fff3cd;
                border-bottom: 2px solid #ffc107;
                cursor: help;
                position: relative;
                transition: all 0.3s;
            }

            span.${CONFIG.annotationClass}:hover {
                background-color: #ffe69c;
            }

            span.${CONFIG.annotationClass}[data-explain]:hover::after {
                content: attr(data-explain);
                position: absolute;
                bottom: 100%;
                right: 50%;
                transform: translateX(50%);
                background: #2c3e50;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                white-space: nowrap;
                font-size: 14px;
                z-index: 100;
                margin-bottom: 5px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }

            /* Edit button for existing annotations */
            span.${CONFIG.annotationClass}.editable {
                cursor: pointer;
            }

            span.${CONFIG.annotationClass}.editable:hover {
                background-color: #ffd966;
            }
        `;
        document.head.appendChild(style);
    }

    // Attach event listeners
    function attachEventListeners() {
        const container = document.querySelector(CONFIG.containerSelector);
        
        // Text selection
        container.addEventListener('mouseup', handleTextSelection);
        
        // Modal buttons
        document.getElementById('annotator-save').addEventListener('click', saveAnnotation);
        document.getElementById('annotator-cancel').addEventListener('click', closeModal);
        document.getElementById(CONFIG.overlayId).addEventListener('click', closeModal);
        
        // Export button
        document.getElementById(CONFIG.buttonId).addEventListener('click', exportContent);
        
        // Toggle button
        document.getElementById('annotator-toggle').addEventListener('click', toggleAnnotator);
        
        // Enter key in input
        document.getElementById('annotator-explanation').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveAnnotation();
            }
        });
    }

    // Handle text selection
    function handleTextSelection(e) {
        if (!annotatorEnabled) return;

        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        // Ignore if no text selected or if clicking on existing annotation
        if (!selectedText || e.target.classList.contains(CONFIG.annotationClass)) {
            return;
        }

        // Check if selection is within the content area
        const container = document.querySelector(CONFIG.containerSelector);
        if (!container.contains(selection.anchorNode)) {
            return;
        }

        // Store the range
        selectedRange = selection.getRangeAt(0);

        // Show modal
        showModal(selectedText);
    }

    // Show modal
    function showModal(selectedText) {
        const modal = document.getElementById(CONFIG.modalId);
        const overlay = document.getElementById(CONFIG.overlayId);
        const selectedTextEl = modal.querySelector('.annotator-selected-text');
        const input = document.getElementById('annotator-explanation');

        selectedTextEl.textContent = `النص المحدد: ${selectedText}`;
        input.value = '';
        
        modal.classList.add('show');
        overlay.classList.add('show');
        input.focus();
    }

    // Close modal
    function closeModal() {
        const modal = document.getElementById(CONFIG.modalId);
        const overlay = document.getElementById(CONFIG.overlayId);
        
        modal.classList.remove('show');
        overlay.classList.remove('show');
        
        // Clear selection
        window.getSelection().removeAllRanges();
        selectedRange = null;
    }

    // Save annotation
    function saveAnnotation() {
        const explanation = document.getElementById('annotator-explanation').value.trim();
        
        if (!explanation || !selectedRange) {
            alert('الرجاء إدخال الشرح');
            return;
        }

        try {
            // Create the annotation span
            const span = document.createElement('span');
            span.className = CONFIG.annotationClass;
            span.setAttribute('data-explain', explanation);
            
            // Wrap the selected text
            selectedRange.surroundContents(span);
            
            // Make it editable
            makeAnnotationEditable(span);
            
            closeModal();
        } catch (error) {
            alert('حدث خطأ. الرجاء تحديد نص بسيط بدون تنسيق معقد.');
            console.error(error);
        }
    }

    // Make existing annotations editable
    function makeExistingAnnotationsEditable() {
        const annotations = document.querySelectorAll(`span.${CONFIG.annotationClass}`);
        annotations.forEach(makeAnnotationEditable);
    }

    // Make a single annotation editable
    function makeAnnotationEditable(span) {
        span.classList.add('editable');
        span.addEventListener('click', function(e) {
            if (!annotatorEnabled) return;
            e.stopPropagation();
            
            const currentExplanation = this.getAttribute('data-explain');
            const newExplanation = prompt('تعديل الشرح:', currentExplanation);
            
            if (newExplanation !== null && newExplanation.trim() !== '') {
                this.setAttribute('data-explain', newExplanation.trim());
            }
        });
    }

    // Toggle annotator
    function toggleAnnotator() {
        annotatorEnabled = !annotatorEnabled;
        const toggleBtn = document.getElementById('annotator-toggle');
        const status = document.querySelector('.annotator-status');
        
        if (annotatorEnabled) {
            toggleBtn.textContent = 'إيقاف الأداة';
            toggleBtn.classList.remove('disabled');
            status.textContent = 'الأداة مفعلة';
        } else {
            toggleBtn.textContent = 'تفعيل الأداة';
            toggleBtn.classList.add('disabled');
            status.textContent = 'الأداة متوقفة';
        }
    }

    // Export content
    function exportContent() {
        const container = document.querySelector(CONFIG.containerSelector);
        const clonedContent = container.cloneNode(true);
        
        // Convert HTML to markdown-friendly format
        let markdown = clonedContent.innerHTML;
        
        // Clean up and format
        markdown = markdown
            .replace(/<span class="explain" data-explain="([^"]+)">([^<]+)<\/span>/g, 
                     '<span class="explain" data-explain="$1">$2</span>')
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim();
        
        // Create download
        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'maqama-annotated.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Also show in modal for copy-paste
        showExportModal(markdown);
    }

    // Show export modal
    function showExportModal(content) {
        const existingModal = document.getElementById('export-result-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'export-result-modal';
        modal.innerHTML = `
            <div class="annotator-modal-content" style="max-width: 800px; max-height: 80vh;">
                <h3>المحتوى المصدّر</h3>
                <p style="color: #27ae60; margin-bottom: 10px;">✓ تم تنزيل الملف. يمكنك أيضاً نسخ المحتوى من الأسفل:</p>
                <textarea id="export-textarea" readonly style="width: 100%; height: 400px; padding: 10px; 
                          font-family: monospace; font-size: 13px; direction: rtl; border: 1px solid #ddd; 
                          border-radius: 4px;">${content}</textarea>
                <div class="annotator-modal-buttons" style="margin-top: 15px;">
                    <button id="copy-export-btn" class="annotator-btn annotator-primary">نسخ إلى الحافظة</button>
                    <button id="close-export-btn" class="annotator-btn">إغلاق</button>
                </div>
            </div>
        `;
        modal.style.cssText = `
            display: block;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1003;
            direction: rtl;
        `;

        document.body.appendChild(modal);

        // Show overlay
        const overlay = document.getElementById(CONFIG.overlayId);
        overlay.classList.add('show');
        overlay.style.zIndex = '1002';

        // Copy button
        document.getElementById('copy-export-btn').addEventListener('click', function() {
            const textarea = document.getElementById('export-textarea');
            textarea.select();
            document.execCommand('copy');
            this.textContent = '✓ تم النسخ';
            setTimeout(() => {
                this.textContent = 'نسخ إلى الحافظة';
            }, 2000);
        });

        // Close button
        document.getElementById('close-export-btn').addEventListener('click', function() {
            modal.remove();
            overlay.classList.remove('show');
            overlay.style.zIndex = '1001';
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();