export function getModalForm(item = {}) {
    return `
        <div class="form-group"><label>Date Range (e.g. 2022 - Present)</label><input id="m-date" class="form-control" value="${item.date||''}"></div>
        <div class="form-group"><label>Job Title</label><input id="m-title" class="form-control" value="${item.title||''}"></div>
        <div class="form-group"><label>Company Name</label><input id="m-subtitle" class="form-control" value="${item.subtitle||''}"></div>
        <div class="form-group"><label>Description</label><textarea id="m-desc" class="form-control">${item.desc||''}</textarea></div>
    `;
}

export function buildItem(base = {}) {
    return {
        ...base,
        date: document.getElementById('m-date').value,
        title: document.getElementById('m-title').value,
        subtitle: document.getElementById('m-subtitle').value,
        desc: document.getElementById('m-desc').value
    };
}
