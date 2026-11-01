export function getModalForm(item = {}) {
    return `
        <div class="form-group"><label>Title</label><input id="m-title" class="form-control" value="${item.title||''}"></div>
        <div class="form-group"><label>Subtitle / Description</label><input id="m-subtitle" class="form-control" value="${item.subtitle||''}"></div>
        <div class="form-group"><label>Tag (e.g. Kotlin | Compose)</label><input id="m-tag" class="form-control" value="${item.tag||''}"></div>
        <div class="form-group"><label>Image URL</label><input id="m-image" class="form-control" value="${item.image||''}"></div>
        <div class="form-group"><label>Live Demo URL</label><input id="m-demo" class="form-control" value="${item.demo||''}"></div>
        <div class="form-group"><label>GitHub URL</label><input id="m-github" class="form-control" value="${item.github||''}"></div>
        <div class="form-group"><label>LinkedIn URL</label><input id="m-linkedin" class="form-control" value="${item.linkedin||''}"></div>
        <div class="form-group"><label>Video URL</label><input id="m-video" class="form-control" value="${item.video||''}"></div>
    `;
}

export function buildItem(base = {}) {
    return {
        ...base,
        title: document.getElementById('m-title').value,
        subtitle: document.getElementById('m-subtitle').value,
        tag: document.getElementById('m-tag').value,
        image: document.getElementById('m-image').value,
        demo: document.getElementById('m-demo').value,
        github: document.getElementById('m-github').value,
        linkedin: document.getElementById('m-linkedin').value,
        video: document.getElementById('m-video').value
    };
}
