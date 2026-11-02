const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024;

export function imageField(id, label, value = '', placeholder = 'https://...') {
    return `<div class="form-group image-field">
        <label for="${id}">${label}</label>
        <input id="${id}" class="form-control" type="url" value="${escapeHtml(value)}" placeholder="${placeholder}">
        <div class="image-upload-row"><label class="image-upload-button" for="${id}-upload"><i class="ph ph-upload-simple"></i> Upload from device</label><input id="${id}-upload" class="image-upload-input" type="file" accept="image/*" data-image-target="${id}"><span class="image-upload-status" aria-live="polite">Or paste an image URL above.</span></div>
    </div>`;
}

document.addEventListener('change', async event => {
    const picker = event.target.closest('[data-image-target]');
    if (!picker) return;
    const file = picker.files?.[0];
    const target = document.getElementById(picker.dataset.imageTarget);
    const status = picker.closest('.image-upload-row')?.querySelector('.image-upload-status');
    if (!file || !target) return;
    if (!file.type.startsWith('image/')) {
        if (status) status.textContent = 'Choose an image file.';
        picker.value = '';
        return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
        if (status) status.textContent = 'Image must be 1.5 MB or smaller.';
        picker.value = '';
        return;
    }
    if (status) status.textContent = 'Reading image…';
    try {
        target.value = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Could not read this image.'));
            reader.readAsDataURL(file);
        });
        if (status) status.textContent = `${file.name} is ready to save.`;
    } catch {
        if (status) status.textContent = 'Could not read this image. Try another file.';
    }
});
