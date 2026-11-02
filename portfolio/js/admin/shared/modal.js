import * as projectsSection from '../sections/projects.js';
import * as servicesSection from '../sections/services.js';
import * as experienceSection from '../sections/experience.js';
import * as skillsSection from '../sections/skills.js';
import * as educationSection from '../sections/education.js';
import * as certificationsSection from '../sections/certifications.js';
import * as contactsSection from '../sections/contacts.js';

const sectionModules = {
    projects: projectsSection,
    services: servicesSection,
    experience: experienceSection,
    skills: skillsSection,
    education: educationSection,
    certifications: certificationsSection,
    contacts: contactsSection,
    socials: {
        getModalForm: (item = {}) => `<div class="form-group"><label>Name (e.g. GitHub)</label><input id="m-name" class="form-control" value="${item.name||''}"></div><div class="form-group"><label>Icon (ph-*)</label><input id="m-icon" class="form-control" value="${item.icon||''}"></div><div class="form-group"><label>Link</label><input id="m-url" class="form-control" value="${item.url||''}"></div>`,
        buildItem: (base = {}) => ({ ...base, name: document.getElementById('m-name').value, icon: document.getElementById('m-icon').value, url: document.getElementById('m-url').value })
    },
    partners: {
        getModalForm: (item = {}) => `<div class="form-group"><label>Logo URL</label><input id="m-logo" class="form-control" value="${item.logo||''}"></div>`,
        buildItem: (base = {}) => ({ ...base, logo: document.getElementById('m-logo').value })
    }
};

let activeProjectEditor = null;

function openProjectEditor(app, item, idx) {
    document.querySelectorAll('.project-inline-editor').forEach(editor => {
        editor.hidden = true;
        editor.replaceChildren();
    });
    const editor = idx === null
        ? document.getElementById('project-new-editor')
        : document.getElementById(`project-inline-${idx}`);
    if (!editor) return;
    const form = sectionModules.projects.getModalForm(item);
    editor.innerHTML = `<div class="project-inline-heading"><h3>${idx === null ? 'Add project' : 'Edit project'}</h3><p>Expand the project details below, then save when you are done.</p></div>${form}<div class="project-inline-actions"><button type="button" class="btn-save" onclick="adminApp.saveModal()">Save Project</button><button type="button" class="project-inline-cancel" onclick="adminApp.closeModal()">Cancel</button></div>`;
    editor.hidden = false;
    activeProjectEditor = editor;
    editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function openModal(app, mode, idx = null) {
    if (mode !== 'projects' && activeProjectEditor) closeModal();
    app.currentMode = mode;
    app.editIndex = idx;
    const item = idx !== null ? app.data[mode][idx] : {};
    const mod = sectionModules[mode];
    if (mode === 'projects') {
        openProjectEditor(app, item, idx);
        return;
    }
    const html = mod ? mod.getModalForm(item) : '';
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('generic-modal').classList.add('active');
}

export function closeModal() {
    if (activeProjectEditor) {
        activeProjectEditor.hidden = true;
        activeProjectEditor.replaceChildren();
        activeProjectEditor = null;
    }
    document.getElementById('generic-modal').classList.remove('active');
}

export function saveModal(app, renderLists) {
    const mode = app.currentMode;
    const existingItem = app.editIndex !== null && app.data[mode][app.editIndex] ? app.data[mode][app.editIndex] : null;
    const base = { id: existingItem ? (existingItem.id ?? (mode === 'projects' ? app.editIndex : Date.now())) : Date.now() };
    const mod = sectionModules[mode];
    const newItem = mod ? mod.buildItem(base) : base;

    if (app.editIndex !== null) {
        app.data[mode][app.editIndex] = newItem;
    } else {
        if (!app.data[mode]) app.data[mode] = [];
        app.data[mode].push(newItem);
    }
    closeModal();
    renderLists(app.data);
    app.saveData();
}
