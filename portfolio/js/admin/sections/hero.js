import { imageField } from '../shared/image-field.js';

export function populateForm(data) {
    document.getElementById('hero-name').value = data.hero?.name || '';
    document.getElementById('hero-title').value = data.hero?.title || '';
    document.getElementById('hero-description').value = data.hero?.description || '';
    const proofInput = document.getElementById('hero-proof');
    if (proofInput) {
        proofInput.value = data.hero?.proof || '';
    }
    document.getElementById('hero-image').value = data.hero?.image || '';
    document.getElementById('hero-cv').value = data.hero?.cv_url || '';
}

export function imageFieldMarkup(data) {
    return imageField('hero-image', 'Profile image', data.hero?.image || '');
}

export function save(data) {
    if (!data.hero) data.hero = {};
    data.hero.name = document.getElementById('hero-name').value;
    data.hero.title = document.getElementById('hero-title').value;
    data.hero.description = document.getElementById('hero-description').value;
    const proofInput = document.getElementById('hero-proof');
    if (proofInput) {
        data.hero.proof = proofInput.value;
    }
    data.hero.image = document.getElementById('hero-image').value;
    data.hero.cv_url = document.getElementById('hero-cv').value;
}
