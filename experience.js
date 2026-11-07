(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const themeKey = 'placement-compass-theme-v1';
  const body = document.body;
  const themeButton = $('#themeToggle');
  const search = $('#searchInput');
  const stageFilter = $('#stageFilter');
  const sortSelect = $('#sortSelect');
  const rows = $('#applicationRows');
  const clearSearch = $('#clearSearch');
  const resultsSummary = $('#resultsSummary');

  function applyTheme(theme) {
    const dark = theme === 'dark';
    body.dataset.theme = dark ? 'dark' : 'light';
    themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeButton.setAttribute('aria-pressed', String(dark));
    try { localStorage.setItem(themeKey, dark ? 'dark' : 'light'); } catch { /* Theme still works for this page view. */ }
  }

  try { applyTheme(localStorage.getItem(themeKey) || 'light'); } catch { applyTheme('light'); }
  themeButton.addEventListener('click', () => applyTheme(body.dataset.theme === 'dark' ? 'light' : 'dark'));

  function syncQuickFilters() {
    const value = stageFilter.value;
    $$('.quick-filter').forEach((button) => {
      const active = button.dataset.stage === value;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  $$('.quick-filter').forEach((button) => button.addEventListener('click', () => {
    stageFilter.value = button.dataset.stage;
    stageFilter.dispatchEvent(new Event('change', { bubbles: true }));
    syncQuickFilters();
  }));
  stageFilter.addEventListener('change', syncQuickFilters);

  clearSearch.addEventListener('click', () => {
    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    search.focus();
  });
  search.addEventListener('input', () => { clearSearch.hidden = !search.value; });

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const typing = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    if (!typing && event.key === '/') {
      event.preventDefault();
      search.focus();
    }
    if (!typing && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
      event.preventDefault();
      $('#openForm').click();
    }
    if (event.key === 'Escape' && target === search && search.value) {
      search.value = '';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  function dateValue(text) {
    const parsed = Date.parse(text);
    return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
  }

  function sortRows() {
    if (!rows || !sortSelect) return;
    const current = [...rows.rows];
    const sorted = current.slice().sort((a, b) => {
      if (sortSelect.value === 'company') return a.cells[0].querySelector('strong').textContent.localeCompare(b.cells[0].querySelector('strong').textContent);
      if (sortSelect.value === 'followup') return dateValue(a.cells[4].textContent) - dateValue(b.cells[4].textContent);
      return dateValue(b.cells[3].textContent) - dateValue(a.cells[3].textContent);
    });
    if (sorted.some((row, index) => row !== current[index])) rows.append(...sorted);
  }

  sortSelect.addEventListener('change', sortRows);

  function updateSummary() {
    const visible = Number($('#visibleCount')?.textContent || 0);
    const total = rows?.rows.length || 0;
    // The full count comes from the live dashboard stat, not the filtered table.
    const all = Number($('#totalStat')?.textContent || total);
    resultsSummary.textContent = visible === all ? `${all} ${all === 1 ? 'opportunity' : 'opportunities'}` : `Showing ${visible} of ${all} opportunities`;
    sortRows();
  }

  if (rows) new MutationObserver(updateSummary).observe(rows, { childList: true });
  const count = $('#visibleCount');
  if (count) new MutationObserver(updateSummary).observe(count, { childList: true, characterData: true, subtree: true });
  updateSummary();

  // Keep the workspace navigation in sync with the section the user selects.
  $$('.nav-link').forEach((link) => link.addEventListener('click', () => {
    $$('.nav-link').forEach((item) => item.classList.toggle('selected', item === link));
  }));
})();
