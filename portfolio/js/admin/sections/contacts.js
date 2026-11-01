export function populateForm(data) {
    document.getElementById('contact-title').value = data.contact?.title || '';
    document.getElementById('contact-subtitle').value = data.contact?.subtitle || '';
}

export function save(data) {
    if (!data.contact) data.contact = {};
    data.contact.title = document.getElementById('contact-title').value;
    data.contact.subtitle = document.getElementById('contact-subtitle').value;
}

export function getModalForm(item = {}) {
    return `<div class="form-group"><label>Icon</label><input id="m-icon" class="form-control" value="${item.icon||''}"></div><div class="form-group"><label>Label</label><input id="m-label" class="form-control" value="${item.label||''}"></div><div class="form-group"><label>Value</label><input id="m-value" class="form-control" value="${item.value||''}"></div><div class="form-group"><label>Link</label><input id="m-url" class="form-control" value="${item.url||''}"></div>`;
}

export function buildItem(base = {}) {
    return {
        ...base,
        icon: document.getElementById('m-icon').value,
        label: document.getElementById('m-label').value,
        value: document.getElementById('m-value').value,
        url: document.getElementById('m-url').value
    };
}
