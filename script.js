/* ============================ USA · Emploi du temps ============================ */
/* Dates AUTO (semaine en cours) + horaires GLOBAUX fixes (memes pour tous les jours).
   Les jours ne gerent que les matieres. Sauvegarde auto (localStorage) + export/import. */

const DEFAULT = {
  meta: {
    title: "UNIVERSITY OF SAN ANDREAS",
    subtitle: "EMPLOI DU TEMPS – SEMESTRE D'ÉTÉ",
    badge: "USA",
    foot: "ORGANISE TON AVENIR. VIS TA PASSION. DEVIENS LÉGENDAIRE.",
    badges: "EXCELLENCE • INTÉGRITÉ • COMMUNAUTÉ"
  },
  classes: ["ALPHA", "OMEGA", "SIGMA", "DELTA"],
  subjects: {
    science:  { name: "SCIENCE",       prof: "Dr. Elias Krüger",       color: "#2f6fd0", icon: "🧪" },
    histoire: { name: "HISTOIRE/GEO",   prof: "Prof. Arthur Wood",      color: "#5560c0", icon: "📖" },
    info:     { name: "INFORMATIQUE",   prof: "Prof. Walter Newman",    color: "#2f86e0", icon: "💻" },
    sport:    { name: "SPORT",          prof: "Coach Jonas Dubois",     color: "#d0443a", icon: "🏃" },
    socio:    { name: "SOCIOLOGIE",     prof: "Prof. Oliver Monroe",    color: "#c9a44a", icon: "👥" },
    theatre:  { name: "THÉÂTRE",        prof: "Prof. Eugène Sauvignac", color: "#9b6fd0", icon: "🎭" },
    art:      { name: "ART PLASTIQUE",  prof: "Pr. Dick Dawnson",       color: "#e08a3c", icon: "🎨" },
    eco:      { name: "ÉCONOMIE",       prof: "Prof. Henry Schultz",    color: "#43a96b", icon: "📈" }
  },
  // horaires globaux (memes pour chaque jour) — slots avec ID stable
  slots: [
    { id: "c1", time: "21h15 - 21h40", type: "class" },
    { id: "c2", time: "21h40 - 22h05", type: "class" },
    { id: "b1", time: "22h05 - 22h35", type: "break", label: "REPAS", duration: "30 min", color: "#9a7b2f", icon: "🍴" },
    { id: "c3", time: "22h35 - 23h00", type: "class" },
    { id: "c4", time: "23h00 - 23h25", type: "class" },
    { id: "b2", time: "23h25 - 23h55", type: "break", label: "RÉCRÉATION", duration: "30 min", color: "#5a4fa0", icon: "🏃" }
  ],
  // jours : grille des matieres par slot de cours (clef = id du slot)
  // construit selon les dispos profs ; jamais 2x la meme matiere sur un creneau ; variete chaque jour
  days: [
    { day: "Mercredi", grid: {
      c1: { ALPHA: "science", OMEGA: "eco", SIGMA: "theatre", DELTA: "art" },
      c2: { ALPHA: "eco", OMEGA: "science", SIGMA: "art", DELTA: "sport" },
      c3: { ALPHA: "art", OMEGA: "info", SIGMA: "histoire", DELTA: "eco" },
      c4: { ALPHA: "theatre", OMEGA: "art", SIGMA: "eco", DELTA: "info" }
    }},
    { day: "Jeudi", grid: {
      c1: { ALPHA: "science", OMEGA: "theatre", SIGMA: "socio", DELTA: "histoire" },
      c2: { ALPHA: "theatre", OMEGA: "science", SIGMA: "histoire", DELTA: "socio" },
      c3: { ALPHA: "socio", OMEGA: "histoire", SIGMA: "theatre", DELTA: "science" },
      c4: { ALPHA: "histoire", OMEGA: "socio", SIGMA: "science", DELTA: "theatre" }
    }},
    { day: "Samedi", grid: {
      c1: { ALPHA: "sport", OMEGA: "theatre", SIGMA: "art", DELTA: "socio" },
      c2: { ALPHA: "art", OMEGA: "histoire", SIGMA: "info", DELTA: "theatre" },
      c3: { ALPHA: "socio", OMEGA: "art", SIGMA: "sport", DELTA: "histoire" },
      c4: { ALPHA: "info", OMEGA: "sport", SIGMA: "science", DELTA: "art" }
    }},
    { day: "Dimanche", grid: {
      c1: { ALPHA: "info", OMEGA: "socio", SIGMA: "science", DELTA: "sport" },
      c2: { ALPHA: "sport", OMEGA: "info", SIGMA: "socio", DELTA: "science" },
      c3: { ALPHA: "science", OMEGA: "sport", SIGMA: "info", DELTA: "socio" },
      c4: { ALPHA: "socio", OMEGA: "science", SIGMA: "sport", DELTA: "info" }
    }}
  ]
};

