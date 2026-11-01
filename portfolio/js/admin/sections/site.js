import { DEFAULT_DATA } from '../defaults.js';

export function populateForm(data) {
    document.getElementById('site-logo').value = data.site?.logo || DEFAULT_DATA.site.logo;
    document.getElementById('site-accent').value = data.site?.accent || DEFAULT_DATA.site.accent;
    document.getElementById('site-secondary').value = data.site?.secondary || '';
    document.getElementById('site-theme').value = data.site?.theme || DEFAULT_DATA.site.theme;
}

export function save(data) {
    if (!data.site) data.site = {};
    data.site.logo = document.getElementById('site-logo').value;
    data.site.accent = document.getElementById('site-accent').value;
    data.site.secondary = document.getElementById('site-secondary').value;
    data.site.theme = document.getElementById('site-theme').value;
}
