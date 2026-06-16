// ============================================================
//  AI MASTERY ROADMAP — APP.JS
// ============================================================

const STORAGE_KEY = 'ai-roadmap-progress-v1';

// ── Progress helpers ─────────────────────────────────────────
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function saveProgress(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

let progress = loadProgress();

function toggleDay(dayNum) {
  progress[dayNum] = !progress[dayNum];
  saveProgress(progress);
  updateAllProgress();
  // update this card's visual state
  const card = document.getElementById(`day-${dayNum}`);
  if (card) {
    card.classList.toggle('done', !!progress[dayNum]);
    const btn = card.querySelector('.complete-btn');
    if (btn) btn.textContent = progress[dayNum] ? '✓ Completed' : 'Mark Complete';
  }
}

function updateAllProgress() {
  const total = 60;
  const done = Object.values(progress).filter(Boolean).length;
  const pct = Math.round((done / total) * 100);

  // Hero ring
  document.getElementById('progressPct').textContent = pct + '%';
  drawRing(pct);

  // Panel
  document.getElementById('ppDone').textContent = done;
  document.getElementById('ppLeft').textContent = total - done;
  document.getElementById('ppPct2').textContent = pct + '%';

  // Dot grid
  document.querySelectorAll('.pp-dot').forEach(dot => {
    const d = parseInt(dot.dataset.day);
    dot.classList.toggle('done', !!progress[d]);
  });
}

function drawRing(pct) {
  const canvas = document.getElementById('progressRing');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 120, cx = 60, cy = 60, r = 48, lw = 8;
  ctx.clearRect(0, 0, size, size);

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#1f1f35';
  ctx.lineWidth = lw;
  ctx.stroke();

  // Fill
  if (pct > 0) {
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#10b981');
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * pct / 100));
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

// ── Progress panel ────────────────────────────────────────────
function toggleProgress() {
  document.getElementById('progressPanel').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
}

function resetProgress() {
  if (confirm('Reset all progress? This cannot be undone.')) {
    progress = {};
    saveProgress(progress);
    updateAllProgress();
    document.querySelectorAll('.day-card').forEach(c => {
      c.classList.remove('done');
      const btn = c.querySelector('.complete-btn');
      if (btn) btn.textContent = 'Mark Complete';
    });
  }
}

// ── Render curriculum ─────────────────────────────────────────
function tagClass(tag) {
  const map = { theory: 'tag-theory', practice: 'tag-practice', project: 'tag-project', deep: 'tag-deep' };
  return map[tag] || 'tag-theory';
}

function tagLabel(tag) {
  const map = { theory: 'Theory', practice: 'Practice', project: 'Project', deep: 'Deep Dive' };
  return map[tag] || tag;
}

function badgeClass(badge) {
  const map = { yt: 'badge-yt', doc: 'badge-doc', course: 'badge-course', tool: 'badge-tool', paper: 'badge-paper' };
  return map[badge] || 'badge-doc';
}

function badgeLabel(badge) {
  const map = { yt: 'YouTube', doc: 'Docs', course: 'Course', tool: 'Tool', paper: 'Paper' };
  return map[badge] || badge;
}

function renderCurriculum() {
  const container = document.getElementById('days-container');
  if (!container) return;

  let html = '';

  MODULES.forEach((mod, mi) => {
    html += `
      <div class="module-header fade-in" id="${mod.id}">
        <div class="module-num">Module ${mi + 1} / 8</div>
        <div class="module-header-info">
          <h2>${mod.title}</h2>
          <p>${mod.subtitle}</p>
        </div>
      </div>
    `;

    mod.days.forEach(day => {
      const isDone = !!progress[day.day];
      html += `
        <div class="day-card fade-in${isDone ? ' done' : ''}" id="day-${day.day}">
          <div class="day-header" onclick="toggleCard(${day.day})">
            <div class="day-check" onclick="event.stopPropagation(); toggleDay(${day.day})">
              ${isDone ? '✓' : ''}
            </div>
            <span class="day-num">Day ${day.day}</span>
            <span class="day-title">${day.title}</span>
            <span class="day-tag ${tagClass(day.tag)}">${tagLabel(day.tag)}</span>
            <span class="day-chevron">▾</span>
          </div>
          <div class="day-body">
            <div class="concepts-section">
              <h4>Key Concepts</h4>
              <ul class="concepts-list">
                ${day.concepts.map(c => `<li>${c}</li>`).join('')}
              </ul>
            </div>

            ${day.terms && day.terms.length ? `
            <div class="terms-row">
              ${day.terms.map(t => `<span class="term-chip">${t}</span>`).join('')}
            </div>` : ''}

            <div class="links-section">
              <h4>Resources & Links</h4>
              <div class="link-list">
                ${day.links.map(l => `
                  <div class="link-item">
                    <span class="link-badge ${badgeClass(l.badge)}">${badgeLabel(l.badge)}</span>
                    <a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>
                  </div>
                `).join('')}
              </div>
            </div>

            ${day.practice ? `
            <div class="practice-box">
              <h4>⚡ Today's Practice</h4>
              <p>${day.practice}</p>
            </div>` : ''}

            <button class="complete-btn" onclick="toggleDay(${day.day})">
              ${isDone ? '✓ Completed' : 'Mark Complete'}
            </button>
          </div>
        </div>
      `;
    });
  });

  container.innerHTML = html;
  observeFadeIns();
}

function toggleCard(dayNum) {
  const card = document.getElementById(`day-${dayNum}`);
  if (card) card.classList.toggle('open');
}

// ── Render resources ──────────────────────────────────────────
function renderResources() {
  const grid = document.getElementById('resources-grid');
  if (!grid) return;
  grid.innerHTML = RESOURCES.map(r => `
    <div class="resource-card fade-in">
      <span class="rc-type" style="color:${r.color}">${r.type}</span>
      <h4>${r.name}</h4>
      <p>${r.desc}</p>
      <a href="${r.url}" target="_blank" rel="noopener">${r.url.replace('https://', '')}</a>
    </div>
  `).join('');
}

// ── Render tools ──────────────────────────────────────────────
function renderTools() {
  const grid = document.getElementById('tools-grid');
  if (!grid) return;
  grid.innerHTML = TOOLS.map(t => `
    <div class="tool-card fade-in">
      <span class="tool-icon">${t.icon}</span>
      <h4>${t.name}</h4>
      <p>${t.desc}</p>
      <a href="${t.url}" target="_blank" rel="noopener">${t.url.replace('https://', '')}</a>
    </div>
  `).join('');
}

// ── Render progress dot grid ──────────────────────────────────
function renderProgressGrid() {
  const grid = document.getElementById('ppGrid');
  if (!grid) return;
  let html = '';
  for (let i = 1; i <= 60; i++) {
    html += `<div class="pp-dot${progress[i] ? ' done' : ''}" data-day="${i}" title="Day ${i}">${i}</div>`;
  }
  grid.innerHTML = html;
}

// ── Module scroll helper ──────────────────────────────────────
function scrollToModule(id) {
  const el = document.getElementById(id);
  if (el) {
    document.getElementById('week-by-week').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  }
}

// ── Intersection observer for fade-in ────────────────────────
function observeFadeIns() {
  const els = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.07 });
  els.forEach(el => observer.observe(el));
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCurriculum();
  renderResources();
  renderTools();
  renderProgressGrid();
  updateAllProgress();
  drawRing(0);
  observeFadeIns();
});