const KEY = 'usa_edt_v5';
const $ = (s) => document.querySelector(s);
let data, editMode = false;

const clone = (o) => JSON.parse(JSON.stringify(o));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

/* ---- dates automatiques (semaine en cours, lundi -> dimanche) ---- */
const WD = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const WD_ABBR = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const stripA = (s) => String(s || '').toLowerCase().trim();
function weekdayIndex(name) { return WD.findIndex(w => stripA(w) === stripA(name)); }
function dateForDay(name) {
  const wi = weekdayIndex(name); if (wi < 0) return '';
  const now = new Date();
  const monday = new Date(now); monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // lundi de la semaine
  const t = new Date(monday); t.setDate(monday.getDate() + ((wi + 6) % 7)); // wi: dim=0..sam=6
  return `${WD_ABBR[wi]} ${t.getDate()} ${MONTHS[t.getMonth()]}`;
}

function load() {
  try { const r = localStorage.getItem(KEY); if (r) { data = JSON.parse(r); return; } } catch (e) {}
  data = clone(DEFAULT);
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }

/* ---------------------- RENDU ---------------------- */
function renderMeta() {
  $('#title').textContent = data.meta.title;
  $('#subtitle').textContent = data.meta.subtitle;
  $('#badge').textContent = data.meta.badge;
  $('#footMain').textContent = '🎓 ' + data.meta.foot;
  $('#footBadges').textContent = data.meta.badges;
  document.title = 'USA · ' + data.meta.subtitle;
}
function cardHTML(subjId) {
  const s = data.subjects[subjId];
  if (!s) return `<div class="card empty">—</div>`;
  return `<div class="card" style="--c:${esc(s.color)}"><span class="ico">${esc(s.icon)}</span>
    <div><div class="subj">${esc(s.name)}</div><div class="prof">${esc(s.prof)}</div></div></div>`;
}
function breakRowHTML(slot) {
  return `<tr class="break"><td class="jour"></td><td class="date"></td>
    <td class="time">${esc(slot.time)}</td>
    <td colspan="${data.classes.length}" style="--c:${esc(slot.color)}"><span class="ico">${esc(slot.icon)}</span><b>${esc(slot.label)}</b> <span class="dur">- ${esc(slot.duration)}</span></td></tr>`;
}
function classRowHTML(slot, day, di) {
  const cl = data.classes;
  const g = (day.grid && day.grid[slot.id]) || {};
  const date = dateForDay(day.day);
  const head = `<td class="jour">${esc(day.day)}</td><td class="date">${esc(date)}</td><td class="time">${esc(slot.time)}</td>`;
  if (!editMode) return `<tr>${head}${cl.map(c => `<td>${cardHTML(g[c])}</td>`).join('')}</tr>`;
  return `<tr>${head}${cl.map(c => {
    const cur = g[c] || '';
    const opts = `<option value="">— vide —</option>` + Object.keys(data.subjects).map(id =>
      `<option value="${id}" ${cur === id ? 'selected' : ''}>${esc(data.subjects[id].name)}</option>`).join('');
    const pf = cur && data.subjects[cur] ? esc(data.subjects[cur].prof) : '';
    return `<td class="ed"><div class="cellpick"><select data-d="${di}" data-s="${slot.id}" data-c="${c}">${opts}</select><div class="pf">${pf}</div></div></td>`;
  }).join('')}</tr>`;
}
function dayHTML(day, di) {
  const cl = data.classes;
  const head = `<thead><tr><th>JOUR</th><th>DATE</th><th>CRÉNEAU</th>${cl.map(c => `<th class="cl">${esc(c)}</th>`).join('')}</tr></thead>`;
  let bar = '';
  if (editMode) {
    const opts = WD.map(w => `<option value="${w}" ${stripA(w) === stripA(day.day) ? 'selected' : ''}>${w}</option>`).join('');
    bar = `<div class="day-edit">
      <select class="di-day" data-d="${di}" data-k="day">${opts}</select>
      <span class="date">→ ${esc(dateForDay(day.day)) || '(jour invalide)'}</span>
      <span class="spacer"></span>
      <button class="mini del" data-act="delday" data-d="${di}">🗑 supprimer jour</button>
    </div>`;
  }
  const rows = data.slots.map(slot => slot.type === 'break' ? breakRowHTML(slot) : classRowHTML(slot, day, di)).join('');
  return `<div class="daygrid">${bar}<table>${head}<tbody>${rows}</tbody></table></div>`;
}
function render() {
  renderMeta();
  $('#board').innerHTML = data.days.map((d, i) => dayHTML(d, i)).join('');
}

