export function getModalForm(item = {}) {
    return `<div class="form-group"><label>Category (e.g. Android, Architecture, Tools)</label><input id="m-category" class="form-control" value="${item.category||''}"></div><div class="form-group"><label>Icon (ph-*)</label><input id="m-icon" class="form-control" value="${item.icon||''}"></div><div class="form-group"><label>Name</label><input id="m-name" class="form-control" value="${item.name||''}"></div>`;
}

export function buildItem(base = {}) {
    return {
        ...base,
        category: document.getElementById('m-category').value,
        icon: document.getElementById('m-icon').value,
        name: document.getElementById('m-name').value
    };
}
