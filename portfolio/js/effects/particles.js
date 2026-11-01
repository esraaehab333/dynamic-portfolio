export function createParticles(container, count = 20) {
    if (!container) return;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        const size = Math.random() * 4 + 2 + 'px';
        p.style.width = size;
        p.style.height = size;
        p.style.setProperty('--duration', Math.random() * 10 + 20 + 's');
        p.style.setProperty('--move-x', (Math.random() - 0.5) * 300 + 'px');
        container.appendChild(p);
    }
}
