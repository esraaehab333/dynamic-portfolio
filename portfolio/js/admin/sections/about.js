export function populateForm(data) {
    if (document.getElementById('about-bio')) {
        document.getElementById('about-bio').value = data.about?.bio || '';
    }
}

export function save(data) {
    if (!data.about) data.about = {};
    data.about.bio = document.getElementById('about-bio').value;
}