/* ---------------------- EDITION (jours) ---------------------- */
function onBoardClick(e) {
  const b = e.target.closest('[data-act]'); if (!b) return;
  if (b.dataset.act === 'delday') {
    if (!confirm('Supprimer ce jour ?')) return;
    data.days.splice(+b.dataset.d, 1); save(); render();
  }
}
function onBoardChange(e) {
  const t = e.target;
  if (t.dataset.c !== undefined && t.tagName === 'SELECT') {       // matiere d'une case
    const day = data.days[+t.dataset.d];
    if (!day.grid) day.grid = {};
    if (!day.grid[t.dataset.s]) day.grid[t.dataset.s] = {};
    day.grid[t.dataset.s][t.dataset.c] = t.value;
    save(); render();
  } else if (t.dataset.k === 'day') {                              // jour de la semaine
    data.days[+t.dataset.d].day = t.value; save(); render();
  }
}

/* ---------------------- HORAIRES (slots globaux) ---------------------- */
function renderSlots() {
  const wrap = $('#slotsList'); wrap.innerHTML = '';
  data.slots.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'slot-row';
    const tools = `<button class="mini" data-slotmove="${i}" data-dir="-1">↑</button>
      <button class="mini" data-slotmove="${i}" data-dir="1">↓</button>
      <button class="mini del" data-delslot="${i}">✕</button>`;
    if (s.type === 'break') {
      row.innerHTML = `<input type="text" class="sl-time" data-i="${i}" data-k="time" value="${esc(s.time)}">
        <span class="sl-tag break">PAUSE</span>
        <span class="sl-extra">
          <input type="text" class="sl-label" data-i="${i}" data-k="label" value="${esc(s.label)}">
          <input type="text" class="sl-dur" data-i="${i}" data-k="duration" value="${esc(s.duration)}">
          <input type="color" data-i="${i}" data-k="color" value="${esc(s.color)}">
          <input type="text" class="sl-ico" data-i="${i}" data-k="icon" value="${esc(s.icon)}">
        </span>${tools}`;
    } else {
      row.innerHTML = `<input type="text" class="sl-time" data-i="${i}" data-k="time" value="${esc(s.time)}">
        <span class="sl-tag class">COURS</span><span class="sl-extra"></span>${tools}`;
    }
    wrap.appendChild(row);
  });
}
function onSlotsInput(e) {
  const t = e.target; if (t.dataset.i === undefined) return;
  data.slots[+t.dataset.i][t.dataset.k] = t.value;
  save(); render();
}
function onSlotsClick(e) {
  const mv = e.target.closest('[data-slotmove]');
  const del = e.target.closest('[data-delslot]');
  if (mv) {
    const i = +mv.dataset.slotmove, j = i + (+mv.dataset.dir);
    if (j < 0 || j >= data.slots.length) return;
    const a = data.slots; [a[i], a[j]] = [a[j], a[i]];
    save(); renderSlots(); render();
  } else if (del) {
    if (!confirm('Supprimer ce créneau pour tous les jours ?')) return;
    const id = data.slots[+del.dataset.delslot].id;
    data.slots.splice(+del.dataset.delslot, 1);
    if (id) data.days.forEach(d => { if (d.grid) delete d.grid[id]; });
    save(); renderSlots(); render();
  }
}
function addSlot() { data.slots.push({ id: 'c' + Date.now().toString(36), time: "00h00 - 00h00", type: "class" }); save(); renderSlots(); render(); }
function addBreak() { data.slots.push({ id: 'b' + Date.now().toString(36), time: "00h00 - 00h00", type: "break", label: "PAUSE", duration: "30 min", color: "#5a4fa0", icon: "⏸" }); save(); renderSlots(); render(); }

