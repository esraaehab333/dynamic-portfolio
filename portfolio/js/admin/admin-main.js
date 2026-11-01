import { API_URL } from '../config.js';
import { DEFAULT_DATA } from './defaults.js';
import { initAuth, logout } from './auth.js';
import { setupNav } from './shared/nav.js';
import { showToast } from './shared/toast.js';
import { renderLists, deleteItem } from './shared/collection.js';
import { openModal, closeModal, saveModal } from './shared/modal.js';

import * as siteSection from './sections/site.js';
import * as heroSection from './sections/hero.js';
import * as aboutSection from './sections/about.js';
import * as contactsSection from './sections/contacts.js';

class AdminApp {
    constructor() {
        this.data = null;
        this.editIndex = null;
        this.currentMode = null;
        this._initAuth();
    }

    _initAuth() {
        initAuth(() => this.init());
    }

    logout() {
        logout();
    }

    async init() {
        this.data = await this.loadData();
        setupNav();
        this.populateForms();
        renderLists(this.data);
        this.updateFavicon();
    }

    async loadData() {
        try {
            const res = await fetch(API_URL + '?t=' + Date.now());
            const data = await res.json();
            const cleaned = { ...DEFAULT_DATA, ...data };
            if (data.project && !data.projects) cleaned.projects = data.project;
            if (data.skill && !data.skills) cleaned.skills = data.skill;
            if (data.service && !data.services) cleaned.services = data.service;
            if (data.partner && !data.partners) cleaned.partners = data.partner;
            return cleaned;
        } catch (e) { return DEFAULT_DATA; }
    }

    async saveData() {
        await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.data)
        });
        showToast();
    }

    populateForms() {
        siteSection.populateForm(this.data);
        heroSection.populateForm(this.data);
        aboutSection.populateForm(this.data);
        contactsSection.populateForm(this.data);
    }

    saveSite() {
        siteSection.save(this.data);
        this.saveData();
        this.updateFavicon();
    }

    saveHero() {
        heroSection.save(this.data);
        this.saveData();
    }

    saveAbout() {
        aboutSection.save(this.data);
        this.saveData();
    }

    renderLists() {
        renderLists(this.data);
    }

    deleteItem(col, idx) {
        deleteItem(this, col, idx);
    }

    openModal(mode, idx = null) {
        openModal(this, mode, idx);
    }

    closeModal() {
        closeModal();
    }

    saveModal() {
        saveModal(this, (data) => renderLists(data));
    }

    showToast() {
        showToast();
    }

    updateFavicon() {
        const primary = this.data.site?.accent || '#0055FF';
        let secondary = this.data.site?.secondary || '';

        if (!secondary || secondary === '#000000') {
            const r = parseInt(primary.slice(1, 3), 16);
            const g = parseInt(primary.slice(3, 5), 16);
            const b = parseInt(primary.slice(5, 7), 16);
            const sr = Math.min(255, r + 40);
            const sg = Math.max(0, g - 20);
            const sb = Math.min(255, b + 60);
            secondary = `rgb(${sr}, ${sg}, ${sb})`;
        }

        const svg = `
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#faviconGradient)"/>
                <path d="M42 18H22V46H42V40H28V34H39V30H28V24H42V18Z" fill="white"/>
                <defs>
                    <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="${primary}"/>
                        <stop offset="50%" stop-color="${secondary}"/>
                        <stop offset="100%" stop-color="${primary}"/>
                    </linearGradient>
                </defs>
            </svg>
        `.trim();

        const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/svg+xml';
            document.head.appendChild(link);
        }
        link.href = dataUrl;
    }
}

const adminApp = new AdminApp();
window.adminApp = adminApp;
