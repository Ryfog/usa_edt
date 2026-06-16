/* ============================ USA · Emploi du temps ============================ */
/* Gestionnaire d'emploi du temps editable. Donnees en localStorage (auto-save),
   export/import JSON. Tout se gere depuis le mode edition. */

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
    science:  { name: "SCIENCE",       prof: "Dr. Elias Krüger",      color: "#2f6fd0", icon: "🧪" },
    histoire: { name: "HISTOIRE/GEO",   prof: "Prof. Arthur Wood",     color: "#5560c0", icon: "📖" },
    info:     { name: "INFORMATIQUE",   prof: "Prof. Walter Newman",   color: "#2f86e0", icon: "💻" },
    sport:    { name: "SPORT",          prof: "Coach Jonas Dubois",    color: "#d0443a", icon: "🏃" },
    socio:    { name: "SOCIOLOGIE",     prof: "Prof. Oliver Monroe",   color: "#c9a44a", icon: "👥" },
    theatre:  { name: "THÉÂTRE",        prof: "Prof. Eugène Sauvignac", color: "#9b6fd0", icon: "🎭" },
    art:      { name: "ART PLASTIQUE",  prof: "Pr. Dick Dawnson",      color: "#e08a3c", icon: "🎨" },
    eco:      { name: "ÉCONOMIE",       prof: "Prof. Henry Schultz",   color: "#43a96b", icon: "📈" }
  },
  days: [
    { day: "Mardi", date: "mar. 9 juin", rows: [
      { time: "21h15 - 21h40", type: "class", cells: { ALPHA: "science", OMEGA: "histoire", SIGMA: "info", DELTA: "sport" } },
      { time: "21h40 - 22h05", type: "class", cells: { ALPHA: "histoire", OMEGA: "info", SIGMA: "socio", DELTA: "science" } },
      { time: "22h05 - 22h35", type: "break", label: "REPAS", duration: "30 min", color: "#9a7b2f", icon: "🍴" },
      { time: "22h35 - 23h00", type: "class", cells: { ALPHA: "socio", OMEGA: "sport", SIGMA: "histoire", DELTA: "theatre" } },
      { time: "23h00 - 23h25", type: "class", cells: { ALPHA: "sport", OMEGA: "socio", SIGMA: "theatre", DELTA: "histoire" } },
      { time: "23h25 - 23h55", type: "break", label: "RÉCRÉATION", duration: "30 min", color: "#5a4fa0", icon: "🏃" }
    ]},
    { day: "Mercredi", date: "mer. 10 juin", rows: [
      { time: "21h15 - 21h40", type: "class", cells: { ALPHA: "histoire", OMEGA: "science", SIGMA: "art", DELTA: "sport" } },
      { time: "21h40 - 22h05", type: "class", cells: { ALPHA: "art", OMEGA: "sport", SIGMA: "science", DELTA: "info" } },
      { time: "22h05 - 22h35", type: "break", label: "REPAS", duration: "30 min", color: "#9a7b2f", icon: "🍴" },
      { time: "22h35 - 23h00", type: "class", cells: { ALPHA: "sport", OMEGA: "histoire", SIGMA: "sport", DELTA: "art" } },
      { time: "23h00 - 23h25", type: "class", cells: { ALPHA: "info", OMEGA: "art", SIGMA: "science", DELTA: "histoire" } },
      { time: "23h25 - 23h55", type: "break", label: "RÉCRÉATION", duration: "30 min", color: "#5a4fa0", icon: "🏃" }
    ]},
    { day: "Samedi", date: "sam. 13 juin", rows: [
      { time: "21h15 - 21h40", type: "class", cells: { ALPHA: "art", OMEGA: "science", SIGMA: "eco", DELTA: "sport" } },
      { time: "21h40 - 22h05", type: "class", cells: { ALPHA: "socio", OMEGA: "eco", SIGMA: "art", DELTA: "science" } },
      { time: "22h05 - 22h35", type: "break", label: "REPAS", duration: "30 min", color: "#9a7b2f", icon: "🍴" },
      { time: "22h35 - 23h00", type: "class", cells: { ALPHA: "science", OMEGA: "art", SIGMA: "sport", DELTA: "eco" } },
      { time: "23h00 - 23h25", type: "class", cells: { ALPHA: "eco", OMEGA: "sport", SIGMA: "science", DELTA: "socio" } },
      { time: "23h25 - 23h55", type: "break", label: "RÉCRÉATION", duration: "30 min", color: "#5a4fa0", icon: "🏃" }
    ]}
  ]
};

