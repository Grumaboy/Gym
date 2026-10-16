'use strict';

/* ================= constants ================= */

const APP_VERSION = '1.0.0';
const STORAGE_KEY = 'rabochiy-ves:v1';
const PREFS_KEY = 'rabochiy-ves:prefs';
const SCHEMA_VERSION = 1;
const EXPORT_APP_ID = 'rabochiy-ves';

const DEFAULT_STEP = 2.5;
const DEFAULT_SETS = 3;
const DEFAULT_REPS = 10;
const LIMITS = { weight: [0, 999], sets: [1, 20], reps: [1, 100] };
const MAX_NAME_LENGTH = 40;
const MAX_DOTS_PER_DAY = 3;
const HISTORY_PAGE = 30;
const TOAST_MS = 2600;
const DAY_MS = 86400000;

const PLATES = [
  { key: 'red', name: 'Красный' },
  { key: 'blue', name: 'Синий' },
  { key: 'yellow', name: 'Жёлтый' },
  { key: 'green', name: 'Зелёный' },
  { key: 'white', name: 'Белый' },
  { key: 'black', name: 'Чёрный' },
];
const PLATE_KEYS = PLATES.map(p => p.key);
const GROUPS = ['Грудь', 'Спина', 'Ноги', 'Плечи', 'Руки', 'Пресс', 'Другое'];
const FALLBACK_GROUP = 'Другое';
const STEPS = [1, 2.5, 5];
const PRESETS = [
  { name: 'Жим ногами', group: 'Ноги', plate: 'red', step: 5 },
  { name: 'Разгибание ног', group: 'Ноги', plate: 'yellow', step: 2.5 },
  { name: 'Сгибание ног', group: 'Ноги', plate: 'green', step: 2.5 },
  { name: 'Тяга верхнего блока', group: 'Спина', plate: 'blue', step: 2.5 },
  { name: 'Тяга горизонтального блока', group: 'Спина', plate: 'green', step: 2.5 },
  { name: 'Жим в тренажёре сидя', group: 'Грудь', plate: 'red', step: 2.5 },
  { name: 'Бабочка', group: 'Грудь', plate: 'white', step: 2.5 },
  { name: 'Жим вверх сидя', group: 'Плечи', plate: 'yellow', step: 2.5 },
];

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTHS_IN = ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'];
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const WEEK_HEAD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const ICONS = {
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  share: '<svg class="share-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M6 11H5v10h14V11h-1" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/* ================= utils ================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function esc(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function uid() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

const round2 = n => Math.round(n * 100) / 100;
const clamp = (n, [lo, hi]) => Math.min(hi, Math.max(lo, n));

function parseNum(value) {
  const n = parseFloat(String(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

const numberFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const fmtW = n => numberFormat.format(n);

function fmtDelta(n) {
  if (n === 0) return '±0';
  return (n > 0 ? '+' : '−') + fmtW(Math.abs(n));
}

const pluralRules = new Intl.PluralRules('ru-RU');
function plural(n, one, few, many) {
  const form = pluralRules.select(n);
  if (form === 'one') return one;
  if (form === 'few') return few;
  return many;
}

/* dates are stored as local "YYYY-MM-DD" keys */
function toKey(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
const todayKey = () => toKey(new Date());
const isDateKey = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(fromKey(v).getTime());
const daysBetween = (a, b) => Math.round((fromKey(b) - fromKey(a)) / DAY_MS);

function fmtShort(key) {
  const d = fromKey(key);
  const base = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  return d.getFullYear() === new Date().getFullYear() ? base : `${base} ${d.getFullYear()}`;
}
function fmtLong(key) {
  const d = fromKey(key);
  const wd = WEEKDAYS[d.getDay()];
  const yearPart = d.getFullYear() === new Date().getFullYear() ? '' : ` ${d.getFullYear()}`;
  return `${wd[0].toUpperCase()}${wd.slice(1)}, ${d.getDate()} ${MONTHS_GEN[d.getMonth()]}${yearPart}`;
}
function fmtRelative(key) {
  const diff = daysBetween(key, todayKey());
  if (diff === 0) return 'сегодня';
  if (diff === 1) return 'вчера';
  if (diff > 1 && diff < 7) return `${diff} ${plural(diff, 'день', 'дня', 'дней')} назад`;
  return fmtShort(key);
}
function weekStartKey(key) {
  const d = fromKey(key);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toKey(d);
}

/* ================= storage ================= */

function emptyDb() {
  return { schema: SCHEMA_VERSION, machines: [], logs: [], marks: {}, meta: { lastBackup: null } };
}

function normalizeDb(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.machines) || !Array.isArray(raw.logs)) return null;

  const machines = raw.machines
    .filter(m => m && typeof m.id === 'string' && typeof m.name === 'string' && m.name.trim())
    .map(m => ({
      id: m.id,
      name: m.name.trim().slice(0, MAX_NAME_LENGTH),
      group: GROUPS.includes(m.group) ? m.group : FALLBACK_GROUP,
      plate: PLATE_KEYS.includes(m.plate) ? m.plate : PLATE_KEYS[0],
      step: STEPS.includes(m.step) ? m.step : DEFAULT_STEP,
      createdAt: Number.isFinite(m.createdAt) ? m.createdAt : 0,
    }));
  const machineIds = new Set(machines.map(m => m.id));

  const logs = raw.logs
    .filter(l => l && machineIds.has(l.machineId) && isDateKey(l.date) && Number.isFinite(l.weight))
    .map(l => ({
      id: typeof l.id === 'string' ? l.id : uid(),
      machineId: l.machineId,
      date: l.date,
      weight: round2(clamp(l.weight, LIMITS.weight)),
      sets: Number.isInteger(l.sets) ? clamp(l.sets, LIMITS.sets) : DEFAULT_SETS,
      reps: Number.isInteger(l.reps) ? clamp(l.reps, LIMITS.reps) : DEFAULT_REPS,
      ts: Number.isFinite(l.ts) ? l.ts : 0,
    }));

  const marks = {};
  if (raw.marks && typeof raw.marks === 'object') {
    for (const key of Object.keys(raw.marks)) if (isDateKey(key) && raw.marks[key]) marks[key] = true;
  }

  const lastBackup = raw.meta && Number.isFinite(raw.meta.lastBackup) ? raw.meta.lastBackup : null;
  return { schema: SCHEMA_VERSION, machines, logs, marks, meta: { lastBackup } };
}

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDb();
    return normalizeDb(JSON.parse(raw)) || emptyDb();
  } catch (err) {
    return emptyDb();
  }
}

function saveDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return true;
  } catch (err) {
    toast('Не удалось сохранить: память браузера недоступна');
    return false;
  }
}

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; } catch (err) { return {}; }
}
function savePrefs() {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (err) { /* convenience only */ }
}

