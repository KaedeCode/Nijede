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
                    <b style="color: #9d4edd;">Возможности:</b><br>
                    • 3D-комнаты с интерактивными объектами<br>
                    • Диалоги с персонажами (новелла)<br>
                    • Нотный редактор с воспроизведением<br>
                    • Система регистрации и входа — личный кабинет<br>
                    • Обратная связь — отправка сообщений разработчикам
                </p>
                <p style="margin-bottom: 10px;">
                    <b style="color: #9d4edd;">Распределение ролей:</b><br>
                    <b>Фролякин Александр</b> — 3D-сцены, система новеллы, комната Каэде, бэкенд (аутентификация, обратная связь, профиль), адаптивность.<br>
                    <b>Житников Кирилл</b> — нотный редактор, аудиосистема, комната Ниджики.
                </p>
                <p style="margin-bottom: 10px;">
                    <b style="color: #9d4edd;">Связь с нами:</b><br>
                    Александр: <a href="https://github.com/KaedeCode" target="_blank" style="color: #c77dff; text-decoration: none;">GitHub</a> | <a href="https://t.me/KaedeCode" target="_blank" style="color: #c77dff; text-decoration: none;">Telegram</a><br>
                    Кирилл: <a href="https://github.com/arkin99-p" target="_blank" style="color: #c77dff; text-decoration: none;">GitHub</a>
                </p>
                <p style="margin-top: 10px; font-size: 0.9rem; color: #888;">
                    <b>Использованные технологии:</b> HTML5, CSS3, JavaScript, Three.js, Web Audio API, Express.js, MySQL, Knex, bcrypt, express-session, Cloudinary.<br>
                    <b>Модели:</b> 3D-модели взяты из открытых источников. Если вы являетесь автором — свяжитесь с нами.
                </p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Закрыть',
        width: 1000,
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

window.searchData = [
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

(function initIntroSearch() {
    const introSearch = document.getElementById('introSearch');
    const introDropdown = document.getElementById('introSearchDropdown');
    if (!introSearch || !introDropdown) return;

    introSearch.addEventListener('input', function(e) {
        const query = e.target.value;
        if (!query.trim()) {
            introDropdown.classList.remove('show');
            return;
        }
        const filtered = window.searchData.filter(function(item) {
            return item.name.toLowerCase().includes(query.toLowerCase());
        });
        if (filtered.length === 0) {
            introDropdown.innerHTML = '<div class="search-item" style="color: #aaa;">Ничего не найдено</div>';
            introDropdown.classList.add('show');
            return;
        }
        const grouped = {};
        filtered.forEach(function(item) {
            if (!grouped[item.category]) grouped[item.category] = [];
            grouped[item.category].push(item);
        });
        let html = '';
        for (const category in grouped) {
            html += '<div class="search-category">' + category + '</div>';
            grouped[category].forEach(function(item) {
                html += '<div class="search-item" data-url="' + item.url + '">' + item.name + '</div>';
            });
        }
        introDropdown.innerHTML = html;
        introDropdown.classList.add('show');
        introDropdown.querySelectorAll('.search-item[data-url]').forEach(function(el) {
            el.addEventListener('click', function() {
                window.location.href = el.dataset.url;
            });
        });
    });

    document.addEventListener('click', function(e) {
        if (!introSearch.contains(e.target) && !introDropdown.contains(e.target)) {
            introDropdown.classList.remove('show');
        }
    });
})();

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('authButtons')) {
    }
});

window.API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://api-proxy.akkdorn10.workers.dev/api';

function showFeedbackModal() {
  Swal.fire({
    title: '💬 Обратная связь',
    html: `
      <div style="text-align: left; font-family: 'Segoe UI', Arial, sans-serif;">
        <label for="feedbackType" style="display:block; margin-bottom:6px; color:#c77dff; font-weight:500;">Тип отзыва</label>
        <select id="feedbackType" style="width:100%; padding:10px 14px; margin-bottom:18px; border-radius:12px; background:#2a2a3e; color:#fff; border:1.5px solid #6a3a8a; outline:none; font-size:1rem; transition:0.2s;">
          <option value="general">📝 Общее</option>
          <option value="bug">🐞 Сообщить об ошибке</option>
          <option value="suggestion">💡 Предложение</option>
        </select>

        <label for="feedbackEmail" style="display:block; margin-bottom:6px; color:#c77dff; font-weight:500;">Email (необязательно)</label>
        <input id="feedbackEmail" type="email" style="width:100%; padding:10px 14px; margin-bottom:18px; border-radius:12px; background:#2a2a3e; color:#fff; border:1.5px solid #6a3a8a; outline:none; font-size:1rem; transition:0.2s;" placeholder="Ваш email">

        <label for="feedbackMessage" style="display:block; margin-bottom:6px; color:#c77dff; font-weight:500;">Сообщение</label>
        <textarea id="feedbackMessage" style="width:100%; padding:10px 14px; border-radius:12px; background:#2a2a3e; color:#fff; border:1.5px solid #6a3a8a; outline:none; font-size:1rem; height:120px; resize:vertical; transition:0.2s;" placeholder="Опишите ваш вопрос, проблему или идею…"></textarea>

        <style>
          #feedbackType:focus, #feedbackEmail:focus, #feedbackMessage:focus {
            border-color: #9d4edd;
            box-shadow: 0 0 0 3px rgba(157, 78, 221, 0.3);
          }
          #feedbackType option { background: #1a1a2e; }
        </style>
      </div>
    `,
    confirmButtonText: 'Отправить',
    confirmButtonColor: '#9d4edd',
    cancelButtonText: 'Отмена',
    cancelButtonColor: '#6c6c8a',
    showCancelButton: true,
    focusConfirm: false,
    background: '#1a1a2e',
    color: '#e0e0f0',
    width: 520,
    padding: '1.5rem',
    preConfirm: async () => {
      const type = document.getElementById('feedbackType').value;
      const email = document.getElementById('feedbackEmail').value;
      const message = document.getElementById('feedbackMessage').value.trim();
      if (!message) {
        Swal.showValidationMessage('Пожалуйста, напишите сообщение');
        return false;
      }
      const payload = { type, email, message };
      try {
        const res = await fetch(`${API_BASE}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ошибка отправки');
        return data;
      } catch (err) {
        Swal.showValidationMessage(err.message);
        return false;
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        icon: 'success',
        title: 'Спасибо!',
        text: 'Ваш отзыв отправлен.',
        background: '#1a1a2e',
        color: '#e0e0f0',
        confirmButtonColor: '#9d4edd'
      });
    }
  });
}