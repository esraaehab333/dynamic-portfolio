export function setupNav() {
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.target;
            if (!target) return;
            document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            item.classList.add('active');
            const targetSection = document.getElementById(target + '-section');
            if (targetSection) targetSection.classList.add('active');
            const titleDisplay = document.getElementById('section-title-display');
            if (titleDisplay) titleDisplay.textContent = item.textContent.trim();
        });
    });
}
