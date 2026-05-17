/* ── Particles Canvas ─────────────────────────────────────────────── */

(function initParticles() {
  const c = document.getElementById('particles');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, particles = [];

  function resize() { w = c.width = innerWidth; h = c.height = innerHeight; }
  resize(); window.addEventListener('resize', resize);

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
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(138,43,226,${1 - dist / 180})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── Code Tabs ────────────────────────────────────────────────────── */

function highlightZing(src) {
  return src
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(\/\/.*)/g, '<span class="cm">$1</span>')
    .replace(/\b(import|let)\b/g, '<span class="kw">$1</span>')
    .replace(/\b(print)\b/g, '<span class="fn">$1</span>')
    .replace(/\b(?:json|crypto)\b/g, '<span class="mod">$&</span>')
    .replace(/"([^"]*)"/g, '<span class="str">"$1"</span>')
    .replace(/\b(\d+)\b/g, '<span class="int">$1</span>');
}

const CODE_SAMPLES = [
  {
    file: 'hello.zing',
    code: highlightZing(
`// Primul tau program ZingLang
let nume = "ZingLang";
let versiune = "1.0.0";

print("Salut, ", nume);
print("Versiune: ", versiune);

let x = 10;
print(x + 5);  // → 15`)
  },
  {
    file: 'json.zing',
    code: highlightZing(
`import "json";

let text = '{"user": "Mihai", "pass": "secret123"}';

let data = json.parse(text);
print("Utilizator:", data.user);
print("Parola:", data.pass);`)
  },
  {
    file: 'crypto.zing',
    code: highlightZing(
`import "crypto";

let parola = "parola_mea_secreta";
let hash = crypto.hash_password(parola);
print("Hash generat:", hash);

let ok = crypto.verify_password(parola, hash);
print("Parola corecta?", ok); // → true`)
  }
];

function switchTab(index) {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((t, i) => t.classList.toggle('active', i === index));
  const el = document.getElementById('editor-code');
  const fn = document.getElementById('editor-filename');
  if (el && CODE_SAMPLES[index]) {
    el.innerHTML = CODE_SAMPLES[index].code;
    if (fn) fn.textContent = CODE_SAMPLES[index].file;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab');
  if (tabs.length) {
    tabs.forEach(t => t.addEventListener('click', () => switchTab(parseInt(t.dataset.tab))));
    switchTab(0);
  }
});

/* ── Copy Install Command ─────────────────────────────────────────── */

function copyInstall() {
  const btn = document.querySelector('.copy-btn');
  const cmd = document.getElementById('install-cmd');
  if (!btn || !cmd) return;
  navigator.clipboard.writeText(cmd.textContent.trim()).then(() => {
    btn.innerHTML = '<i class="bi bi-check-lg mr-1"></i>Copiat!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = '<i class="bi bi-clipboard mr-1"></i>Copiaz\u0103';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {});
}

/* ── Package Registry Explorer ────────────────────────────────────── */

const REGISTRY_URL = 'packages.json';

async function loadPackages() {
  const grid = document.getElementById('package-grid');
  if (!grid) return;
  try {
    const resp = await fetch(REGISTRY_URL);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    const entries = Object.entries(data.packages || {});
    if (!entries.length) {
      grid.innerHTML = '<div class="loading text-center py-16 text-[#8b8b9e]"><i class="bi bi-inbox mr-2"></i>Nu s-au g\u0103sit pachete.</div>';
      return;
    }
    grid.innerHTML = entries.sort(([a], [b]) => a.localeCompare(b)).map(([name, info]) => {
      const version = info.latest || (info.versions ? Object.keys(info.versions).sort().pop() : '?');
      const desc = info.description || '';
      return '<div class="pkg-card">'
        + '<div class="flex items-baseline gap-3 mb-2">'
        + '<span class="font-mono font-bold text-lg text-[#8a2be2]">' + esc(name) + '</span>'
        + '<span class="font-mono text-xs text-[#8b8b9e] bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10">v' + esc(version) + '</span>'
        + '</div>'
        + '<div class="text-[#8b8b9e] text-sm mb-4">' + esc(desc) + '</div>'
        + '<code class="pkg-install inline-block bg-white/5 px-4 py-1.5 rounded-lg font-mono text-xs text-[#00ff66] cursor-pointer transition-colors hover:bg-white/10" data-cmd="zpm install ' + esc(name) + '">'
        + '<i class="bi bi-terminal mr-1.5"></i>zpm install ' + esc(name)
        + '</code>'
        + '</div>';
    }).join('');
    document.querySelectorAll('.pkg-install').forEach(el => {
      el.addEventListener('click', function () {
        navigator.clipboard.writeText(this.dataset.cmd).then(() => {
          const orig = this.innerHTML;
          this.innerHTML = '<i class="bi bi-check-lg mr-1.5"></i>Copiat!';
          setTimeout(() => { this.innerHTML = orig; }, 1500);
        }).catch(() => {});
      });
    });
  } catch (err) {
    grid.innerHTML = '<div class="loading text-center py-16 text-[#8b8b9e]"><i class="bi bi-exclamation-triangle mr-2"></i>Eroare la \u00eenc\u0103rcarea pachetelor: ' + esc(err.message) + '</div>';
  }
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadPackages);