/* ================= state ================= */

let db = loadDb();
const prefs = loadPrefs();
const ui = {
  tab: 'machines',
  machineId: null,
  presetDate: null,
  month: (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })(),
  groupFilter: null,
  historyLimit: HISTORY_PAGE,
};
let machineForm = null;   // { id|null, group, plate, step } while the machine sheet is open
let pendingImport = null;

/* ================= derived data ================= */

const getMachine = id => db.machines.find(m => m.id === id) || null;

function byNewest(a, b) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return b.ts - a.ts;
}

function logsFor(machineId) {
  return db.logs.filter(l => l.machineId === machineId).sort(byNewest);
}

function dayMax(logs, date) {
  let best = null;
  for (const l of logs) if (l.date === date && (best === null || l.weight > best.weight)) best = l;
  return best;
}

function summarize(machineId) {
  const logs = logsFor(machineId);
  if (!logs.length) return { logs, current: null, best: null, delta: null, isRecord: false };

  const lastDate = logs[0].date;
  const current = dayMax(logs, lastDate);
  const best = Math.max(...logs.map(l => l.weight));
  const earlier = logs.filter(l => l.date < lastDate);
  const prevDay = earlier.length ? dayMax(earlier, earlier[0].date) : null;
  const prevBest = earlier.length ? Math.max(...earlier.map(l => l.weight)) : null;

  return {
    logs,
    current,
    best,
    delta: prevDay ? round2(current.weight - prevDay.weight) : null,
    isRecord: prevBest !== null && current.weight > prevBest,
  };
}

function trainingDays() {
  const days = new Set(Object.keys(db.marks));
  for (const l of db.logs) days.add(l.date);
  return days;
}

function machinesByDay() {
  const map = new Map();
  const sorted = db.logs.slice().sort((a, b) => a.ts - b.ts);
  for (const l of sorted) {
    if (!map.has(l.date)) map.set(l.date, []);
    const list = map.get(l.date);
    if (!list.includes(l.machineId)) list.push(l.machineId);
  }
  return map;
}

