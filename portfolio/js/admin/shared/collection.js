const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function renderLists(data) {
    const collections = ['projects', 'services', 'experience', 'skills', 'education', 'certifications', 'contacts', 'socials'];
    collections.forEach(col => {
        const container = document.getElementById(col + '-list');
        if (!container) return;
        container.innerHTML = (data[col] || []).map((item, idx) => {
            const rawLabel = item.title || item.name || item.author || item.label || ('Item ' + (idx + 1));
            const safeLabel = escapeHtml(rawLabel);
            const safeCat = item.category ? escapeHtml(item.category) : '';
            return `
            <div class="${col === 'projects' ? 'project-admin-item' : ''}">
                <div class="list-item">
                    <span style="font-weight: 700;">${safeLabel} ${safeCat ? `<small style="color:var(--admin-text-muted); font-weight:400; margin-left:8px;">(${safeCat})</small>` : ''}</span>
                    <div>
                        <button class="btn-icon" onclick="adminApp.openModal('${col}', ${idx})" style="background:none; border:none; cursor:pointer; color:#0055FF; margin-right:1rem;"><i class="ph ph-pencil-simple" style="font-size:1.5rem;"></i></button>
                        <button class="btn-icon" onclick="adminApp.deleteItem('${col}', ${idx})" style="background:none; border:none; cursor:pointer; color:#ef4444;"><i class="ph ph-trash" style="font-size:1.5rem;"></i></button>
                    </div>
                </div>
                <div class="inline-editor" id="${col}-inline-${idx}" hidden></div>
            </div>
            `;
        }).join('') + `<div class="inline-editor" id="${col}-new-editor" hidden></div>`;
    });
}

export function deleteItem(app, col, idx) {
    if (confirm('Delete?')) {
        app.data[col].splice(idx, 1);
        renderLists(app.data);
        app.saveData();
    }
}
