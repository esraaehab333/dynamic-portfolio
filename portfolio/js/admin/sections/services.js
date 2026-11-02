export function getModalForm(item = {}) {
    return `
        <div class="form-group"><label>Title</label><input id="m-title" class="form-control" value="${item.title || ''}"></div>
        <div class="form-group"><label>Subtitle / Description</label><textarea id="m-subtitle" class="form-control" rows="3">${item.subtitle || item.desc || ''}</textarea></div>
        <div class="form-group"><label>Icon (ph-* e.g. ph-android-logo, ph-layout, ph-lightning)</label><input id="m-icon" class="form-control" value="${item.icon || ''}" placeholder="ph-sparkle"></div>
        <div class="form-group"><label>Image URL (Optional side image instead of icon)</label><input id="m-image" class="form-control" value="${item.image || ''}" placeholder="https://..."></div>
    `;
}

export function buildItem(base = {}) {
    return {
        ...base,
        title: document.getElementById('m-title').value,
        subtitle: document.getElementById('m-subtitle').value,
        icon: document.getElementById('m-icon').value,
        image: document.getElementById('m-image').value
    };
}