const KEY = 'usa_edt_v1';
const $ = (s) => document.querySelector(s);
let data, editMode = false;

const clone = (o) => JSON.parse(JSON.stringify(o));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

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
  return `<div class="card" style="--c:${esc(s.color)}">
    <span class="ico">${esc(s.icon)}</span>
    <div><div class="subj">${esc(s.name)}</div><div class="prof">${esc(s.prof)}</div></div>
  </div>`;
}

function rowHTML(row, di, ri) {
  const cl = data.classes;
  if (!editMode) {
    if (row.type === 'break') {
      return `<tr class="break"><td class="jour"></td><td class="date"></td>
        <td class="time">${esc(row.time)}</td>
        <td colspan="${cl.length}" style="--c:${esc(row.color)}"><span class="ico">${esc(row.icon)}</span><b>${esc(row.label)}</b> <span class="dur">- ${esc(row.duration)}</span></td></tr>`;
    }
    return `<tr><td class="jour">${esc(data.days[di].day)}</td><td class="date">${esc(data.days[di].date)}</td>
      <td class="time">${esc(row.time)}</td>
      ${cl.map(c => `<td>${cardHTML(row.cells && row.cells[c])}</td>`).join('')}</tr>`;
  }
  // --- mode edition ---
  const delBtn = `<div class="rowtools"><button class="mini del" data-act="delrow" data-d="${di}" data-r="${ri}">✕</button></div>`;
  const timeCell = `<td class="ed timeed"><input data-d="${di}" data-r="${ri}" data-k="time" value="${esc(row.time)}">${delBtn}</td>`;
  if (row.type === 'break') {
    return `<tr class="break"><td class="jour"></td><td class="date"></td>${timeCell}
      <td colspan="${cl.length}" class="ed"><div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap">
        <input data-d="${di}" data-r="${ri}" data-k="label" value="${esc(row.label)}" style="width:160px">
        <input data-d="${di}" data-r="${ri}" data-k="duration" value="${esc(row.duration)}" style="width:90px">
        <input type="color" data-d="${di}" data-r="${ri}" data-k="color" value="${esc(row.color)}">
        <input data-d="${di}" data-r="${ri}" data-k="icon" value="${esc(row.icon)}" style="width:46px;text-align:center">
      </div></td></tr>`;
  }
  return `<tr><td class="jour">${esc(data.days[di].day)}</td><td class="date">${esc(data.days[di].date)}</td>${timeCell}
    ${cl.map(c => {
      const cur = row.cells && row.cells[c];
      const opts = `<option value="">— vide —</option>` + Object.keys(data.subjects).map(id =>
        `<option value="${id}" ${cur === id ? 'selected' : ''}>${esc(data.subjects[id].name)}</option>`).join('');
      const pf = cur && data.subjects[cur] ? esc(data.subjects[cur].prof) : '';
      return `<td class="ed"><div class="cellpick"><select data-d="${di}" data-r="${ri}" data-c="${c}">${opts}</select><div class="pf">${pf}</div></div></td>`;
    }).join('')}</tr>`;
}

function dayHTML(day, di) {
  const cl = data.classes;
  const head = `<thead><tr><th>JOUR</th><th>DATE</th><th>CRÉNEAU</th>${cl.map(c => `<th class="cl">${esc(c)}</th>`).join('')}</tr></thead>`;
  const editBar = editMode ? `<div class="day-edit">
      <input class="di-day" data-d="${di}" data-k="day" value="${esc(day.day)}">
      <input class="di-date" data-d="${di}" data-k="date" value="${esc(day.date)}">
      <span class="spacer"></span>
      <button class="mini" data-act="addrow" data-d="${di}">＋ créneau</button>
      <button class="mini" data-act="addbreak" data-d="${di}">＋ pause</button>
      <button class="mini del" data-act="delday" data-d="${di}">🗑 supprimer jour</button>
    </div>` : '';
  return `<div class="daygrid">${editBar}<table>${head}<tbody>${day.rows.map((r, ri) => rowHTML(r, di, ri)).join('')}</tbody></table></div>`;
}

function render() {
  renderMeta();
  $('#board').innerHTML = data.days.map((d, i) => dayHTML(d, i)).join('');
}

/* ---------------------- EDITION : actions ---------------------- */
function emptyCells() { const o = {}; data.classes.forEach(c => o[c] = ''); return o; }

