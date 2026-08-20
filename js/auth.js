(function() {
  const SESSION_KEY = 'auth_current_user';
  const API_BASE = window.API_BASE || 'http://localhost:3000/api';

  class Auth {
    constructor() {
      this.currentUser = null;
      this.modalOverlay = null;
      console.log('[AUTH] Initialized with API_BASE:', API_BASE);
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
          console.log('[AUTH] Loaded user from localStorage:', this.currentUser);
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
        console.log('[AUTH] Saved user to localStorage:', this.currentUser);
      } else {
        localStorage.removeItem(SESSION_KEY);
        console.log('[AUTH] Removed user from localStorage');
      }
    }

    async fetchCurrentUser() {
      console.log('[AUTH] Fetching current user from /api/profile');
      try {
        const res = await fetch(`${API_BASE}/profile`, {
          credentials: 'include'
        });
        console.log('[AUTH] Profile response status:', res.status);
        if (res.ok) {
          const user = await res.json();
          console.log('[AUTH] Profile data received:', user);
          this.currentUser = user;
          this.saveSession();
          this.updateUI();
        } else {
          console.log('[AUTH] Profile fetch not ok, status:', res.status);
          this.currentUser = null;
          this.saveSession();
          this.updateUI();
        }
      } catch (err) {
        console.error('[AUTH] fetchCurrentUser error:', err);
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
      console.log('[AUTH] Registering user:', username);
      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        console.log('[AUTH] Register response:', data);
        if (!res.ok) {
          return { success: false, message: data.error || data.errors?.[0]?.msg || 'Ошибка регистрации' };
        }
        this.currentUser = data;
        this.saveSession();
        this.updateUI();
        console.log('[AUTH] Register successful, user:', data);
        return { success: true, user: data };
      } catch (err) {
        console.error('[AUTH] Register network error:', err);
        return { success: false, message: 'Ошибка сети' };
      }
    }

    async login(username, password) {
      console.log('[AUTH] Logging in user:', username);
      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        console.log('[AUTH] Login response:', data);
        if (!res.ok) {
          return { success: false, message: data.error || 'Неверные данные' };
        }
        this.currentUser = data;
        this.saveSession();
        this.updateUI();
        console.log('[AUTH] Login successful, user:', data);
        return { success: true, user: data };
      } catch (err) {
        console.error('[AUTH] Login network error:', err);
        return { success: false, message: 'Ошибка сети' };
      }
    }

    async logout() {
      console.log('[AUTH] Logging out');
      try {
        const res = await fetch(`${API_BASE}/logout`, {
          method: 'POST',
          credentials: 'include'
        });
        console.log('[AUTH] Logout response status:', res.status);
      } catch (err) {
        console.error('[AUTH] Logout network error:', err);
      }
      this.currentUser = null;
      this.saveSession();
      this.updateUI();
      this.closeModal();
      console.log('[AUTH] User logged out, reloading');
      window.location.reload();
    }

    async logoutWithConfirm() {
      const result = await Swal.fire({
        title: 'Выход из аккаунта',
        text: 'Вы уверены, что хотите выйти?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Выйти',
        cancelButtonText: 'Отмена',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#cc4444',
        cancelButtonColor: '#6c6c8a'
      });
      if (result.isConfirmed) {
        await this.logout();
      }
    }

    async updateProfile(username, avatarFile, pronouns, bio, birthdate) {
      const formData = new FormData();
      if (username) formData.append('username', username);
      if (avatarFile) formData.append('avatar', avatarFile);
      if (pronouns !== undefined) formData.append('pronouns', pronouns);
      if (bio !== undefined) formData.append('bio', bio);
      if (birthdate !== undefined) formData.append('birthdate', birthdate);

      try {
        const res = await fetch(`${API_BASE}/profile`, {
          method: 'PUT',
          credentials: 'include',
          body: formData
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Ошибка обновления');
        }
        const updated = await res.json();
        this.currentUser = { ...this.currentUser, ...updated };
        this.saveSession();
        this.updateUI();
        return { success: true, user: this.currentUser };
      } catch (err) {
        console.error('[AUTH] Update profile error:', err);
        return { success: false, message: err.message };
      }
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
      console.log('[AUTH] Updating UI, isAuthenticated:', this.isAuthenticated());

      const authButtons = document.getElementById('authButtons');
      if (authButtons) {
        if (this.isAuthenticated()) {
          authButtons.innerHTML = `
            <span class="auth-user">${this.currentUser.username}</span>
            <button class="auth-btn logout-btn" id="logoutBtnMain">Выйти</button>
          `;
          const logoutBtn = authButtons.querySelector('#logoutBtnMain');
          if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logoutWithConfirm());
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
          const avatarUrl = this.currentUser.avatar_url || '';
          const initial = this.currentUser.username.charAt(0).toUpperCase();
          profileTopLeft.innerHTML = `
            <a href="${this.getProfileUrl()}" class="profile-top-btn">
              <span class="profile-top-avatar">
                <img src="${avatarUrl}" alt="Avatar" class="profile-top-avatar-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22 viewBox=%220 0 32 32%22%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%2216%22 fill=%22%239d4edd%22/%3E%3Ctext x=%2216%22 y=%2222%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2216%22 font-family=%22Arial%22%3E${initial}%3C/text%3E%3C/svg%3E'">
              </span>
              <span class="profile-top-name">${this.currentUser.username}</span>
            </a>
          `;
        } else {
          profileTopLeft.innerHTML = '';
        }
      }

      const sidebarAuth = document.querySelector('.sidebar-auth');
      if (sidebarAuth) {
        if (this.isAuthenticated()) {
          const avatarUrl = this.currentUser.avatar_url || '';
          const initial = this.currentUser.username.charAt(0).toUpperCase();
          sidebarAuth.innerHTML = `
            <div class="sidebar-user">
              <div class="sidebar-avatar">
                <img src="${avatarUrl}" alt="Avatar" class="sidebar-avatar-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22 viewBox=%220 0 64 64%22%3E%3Ccircle cx=%2232%22 cy=%2232%22 r=%2232%22 fill=%22%239d4edd%22/%3E%3Ctext x=%2232%22 y=%2242%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2232%22 font-family=%22Arial%22%3E${initial}%3C/text%3E%3C/svg%3E'">
              </div>
              <span class="sidebar-username">${this.currentUser.username}</span>
              <a href="${this.getProfileUrl()}" class="auth-btn profile-btn">Профиль</a>
              <button class="auth-btn logout-btn sidebar-logout">Выйти</button>
            </div>
          `;
          sidebarAuth.querySelector('.sidebar-logout')?.addEventListener('click', () => this.logoutWithConfirm());
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
          console.log('[AUTH] Login form submitted for:', username);
          const result = await this.login(username, password);
          if (result.success) {
            this.closeModal();
            await this.showAuthModal('Вход', 'Добро пожаловать, ' + username);
            console.log('[AUTH] Login successful, reloading page');
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
          console.log('[AUTH] Register form submitted for:', username);
          const result = await this.register(username, password);
          if (result.success) {
            this.closeModal();
            await this.showAuthModal('Регистрация', 'Регистрация прошла успешно! Добро пожаловать, ' + username);
            console.log('[AUTH] Register successful, reloading page');
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