// ─── Package Registry Explorer ───
// Fetches packages.json and renders cards dynamically.

const REGISTRY_URL = 'packages.json';

function copyInstall() {
  const btn = document.querySelector('.copy-btn');
  const cmd = document.querySelector('.install-cmd');
  if (!btn || !cmd) return;
  navigator.clipboard.writeText(cmd.textContent.trim()).then(() => {
    btn.textContent = 'Copiat!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copiază'; btn.classList.remove('copied'); }, 2000);
  }).catch(() => {});
}

async function loadPackages() {
  const grid = document.getElementById('package-grid');
  if (!grid) return;

  try {
    const resp = await fetch(REGISTRY_URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const data = await resp.json();
    const entries = Object.entries(data.packages || {});

    if (entries.length === 0) {
      grid.innerHTML = '<div class="loading">Nu s-au găsit pachete.</div>';
      return;
    }

    grid.innerHTML = entries
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, info]) => {
        const version = info.latest || Object.keys(info.versions || {}).sort().pop() || '?';
        const desc = info.description || '';
        return `
          <div class="pkg-card">
            <div class="pkg-header">
              <span class="pkg-name">${esc(name)}</span>
              <span class="pkg-version">v${esc(version)}</span>
            </div>
            <div class="pkg-desc">${esc(desc)}</div>
            <code class="pkg-install">zpm install ${esc(name)}</code>
          </div>
        `;
      })
      .join('');
  } catch (err) {
    grid.innerHTML = `<div class="loading">Eroare la încărcarea pachetelor: ${esc(err.message)}</div>`;
  }
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadPackages);
