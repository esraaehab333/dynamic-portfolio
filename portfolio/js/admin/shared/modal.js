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

let activeInlineEditor = null;

function openInlineEditor(app, mode, item, idx) {
    document.querySelectorAll('.inline-editor').forEach(editor => {
        editor.hidden = true;
        editor.replaceChildren();
    });
    const editor = document.getElementById(idx === null ? `${mode}-new-editor` : `${mode}-inline-${idx}`);
    if (!editor) return;
    const form = sectionModules[mode]?.getModalForm(item) || '';
    const label = mode.charAt(0).toUpperCase() + mode.slice(1);
    editor.innerHTML = `<div class="inline-editor-heading"><h3>${idx === null ? `Add ${label}` : `Edit ${label}`}</h3><p>Update the details below, then save when you are done.</p></div>${form}<div class="inline-editor-actions"><button type="button" class="btn-save" onclick="adminApp.saveModal()">Save ${label}</button><button type="button" class="inline-editor-cancel" onclick="adminApp.closeModal()">Cancel</button></div>`;
    editor.hidden = false;
    activeInlineEditor = editor;
    editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function openModal(app, mode, idx = null) {
    closeModal();
    app.currentMode = mode;
    app.editIndex = idx;
    const item = idx !== null ? app.data[mode][idx] : {};
    const mod = sectionModules[mode];
    if (mod) openInlineEditor(app, mode, item, idx);
}

export function closeModal() {
    if (activeInlineEditor) {
        activeInlineEditor.hidden = true;
        activeInlineEditor.replaceChildren();
        activeInlineEditor = null;
    }
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