/* ---------------------- MATIÈRES ---------------------- */
function renderSubjects() {
  const wrap = $('#subjectsList'); wrap.innerHTML = '';
  Object.keys(data.subjects).forEach(id => {
    const s = data.subjects[id];
    const row = document.createElement('div'); row.className = 'subj-row';
    row.innerHTML = `<div class="swatch" style="background:${esc(s.color)}"></div>
      <input type="text" class="si-ico" data-id="${id}" data-k="icon" value="${esc(s.icon)}">
      <input type="text" class="si-name" data-id="${id}" data-k="name" value="${esc(s.name)}">
      <input type="text" class="si-prof" data-id="${id}" data-k="prof" value="${esc(s.prof)}">
      <input type="color" data-id="${id}" data-k="color" value="${esc(s.color)}">
      <button class="mini del" data-delsubj="${id}">✕</button>`;
    wrap.appendChild(row);
  });
}
function onSubjectsInput(e) {
  const t = e.target; if (!t.dataset.id) return;
  data.subjects[t.dataset.id][t.dataset.k] = t.value;
  if (t.dataset.k === 'color') { const sw = t.parentElement.querySelector('.swatch'); if (sw) sw.style.background = t.value; }
  save(); render();
}
function onSubjectsClick(e) {
  const del = e.target.closest('[data-delsubj]'); if (!del) return;
  if (!confirm('Supprimer cette matière ? Elle sera retirée des créneaux.')) return;
  const id = del.dataset.delsubj;
  delete data.subjects[id];
  data.days.forEach(d => { if (d.grid) Object.values(d.grid).forEach(g => data.classes.forEach(c => { if (g[c] === id) g[c] = ''; })); });
  save(); renderSubjects(); render();
}
function addSubject() {
  data.subjects['m' + Date.now().toString(36)] = { name: "NOUVELLE MATIÈRE", prof: "Prof.", color: "#3f7fd0", icon: "📚" };
  save(); renderSubjects(); render();
}

/* ---------------------- TEXTES ---------------------- */
function openTexts() {
  $('#tTitle').value = data.meta.title; $('#tSubtitle').value = data.meta.subtitle;
  $('#tBadge').value = data.meta.badge; $('#tFoot').value = data.meta.foot; $('#tBadges').value = data.meta.badges;
  $('#textsModal').classList.add('on');
}
function saveTexts() {
  data.meta.title = $('#tTitle').value; data.meta.subtitle = $('#tSubtitle').value;
  data.meta.badge = $('#tBadge').value; data.meta.foot = $('#tFoot').value; data.meta.badges = $('#tBadges').value;
  save(); renderMeta(); $('#textsModal').classList.remove('on');
}

/* ---------------------- IMPORT / EXPORT ---------------------- */
function exportJSON() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'emploi_du_temps.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 500);
}
function importJSON(file) {
  const fr = new FileReader();
  fr.onload = () => { try { data = JSON.parse(fr.result); save(); render(); alert('Importé ✔'); } catch (e) { alert('Fichier JSON invalide.'); } };
  fr.readAsText(file);
}
function resetAll() { if (confirm('Tout réinitialiser à l’emploi du temps de base ?')) { data = clone(DEFAULT); save(); render(); } }

/* ---------------------- INIT ---------------------- */
function toggleEdit() {
  editMode = !editMode;
  document.body.classList.toggle('editing', editMode);
  $('#btnEdit').textContent = editMode ? '✓ Terminer' : '✎ Modifier';
  render();
}
function init() {
  load(); render();
  if (location.search.includes('clean')) document.body.classList.add('clean'); // vue propre (capture)
  $('#btnEdit').addEventListener('click', toggleEdit);
  $('#btnAddDay').addEventListener('click', () => { data.days.push({ day: "Lundi", grid: {} }); save(); render(); });
  $('#btnSlots').addEventListener('click', () => { renderSlots(); $('#slotsModal').classList.add('on'); });
  $('#btnSubjects').addEventListener('click', () => { renderSubjects(); $('#subjectsModal').classList.add('on'); });
  $('#btnTexts').addEventListener('click', openTexts);
  $('#btnExport').addEventListener('click', exportJSON);
  $('#btnImport').addEventListener('click', () => $('#fileImport').click());
  $('#fileImport').addEventListener('change', (e) => { if (e.target.files[0]) importJSON(e.target.files[0]); e.target.value = ''; });
  $('#btnReset').addEventListener('click', resetAll);

  $('#board').addEventListener('click', onBoardClick);
  $('#board').addEventListener('change', onBoardChange);

  $('#slotsList').addEventListener('input', onSlotsInput);
  $('#slotsList').addEventListener('click', onSlotsClick);
  $('#addSlot').addEventListener('click', addSlot);
  $('#addBreak').addEventListener('click', addBreak);

  $('#subjectsList').addEventListener('input', onSubjectsInput);
  $('#subjectsList').addEventListener('click', onSubjectsClick);
  $('#addSubject').addEventListener('click', addSubject);
  $('#saveTexts').addEventListener('click', saveTexts);

  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('.modal').classList.remove('on')));
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', (e) => { if (e.target === m) m.classList.remove('on'); }));
}
init();
