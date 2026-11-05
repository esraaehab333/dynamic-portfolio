import { imageField } from '../shared/image-field.js';

const CATEGORIES = [
    'Languages',
    'Mobile Development',
    'Architecture & Design',
    'Libraries & Frameworks',
    'Backend & APIs',
    'Development Tools'
];

export function getModalForm(item = {}) {
    const selectedCategory = item.category || 'Languages';
    const categoryOptions = CATEGORIES.map(cat =>
        `<option value="${cat}" ${cat === selectedCategory ? 'selected' : ''}>${cat}</option>`
    ).join('');

    return `
        <div class="form-group">
            <label>Skill Name</label>
            <input id="m-name" class="form-control" placeholder="e.g. Kotlin, Jetpack Compose, KMP" value="${item.name||''}">
        </div>
        <div class="form-group">
            <label>Category</label>
            <select id="m-category" class="form-control">
                ${categoryOptions}
            </select>
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
        category: document.getElementById('m-category').value,
        image: document.getElementById('m-image').value,
        icon: document.getElementById('m-icon').value
    };
}
