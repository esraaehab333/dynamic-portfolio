export function setupScrollEffect() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

export function setupNavbarScroll() {
    const nav = document.querySelector('nav');
    const blob1 = document.querySelector('.blob-1');
    const blob2 = document.querySelector('.blob-2');
    let scrollTimeout;

    window.addEventListener('scroll', () => {
        if (nav) {
            if (window.scrollY > 50) nav.classList.add('scrolled');
            else nav.classList.remove('scrolled');
        }

        document.body.classList.add('is-scrolling');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            document.body.classList.remove('is-scrolling');
        }, 150);

        const scrolled = window.scrollY;
        if (blob1) blob1.style.transform = `translate(${scrolled * 0.1}px, ${scrolled * 0.05}px)`;
        if (blob2) blob2.style.transform = `translate(-${scrolled * 0.1}px, -${scrolled * 0.05}px)`;

        document.querySelectorAll('[data-parallax]').forEach(el => {
            const speed = el.dataset.parallax || 0.1;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

export function setupNavbarActiveState() {
    const links = Array.from(document.querySelectorAll('#nav-menu a[href^="#"]'));
    const sections = links
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(section => section && section.tagName === 'SECTION');
    if (!links.length || !sections.length) return;

    const updateActiveLink = () => {
        const marker = window.innerHeight * 0.35;
        let currentSection = sections[0];

        for (const section of sections) {
            if (section.getBoundingClientRect().top <= marker) currentSection = section;
            else break;
        }

        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            currentSection = sections[sections.length - 1];
        }

        links.forEach(link => {
            const isActive = link.getAttribute('href') === `#${currentSection.id}`;
            link.classList.toggle('active', isActive);
            if (isActive) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    };

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    window.addEventListener('resize', updateActiveLink);
    window.addEventListener('hashchange', updateActiveLink);
    updateActiveLink();
}

export function addStagger() {
    document.querySelectorAll('.projects-grid, .skills-grid, .services-grid, .certs-grid, .nav-links').forEach(container => {
        container.querySelectorAll('.reveal').forEach((el, index) => {
            el.style.setProperty('--order', index);
        });
    });
}
