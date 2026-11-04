export function populateForm(data) {
    document.getElementById('site-logo').value = data.site?.logo || '';
    document.getElementById('site-accent').value = data.site?.accent || '#0055ff';
    document.getElementById('site-secondary').value = data.site?.secondary || '';
    document.getElementById('site-theme').value = data.site?.theme || 'light';
}

export function save(data) {
    if (!data.site) data.site = {};
    data.site.logo = document.getElementById('site-logo').value;
    data.site.accent = document.getElementById('site-accent').value;
    data.site.secondary = document.getElementById('site-secondary').value;
    data.site.theme = document.getElementById('site-theme').value;
}
