export function showPopup() {
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
          <b>Использованные технологии:</b> HTML5, CSS3, JavaScript, Three.js, Web Audio API, Express.js, MySQL, Knex, bcrypt, express-session, sharp.
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