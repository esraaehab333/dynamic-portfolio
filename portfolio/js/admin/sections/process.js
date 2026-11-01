export function getModalForm(item = {}) {
    return `<div class="form-group"><label>Number</label><input id="m-number" class="form-control" value="${item.number||''}"></div><div class="form-group"><label>Icon (ph-*)</label><input id="m-icon" class="form-control" value="${item.icon||''}"></div><div class="form-group"><label>Title</label><input id="m-title" class="form-control" value="${item.title||''}"></div><div class="form-group"><label>Description</label><textarea id="m-desc" class="form-control">${item.desc||''}</textarea></div>`;
}

export function buildItem(base = {}) {
    return {
        ...base,
        number: document.getElementById('m-number').value,
        icon: document.getElementById('m-icon').value,
        title: document.getElementById('m-title').value,
        desc: document.getElementById('m-desc').value
    };
}
