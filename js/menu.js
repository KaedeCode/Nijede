document.addEventListener('DOMContentLoaded', function() {
    var burger = document.querySelector('.burger-button');
    var sidebar = document.querySelector('.sidebar');
    var closeBtn = document.querySelector('.close-sidebar');
    var volumeSlider = document.getElementById('volumeSlider');

    if (burger && sidebar) {
        burger.addEventListener('click', function() {
            sidebar.classList.add('open');
            burger.style.display = 'none';
            if (window.Auth) window.Auth.updateUI();
        });
    }

    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', function() {
            sidebar.classList.remove('open');
            burger.style.display = 'flex';
        });
    }

    document.addEventListener('click', function(e) {
        if (sidebar && sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            !burger.contains(e.target)) {
            sidebar.classList.remove('open');
            burger.style.display = 'flex';
        }
    });

    var sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (sidebar) sidebar.classList.remove('open');
            burger.style.display = 'flex';
        });
    });

    if (volumeSlider) {
        var audio = document.getElementById('bgMusic');
        if (audio) {
            audio.volume = volumeSlider.value / 100;
        }
    }

    var sidebarHeader = sidebar ? sidebar.querySelector('.sidebar-header') : null;
    var sidebarNav = sidebar ? sidebar.querySelector('.sidebar-nav') : null;
    if (sidebarHeader && sidebarNav && !sidebar.querySelector('.sidebar-auth')) {
        var authDiv = document.createElement('div');
        authDiv.className = 'sidebar-auth';
        sidebarHeader.parentNode.insertBefore(authDiv, sidebarNav);
        if (window.Auth) window.Auth.updateUI();
    }

    var searchInput = document.getElementById('searchInput');
    var searchDropdown = document.getElementById('searchDropdown');

    if (!searchInput || !searchDropdown) {
        return;
    }

    function showSearchResults(query) {
        if (!query.trim()) {
            searchDropdown.classList.remove('show');
            return;
        }

        var filtered = searchData.filter(function(item) {
            return item.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        });

        if (filtered.length === 0) {
            searchDropdown.innerHTML = '<div class="search-item" style="color: #aaa;">Ничего не найдено</div>';
            searchDropdown.classList.add('show');
            return;
        }

        var grouped = {};
        filtered.forEach(function(item) {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });

        var html = '';
        for (var category in grouped) {
            html += '<div class="search-category">' + category + '</div>';
            grouped[category].forEach(function(item) {
                html += '<div class="search-item" data-url="' + item.url + '">' + item.name + '</div>';
            });
        }

        searchDropdown.innerHTML = html;
        searchDropdown.classList.add('show');

        var items = searchDropdown.querySelectorAll('.search-item[data-url]');
        items.forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                window.location.href = el.getAttribute('data-url');
            });
        });
    }

    searchInput.addEventListener('input', function(e) {
        showSearchResults(e.target.value);
    });

    searchInput.addEventListener('blur', function() {
        setTimeout(function() {
            searchDropdown.classList.remove('show');
        }, 200);
    });

    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.classList.remove('show');
        }
    });
});