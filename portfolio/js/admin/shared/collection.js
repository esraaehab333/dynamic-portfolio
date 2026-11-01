export function renderLists(data) {
    const collections = ['projects', 'experience', 'process', 'skills', 'education', 'certifications', 'contacts', 'socials'];
    collections.forEach(col => {
        const container = document.getElementById(col + '-list');
        if (!container) return;
        container.innerHTML = (data[col] || []).map((item, idx) => `
            <div class="list-item">
                <span style="font-weight: 700;">${item.title || item.name || item.author || item.label || 'Item ' + (idx+1)} ${item.category ? `<small style="color:var(--admin-text-muted); font-weight:400; margin-left:8px;">(${item.category})</small>` : ''}</span>
                <div>
                    <button class="btn-icon" onclick="adminApp.openModal('${col}', ${idx})" style="background:none; border:none; cursor:pointer; color:#0055FF; margin-right:1rem;"><i class="ph ph-pencil-simple" style="font-size:1.5rem;"></i></button>
                    <button class="btn-icon" onclick="adminApp.deleteItem('${col}', ${idx})" style="background:none; border:none; cursor:pointer; color:#ef4444;"><i class="ph ph-trash" style="font-size:1.5rem;"></i></button>
                </div>
            </div>
        `).join('');
    });
}

export function deleteItem(app, col, idx) {
    if (confirm('Delete?')) {
        app.data[col].splice(idx, 1);
        renderLists(app.data);
        app.saveData();
    }
}
