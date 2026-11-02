import { imageField } from '../shared/image-field.js';

export function getModalForm(item = {}) {
    return `
        <div class="form-group">
            <label>Skill Name</label>
            <input id="m-name" class="form-control" placeholder="e.g. Kotlin, Android Studio, Git" value="${item.name||''}">
        </div>
        ${imageField('m-image', 'Image / logo', item.image, 'https://cdn.jsdelivr.net/...')}
        <div class="form-group">
            <label>Icon Class (fallback if no image URL)</label>
            <input id="m-icon" class="form-control" placeholder="ph-code" value="${item.icon||''}">
        </div>
    `;
}

export function buildItem(base = {}) {
    return {
        ...base,
        name: document.getElementById('m-name').value,
        image: document.getElementById('m-image').value,
        icon: document.getElementById('m-icon').value
    };
}
