import { API_URL } from '../config.js';

export function getAdminToken() {
    return sessionStorage.getItem('admin_token') || '';
}

export function setAdminToken(token) {
    if (token) {
        sessionStorage.setItem('admin_token', token);
    } else {
        sessionStorage.removeItem('admin_token');
    }
}

export async function checkAuthToken(token) {
    if (!token) return false;
    try {
        const res = await fetch(`${API_URL}/auth/check`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.status === 204;
    } catch {
        return false;
    }
}

export function showLoginScreen(message = '') {
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const errorEl = document.getElementById('login-error');
    if (dashboard) dashboard.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'flex';
    if (errorEl) {
        if (message) {
            errorEl.textContent = message;
            errorEl.hidden = false;
        } else {
            errorEl.hidden = true;
            errorEl.textContent = '';
        }
    }
}

export function showDashboard() {
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboard) dashboard.style.display = 'flex';
}

export function initAuth(onSuccess) {
    sessionStorage.removeItem('admin_authed');
    const token = getAdminToken();

    if (token) {
        checkAuthToken(token).then(isValid => {
            if (isValid) {
                showDashboard();
                onSuccess();
            } else {
                setAdminToken('');
                showLoginScreen('Session expired');
            }
        });
    } else {
        showLoginScreen();
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const tokenInput = document.getElementById('admin-token');
            const submitBtn = document.getElementById('login-submit-btn');
            const errorEl = document.getElementById('login-error');
            const inputToken = tokenInput?.value?.trim() || '';

            if (!inputToken) return;

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Checking…';
            }
            if (errorEl) errorEl.hidden = true;

            const isValid = await checkAuthToken(inputToken);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }

            if (isValid) {
                setAdminToken(inputToken);
                showDashboard();
                onSuccess();
            } else {
                showLoginScreen('Wrong token');
            }
        };
    }
}

export function logout(message = '') {
    setAdminToken('');
    showLoginScreen(message);
}
