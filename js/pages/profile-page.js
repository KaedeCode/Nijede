import { getAuth } from '../features/auth/auth.js';
import { initSidebar } from '../features/menu.js';
import { initMusicControls } from '../features/music.js';
import { initRotateOverlay } from '../features/rotate.js';
import { initSearch } from '../features/search.js';
import { initGlobalActions } from '../features/actions.js';

getAuth();
initSidebar();
initMusicControls();
initSearch('searchInput', 'searchDropdown');
initRotateOverlay();
initGlobalActions();

const auth = getAuth();

if (!auth.isAuthenticated()) {
  window.location.href = '../index.html';
} else {
  const usernameInput = document.getElementById('profileUsernameInput');
  const pronounsSelect = document.getElementById('profilePronounsSelect');
  const birthInput = document.getElementById('profileBirthInput');
  const bioInput = document.getElementById('profileBioInput');
  const displayName = document.getElementById('profileDisplayName');
  const createdSpan = document.getElementById('profileCreated');
  const idSpan = document.getElementById('profileId');
  const avatarImg = document.getElementById('profileAvatar');
  const avatarPlaceholder = document.getElementById('avatarPlaceholder');
  const avatarWrapper = document.getElementById('avatarWrapper');
  const avatarInput = document.getElementById('avatarInput');
  const saveBtn = document.getElementById('profileSave');
  const logoutBtn = document.getElementById('profileLogout');
  const backBtn = document.getElementById('profileBack');
  const msgDiv = document.getElementById('profileMessage');

  function updateProfileUI() {
    const currentUser = auth.getUser();
    if (!currentUser) return;
    usernameInput.value = currentUser.username || '';
    const userPronouns = currentUser.pronouns || '';
    const predefined = ['он/его', 'она/её', 'они/их', 'оно/его'];
    pronounsSelect.value = predefined.includes(userPronouns) ? userPronouns : '';
    let birthValue = currentUser.birthdate;
    if (birthValue && typeof birthValue === 'string' && birthValue.includes('T')) {
      birthValue = birthValue.split('T')[0];
    }
    birthInput.value = birthValue || '';
    bioInput.value = currentUser.bio || '';
    displayName.textContent = currentUser.username || 'Пользователь';
    createdSpan.textContent = currentUser.created_at ? new Date(currentUser.created_at).toLocaleString() : '—';
    idSpan.textContent = currentUser.id || '—';

    const avatarUrl = currentUser.avatar_url || '';
    if (avatarUrl) {
      avatarImg.src = avatarUrl;
      avatarImg.style.display = 'block';
      avatarPlaceholder.style.display = 'none';
    } else {
      avatarImg.style.display = 'none';
      avatarPlaceholder.style.display = 'flex';
      avatarPlaceholder.textContent = (currentUser.username || '?').charAt(0).toUpperCase();
    }
  }
  updateProfileUI();

  function showMessage(text, type = 'info') {
    msgDiv.textContent = text;
    msgDiv.className = 'profile-message show';
    if (type === 'success') msgDiv.classList.add('success');
    else if (type === 'error') msgDiv.classList.add('error');
    setTimeout(() => msgDiv.classList.remove('show'), 5000);
  }

  avatarWrapper.addEventListener('click', () => avatarInput.click());

  avatarInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        avatarImg.src = ev.target.result;
        avatarImg.style.display = 'block';
        avatarPlaceholder.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });

  backBtn.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  saveBtn.addEventListener('click', async () => {
    const newUsername = usernameInput.value.trim();
    let newPronouns = pronounsSelect.value;
    if (newPronouns === '') newPronouns = null;
    const newBirthdate = birthInput.value || null;
    const newBio = bioInput.value.trim();
    const file = avatarInput.files[0];

    if (!newUsername && !file && !newPronouns && !newBio && !newBirthdate) {
      showMessage('Нет изменений для сохранения', 'info');
      return;
    }

    if (newUsername && newUsername.length < 3) {
      showMessage('Имя должно содержать минимум 3 символа', 'error');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ Сохранение...';

    const result = await auth.updateProfile(
      newUsername || null,
      file || null,
      newPronouns || null,
      newBio || null,
      newBirthdate || null
    );

    saveBtn.disabled = false;
    saveBtn.textContent = '💾 Сохранить';

    if (result.success) {
      showMessage('Профиль успешно обновлён!', 'success');
      updateProfileUI();
      avatarInput.value = '';
    } else {
      showMessage(result.message || 'Ошибка обновления', 'error');
    }
  });

  logoutBtn.addEventListener('click', () => auth.logoutWithConfirm());
}