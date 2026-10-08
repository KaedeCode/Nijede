import { SEARCH_DATA, PROJECT_ROOT } from '../core/config.js';

function renderResults(query, dropdown) {
  if (!query.trim()) {
    dropdown.classList.remove('show');
    return;
  }

  const filtered = SEARCH_DATA.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  if (filtered.length === 0) {
    dropdown.innerHTML = '<div class="search-item" style="color: #aaa;">Ничего не найдено</div>';
    dropdown.classList.add('show');
    return;
  }

  const grouped = {};
  filtered.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  let html = '';
  for (const category in grouped) {
    html += '<div class="search-category">' + category + '</div>';
    grouped[category].forEach(item => {
      html += '<div class="search-item" data-url="' + PROJECT_ROOT + item.url + '">' + item.name + '</div>';
    });
  }

  dropdown.innerHTML = html;
  dropdown.classList.add('show');

  dropdown.querySelectorAll('.search-item[data-url]').forEach(el => {
    el.addEventListener('click', () => {
      window.location.href = el.dataset.url;
    });
  });
}

export function initSearch(inputId, dropdownId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  if (!input || !dropdown) return;

  input.addEventListener('input', e => renderResults(e.target.value, dropdown));
  input.addEventListener('blur', () => {
    setTimeout(() => dropdown.classList.remove('show'), 200);
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
}