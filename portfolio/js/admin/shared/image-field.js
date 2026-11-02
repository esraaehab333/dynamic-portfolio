const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const MAX_COMPRESSED_SIZE = 400 * 1024;
const MAX_GIF_SIZE = 300 * 1024;

function formatImageSize(bytes) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function readImage(file) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const source = URL.createObjectURL(file);
        image.onload = () => {
            URL.revokeObjectURL(source);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(source);
            reject(new Error('Could not read this image.'));
        };
        image.src = source;
    });
}

async function compressImage(file, maxSide) {
    const image = await readImage(file);
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image compression is not available in this browser.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.82));
    if (!blob || blob.type !== 'image/webp') throw new Error('Could not compress this image. Try another file.');
    return blob;
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read this image.'));
        reader.readAsDataURL(blob);
    });
}

export async function compressImageFile(file, { maxSide = 1400, preserveGif = true } = {}) {
    const isGif = file.type === 'image/gif';
    if (isGif && preserveGif && file.size > MAX_GIF_SIZE) {
        throw new Error('GIF must be 300 KB or smaller.');
    }
    const blob = isGif && preserveGif ? file : await compressImage(file, maxSide);
    if (blob.size > MAX_COMPRESSED_SIZE) {
        throw new Error('Image is too big even after compression. Use a link instead.');
    }
    return { dataUrl: await blobToDataUrl(blob), size: blob.size };
}

function showUploadedPreview(row, dataUrl, size) {
    let preview = row.querySelector('.image-upload-preview');
    if (!preview) {
        preview = document.createElement('div');
        preview.className = 'image-upload-preview';
        preview.innerHTML = '<img alt="Uploaded image preview"><span class="image-upload-size"></span>';
        row.append(preview);
    }
    preview.querySelector('img').src = dataUrl;
    preview.querySelector('.image-upload-size').textContent = formatImageSize(size);
    preview.hidden = false;
}

export function imageField(id, label, value = '', placeholder = 'https://...', options = {}) {
    const size = embeddedImageSize(value);
    const warn = options.warnLargePng && /^data:image\/png[;,]/i.test(String(value)) && size > 150 * 1024;
    return `<div class="form-group image-field">
        <label for="${id}">${label}</label>
        <input id="${id}" class="form-control" type="url" value="${escapeHtml(value)}" placeholder="${placeholder}">
        ${options.warnLargePng ? `<small class="project-image-warning" ${warn ? '' : 'hidden'}>This image is large. Choose it again to compress it.</small>` : ''}
        <div class="image-upload-row"><label class="image-upload-button" for="${id}-upload"><i class="ph ph-upload-simple"></i> Upload from device</label><input id="${id}-upload" class="image-upload-input" type="file" accept="image/*" data-image-target="${id}" data-image-kind="${/logo|icon/i.test(label) ? 'small' : 'large'}"><span class="image-upload-status" aria-live="polite">Or paste an image URL above.</span></div>
    </div>`;
}

function embeddedImageSize(value) {
    const match = String(value || '').match(/^data:[^,]*;base64,(.*)$/);
    if (!match) return null;
    const source = match[1];
    const padding = source.endsWith('==') ? 2 : source.endsWith('=') ? 1 : 0;
    return Math.floor(source.length * 3 / 4) - padding;
}

document.addEventListener('change', async event => {
    const picker = event.target.closest('[data-image-target]');
    if (!picker) return;
    const file = picker.files?.[0];
    const target = document.getElementById(picker.dataset.imageTarget);
    const row = picker.closest('.image-upload-row');
    const status = row?.querySelector('.image-upload-status');
    if (!file || !target) return;
    if (!file.type.startsWith('image/')) {
        if (status) status.textContent = 'Choose an image file.';
        picker.value = '';
        return;
    }
    if (file.type === 'image/gif' && file.size > MAX_GIF_SIZE) {
        if (status) status.textContent = 'GIF must be 300 KB or smaller.';
        picker.value = '';
        return;
    }
    if (status) status.textContent = file.type === 'image/gif' ? 'Reading GIF…' : 'Compressing image…';
    try {
        const { dataUrl, size } = await compressImageFile(file, { maxSide: picker.dataset.imageKind === 'small' ? 800 : 1400 });
        target.value = dataUrl;
        showUploadedPreview(row, dataUrl, size);
        if (status) status.textContent = `${file.name} is ready to save.`;
        target.closest('.image-field')?.querySelector('.project-image-warning')?.setAttribute('hidden', '');
        window.ProjectFields?.imageChanged?.();
    } catch (error) {
        if (status) status.textContent = error.message || 'Could not read this image. Try another file.';
    }
});

document.addEventListener('input', event => {
    if (!event.target.matches('.image-field input[type="url"]')) return;
    const warning = event.target.closest('.image-field')?.querySelector('.project-image-warning');
    if (!warning) return;
    const size = embeddedImageSize(event.target.value);
    const warn = /^data:image\/png[;,]/i.test(event.target.value) && size > 150 * 1024;
    warning.hidden = !warn;
    window.ProjectFields?.imageChanged?.();
});
