/* ─── Particles Canvas ─────────────────────────────────────────────── */

(function initParticles() {
  const c = document.getElementById('particles');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, particles = [];

  function resize() { w = c.width = innerWidth; h = c.height = innerHeight; }
  resize(); addEventListener('resize', resize);

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
      r: Math.random() * 2 + .5,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(138,43,226,.35)'; ctx.fill();
    }
    // lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(138,43,226,${1 - dist / 180})`;
          ctx.lineWidth = .5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ─── Code Tabs ────────────────────────────────────────────────────── */

const CODE_SAMPLES = [
  {
    file: 'hello.zing',
    code:
`<span class="cm">// Primul tau program ZingLang</span>
<span class="kw">let</span> nume = <span class="str">"ZingLang"</span>;
<span class="kw">let</span> versiune = <span class="str">"1.0.0"</span>;

<span class="fn">print</span>(<span class="str">"Salut, "</span>, nume);
<span class="fn">print</span>(<span class="str">"Versiune: "</span>, versiune);

<span class="kw">let</span> x = <span class="int">10</span>;
<span class="fn">print</span>(x + <span class="int">5</span>);  <span class="cm">// → 15</span>`
  },
  {
    file: 'json.zing',
    code:
`<span class="kw">import</span> <span class="str">"json"</span>;

<span class="kw">let</span> text = <span class="str">'{"user": "Mihai", "pass": "secret123"}'</span>;

<span class="kw">let</span> data = <span class="mod">json</span>.<span class="fn">parse</span>(text);
<span class="fn">print</span>(<span class="str">"Utilizator:"</span>, data.user);
<span class="fn">print</span>(<span class="str">"Parola:"</span>, data.pass);`
  },
  {
    file: 'crypto.zing',
    code:
`<span class="kw">import</span> <span class="str">"crypto"</span>;

<span class="kw">let</span> parola = <span class="str">"parola_mea_secreta"</span>;
<span class="kw">let</span> hash = <span class="mod">crypto</span>.<span class="fn">hash_password</span>(parola);
<span class="fn">print</span>(<span class="str">"Hash generat:"</span>, hash);

<span class="kw">let</span> ok = <span class="mod">crypto</span>.<span class="fn">verify_password</span>(parola, hash);
<span class="fn">print</span>(<span class="str">"Parola corecta?"</span>, ok); <span class="cm">// → true</span>`
  }
];

function switchTab(index) {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((t, i) => t.classList.toggle('active', i === index));
  const sample = CODE_SAMPLES[index];
  document.getElementById('editor-code').innerHTML = sample.code;
  document.getElementById('editor-filename').textContent = sample.file;
}

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab');
  if (tabs.length) {
    tabs.forEach(t => t.addEventListener('click', () => switchTab(parseInt(t.dataset.tab))));
    switchTab(0);
  }
});

/* ─── Copy Install Command ─────────────────────────────────────────── */

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

/* ─── Package Registry Explorer ────────────────────────────────────── */

const REGISTRY_URL = 'packages.json';

async function loadPackages() {
  const grid = document.getElementById('package-grid');
  if (!grid) return;

  try {
    const resp = await fetch(REGISTRY_URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const entries = Object.entries(data.packages || {});

    if (!entries.length) {
      grid.innerHTML = '<div class="loading">Nu s-au găsit pachete.</div>';
      return;
    }

    grid.innerHTML = entries
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, info]) => {
        const version = info.latest || (info.versions ? Object.keys(info.versions).sort().pop() : '?');
        const desc = info.description || '';
        return `
          <div class="pkg-card">
            <div class="pkg-header">
              <span class="pkg-name">${esc(name)}</span>
              <span class="pkg-version">v${esc(version)}</span>
            </div>
            <div class="pkg-desc">${esc(desc)}</div>
            <code class="pkg-install" data-cmd="zpm install ${esc(name)}">zpm install ${esc(name)}</code>
          </div>
        `;
      })
      .join('');

    // Per-card copy
    document.querySelectorAll('.pkg-install').forEach(el => {
      el.addEventListener('click', () => {
        const cmd = el.dataset.cmd;
        navigator.clipboard.writeText(cmd).then(() => {
          const orig = el.textContent;
          el.textContent = '✓ Copiat!';
          setTimeout(() => { el.textContent = orig; }, 1500);
        }).catch(() => {});
      });
    });

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
