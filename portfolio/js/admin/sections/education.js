export function getModalForm(item = {}) {
    return `
        <div class="form-group"><label>Date Range</label><input id="m-date" class="form-control" value="${item.date||''}"></div>
        <div class="form-group"><label>Degree/Major</label><input id="m-title" class="form-control" value="${item.title||''}"></div>
        <div class="form-group"><label>School/University</label><input id="m-subtitle" class="form-control" value="${item.subtitle||''}"></div>
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
