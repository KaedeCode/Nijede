(function() {
  const SESSION_KEY = 'auth_current_user';
  const API_BASE = window.API_BASE || 'http://localhost:3000/api';

  class Auth {
    constructor() {
      this.currentUser = null;
      this.modalOverlay = null;
      this.init();
    }

    init() {
      this.loadSession();
      this.updateUI();
      this.bindGlobalEvents();
      this.fetchCurrentUser();
    }

    loadSession() {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
        } catch {
          this.currentUser = null;
        }
      } else {
        this.currentUser = null;
      }
    }

    saveSession() {
      if (this.currentUser) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }

    async fetchCurrentUser() {
      try {
        const res = await fetch(`${API_BASE}/profile`, {
          credentials: 'include'
        });
        if (res.ok) {
          const user = await res.json();
          this.currentUser = user;
          this.saveSession();
          this.updateUI();
        } else {
          this.currentUser = null;
          this.saveSession();
          this.updateUI();
        }
      } catch {
        this.currentUser = null;
        this.saveSession();
        this.updateUI();
      }
    }

    isAuthenticated() {
      return !!this.currentUser;
    }

    getUser() {
      return this.currentUser;
    }

    getProfileUrl() {
      if (window.location.pathname.includes('/pages/')) {
        return '../profile.html';
      }
      return 'profile.html';
    }

    async register(username, password) {
      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, message: data.error || data.errors?.[0]?.msg || 'Ошибка регистрации' };
        }
        this.currentUser = data;
        this.saveSession();
        this.updateUI();
        return { success: true, user: data };
      } catch (err) {
        return { success: false, message: 'Ошибка сети' };
      }
    }

    async login(username, password) {
      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, message: data.error || 'Неверные данные' };
        }
        this.currentUser = data;
        this.saveSession();
        this.updateUI();
        return { success: true, user: data };
      } catch (err) {
        return { success: false, message: 'Ошибка сети' };
      }
    }

    async logout() {
      try {
        await fetch(`${API_BASE}/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch {}
      this.currentUser = null;
      this.saveSession();
      this.updateUI();
      this.closeModal();
      window.location.reload();
    }

    async showAuthModal(title, text, icon = 'success') {
      await Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: 'ОК',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#9d4edd'
      });
    }

    updateUI() {
      const authButtons = document.getElementById('authButtons');
      if (authButtons) {
        if (this.isAuthenticated()) {
          authButtons.innerHTML = `
            <span class="auth-user">${this.currentUser.username}</span>
            <button class="auth-btn logout-btn" id="logoutBtnMain">Выйти</button>
          `;
          const logoutBtn = authButtons.querySelector('#logoutBtnMain');
          if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
          }
        } else {
          authButtons.innerHTML = `
            <button class="auth-btn login-btn" id="loginBtnMain">Вход</button>
            <button class="auth-btn register-btn" id="registerBtnMain">Регистрация</button>
          `;
          document.getElementById('loginBtnMain')?.addEventListener('click', () => this.showLoginModal());
          document.getElementById('registerBtnMain')?.addEventListener('click', () => this.showRegisterModal());
        }
      }

      const profileTopLeft = document.getElementById('profileTopLeft');
      if (profileTopLeft) {
        if (this.isAuthenticated()) {
          profileTopLeft.innerHTML = `<a href="${this.getProfileUrl()}" class="auth-btn profile-top-btn">Профиль</a>`;
        } else {
          profileTopLeft.innerHTML = '';
        }
      }

      const sidebarAuth = document.querySelector('.sidebar-auth');
      if (sidebarAuth) {
        if (this.isAuthenticated()) {
          sidebarAuth.innerHTML = `
            <div class="sidebar-user">
              <span class="sidebar-username">${this.currentUser.username}</span>
              <a href="${this.getProfileUrl()}" class="auth-btn profile-btn">Профиль</a>
              <button class="auth-btn logout-btn sidebar-logout">Выйти</button>
            </div>
          `;
          sidebarAuth.querySelector('.sidebar-logout')?.addEventListener('click', () => this.logout());
        } else {
          sidebarAuth.innerHTML = `
            <button class="auth-btn login-btn sidebar-login">Вход</button>
            <button class="auth-btn register-btn sidebar-register">Регистрация</button>
          `;
          sidebarAuth.querySelector('.sidebar-login')?.addEventListener('click', () => this.showLoginModal());
          sidebarAuth.querySelector('.sidebar-register')?.addEventListener('click', () => this.showRegisterModal());
        }
      }
    }

    showLoginModal() {
      this.showModal('login');
    }

    showRegisterModal() {
      this.showModal('register');
    }

    showModal(type) {
      this.closeModal();
      const overlay = document.createElement('div');
      overlay.className = 'auth-modal-overlay';
      overlay.id = 'authModalOverlay';

      const modal = document.createElement('div');
      modal.className = 'auth-modal';

      if (type === 'login') {
        modal.innerHTML = `
          <h2>Вход</h2>
          <form id="loginForm">
            <label>Имя пользователя</label>
            <input type="text" id="loginUsername" placeholder="Ваше имя" required>
            <label>Пароль</label>
            <input type="password" id="loginPassword" placeholder="Пароль" required>
            <button type="submit" class="auth-submit">Войти</button>
          </form>
          <div id="loginError" class="auth-error"></div>
          <button class="auth-modal-close">✕</button>
        `;
      } else {
        modal.innerHTML = `
          <h2>Регистрация</h2>
          <form id="registerForm">
            <label>Имя пользователя</label>
            <input type="text" id="registerUsername" placeholder="Ваше имя" required>
            <div class="auth-warning">Имя не должно содержать оскорбления, нецензурную лексику или нарушать законодательство РФ.</div>
            <label>Пароль</label>
            <input type="password" id="registerPassword" placeholder="Пароль (мин. 6 символов)" required>
            <label>Подтверждение пароля</label>
            <input type="password" id="registerPasswordConfirm" placeholder="Повторите пароль" required>
            <button type="submit" class="auth-submit">Зарегистрироваться</button>
          </form>
          <div id="registerError" class="auth-error"></div>
          <button class="auth-modal-close">✕</button>
        `;
      }

      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      this.modalOverlay = overlay;

      overlay.querySelector('.auth-modal-close').addEventListener('click', () => this.closeModal());
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal();
      });

      if (type === 'login') {
        const form = document.getElementById('loginForm');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const username = document.getElementById('loginUsername').value.trim();
          const password = document.getElementById('loginPassword').value.trim();
          const result = await this.login(username, password);
          if (result.success) {
            this.closeModal();
            await this.showAuthModal('Вход', 'Добро пожаловать, ' + username);
            window.location.reload();
          } else {
            document.getElementById('loginError').textContent = result.message;
          }
        });
      } else {
        const form = document.getElementById('registerForm');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const username = document.getElementById('registerUsername').value.trim();
          const password = document.getElementById('registerPassword').value.trim();
          const confirm = document.getElementById('registerPasswordConfirm').value.trim();
          if (password.length < 6) {
            document.getElementById('registerError').textContent = 'Пароль должен быть не менее 6 символов';
            return;
          }
          if (password !== confirm) {
            document.getElementById('registerError').textContent = 'Пароли не совпадают';
            return;
          }
          const result = await this.register(username, password);
          if (result.success) {
            this.closeModal();
            await this.showAuthModal('Регистрация', 'Регистрация прошла успешно! Добро пожаловать, ' + username);
            window.location.reload();
          } else {
            document.getElementById('registerError').textContent = result.message;
          }
        });
      }
    }

    closeModal() {
      if (this.modalOverlay && this.modalOverlay.parentNode) {
        this.modalOverlay.parentNode.removeChild(this.modalOverlay);
        this.modalOverlay = null;
      }
    }

    bindGlobalEvents() {
      document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-auth]');
        if (target) {
          const action = target.dataset.auth;
          if (action === 'login') this.showLoginModal();
          else if (action === 'register') this.showRegisterModal();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.Auth = new Auth();
  });
})();