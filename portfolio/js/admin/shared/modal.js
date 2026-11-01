import * as projectsSection from '../sections/projects.js';
import * as experienceSection from '../sections/experience.js';
import * as skillsSection from '../sections/skills.js';
import * as processSection from '../sections/process.js';
import * as educationSection from '../sections/education.js';
import * as certificationsSection from '../sections/certifications.js';
import * as contactsSection from '../sections/contacts.js';

const sectionModules = {
    projects: projectsSection,
    experience: experienceSection,
    skills: skillsSection,
    process: processSection,
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

export function openModal(app, mode, idx = null) {
    app.currentMode = mode;
    app.editIndex = idx;
    const item = idx !== null ? app.data[mode][idx] : {};
    const mod = sectionModules[mode];
    const html = mod ? mod.getModalForm(item) : '';
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('generic-modal').classList.add('active');
}

export function closeModal() {
    document.getElementById('generic-modal').classList.remove('active');
}

export function saveModal(app, renderLists) {
    const mode = app.currentMode;
    const base = { id: (app.editIndex !== null && app.data[mode][app.editIndex]) ? app.data[mode][app.editIndex].id : Date.now() };
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
