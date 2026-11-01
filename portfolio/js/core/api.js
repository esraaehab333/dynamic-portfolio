import { API_URL } from '../config.js';
import { DEFAULT_DATA } from './defaults.js';

export async function loadData() {
    try {
        const res = await fetch(API_URL + '?t=' + Date.now());
        const data = await res.json();

        // Deep merge essential sections to preserve defaults if partially missing in API
        const merged = {
            ...DEFAULT_DATA,
            ...data,
            site: { ...DEFAULT_DATA.site, ...(data.site || {}) },
            hero: { ...DEFAULT_DATA.hero, ...(data.hero || {}) },
            about: { ...DEFAULT_DATA.about, ...(data.about || {}) },
            contact: { ...DEFAULT_DATA.contact, ...(data.contact || {}) }
        };

        // Migration logic for singular/plural keys
        if (data.project && !data.projects) merged.projects = data.project;
        if (data.skill && !data.skills) merged.skills = data.skill;
        if (data.service && !data.services) merged.services = data.service;
        if (data.partner && !data.partners) merged.partners = data.partner;

        return merged;
    } catch (e) {
        console.warn("Using defaults due to fetch error:", e);
        return DEFAULT_DATA;
    }
}

export async function saveData(data) {
    await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}
