export function populateForm(data) {
    const contact = data.contact || {};
    document.getElementById('contact-title').value = contact.title || '';
    document.getElementById('contact-subtitle').value = contact.subtitle || '';
    const availabilityInput = document.getElementById('contact-availability');
    if (availabilityInput) availabilityInput.value = contact.availability || '';
    const responseInput = document.getElementById('contact-response');
    if (responseInput) responseInput.value = contact.response || '';
    const subjectInput = document.getElementById('contact-email-subject');
    if (subjectInput) subjectInput.value = contact.emailSubject || '';
    const bodyInput = document.getElementById('contact-email-body');
    if (bodyInput) bodyInput.value = contact.emailBody || '';
}

export function save(data) {
    if (!data.contact) data.contact = {};
    data.contact.title = document.getElementById('contact-title').value;
    data.contact.subtitle = document.getElementById('contact-subtitle').value;
    const availabilityInput = document.getElementById('contact-availability');
    if (availabilityInput) data.contact.availability = availabilityInput.value;
    const responseInput = document.getElementById('contact-response');
    if (responseInput) data.contact.response = responseInput.value;
    const subjectInput = document.getElementById('contact-email-subject');
    if (subjectInput) data.contact.emailSubject = subjectInput.value;
    const bodyInput = document.getElementById('contact-email-body');
    if (bodyInput) data.contact.emailBody = bodyInput.value;
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
