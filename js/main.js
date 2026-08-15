function toggleMusic() {
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic.paused) bgMusic.play();
    else bgMusic.pause();
}

function setVolume(value) {
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.volume = value / 100;
}

function showPopup() {
    Swal.fire({
        title: 'О проекте',
        html: `
            <div style="text-align: left; line-height: 1.7; color: #e0e0e0; font-family: 'Segoe UI', Arial, sans-serif;">
                <p style="margin-bottom: 15px;">
                    <b style="color: #9d4edd;">«Мир музыкальных инструментов»</b> — интерактивный веб-сайт для изучения музыки.
                    Вы можете исследовать 3D-комнаты персонажей, узнавать факты об инструментах,
                    а также сочинять свои мелодии и ритмы с помощью встроенного нотного редактора.
                </p>
                <hr style="border: 0; height: 1px; background: linear-gradient(to right, rgba(157, 78, 221, 0), rgba(157, 78, 221, 0.6), rgba(157, 78, 221, 0)); margin: 15px 0;">
                <p style="margin-bottom: 10px;">
                    <b style="color: #9d4edd;">Распределение ролей:</b><br>
                    <b>Фролякин Александр</b> — создание 3D-сцен, системы новеллы (диалогов) и наполнение комнаты Каэде.<br>
                    <b>Житников Кирилл</b> — реализация системы музыкальных инструментов (нотный редактор, синтезатор) и наполнение комнаты Ниджики.
                </p>
                <p style="margin-bottom: 10px;">
                    <b style="color: #9d4edd;">Связь с нами:</b><br>
                    Александр: <a href="https://github.com/KaedeCode" target="_blank" style="color: #c77dff; text-decoration: none;">GitHub</a> | <a href="https://t.me/KaedeCode" target="_blank" style="color: #c77dff; text-decoration: none;">Telegram</a><br>
                    Кирилл: <a href="https://github.com/arkin99-p" target="_blank" style="color: #c77dff; text-decoration: none;">GitHub</a>
                </p>
                <p style="margin-top: 10px; font-size: 0.9rem; color: #888;">
                    <b>Использованные технологии:</b> HTML5, CSS3, JavaScript, Three.js, Web Audio API.<br>
                    <b>Модели:</b> 3D-модели взяты из открытых источников. Если вы являетесь автором — свяжитесь с нами.
                </p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Закрыть',
        width: 600,
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#9d4edd'
    });
}

document.addEventListener('keydown', function(event) {
    const target = event.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('.auth-modal-overlay')) {
        return;
    }
    if (document.querySelector('.section')) {
        const sections = ['intro', 'kaede', 'nijika'];
        const currentHash = window.location.hash || '#intro';
        let currentIndex = sections.findIndex(s => '#' + s === currentHash);
        if (currentIndex === -1) currentIndex = 0;

        if (event.code === 'ArrowDown' || event.code === 'KeyS') {
            event.preventDefault();
            const nextIndex = (currentIndex + 1) % sections.length;
            window.location.hash = '#' + sections[nextIndex];
        } else if (event.code === 'ArrowUp' || event.code === 'KeyW') {
            event.preventDefault();
            const prevIndex = (currentIndex - 1 + sections.length) % sections.length;
            window.location.hash = '#' + sections[prevIndex];
        }
    }
});

const searchData = [
    { name: "Пианино", category: "Каэдэ", url: "../pages/instruments/piano.html" },
    { name: "Синтезатор", category: "Каэдэ", url: "../pages/instruments/synthesizer.html" },
    { name: "Ударная установка", category: "Ниджика", url: "../pages/instruments/drums.html" },
    { name: "Перкуссия", category: "Ниджика", url: "" },
    { name: "Электрогитара", category: "Ниджика", url: "../pages/instruments/guitar.html" },
    { name: "Акустическая гитара", category: "Ниджика", url: "../pages/instruments/acoustic.html" },
    { name: "Бас-гитара", category: "Ниджика", url: "../pages/instruments/bass.html" },
    { name: "Скрипка", category: "Ниджика", url: "../pages/instruments/violin.html" },
    { name: "Флейта", category: "Ниджика", url: "../pages/instruments/flute.html" }
];

const introSearch = document.getElementById('introSearch');
const introDropdown = document.getElementById('introSearchDropdown');

if (introSearch && introDropdown) {
    introSearch.addEventListener('input', (e) => {
        const query = e.target.value;
        if (!query.trim()) {
            introDropdown.classList.remove('show');
            return;
        }
        const filtered = searchData.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase())
        );
        if (filtered.length === 0) {
            introDropdown.innerHTML = '<div class="search-item" style="color: #aaa;">Ничего не найдено</div>';
            introDropdown.classList.add('show');
            return;
        }
        const grouped = {};
        filtered.forEach(item => {
            if (!grouped[item.category]) grouped[item.category] = [];
            grouped[item.category].push(item);
        });
        let html = '';
        for (const [category, items] of Object.entries(grouped)) {
            html += `<div class="search-category">${category}</div>`;
            items.forEach(item => {
                html += `<div class="search-item" data-url="${item.url}">${item.name}</div>`;
            });
        }
        introDropdown.innerHTML = html;
        introDropdown.classList.add('show');
        introDropdown.querySelectorAll('.search-item[data-url]').forEach(el => {
            el.addEventListener('click', () => {
                window.location.href = el.dataset.url;
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!introSearch.contains(e.target) && !introDropdown.contains(e.target)) {
            introDropdown.classList.remove('show');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('authButtons')) {
    }
});