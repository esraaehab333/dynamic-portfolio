import { getProjectFields, buildProjectFields } from './project-fields.js';
import { imageField } from '../shared/image-field.js';
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function getModalForm(item = {}) {
    return `
        <div class="form-group"><label>Title</label><input id="m-title" class="form-control" value="${esc(item.title)}"></div>
        <div class="form-group"><label>Subtitle / Description</label><input id="m-subtitle" class="form-control" value="${esc(item.subtitle)}"></div>
        <div class="form-group"><label>Project Details</label><textarea id="m-description" class="form-control" rows="5" placeholder="Detailed project overview for the project page">${esc(item.desc || item.description)}</textarea></div>
        <div class="form-group"><label>Tag (e.g. Kotlin | Compose)</label><input id="m-tag" class="form-control" value="${esc(item.tag)}"></div>
        ${imageField('m-image', 'Project image', item.image)}
        <div class="form-group"><label>Live Demo URL</label><input id="m-demo" class="form-control" value="${esc(item.demo)}"></div>
        <div class="form-group"><label>GitHub URL</label><input id="m-github" class="form-control" value="${esc(item.github)}"></div>
        <div class="form-group"><label>LinkedIn URL</label><input id="m-linkedin" class="form-control" value="${esc(item.linkedin)}"></div>
        <div class="form-group"><label>Video URL</label><input id="m-video" class="form-control" value="${esc(item.video)}"></div>
        ${getProjectFields(item)}
    `;
}

export function buildItem(base = {}) {
    return {
        ...base,
        title: document.getElementById('m-title').value,
        subtitle: document.getElementById('m-subtitle').value,
        description: document.getElementById('m-description').value,
        desc: document.getElementById('m-description').value,
        tag: document.getElementById('m-tag').value,
        image: document.getElementById('m-image').value,
        demo: document.getElementById('m-demo').value,
        github: document.getElementById('m-github').value,
        linkedin: document.getElementById('m-linkedin').value,
        video: document.getElementById('m-video').value,
        ...buildProjectFields()
    };
}
