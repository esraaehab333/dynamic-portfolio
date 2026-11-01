export function getModalForm(item = {}) {
    return `
        <div class="form-group"><label>Certification Name</label><input id="m-title" class="form-control" value="${item.title||''}"></div>
        <div class="form-group"><label>Issuer</label><input id="m-subtitle" class="form-control" value="${item.subtitle||''}"></div>
        <div class="form-group"><label>Date</label><input id="m-date" class="form-control" value="${item.date||''}"></div>
        <div class="form-group"><label>Link</label><input id="m-url" class="form-control" value="${item.url||''}"></div>
    `;
}

export function buildItem(base = {}) {
    return {
        ...base,
        title: document.getElementById('m-title').value,
        subtitle: document.getElementById('m-subtitle').value,
        date: document.getElementById('m-date').value,
        url: document.getElementById('m-url').value
    };
}
