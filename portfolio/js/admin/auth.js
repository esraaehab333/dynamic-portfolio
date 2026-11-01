import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config.js';

export function initAuth(onSuccess) {
    if (sessionStorage.getItem('admin_authed') === '1') {
        const loginScreen = document.getElementById('login-screen');
        const dashboard = document.getElementById('dashboard');
        if (loginScreen) loginScreen.style.display = 'none';
        if (dashboard) dashboard.style.display = 'flex';
        onSuccess();
    }
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (document.getElementById('login-email').value === ADMIN_EMAIL &&
                document.getElementById('login-password').value === ADMIN_PASSWORD) {
                sessionStorage.setItem('admin_authed', '1');
                location.reload();
            }
        });
    }
}

export function logout() {
    sessionStorage.removeItem('admin_authed');
    location.reload();
}
