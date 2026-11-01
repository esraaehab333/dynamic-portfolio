export function showToast() {
    const t = document.getElementById('toast');
    if (t) {
        t.style.display = 'block';
        setTimeout(() => t.style.display = 'none', 3000);
    }
}
