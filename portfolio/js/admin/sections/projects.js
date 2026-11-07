import { buildProjectFields, chipsField, currentChipValue, projectEditorTabs } from './project-fields.js';
import { imageField } from '../shared/image-field.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const input = (id, label, value, placeholder = '', type = 'text') => `<div class="form-group"><label for="${id}">${label}</label><input id="${id}" class="form-control" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}"></div>`;

export function getModalForm(item = {}) {
    window.ProjectFields.startEditor();
    const id = item.id ?? window.adminApp?.editIndex;
    const previewHref = id == null ? 'index.html#projects' : `index.html#/project/${encodeURIComponent(id)}`;
    const basics = `<div class="project-basics-grid">
        ${input('m-title', 'Title', item.title, 'e.g. Meal Planner')}
        ${input('m-subtitle', 'Subtitle / description', item.subtitle || item.desc || item.description, 'e.g. Plan meals and shopping in one place')}
        ${imageField('m-image', 'Cover', item.image, 'https://...', { warnLargePng: true })}
        ${chipsField('tags', 'Tags', item.tag)}
        ${input('m-video', 'Video URL', item.video, 'https://youtu.be/...')}
        ${input('m-github', 'GitHub URL', item.github, 'https://github.com/...')}
        ${input('m-playstore', 'Google Play URL', item.playstore, 'https://play.google.com/...')}
    </div>
    <details class="project-collapsible"><summary>More links</summary>
        ${input('m-appstore', 'App Store URL', item.appstore, 'https://apps.apple.com/...')}
        ${input('m-apk', 'APK URL', item.apk, 'https://.../app.apk')}
        ${input('m-demo', 'Live Demo URL', item.demo, 'https://...')}
    </details>`;
    return `<div class="project-editor-top"><a class="project-preview-link" href="${previewHref}" target="_blank" rel="noopener noreferrer">Preview ↗</a></div>${projectEditorTabs(item, basics)}`;
}

export function buildItem(base = {}) {
    const app = window.adminApp;
    const existing = app?.editIndex == null ? {} : app?.data?.projects?.[app.editIndex] || {};
    const subtitle = document.getElementById('m-subtitle').value;
    const tagField = document.querySelector('[data-chip-field="tags"]');
    const result = {
        ...existing,
        ...base,
        title: document.getElementById('m-title').value,
        subtitle,
        ...buildProjectFields()
    };
    const optionalFields = {
        tag: currentChipValue(tagField, existing.tag),
        image: document.getElementById('m-image').value,
        video: document.getElementById('m-video').value,
        github: document.getElementById('m-github').value,
        playstore: document.getElementById('m-playstore').value,
        appstore: document.getElementById('m-appstore').value,
        apk: document.getElementById('m-apk').value,
        demo: document.getElementById('m-demo').value
    };
    for (const [key, value] of Object.entries(optionalFields)) {
        if (Object.hasOwn(existing, key) || String(value ?? '').trim()) result[key] = value;
    }
    return result;
}
