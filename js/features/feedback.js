import { API_BASE } from '../core/config.js';

export function showFeedbackModal() {
  Swal.fire({
    title: '💬 Обратная связь',
    html: `
      <div style="text-align: left; font-family: 'Segoe UI', Arial, sans-serif;">
        <label for="feedbackType" style="display:block; margin-bottom:6px; color:#c77dff; font-weight:500;">Тип отзыва</label>
        <select id="feedbackType" style="width:100%; padding:10px 14px; margin-bottom:18px; border-radius:12px; background:#2a2a3e; color:#fff; border:1.5px solid #6a3a8a; outline:none; font-size:1rem;">
          <option value="general">📝 Общее</option>
          <option value="bug">🐞 Сообщить об ошибке</option>
          <option value="suggestion">💡 Предложение</option>
        </select>
        <label for="feedbackEmail" style="display:block; margin-bottom:6px; color:#c77dff; font-weight:500;">Email (необязательно)</label>
        <input id="feedbackEmail" type="email" style="width:100%; padding:10px 14px; margin-bottom:18px; border-radius:12px; background:#2a2a3e; color:#fff; border:1.5px solid #6a3a8a; outline:none; font-size:1rem;" placeholder="Ваш email">
        <label for="feedbackMessage" style="display:block; margin-bottom:6px; color:#c77dff; font-weight:500;">Сообщение</label>
        <textarea id="feedbackMessage" style="width:100%; padding:10px 14px; border-radius:12px; background:#2a2a3e; color:#fff; border:1.5px solid #6a3a8a; outline:none; font-size:1rem; height:120px; resize:vertical;" placeholder="Опишите ваш вопрос, проблему или идею…"></textarea>
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
      try {
        const res = await fetch(`${API_BASE}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ type, email, message })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ошибка отправки');
        return data;
      } catch (err) {
        Swal.showValidationMessage(err.message);
        return false;
      }
    }
  }).then(result => {
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