(function() {
    var savedTheme = localStorage.getItem('theme_preference') || 'dark';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
    } else {
        document.documentElement.classList.remove('dark-mode');
    }
})();
