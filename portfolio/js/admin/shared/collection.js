const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

let activeTouchDrag = null;

export function renderLists(data) {
    const collections = ['projects', 'services', 'experience', 'skills', 'education', 'certifications', 'contacts', 'socials'];
    collections.forEach(col => {
        const container = document.getElementById(col + '-list');
        if (!container) return;
        const total = (data[col] || []).length;
        container.innerHTML = (data[col] || []).map((item, idx) => {
            const rawLabel = item.title || item.name || item.author || item.label || ('Item ' + (idx + 1));
            const safeLabel = escapeHtml(rawLabel);
            const safeCat = item.category ? escapeHtml(item.category) : '';
            return `
            <div class="${col === 'projects' ? 'project-admin-item' : ''} list-item-reorderable" draggable="true" data-col="${col}" data-index="${idx}">
                <div class="list-item">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span class="reorder-drag-handle" title="Long press or drag to reorder" style="cursor: grab; color: var(--admin-text-muted); font-size: 1.3rem; display: flex; align-items: center;"><i class="ph ph-dots-six-vertical"></i></span>
                        <span style="font-weight: 700;">${safeLabel} ${safeCat ? `<small style="color:var(--admin-text-muted); font-weight:400; margin-left:8px;">(${safeCat})</small>` : ''}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <button type="button" class="btn-move" title="Move Up" ${idx === 0 ? 'disabled' : ''} onclick="adminApp.moveItem('${col}', ${idx}, ${idx - 1})"><i class="ph ph-arrow-up"></i></button>
                        <button type="button" class="btn-move" title="Move Down" ${idx === total - 1 ? 'disabled' : ''} onclick="adminApp.moveItem('${col}', ${idx}, ${idx + 1})"><i class="ph ph-arrow-down"></i></button>
                        <button class="btn-icon" onclick="adminApp.openModal('${col}', ${idx})" style="background:none; border:none; cursor:pointer; color:#0055FF; margin-left:0.5rem; margin-right:0.5rem;"><i class="ph ph-pencil-simple" style="font-size:1.5rem;"></i></button>
                        <button class="btn-icon" onclick="adminApp.deleteItem('${col}', ${idx})" style="background:none; border:none; cursor:pointer; color:#ef4444;"><i class="ph ph-trash" style="font-size:1.5rem;"></i></button>
                    </div>
                </div>
                <div class="inline-editor" id="${col}-inline-${idx}" hidden></div>
            </div>
            `;
        }).join('') + `<div class="inline-editor" id="${col}-new-editor" hidden></div>`;
    });

    setupCollectionDragAndDrop();
}

function setupCollectionDragAndDrop() {
    const items = document.querySelectorAll('.list-item-reorderable');
    items.forEach(item => {
        // Desktop HTML5 drag events
        item.addEventListener('dragstart', (e) => {
            if (e.target.closest('button, input, textarea, a, select')) {
                e.preventDefault();
                return;
            }
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', JSON.stringify({
                col: item.dataset.col,
                index: parseInt(item.dataset.index, 10)
            }));
        });

        item.addEventListener('dragend', () => {
            items.forEach(el => el.classList.remove('dragging', 'drag-over', 'long-pressing'));
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const draggingEl = document.querySelector('.list-item-reorderable.dragging');
            if (draggingEl && draggingEl !== item && draggingEl.dataset.col === item.dataset.col) {
                item.classList.add('drag-over');
            }
        });

        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            try {
                const payload = JSON.parse(e.dataTransfer.getData('text/plain'));
                const fromIdx = payload.index;
                const toIdx = parseInt(item.dataset.index, 10);
                const col = item.dataset.col;
                if (col === payload.col && fromIdx !== toIdx && !isNaN(fromIdx) && !isNaN(toIdx)) {
                    window.adminApp?.moveItem(col, fromIdx, toIdx);
                }
            } catch (err) {
                console.error('Reorder drop error:', err);
            }
        });

        // Long Press Touch Support
        item.addEventListener('touchstart', (e) => handleTouchStart(e, item), { passive: false });
    });
}

function handleTouchStart(e, item) {
    if (e.target.closest('button, input, textarea, a, select')) return;

    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const col = item.dataset.col;
    const fromIdx = parseInt(item.dataset.index, 10);

    let isLongPress = false;
    let targetIdx = null;

    const timer = setTimeout(() => {
        isLongPress = true;
        if (navigator.vibrate) navigator.vibrate(50);
        item.classList.add('long-pressing');
        activeTouchDrag = { item, col, fromIdx };
    }, 400);

    const onTouchMove = (moveEvt) => {
        const t = moveEvt.touches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        if (!isLongPress) {
            if (Math.hypot(dx, dy) > 10) {
                clearTimeout(timer);
            }
            return;
        }

        moveEvt.preventDefault();

        const elem = document.elementFromPoint(t.clientX, t.clientY);
        const targetCard = elem?.closest('.list-item-reorderable');

        document.querySelectorAll(`.list-item-reorderable[data-col="${col}"]`).forEach(el => el.classList.remove('drag-over'));

        if (targetCard && targetCard !== item && targetCard.dataset.col === col) {
            targetCard.classList.add('drag-over');
            targetIdx = parseInt(targetCard.dataset.index, 10);
        } else {
            targetIdx = null;
        }
    };

    const onTouchEnd = () => {
        clearTimeout(timer);
        if (isLongPress) {
            item.classList.remove('long-pressing');
            document.querySelectorAll(`.list-item-reorderable[data-col="${col}"]`).forEach(el => el.classList.remove('drag-over'));
            activeTouchDrag = null;
            if (targetIdx !== null && targetIdx !== fromIdx && !isNaN(targetIdx)) {
                window.adminApp?.moveItem(col, fromIdx, targetIdx);
            }
        }
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('touchcancel', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
}

export function deleteItem(app, col, idx) {
    if (confirm('Delete?')) {
        app.data[col].splice(idx, 1);
        renderLists(app.data);
        app.saveData();
    }
}
