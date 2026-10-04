import { searchShortcut } from './keyboard';
type SearchEntry = { title: string; description: string; text: string; url: string; external: boolean };
let entries: SearchEntry[] | null = null;
let searchRequest: Promise<SearchEntry[]> | null = null;

function savedTheme() {
  try {
    const theme = localStorage.getItem('theme');
    return theme === 'light' || theme === 'dark' ? theme : null;
  } catch { return null; }
}
function applyTheme() {
  const preference = savedTheme();
  const dark = preference ? preference === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const label = `Switch to ${dark ? 'light' : 'dark'} mode`;
  document.getElementById('theme-toggle')?.setAttribute('aria-label', label);
  document.getElementById('theme-toggle')?.setAttribute('title', label);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b0b0b' : '#ffffff');
}

function positionTooltip(wrapper: HTMLElement) {
  const tooltip = wrapper.querySelector<HTMLElement>('.nav-tooltip-text')!;
  const width = tooltip.offsetWidth;
  if (!width) return;
  const anchor = wrapper.getBoundingClientRect();
  const left = Math.max(16, Math.min(anchor.left + (anchor.width - width) / 2, document.documentElement.clientWidth - width - 16));
  tooltip.style.left = `${left - anchor.left}px`;
}

function setup() {
  applyTheme();
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform || '';
  const shortcut = searchShortcut(platform, navigator.userAgent);
  document.querySelectorAll('[data-search-shortcut]').forEach(hint => { hint.textContent = shortcut.label; });
  const searchButton = document.querySelector('.search-trigger');
  searchButton?.setAttribute('title', `Search (${shortcut.label})`);
  searchButton?.setAttribute('aria-label', `Search this site (${shortcut.label})`);
  searchButton?.setAttribute('aria-keyshortcuts', shortcut.keys);
  document.querySelectorAll<HTMLElement>('[data-tag-filter]').forEach(section => {
    section.addEventListener('click', event => {
      const button = (event.target as Element).closest<HTMLButtonElement>('button[data-filter]');
      if (!button || !section.contains(button)) return;
      const selected = button.dataset.filter || '';
      let visible = 0;
      section.querySelectorAll<HTMLElement>('[data-tag-item]').forEach(item => {
        const tags: string[] = JSON.parse(item.dataset.tags || '[]');
        item.hidden = Boolean(selected) && !tags.includes(selected);
        if (!item.hidden) visible++;
      });
      section.querySelectorAll<HTMLButtonElement>('.tag-filters button').forEach(filter => {
        filter.setAttribute('aria-pressed', String(filter.dataset.filter === selected));
      });
      section.querySelectorAll<HTMLElement>('[data-tag-group]').forEach(group => {
        group.hidden = !Array.from(group.querySelectorAll<HTMLElement>('[data-tag-item]')).some(item => !item.hidden);
      });
      section.querySelector<HTMLElement>('.filter-empty')!.hidden = visible !== 0;
      section.querySelector<HTMLElement>('.filter-status')!.textContent = `${visible} ${visible === 1 ? 'item' : 'items'} shown${selected ? ` for ${button.textContent}` : ''}.`;
    });
  });
  document.querySelectorAll<HTMLElement>('.nav-tooltip').forEach(wrapper => {
    const revealTooltip = () => {
      wrapper.classList.remove('tooltip-dismissed');
      positionTooltip(wrapper);
    };
    wrapper.addEventListener('pointerenter', revealTooltip);
    wrapper.addEventListener('focusin', revealTooltip);
    wrapper.addEventListener('keydown', event => {
      if (event.key === 'Escape') wrapper.classList.add('tooltip-dismissed');
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-gallery-preview]').forEach(button => {
    button.addEventListener('click', () => {
      button.setAttribute('aria-expanded', String(button.getAttribute('aria-expanded') !== 'true'));
    });
    button.addEventListener('blur', () => button.setAttribute('aria-expanded', 'false'));
  });
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', theme); } catch {}
    document.documentElement.dataset.theme = theme;
    const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
    document.getElementById('theme-toggle')?.setAttribute('aria-label', label);
    document.getElementById('theme-toggle')?.setAttribute('title', label);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b0b0b' : '#ffffff');
  });

  const dialog = document.getElementById('search-dialog') as HTMLDialogElement;
  const input = document.getElementById('search-input') as HTMLInputElement;
  const results = document.getElementById('search-results')!;
  const message = (text: string) => {
    const p = document.createElement('p');
    p.className = 'search-message';
    p.textContent = text;
    results.replaceChildren(p);
  };
  function showResults() {
    if (!entries) return;
    const words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = entries
      .filter(entry => words.every(word => `${entry.title} ${entry.description} ${entry.text}`.toLowerCase().includes(word)))
      .sort((a, b) => {
        const score = (entry: SearchEntry) => words.reduce((sum, word) => sum + (entry.title.toLowerCase().includes(word) ? 3 : 0) + (entry.description.toLowerCase().includes(word) ? 1 : 0), 0);
        return score(b) - score(a);
      });
    if (!matches.length) { message('No results. Try a different word or phrase.'); return; }
    results.replaceChildren(...matches.map(entry => {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = entry.url;
      if (entry.external) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      const title = document.createElement('strong');
      title.textContent = `${entry.title}${entry.external ? ' ↗' : ''}`;
      const description = document.createElement('p');
      description.textContent = entry.description;
      link.append(title, description);
      link.addEventListener('click', () => dialog.close());
      return link;
    }));
  }
  async function openSearch() {
    if (dialog.open) return;
    dialog.showModal();
    input.value = '';
    input.focus();
    if (entries) { showResults(); return; }
    message('Loading search…');
    try {
      searchRequest ??= fetch('/search.json').then(response => {
        if (!response.ok) throw new Error('Search unavailable');
        return response.json() as Promise<SearchEntry[]>;
      });
      entries = await searchRequest;
      if (dialog.isConnected) showResults();
    } catch {
      searchRequest = null;
      message('Search could not load. Please close this window and try again.');
    }
  }
  document.querySelector('.search-trigger')?.addEventListener('click', openSearch);
  document.getElementById('close-search')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  input.addEventListener('input', showResults);
  dialog.addEventListener('cancel', event => { event.preventDefault(); dialog.close(); });
}

document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', (event) => {
  const next = (event as Event & { newDocument: Document }).newDocument;
  next.documentElement.dataset.theme = document.documentElement.dataset.theme;
});
document.addEventListener('keydown', event => {
  const dialog = document.getElementById('search-dialog') as HTMLDialogElement | null;
  if (event.key === 'Escape' && dialog?.open) {
    // Handle this before a search input consumes Escape to clear its value.
    event.preventDefault();
    event.stopPropagation();
    dialog.close();
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (dialog?.open) dialog.close();
    else (document.querySelector('.search-trigger') as HTMLButtonElement | null)?.click();
  }
}, { capture: true });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (!savedTheme()) applyTheme(); });
window.addEventListener('storage', event => { if (event.key === 'theme') applyTheme(); });
window.addEventListener('resize', () => document.querySelectorAll<HTMLElement>('.nav-tooltip').forEach(positionTooltip));
