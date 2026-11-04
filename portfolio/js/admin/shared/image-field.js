import { API_URL } from '../../config.js';
import { getAdminToken, logout } from '../auth.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const MAX_GIF_SIZE = 300 * 1024;

function formatImageSize(bytes) {
    if (!bytes) return '';
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

export async function uploadImageFile(file, { maxSide = 1400, preserveGif = true } = {}) {
    const isGif = file.type === 'image/gif';
    if (isGif && preserveGif && file.size > MAX_GIF_SIZE) {
        throw new Error('GIF must be 300 KB or smaller.');
    }
    const blob = isGif && preserveGif ? file : await compressImage(file, maxSide);

    const token = getAdminToken();
    if (!token) {
        logout('Session expired');
        throw new Error('Please log in to upload images.');
    }

    const formData = new FormData();
    const fileName = (file.name || 'image').replace(/\.[^.]+$/, '') + (isGif && preserveGif ? '.gif' : '.webp');
    formData.append('file', blob, fileName);

    const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (res.status === 401) {
        logout('Session expired');
        throw new Error('Session expired');
    }

    if (!res.ok) {
        let errMessage = 'Image upload failed';
        try {
            const errJson = await res.json();
            if (errJson.error) errMessage = errJson.error;
        } catch {}
        throw new Error(errMessage);
    }

    const data = await res.json();
    return { url: data.url, size: data.size || blob.size, dataUrl: data.url };
}

export async function compressImageFile(file, options = {}) {
    return uploadImageFile(file, options);
}

function showUploadedPreview(row, url, size) {
    let preview = row.querySelector('.image-upload-preview');
    if (!preview) {
        preview = document.createElement('div');
        preview.className = 'image-upload-preview';
        preview.innerHTML = '<img alt="Uploaded image preview"><span class="image-upload-size"></span>';
        row.append(preview);
    }
    preview.querySelector('img').src = url;
    preview.querySelector('.image-upload-size').textContent = formatImageSize(size);
    preview.hidden = false;
}

export function imageField(id, label, value = '', placeholder = 'https://...', options = {}) {
    return `<div class="form-group image-field">
        <label for="${id}">${label}</label>
        <input id="${id}" class="form-control" type="url" value="${escapeHtml(value)}" placeholder="${placeholder}">
        <div class="image-upload-row"><label class="image-upload-button" for="${id}-upload"><i class="ph ph-upload-simple"></i> Upload from device</label><input id="${id}-upload" class="image-upload-input" type="file" accept="image/*" data-image-target="${id}" data-image-kind="${/logo|icon/i.test(label) ? 'small' : 'large'}"><span class="image-upload-status" aria-live="polite">Or paste an image URL above.</span></div>
    </div>`;
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
    if (status) status.textContent = 'Uploading image…';
    try {
        const { url, size } = await uploadImageFile(file, { maxSide: picker.dataset.imageKind === 'small' ? 800 : 1400 });
        target.value = url;
        showUploadedPreview(row, url, size);
        if (status) status.textContent = `${file.name} uploaded successfully.`;
        window.ProjectFields?.imageChanged?.();
    } catch (error) {
        if (status) status.textContent = error.message || 'Could not upload this image. Try again.';
    }
});