function onBoardClick(e) {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const d = +b.dataset.d, r = +b.dataset.r;
  const act = b.dataset.act;
  if (act === 'addrow') data.days[d].rows.push({ time: "00h00 - 00h00", type: "class", cells: emptyCells() });
  else if (act === 'addbreak') data.days[d].rows.push({ time: "00h00 - 00h00", type: "break", label: "PAUSE", duration: "30 min", color: "#5a4fa0", icon: "⏸" });
  else if (act === 'delrow') data.days[d].rows.splice(r, 1);
  else if (act === 'delday') { if (confirm('Supprimer ce jour ?')) data.days.splice(d, 1); else return; }
  save(); render();
}

function onBoardInput(e) {
  const t = e.target;
  if (t.dataset.k && t.dataset.d !== undefined && t.dataset.r === undefined) {
    // day / date
    data.days[+t.dataset.d][t.dataset.k] = t.value;
  } else if (t.dataset.k && t.dataset.r !== undefined) {
    // row field (time/label/duration/color/icon)
    data.days[+t.dataset.d].rows[+t.dataset.r][t.dataset.k] = t.value;
  } else return;
  save();
}

function onBoardChange(e) {
  const t = e.target;
  if (t.dataset.c !== undefined && t.tagName === 'SELECT') {
    const row = data.days[+t.dataset.d].rows[+t.dataset.r];
    if (!row.cells) row.cells = emptyCells();
    row.cells[t.dataset.c] = t.value;
    save(); render();
  } else if (t.dataset.k === 'color') { save(); render(); }
}

/* ---------------------- MATIÈRES ---------------------- */
function renderSubjects() {
  const wrap = $('#subjectsList'); wrap.innerHTML = '';
  Object.keys(data.subjects).forEach(id => {
    const s = data.subjects[id];
    const row = document.createElement('div');
    row.className = 'subj-row';
    row.innerHTML = `
      <div class="swatch" style="background:${esc(s.color)}"></div>
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
  const del = e.target.closest('[data-delsubj]');
  if (del) {
    const id = del.dataset.delsubj;
    if (!confirm('Supprimer cette matière ? Elle sera retirée des créneaux.')) return;
    delete data.subjects[id];
    data.days.forEach(day => day.rows.forEach(r => { if (r.cells) data.classes.forEach(c => { if (r.cells[c] === id) r.cells[c] = ''; }); }));
    save(); renderSubjects(); render();
  }
}
function addSubject() {
  const id = 'm' + Date.now().toString(36);
  data.subjects[id] = { name: "NOUVELLE MATIÈRE", prof: "Prof.", color: "#3f7fd0", icon: "📚" };
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
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'emploi_du_temps.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
}
function importJSON(file) {
  const fr = new FileReader();
  fr.onload = () => { try { data = JSON.parse(fr.result); save(); render(); alert('Importé ✔'); } catch (e) { alert('Fichier JSON invalide.'); } };
  fr.readAsText(file);
}
function resetAll() {
  if (!confirm('Tout réinitialiser à l’emploi du temps de base ?')) return;
  data = clone(DEFAULT); save(); render();
}

/* ---------------------- INIT ---------------------- */
function toggleEdit() {
  editMode = !editMode;
  document.body.classList.toggle('editing', editMode);
  $('#btnEdit').textContent = editMode ? '✓ Terminer' : '✎ Modifier';
  render();
}

function init() {
  load(); render();
  $('#btnEdit').addEventListener('click', toggleEdit);
  $('#btnAddDay').addEventListener('click', () => { data.days.push({ day: "Nouveau", date: "", rows: [] }); save(); render(); });
  $('#btnSubjects').addEventListener('click', () => { renderSubjects(); $('#subjectsModal').classList.add('on'); });
  $('#btnTexts').addEventListener('click', openTexts);
  $('#btnExport').addEventListener('click', exportJSON);
  $('#btnImport').addEventListener('click', () => $('#fileImport').click());
  $('#fileImport').addEventListener('change', (e) => { if (e.target.files[0]) importJSON(e.target.files[0]); e.target.value = ''; });
  $('#btnReset').addEventListener('click', resetAll);

  $('#board').addEventListener('click', onBoardClick);
  $('#board').addEventListener('input', onBoardInput);
  $('#board').addEventListener('change', onBoardChange);

  $('#subjectsList').addEventListener('input', onSubjectsInput);
  $('#subjectsList').addEventListener('click', onSubjectsClick);
  $('#addSubject').addEventListener('click', addSubject);
  $('#saveTexts').addEventListener('click', saveTexts);

  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('.modal').classList.remove('on')));
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', (e) => { if (e.target === m) m.classList.remove('on'); }));
}
init();