function weekStreak(days) {
  const weeks = new Set(Array.from(days, weekStartKey));
  const cursor = fromKey(weekStartKey(todayKey()));
  if (!weeks.has(toKey(cursor))) cursor.setDate(cursor.getDate() - 7);
  let count = 0;
  while (weeks.has(toKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  return count;
}

function lastUsed(machineId) {
  let last = '';
  for (const l of db.logs) if (l.machineId === machineId && l.date > last) last = l.date;
  return last;
}

/* ================= platform ================= */

const isStandalone = () =>
  (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;

/* ================= render: shared ================= */

function band(title, right = '') {
  return `<header class="band"><div class="band-inner"><h1 class="band-title">${title}</h1>${right}</div></header>`;
}

function plateClass(key) {
  return `p-${PLATE_KEYS.includes(key) ? key : PLATE_KEYS[0]}`;
}

function render() {
  if (ui.machineId && !getMachine(ui.machineId)) ui.machineId = null;

  let html;
  if (ui.machineId) html = renderMachineScreen(getMachine(ui.machineId));
  else if (ui.tab === 'calendar') html = renderCalendar();
  else if (ui.tab === 'data') html = renderData();
  else html = renderMachines();

  $('#view').innerHTML = html;
  for (const tab of $$('.tab')) {
    if (tab.dataset.tab === ui.tab) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  if (ui.machineId) drawChart();
}

/* ================= render: machines tab ================= */

function renderInstallHint() {
  if (isStandalone() || prefs.installHintDismissed) return '';
  return `
    <div class="card install">
      <button class="close" type="button" data-action="dismiss-install" aria-label="Скрыть подсказку">✕</button>
      <h2>Установи на экран «Домой»</h2>
      <p>В Safari нажми «Поделиться» ${ICONS.share}, затем «На экран „Домой“». Приложение будет открываться без адресной строки и работать без интернета.</p>
      <p>Записи, сделанные здесь в Safari, в установленное приложение не перейдут, поэтому сначала установи, потом записывай.</p>
    </div>`;
}

function renderTodayStrip() {
  const key = todayKey();
  const todayLogs = db.logs.filter(l => l.date === key).length;
  let control;
  if (todayLogs) {
    control = `<span class="mark-btn on">${ICONS.check}${todayLogs} ${plural(todayLogs, 'запись', 'записи', 'записей')}</span>`;
  } else {
    const marked = Boolean(db.marks[key]);
    control = `<button class="mark-btn" type="button" data-action="toggle-mark" data-date="${key}" aria-pressed="${marked}">
      ${marked ? `${ICONS.check}Тренировка` : 'Отметить тренировку'}</button>`;
  }
  return `
    <div class="today">
      <div class="today-date"><b>Сегодня</b><span>${esc(fmtLong(key))}</span></div>
      ${control}
    </div>`;
}

function renderEmptyMachines() {
  const chips = PRESETS.map((p, i) => `
    <button class="chip" type="button" data-action="add-preset" data-index="${i}">
      <span class="plate ${plateClass(p.plate)}" aria-hidden="true"></span>${esc(p.name)}</button>`).join('');
  return `
    <div class="card">
      <h2>Добавь свои тренажёры</h2>
      <p>Нажми на тренажёр из списка, чтобы добавить его, или создай свой. Потом открывай тренажёр и записывай рабочий вес после подхода.</p>
      <div class="chips">${chips}</div>
      <button class="btn btn-primary" type="button" data-action="add-machine">${ICONS.plus}Свой тренажёр</button>
    </div>`;
}

function renderMachineRow(m) {
  const s = summarize(m.id);
  let end;
  let sub = esc(m.group);
  if (s.current) {
    const deltaCls = s.delta > 0 ? 'up' : s.delta < 0 ? 'down' : '';
    const deltaHtml = s.isRecord
      ? '<span class="pill">рекорд</span>'
      : s.delta !== null ? `<span class="delta ${deltaCls}">${fmtDelta(s.delta)}</span>` : '';
    end = `<span class="weight">${fmtW(s.current.weight)}<small>кг</small></span>${deltaHtml}`;
    sub += ` · ${esc(fmtRelative(s.current.date))}`;
  } else {
    end = '<span class="weight none">—</span>';
    sub += ' · нет записей';
  }
  return `
    <button class="row ${plateClass(m.plate)}" type="button" data-action="open-machine" data-id="${esc(m.id)}">
      <span class="plate" aria-hidden="true"></span>
      <span class="row-main"><span class="row-title">${esc(m.name)}</span><span class="row-sub">${sub}</span></span>
      <span class="row-end">${end}</span>
    </button>`;
}

function renderMachines() {
  const addBtn = `<button class="band-btn" type="button" data-action="add-machine" aria-label="Добавить тренажёр">${ICONS.plus}</button>`;
  const parts = [renderInstallHint(), renderTodayStrip()];

  if (!db.machines.length) {
    parts.push(renderEmptyMachines());
  } else {
    const groupsPresent = GROUPS.filter(g => db.machines.some(m => m.group === g));
    if (ui.groupFilter && !groupsPresent.includes(ui.groupFilter)) ui.groupFilter = null;

    const sorted = db.machines
      .filter(m => !ui.groupFilter || m.group === ui.groupFilter)
      .map(m => ({ m, last: lastUsed(m.id) }))
      .sort((a, b) => (a.last !== b.last ? (a.last < b.last ? 1 : -1) : a.m.createdAt - b.m.createdAt))
      .map(x => x.m);

    let filters = '';
    if (groupsPresent.length > 1) {
      const chip = (value, label) =>
        `<button class="chip" type="button" data-action="filter-group" data-group="${esc(value)}" aria-pressed="${(ui.groupFilter || '') === value}">${esc(label)}</button>`;
      filters = `<div class="chips scroll" role="group" aria-label="Фильтр по группе мышц">${chip('', 'Все')}${groupsPresent.map(g => chip(g, g)).join('')}</div>`;
    }

    parts.push(`
      <section class="section">
        <div class="label"><span>Рабочий вес</span><span class="aside">${db.machines.length} ${plural(db.machines.length, 'тренажёр', 'тренажёра', 'тренажёров')}</span></div>
        ${filters}
        <div class="group">${sorted.map(renderMachineRow).join('')}</div>
      </section>`);
  }

  return band('Тренажёры', addBtn) + `<div class="content">${parts.join('')}</div>`;
}

/* ================= render: machine screen ================= */

function stepperRow(field, label, hint, value, mode, stepLabel) {
  return `
    <div class="frow">
      <label for="in-${field}">${label}${hint ? `<small>${hint}</small>` : ''}</label>
      <div class="stepper">
        <button class="step-btn" type="button" data-action="step" data-field="${field}" data-dir="-1" aria-label="Уменьшить на ${stepLabel}">−</button>
        <input class="step-input" id="in-${field}" inputmode="${mode}" autocomplete="off" enterkeyhint="done" value="${value}">
        <button class="step-btn" type="button" data-action="step" data-field="${field}" data-dir="1" aria-label="Увеличить на ${stepLabel}">+</button>
      </div>
    </div>`;
}

function renderMachineScreen(m) {
  const s = summarize(m.id);
  const last = s.logs[0] || null;
  const formDate = ui.presetDate || todayKey();

  const nav = `
    <header class="band band-nav"><div class="band-inner">
      <button class="band-btn back" type="button" data-action="back">${ICONS.back}Тренажёры</button>
      <span class="nav-title">${esc(m.name)}</span>
      <button class="band-btn edit" type="button" data-action="edit-machine">Изменить</button>
    </div></header>`;

  const hero = s.current
    ? `
      <div class="hero-weight">${fmtW(s.current.weight)}<small>кг</small></div>
      <div class="hero-sub">Рабочий вес · ${s.current.sets}×${s.current.reps} · ${esc(fmtRelative(s.current.date))}</div>
      <div class="hero-meta">
        <span>Рекорд<b>${fmtW(s.best)} кг</b></span>
        ${s.delta !== null ? `<span>К прошлой<b>${fmtDelta(s.delta)}</b></span>` : ''}
        <span>Записей<b>${s.logs.length}</b></span>
      </div>`
    : `
      <div class="hero-weight">—</div>
      <div class="hero-sub">Запиши первый рабочий вес ниже</div>`;

  const history = s.logs.slice(0, ui.historyLimit).map(l => {
    const d = fromKey(l.date);
    return `
      <button class="row hist-row" type="button" data-action="ask-delete-log" data-id="${esc(l.id)}" aria-label="Запись ${fmtW(l.weight)} кг, ${esc(fmtShort(l.date))}. Нажми, чтобы удалить">
        <span class="hist-date">${esc(fmtShort(l.date))}<span>${WEEKDAYS_SHORT[d.getDay()]}</span></span>
        <span class="hist-sets">${l.sets}×${l.reps}</span>
        <span class="weight">${fmtW(l.weight)}<small>кг</small></span>
      </button>`;
  }).join('');
  const moreBtn = s.logs.length > ui.historyLimit
    ? `<button class="more" type="button" data-action="more-history">Показать ещё ${Math.min(HISTORY_PAGE, s.logs.length - ui.historyLimit)}</button>`
    : '';

  return `${nav}
    <div class="content ${plateClass(m.plate)}">
      <section class="hero">
        <div class="hero-top"><span>${esc(m.group)}</span>${s.isRecord ? '<span class="pill">рекорд</span>' : ''}</div>
        <h1 class="hero-name">${esc(m.name)}</h1>
        ${hero}
      </section>

      <section class="section">
        <div class="label"><span>Новая запись</span><span class="aside">шаг ${fmtW(m.step)} кг</span></div>
        <div class="group">
          ${stepperRow('weight', 'Вес', 'кг', last ? fmtW(last.weight) : '', 'decimal', `${fmtW(m.step)} кг`)}
          ${stepperRow('sets', 'Подходы', '', last ? last.sets : DEFAULT_SETS, 'numeric', '1')}
          ${stepperRow('reps', 'Повторения', 'в подходе', last ? last.reps : DEFAULT_REPS, 'numeric', '1')}
          <div class="frow">
            <label for="in-date">Дата</label>
            <input class="date-input" id="in-date" type="date" value="${formDate}" max="${todayKey()}">
          </div>
        </div>
        <button class="btn btn-plate" type="button" data-action="save-log">Записать</button>
      </section>

      <section class="section">
        <div class="label"><span>Прогресс</span><span class="aside">лучший вес за день</span></div>
        <div class="chart-card" id="chart"></div>
      </section>

      ${s.logs.length ? `
      <section class="section">
        <div class="label"><span>История</span><span class="aside">нажми, чтобы удалить</span></div>
        <div class="group">${history}${moreBtn}</div>
      </section>` : ''}
    </div>`;
}

/* ---------- chart ---------- */

function niceScale(min, max, count) {
  let lo = min;
  let hi = max;
  if (lo === hi) { lo -= 5; hi += 5; }
  lo = Math.max(0, lo);
  const raw = (hi - lo) / Math.max(1, count - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  const step = nice * mag;
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(round2(v));
  return { lo: start, hi: end, ticks };
}

function drawChart() {
  const box = $('#chart');
  if (!box) return;
  const m = getMachine(ui.machineId);
  const logs = logsFor(m.id);

  const byDay = new Map();
  for (const l of logs) if (!byDay.has(l.date) || l.weight > byDay.get(l.date)) byDay.set(l.date, l.weight);
  const points = Array.from(byDay, ([date, w]) => ({ date, w, t: fromKey(date).getTime() })).sort((a, b) => a.t - b.t);

  if (!points.length) {
    box.innerHTML = '<div class="chart-empty">Здесь появится график роста рабочего веса</div>';
    return;
  }

  const W = Math.max(260, Math.round(box.clientWidth - 16));
  const H = 190;
  const pad = { l: 40, r: 18, t: 26, b: 26 };
  const scale = niceScale(Math.min(...points.map(p => p.w)), Math.max(...points.map(p => p.w)), 4);
  const t0 = points[0].t;
  const t1 = points[points.length - 1].t;

  const x = t => (t1 === t0 ? (pad.l + W - pad.r) / 2 : pad.l + ((t - t0) / (t1 - t0)) * (W - pad.l - pad.r));
  const y = w => pad.t + (1 - (w - scale.lo) / (scale.hi - scale.lo)) * (H - pad.t - pad.b);

  const grid = scale.ticks.map(v => `
    <line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/>
    <text class="axis" x="${pad.l - 8}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${fmtW(v)}</text>`).join('');

  const coords = points.map(p => [x(p.t), y(p.w)]);
  const linePath = coords.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join('');
  const baseY = (H - pad.b).toFixed(1);
  const areaPath = points.length > 1
    ? `${linePath}L${coords[coords.length - 1][0].toFixed(1)},${baseY}L${coords[0][0].toFixed(1)},${baseY}Z`
    : '';

  const dots = coords.slice(0, -1).map(([px, py]) => `<circle class="pt" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3"/>`).join('');
  const [lx, ly] = coords[coords.length - 1];
  const lastPoint = points[points.length - 1];
  const anchor = lx > W - pad.r - 30 ? 'end' : lx < pad.l + 30 ? 'start' : 'middle';

  const xLabels = [`<text class="axis" x="${coords[0][0].toFixed(1)}" y="${H - 6}" text-anchor="${points.length > 1 ? 'start' : 'middle'}">${esc(fmtShort(points[0].date))}</text>`];
  if (points.length > 1) {
    xLabels.push(`<text class="axis" x="${lx.toFixed(1)}" y="${H - 6}" text-anchor="end">${esc(fmtShort(lastPoint.date))}</text>`);
  }

  const first = points[0].w;
  const summary = `График: от ${fmtW(first)} до ${fmtW(lastPoint.w)} кг за ${points.length} ${plural(points.length, 'тренировку', 'тренировки', 'тренировок')}`;

  box.innerHTML = `
    <svg class="chart" viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="${esc(summary)}">
      ${grid}
      ${areaPath ? `<path class="area" d="${areaPath}"/>` : ''}
      ${points.length > 1 ? `<path class="line" d="${linePath}"/>` : ''}
      ${dots}
      <circle class="pt-last" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="5.5"/>
      <text class="val" x="${lx.toFixed(1)}" y="${(ly - 11).toFixed(1)}" text-anchor="${anchor}">${fmtW(lastPoint.w)}</text>
      ${xLabels.join('')}
    </svg>
    ${points.length === 1 ? '<div class="note" style="text-align:center;padding-top:4px">Ещё одна тренировка, и появится линия</div>' : ''}`;
}

/* ================= render: calendar ================= */

function renderCalendar() {
  const year = ui.month.getFullYear();
  const month = ui.month.getMonth();
  const days = trainingDays();
  const perDay = machinesByDay();
  const today = todayKey();
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;

  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push('<span></span>');
  for (let d = 1; d <= daysInMonth; d++) {
    const key = prefix + String(d).padStart(2, '0');
    const isTrain = days.has(key);
    const isFuture = key > today;
    const ids = (perDay.get(key) || []).slice(0, MAX_DOTS_PER_DAY);
    const dots = ids.map(id => {
      const m = getMachine(id);
      return m ? `<i class="dot ${plateClass(m.plate)}"></i>` : '';
    }).join('');
    const cls = ['cal-day', isTrain && 'is-train', key === today && 'is-today', isFuture && 'is-future'].filter(Boolean).join(' ');
    const label = `${d} ${MONTHS_GEN[month]}${isTrain ? ', тренировка' : ''}`;
    cells.push(`
      <button class="${cls}" type="button" data-action="open-day" data-date="${key}" ${isFuture ? 'disabled' : ''} aria-label="${label}">
        <span class="num">${d}</span><span class="dots">${dots}</span>
      </button>`);
  }

  const monthDays = Array.from(days).filter(k => k.startsWith(prefix)).sort().reverse();
  const streak = weekStreak(days);
  const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth();

  const list = monthDays.map(key => {
    const ids = perDay.get(key) || [];
    const names = ids.map(id => getMachine(id)).filter(Boolean)
      .map(m => `<span class="${plateClass(m.plate)}"><i></i>${esc(m.name)}</span>`).join('');
    return `
      <button class="row simple" type="button" data-action="open-day" data-date="${key}">
        <span class="row-main">
          <span class="row-title">${esc(fmtLong(key))}</span>
          ${names ? `<span class="day-machines">${names}</span>` : '<span class="row-sub">Тренировка без записей весов</span>'}
        </span>
        ${ICONS.chev}
      </button>`;
  }).join('');

  const todayBtn = isCurrentMonth ? '' : '<button class="band-btn" type="button" data-action="month-today">Сегодня</button>';

  return band('Календарь', todayBtn) + `
    <div class="content">
      <div class="stats">
        <div class="stat"><b>${monthDays.length}</b><span>${plural(monthDays.length, 'тренировка', 'тренировки', 'тренировок')} в ${MONTHS_IN[month]}</span></div>
        <div class="stat"><b>${days.size}</b><span>всего</span></div>
        <div class="stat"><b>${streak}</b><span>${plural(streak, 'неделя', 'недели', 'недель')} подряд</span></div>
      </div>

      <div class="cal-card">
        <div class="cal-nav">
          <button class="icon-btn" type="button" data-action="month-prev" aria-label="Предыдущий месяц">${ICONS.prev}</button>
          <h2>${MONTHS[month]} ${year}</h2>
          <button class="icon-btn" type="button" data-action="month-next" aria-label="Следующий месяц">${ICONS.next}</button>
        </div>
        <div class="cal-week" aria-hidden="true">${WEEK_HEAD.map(w => `<span>${w}</span>`).join('')}</div>
        <div class="cal-grid">${cells.join('')}</div>
      </div>
      <p class="note">Нажми на день, чтобы отметить тренировку или посмотреть, что делал. Дни с записями весов отмечаются сами.</p>

      ${monthDays.length ? `
      <section class="section">
        <div class="label"><span>Тренировки в ${MONTHS_IN[month]}</span></div>
        <div class="group">${list}</div>
      </section>` : ''}
    </div>`;
}

/* ================= render: data tab ================= */

function renderData() {
  const days = trainingDays().size;
  const backup = db.meta.lastBackup
    ? `Последняя резервная копия: ${esc(fmtShort(toKey(new Date(db.meta.lastBackup))))}.`
    : 'Резервную копию ещё не делал.';

  return band('Данные') + `
    <div class="content">
      ${renderInstallHint()}
      <div class="stats">
        <div class="stat"><b>${db.machines.length}</b><span>${plural(db.machines.length, 'тренажёр', 'тренажёра', 'тренажёров')}</span></div>
        <div class="stat"><b>${db.logs.length}</b><span>${plural(db.logs.length, 'запись', 'записи', 'записей')}</span></div>
        <div class="stat"><b>${days}</b><span>${plural(days, 'тренировка', 'тренировки', 'тренировок')}</span></div>
      </div>

      <section class="section">
        <div class="label"><span>Резервная копия</span></div>
        <div class="group">
          <button class="row simple" type="button" data-action="export">
            <span class="row-main"><span class="row-title">Сохранить копию</span><span class="row-sub">Файл с тренажёрами, весами и календарём</span></span>${ICONS.chev}
          </button>
          <button class="row simple" type="button" data-action="import">
            <span class="row-main"><span class="row-title">Загрузить из копии</span><span class="row-sub">Заменит данные на этом телефоне</span></span>${ICONS.chev}
          </button>
        </div>
        <p class="note">Все записи хранятся только на этом телефоне. ${backup} Сохраняй копию в «Файлы» раз в пару недель, чтобы не потерять историю при смене телефона.</p>
      </section>

      <section class="section">
        <div class="group">
          <button class="row simple" type="button" data-action="ask-wipe">
            <span class="row-main"><span class="row-title" style="color:var(--down)">Удалить все данные</span></span>
          </button>
        </div>
      </section>

      <p class="foot">Рабочий вес ${APP_VERSION}</p>
    </div>`;
}

/* ================= sheet ================= */

const sheet = $('#sheet');
const sheetBody = $('#sheetBody');
const backdrop = $('#sheetBackdrop');
let sheetCloseTimer = null;

function openSheet(html, focusSelector) {
  clearTimeout(sheetCloseTimer);
  sheetBody.innerHTML = html;
  sheet.hidden = false;
  backdrop.hidden = false;
  void sheet.offsetHeight;
  sheet.classList.add('open');
  backdrop.classList.add('open');
  sheet.scrollTop = 0;
  if (focusSelector) {
    const el = $(focusSelector, sheet);
    if (el) setTimeout(() => el.focus(), 300);
  }
}

function closeSheet() {
  if (sheet.hidden) return;
  sheet.classList.remove('open');
  backdrop.classList.remove('open');
  if (document.activeElement && sheet.contains(document.activeElement)) document.activeElement.blur();
  machineForm = null;
  pendingImport = null;
  sheetCloseTimer = setTimeout(() => { sheet.hidden = true; backdrop.hidden = true; sheetBody.innerHTML = ''; }, 280);
}

backdrop.addEventListener('click', closeSheet);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

if (window.visualViewport) {
  const vv = window.visualViewport;
  const adjust = () => {
    const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    sheet.style.setProperty('--kb', `${Math.round(kb)}px`);
  };
  vv.addEventListener('resize', adjust);
  vv.addEventListener('scroll', adjust);
}

function confirmSheet({ title, text, confirmLabel, confirmAction, data = {} }) {
  const attrs = Object.entries(data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ');
  openSheet(`
    <h2 id="sheetTitle">${esc(title)}</h2>
    <p class="lead">${text}</p>
    <div class="btn-row">
      <button class="btn btn-danger solid" type="button" data-action="${confirmAction}" ${attrs}>${esc(confirmLabel)}</button>
      <button class="btn btn-ghost" type="button" data-action="close-sheet">Отмена</button>
    </div>`);
}

/* ---------- machine form ---------- */

function openMachineForm(id) {
  const m = id ? getMachine(id) : null;
  machineForm = {
    id: m ? m.id : null,
    group: m ? m.group : null,
    plate: m ? m.plate : PLATE_KEYS[db.machines.length % PLATE_KEYS.length],
    step: m ? m.step : DEFAULT_STEP,
  };

  const taken = new Set(db.machines.map(x => x.name.toLowerCase()));
  const presetChips = m ? '' : PRESETS
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => !taken.has(p.name.toLowerCase()))
    .map(({ p, i }) => `<button class="chip" type="button" data-action="fill-preset" data-index="${i}"><span class="plate ${plateClass(p.plate)}" aria-hidden="true"></span>${esc(p.name)}</button>`)
    .join('');

  const groupChips = GROUPS.map(g =>
    `<button class="chip" type="button" data-action="pick-group" data-value="${esc(g)}" aria-pressed="false">${esc(g)}</button>`).join('');
  const swatches = PLATES.map(p =>
    `<button class="swatch" type="button" data-action="pick-plate" data-value="${p.key}" aria-pressed="false" aria-label="${p.name}"><span class="plate ${plateClass(p.key)}"></span></button>`).join('');
  const steps = STEPS.map(s =>
    `<button type="button" data-action="pick-step" data-value="${s}" aria-pressed="false">${fmtW(s)} кг</button>`).join('');

  openSheet(`
    <h2 id="sheetTitle">${m ? 'Тренажёр' : 'Новый тренажёр'}</h2>
    ${presetChips ? `<div class="field"><span>Популярные</span><div class="chips scroll">${presetChips}</div></div>` : ''}
    <label class="field"><span>Название</span>
      <input class="text-input" id="m-name" type="text" maxlength="${MAX_NAME_LENGTH}" autocomplete="off" enterkeyhint="done"
        placeholder="Например, жим ногами" value="${m ? esc(m.name) : ''}">
    </label>
    <div class="field"><span>Группа мышц</span><div class="chips" role="group">${groupChips}</div></div>
    <div class="field"><span>Цвет блина</span><div class="swatches" role="group">${swatches}</div></div>
    <div class="field"><span>Шаг веса</span><div class="seg" role="group">${steps}</div><small>На сколько меняют вес кнопки − и +. На блочных тренажёрах обычно 2,5 или 5 кг.</small></div>
    <div class="btn-row">
      <button class="btn btn-primary" type="button" data-action="submit-machine">${m ? 'Сохранить' : 'Добавить'}</button>
      ${m ? '<button class="btn btn-danger" type="button" data-action="ask-delete-machine">Удалить тренажёр</button>' : ''}
      <button class="btn btn-ghost" type="button" data-action="close-sheet">Отмена</button>
    </div>`);
  syncMachineForm();
}

function syncMachineForm() {
  if (!machineForm) return;
  for (const b of $$('[data-action="pick-group"]', sheet)) b.setAttribute('aria-pressed', String(b.dataset.value === machineForm.group));
  for (const b of $$('[data-action="pick-plate"]', sheet)) b.setAttribute('aria-pressed', String(b.dataset.value === machineForm.plate));
  for (const b of $$('[data-action="pick-step"]', sheet)) b.setAttribute('aria-pressed', String(Number(b.dataset.value) === machineForm.step));
}

function submitMachine() {
  const input = $('#m-name', sheet);
  const name = input.value.trim().slice(0, MAX_NAME_LENGTH);
  if (!name) {
    toast('Напиши название тренажёра');
    input.focus();
    return;
  }
  const fields = { name, group: machineForm.group || FALLBACK_GROUP, plate: machineForm.plate, step: machineForm.step };
  if (machineForm.id) {
    Object.assign(getMachine(machineForm.id), fields);
    toast('Сохранено');
  } else {
    const m = { id: uid(), ...fields, createdAt: Date.now() };
    db.machines.push(m);
    ui.groupFilter = null;
    toast(`Добавлен: ${name}`);
  }
  saveDb();
  closeSheet();
  render();
}

function addPreset(index) {
  const p = PRESETS[index];
  if (!p) return;
  db.machines.push({ id: uid(), name: p.name, group: p.group, plate: p.plate, step: p.step, createdAt: Date.now() });
  saveDb();
  toast(`Добавлен: ${p.name}`);
  render();
}

/* ---------- day sheet ---------- */

function openDaySheet(key) {
  const logs = db.logs.filter(l => l.date === key).sort((a, b) => a.ts - b.ts);
  const marked = Boolean(db.marks[key]);

  const logRows = logs.map(l => {
    const m = getMachine(l.machineId);
    if (!m) return '';
    return `
      <button class="row ${plateClass(m.plate)}" type="button" data-action="day-open-machine" data-id="${esc(m.id)}" data-date="${key}">
        <span class="plate" aria-hidden="true"></span>
        <span class="row-main"><span class="row-title">${esc(m.name)}</span><span class="row-sub">${l.sets}×${l.reps}</span></span>
        <span class="row-end"><span class="weight">${fmtW(l.weight)}<small>кг</small></span></span>
      </button>`;
  }).join('');

  let status;
  if (logs.length) {
    status = `<div class="group">${logRows}</div>`;
  } else if (marked) {
    status = `
      <p class="lead">Тренировка отмечена, записей весов нет.</p>
      <button class="btn btn-ghost" type="button" data-action="toggle-mark" data-date="${key}">Снять отметку</button>`;
  } else {
    status = `
      <p class="lead">В этот день тренировки не было.</p>
      <button class="btn btn-primary" type="button" data-action="toggle-mark" data-date="${key}">${ICONS.check}Отметить тренировку</button>`;
  }

  const machineChips = db.machines.map(m =>
    `<button class="chip" type="button" data-action="day-open-machine" data-id="${esc(m.id)}" data-date="${key}"><span class="plate ${plateClass(m.plate)}" aria-hidden="true"></span>${esc(m.name)}</button>`).join('');

  openSheet(`
    <h2 id="sheetTitle">${esc(fmtLong(key))}</h2>
    ${status}
    <div class="field"><span>Записать вес за этот день</span>
      ${machineChips ? `<div class="chips">${machineChips}</div>` : '<small>Сначала добавь тренажёр на вкладке «Тренажёры».</small>'}
    </div>
    <button class="btn btn-ghost" type="button" data-action="close-sheet">Закрыть</button>`);
}

function toggleMark(key) {
  if (!isDateKey(key) || key > todayKey()) return;
  if (db.marks[key]) {
    delete db.marks[key];
    toast('Отметка снята');
  } else {
    db.marks[key] = true;
    toast('Тренировка отмечена');
  }
  saveDb();
  render();
  if (!sheet.hidden && sheet.classList.contains('open')) openDaySheet(key);
}

/* ================= actions ================= */

function switchTab(tab) {
  ui.tab = tab;
  if (ui.machineId) {
    ui.machineId = null;
    ui.presetDate = null;
    history.replaceState(null, '');
  }
  closeSheet();
  render();
  window.scrollTo(0, 0);
}

function openMachine(id, presetDate) {
  ui.machineId = id;
  ui.presetDate = presetDate && presetDate !== todayKey() ? presetDate : null;
  ui.historyLimit = HISTORY_PAGE;
  history.pushState({ machine: id }, '');
  render();
  window.scrollTo(0, 0);
}

function closeMachine() {
  if (history.state && history.state.machine) {
    history.back();
    return;
  }
  ui.machineId = null;
  ui.presetDate = null;
  render();
}

window.addEventListener('popstate', e => {
  ui.machineId = e.state && e.state.machine ? e.state.machine : null;
  ui.presetDate = null;
  closeSheet();
  render();
  window.scrollTo(0, 0);
});

function stepField(field, dir) {
  const input = $(`#in-${field}`);
  if (!input) return;
  const m = getMachine(ui.machineId);
  const current = parseNum(input.value);
  if (field === 'weight') {
    const base = Number.isFinite(current) ? current : 0;
    input.value = fmtW(round2(clamp(base + dir * m.step, LIMITS.weight)));
  } else {
    const fallback = field === 'sets' ? DEFAULT_SETS : DEFAULT_REPS;
    const base = Number.isFinite(current) ? Math.round(current) : fallback;
    input.value = String(clamp(base + dir, LIMITS[field]));
  }
}

function saveLog() {
  const m = getMachine(ui.machineId);
  const weight = parseNum($('#in-weight').value);
  const sets = Math.round(parseNum($('#in-sets').value));
  const reps = Math.round(parseNum($('#in-reps').value));
  const date = $('#in-date').value || todayKey();

  if (!Number.isFinite(weight) || weight < LIMITS.weight[0] || weight > LIMITS.weight[1]) {
    toast('Введи вес, например 62,5');
    $('#in-weight').focus();
    return;
  }
  if (!Number.isFinite(sets) || sets < LIMITS.sets[0] || sets > LIMITS.sets[1]) { toast('Подходов: от 1 до 20'); return; }
  if (!Number.isFinite(reps) || reps < LIMITS.reps[0] || reps > LIMITS.reps[1]) { toast('Повторений: от 1 до 100'); return; }
  if (!isDateKey(date) || date > todayKey()) { toast('Выбери дату не позже сегодняшней'); return; }

  const previous = db.logs.filter(l => l.machineId === m.id);
  const prevBest = previous.length ? Math.max(...previous.map(l => l.weight)) : null;
  const value = round2(weight);

  db.logs.push({ id: uid(), machineId: m.id, date, weight: value, sets, reps, ts: Date.now() });
  if (!saveDb()) return;

  if (document.activeElement) document.activeElement.blur();
  toast(prevBest !== null && value > prevBest ? `Новый рекорд: ${fmtW(value)} кг` : `Записано: ${fmtW(value)} кг · ${sets}×${reps}`);
  ui.presetDate = date !== todayKey() ? date : null;
  render();
}

function askDeleteLog(id) {
  const l = db.logs.find(x => x.id === id);
  if (!l) return;
  confirmSheet({
    title: 'Удалить запись?',
    text: `${fmtW(l.weight)} кг · ${l.sets}×${l.reps} · ${esc(fmtLong(l.date))}`,
    confirmLabel: 'Удалить запись',
    confirmAction: 'delete-log',
    data: { id },
  });
}

function deleteLog(id) {
  db.logs = db.logs.filter(l => l.id !== id);
  saveDb();
  closeSheet();
  toast('Запись удалена');
  render();
}

function askDeleteMachine() {
  const m = getMachine(machineForm && machineForm.id);
  if (!m) return;
  const count = db.logs.filter(l => l.machineId === m.id).length;
  const id = m.id;
  confirmSheet({
    title: `Удалить «${m.name}»?`,
    text: count
      ? `Вместе с тренажёром удалятся ${count} ${plural(count, 'запись', 'записи', 'записей')}. Отменить это нельзя.`
      : 'Записей у тренажёра нет.',
    confirmLabel: 'Удалить тренажёр',
    confirmAction: 'delete-machine',
    data: { id },
  });
}

function deleteMachine(id) {
  const m = getMachine(id);
  if (!m) return;
  db.machines = db.machines.filter(x => x.id !== id);
  db.logs = db.logs.filter(l => l.machineId !== id);
  saveDb();
  closeSheet();
  toast(`Удалён: ${m.name}`);
  if (ui.machineId === id) closeMachine();
  else render();
}

/* ---------- backup ---------- */

async function exportData() {
  const payload = JSON.stringify({ app: EXPORT_APP_ID, schema: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data: db }, null, 2);
  const filename = `rabochiy-ves-${todayKey()}.json`;

  if (navigator.share && navigator.canShare) {
    for (const type of ['application/json', 'text/plain']) {
      const file = new File([payload], filename, { type });
      if (!navigator.canShare({ files: [file] })) continue;
      try {
        await navigator.share({ files: [file], title: 'Рабочий вес: резервная копия' });
        markBackup('Копия сохранена');
      } catch (err) {
        if (err && err.name !== 'AbortError') toast('Не получилось поделиться файлом');
      }
      return;
    }
  }

  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  markBackup('Файл копии скачан');
}

function markBackup(message) {
  db.meta.lastBackup = Date.now();
  saveDb();
  toast(message);
  render();
}

const importInput = $('#importInput');
importInput.addEventListener('change', async () => {
  const file = importInput.files && importInput.files[0];
  importInput.value = '';
  if (!file) return;

  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch (err) {
    toast('Не получилось прочитать файл: это не копия «Рабочего веса»');
    return;
  }
  const data = normalizeDb(parsed && parsed.app === EXPORT_APP_ID ? parsed.data : parsed);
  if (!data) {
    toast('В файле нет данных «Рабочего веса»');
    return;
  }
  const days = new Set([...Object.keys(data.marks), ...data.logs.map(l => l.date)]).size;
  confirmSheet({
    title: 'Загрузить копию?',
    text: `В файле ${data.machines.length} ${plural(data.machines.length, 'тренажёр', 'тренажёра', 'тренажёров')}, ${data.logs.length} ${plural(data.logs.length, 'запись', 'записи', 'записей')} и ${days} ${plural(days, 'тренировка', 'тренировки', 'тренировок')}. Текущие данные на телефоне будут заменены.`,
    confirmLabel: 'Заменить данные',
    confirmAction: 'confirm-import',
  });
  pendingImport = data;
});

function confirmImport() {
  if (!pendingImport) return;
  db = pendingImport;
  saveDb();
  closeSheet();
  ui.groupFilter = null;
  toast('Данные загружены');
  render();
}

function wipe() {
  db = emptyDb();
  saveDb();
  closeSheet();
  ui.groupFilter = null;
  toast('Все данные удалены');
  render();
}

/* ---------- delegation ---------- */

const actions = {
  'tab': el => switchTab(el.dataset.tab),
  'open-machine': el => openMachine(el.dataset.id),
  'back': () => closeMachine(),
  'add-machine': () => openMachineForm(null),
  'edit-machine': () => openMachineForm(ui.machineId),
  'add-preset': el => addPreset(Number(el.dataset.index)),
  'filter-group': el => { ui.groupFilter = el.dataset.group || null; render(); },
  'step': el => stepField(el.dataset.field, Number(el.dataset.dir)),
  'save-log': () => saveLog(),
  'more-history': () => { ui.historyLimit += HISTORY_PAGE; render(); },
  'ask-delete-log': el => askDeleteLog(el.dataset.id),
  'delete-log': el => deleteLog(el.dataset.id),
  'month-prev': () => { ui.month = new Date(ui.month.getFullYear(), ui.month.getMonth() - 1, 1); render(); },
  'month-next': () => { ui.month = new Date(ui.month.getFullYear(), ui.month.getMonth() + 1, 1); render(); },
  'month-today': () => { const d = new Date(); ui.month = new Date(d.getFullYear(), d.getMonth(), 1); render(); },
  'open-day': el => openDaySheet(el.dataset.date),
  'toggle-mark': el => toggleMark(el.dataset.date),
  'day-open-machine': el => { closeSheet(); openMachine(el.dataset.id, el.dataset.date); },
  'export': () => exportData(),
  'import': () => importInput.click(),
  'confirm-import': () => confirmImport(),
  'ask-wipe': () => confirmSheet({
    title: 'Удалить все данные?',
    text: 'Удалятся все тренажёры, записи и отметки в календаре. Если нужна история, сначала сохрани копию.',
    confirmLabel: 'Удалить всё',
    confirmAction: 'wipe',
  }),
  'wipe': () => wipe(),
  'dismiss-install': () => { prefs.installHintDismissed = true; savePrefs(); render(); },
  'close-sheet': () => closeSheet(),
  'fill-preset': el => {
    const p = PRESETS[Number(el.dataset.index)];
    if (!p || !machineForm) return;
    $('#m-name', sheet).value = p.name;
    Object.assign(machineForm, { group: p.group, plate: p.plate, step: p.step });
    syncMachineForm();
  },
  'pick-group': el => { machineForm.group = el.dataset.value; syncMachineForm(); },
  'pick-plate': el => { machineForm.plate = el.dataset.value; syncMachineForm(); },
  'pick-step': el => { machineForm.step = Number(el.dataset.value); syncMachineForm(); },
  'submit-machine': () => submitMachine(),
  'ask-delete-machine': () => askDeleteMachine(),
  'delete-machine': el => deleteMachine(el.dataset.id),
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const handler = actions[el.dataset.action];
  if (!handler) return;
  e.preventDefault();
  handler(el, e);
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (e.target.id === 'm-name') { e.preventDefault(); submitMachine(); }
  else if (e.target.classList && e.target.classList.contains('step-input')) { e.preventDefault(); e.target.blur(); }
});

for (const tab of $$('.tab')) tab.dataset.action = 'tab';

let resizeFrame = 0;
window.addEventListener('resize', () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => { if (ui.machineId) drawChart(); });
});

/* ================= toast ================= */

const toastEl = $('#toast');
let toastTimer = null;
function toast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  void toastEl.offsetHeight;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 220);
  }, TOAST_MS);
}

/* ================= boot ================= */

history.replaceState(null, '');
render();

if (navigator.storage && typeof navigator.storage.persist === 'function') {
  navigator.storage.persist().catch(() => {});
}
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
