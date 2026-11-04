import { API_URL } from '../config.js';
import { DEFAULT_DATA } from './defaults.js';

const CACHE_KEY = 'portfolio_cache_v1';
const MAX_CACHE_SIZE = 2.5 * 1024 * 1024; // 2.5 MB

function processLoadedData(data) {
    if (!data || typeof data !== 'object') return DEFAULT_DATA;
    const merged = { ...data };

    // Merge scalar text placeholders only if top-level fields are missing/empty
    merged.site = { ...DEFAULT_DATA.site, ...(data.site || {}) };
    merged.hero = { ...DEFAULT_DATA.hero, ...(data.hero || {}) };
    merged.about = { ...DEFAULT_DATA.about, ...(data.about || {}) };
    merged.contact = { ...DEFAULT_DATA.contact, ...(data.contact || {}) };

    // Arrays present in data win completely (do not let defaults resurrect deleted content)
    merged.projects = Array.isArray(data.projects) ? data.projects : (Array.isArray(data.project) ? data.project : []);
    merged.skills = Array.isArray(data.skills) ? data.skills : (Array.isArray(data.skill) ? data.skill : []);
    merged.services = Array.isArray(data.services) ? data.services : (Array.isArray(data.service) ? data.service : []);
    merged.partners = Array.isArray(data.partners) ? data.partners : (Array.isArray(data.partner) ? data.partner : []);
    merged.experience = Array.isArray(data.experience) ? data.experience : [];
    merged.education = Array.isArray(data.education) ? data.education : [];
    merged.certifications = Array.isArray(data.certifications) ? data.certifications : [];
    merged.contacts = Array.isArray(data.contacts) ? data.contacts : [];
    merged.socials = Array.isArray(data.socials) ? data.socials : [];
    merged.testimonials = Array.isArray(data.testimonials) ? data.testimonials : [];

    merged.sectionsVisibility = data.sectionsVisibility || data.site?.sectionVisibility || DEFAULT_DATA.sectionsVisibility;
    merged.sectionsOrder = (Array.isArray(data.sectionsOrder) && data.sectionsOrder.length)
        ? data.sectionsOrder
        : (Array.isArray(data.site?.sectionOrder) && data.site.sectionOrder.length)
            ? data.site.sectionOrder
            : DEFAULT_DATA.sectionsOrder;

    return merged;
}

export async function loadData() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
        const res = await fetch(API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`Portfolio API failed: ${res.status}`);
        const data = await res.json();

        // Save to cache if size <= 2.5 MB
        try {
            const str = JSON.stringify(data);
            if (str.length <= MAX_CACHE_SIZE) {
                localStorage.setItem(CACHE_KEY, str);
            }
        } catch (e) {
            console.warn('Could not save portfolio data to localStorage cache:', e);
        }

        return processLoadedData(data);
    } catch (e) {
        clearTimeout(timeoutId);
        console.warn('API request failed or timed out. Checking cache…', e);

        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                return processLoadedData(parsed);
            }
        } catch (cacheErr) {
            console.warn('Failed to parse cached portfolio data:', cacheErr);
        }

        throw new Error('FAILED_TO_LOAD_PORTFOLIO_DATA');
    }
}

export async function saveData(data) {
    if (data && typeof data === 'object') {
        data.schemaVersion = 2;
    }
    await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}
