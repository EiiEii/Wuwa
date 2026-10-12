'use strict';

const $ = (selector) => document.querySelector(selector);
const getJSON = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value == null ? fallback : value;
  } catch (_) {
    return fallback;
  }
};
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const initials = (name) => String(name || '?').split(/[\s(:]+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
const colors = {
  Spectro: '#f4d16f', Havoc: '#d98aff', Aero: '#79e6c2', Electro: '#d3a0ff',
  Fusion: '#ff9b72', Glacio: '#8bd9ff', Variable: '#b3e8ec'
};
const echoes = [
  ['Freezing Frost', 'Glacio Sonata'], ['Molten Rift', 'Fusion Sonata'],
  ['Void Thunder', 'Electro Sonata'], ['Sierra Gale', 'Aero Sonata'],
  ['Celestial Light', 'Spectro Sonata'], ['Sun-sinking Eclipse', 'Havoc Sonata'],
  ['Rejuvenating Glow', 'Support Sonata'], ['Moonlit Clouds', 'Support Sonata'],
  ['Lingering Tunes', 'Support Sonata'], ['Tidebreaking Courage', 'Sonata set'],
  ['Empyrean Anthem', 'Sonata set']
];
const versions = [
  ['1.0', 'Launch roster and original Resonators'], ['1.1', 'Jinhsi, Changli'],
  ['1.2', 'Zhezhi, Xiangli Yao'], ['1.3', 'Shorekeeper, Youhu'],
  ['1.4', 'Camellya, Lumi'], ['2.0', 'Carlotta, Roccia'],
  ['2.1', 'Phoebe, Brant'], ['2.2', 'Cantarella, Aero Rover'],
  ['2.3', 'Zani, Ciaccona'], ['2.4', 'Cartethyia, Lupa'], ['2.5', 'Phrolova'],
  ['2.6', 'Augusta, Iuno'], ['2.7', 'Galbrena, Qiuyuan'], ['2.8', 'Chisa, Buling'],
  ['3.0', 'Lynae, Mornye'], ['3.1', 'Aemeath, Luuk Herssen'], ['3.2', 'Sigrika'],
  ['3.3', 'Hiyuki, Denia'], ['3.4', 'Lucy, Rebecca, Lucilla'],
  ['3.5', 'Yangyang: Xuanling, Electro Rover, Suisui'], ['3.6', 'Qingxiao, Jingran'],
  ['3.7', 'Hsin']
];
const quoteList = [
  'Once I dreamt that we were dear to each other. I woke to find that we were strangers.',
  'Every echo leaves a trace. Every choice changes the resonance.',
  'A new wave begins where the old one fades.'
];
let roster = [];
let favorites = new Set(getJSON('solaris-favs', []));
let team = [];
let saved = getJSON('solaris-teams', []);
let onlyFav = false;
let soundOn = false;
let audioContext = null;
let quoteIndex = 0;
let gacha = { p5: 0, p4: 0, total: 0, results: [] };
let builds = getJSON('solaris-builds', {});
let tiers = getJSON('solaris-tierboard', {});

function saveLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (_) { toast('Could not save: device storage is unavailable'); }
}
function tone(frequency = 500) {
  if (!soundOn) return;
  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.035, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.12);
  } catch (_) { /* Audio is optional; the rest of the site should still work. */ }
}
function toast(message) {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('show'), 2200);
}
function card(resonator) {
  const accent = colors[resonator.element] || '#76f4e2';
  const art = resonator.artwork
    ? `<img loading="lazy" src="${esc(resonator.artwork)}" alt="${esc(resonator.name)} artwork" onerror="this.remove()">`
    : '';
  return `<article class="card" style="--accent:${accent}">
    <button class="favorite ${favorites.has(resonator.id) ? 'active' : ''}" data-fav="${esc(resonator.id)}" aria-label="Toggle favorite">${favorites.has(resonator.id) ? '★' : '☆'}</button>
    <button class="open-card" data-open="${esc(resonator.id)}"><div class="art">
      <span class="idtag">${esc(resonator.id).toUpperCase()}</span><span class="rarity">${'★'.repeat(Math.max(0, Number(resonator.rarity) || 0))}</span>
      <span class="initial">${esc(initials(resonator.name))}</span>${art}
    </div><div class="cardinfo"><div class="name">${esc(resonator.name)}</div>
      <div class="metadata"><span class="element">${esc(resonator.element)}</span><span>${esc(resonator.weapon)}</span></div>
    </div></button></article>`;
}
function currentList() {
  const q = ($('#search')?.value || '').trim().toLowerCase();
  const element = $('#element')?.value || '';
  const weapon = $('#weapon')?.value || '';
  const rarity = $('#rarity')?.value || '';
  const version = $('#version')?.value || '';
  return roster.filter(r =>
    (!q || String(r.name || '').toLowerCase().includes(q)) &&
    (!element || r.element === element) && (!weapon || r.weapon === weapon) &&
    (!rarity || String(r.rarity) === rarity) && (!version || r.version === version) &&
    (!onlyFav || favorites.has(r.id))
  );
}
function renderCards() {
  const node = $('#cards');
  if (!node) return;
  const list = currentList();
  node.innerHTML = list.map(card).join('') || '<div class="blank" style="grid-column:1/-1">NO MATCHING RECORDS — ADJUST YOUR FILTERS</div>';
  if ($('#shownCount')) $('#shownCount').textContent = list.length;
  if ($('#rosterCount')) $('#rosterCount').textContent = roster.length;
}
function toggleFav(id) {
  favorites.has(id) ? favorites.delete(id) : favorites.add(id);
  saveLocal('solaris-favs', [...favorites]);
  renderCards();
  renderPicker();
  tone(700);
}
function profile(id) {
  const r = roster.find(item => item.id === id);
  if (!r) return;
  const accent = colors[r.element] || '#76f4e2';
  const image = r.artwork ? `<img src="${esc(r.artwork)}" alt="${esc(r.name)} artwork" onerror="this.remove()">` : esc(initials(r.name));
  $('#modalContent').innerHTML = `<div class="profilehead"><div class="profileart" style="--accent:${accent}">${image}</div><div>
    <span class="eyebrow">RESONATOR RECORD / ${esc(r.id).toUpperCase()}</span><h2 id="modalName">${esc(r.name)}</h2><span class="element">${esc(r.element)}</span>
  </div></div><div class="profilefields">
    <div class="profilefield"><small>ATTRIBUTE</small><b>${esc(r.element)}</b></div><div class="profilefield"><small>WEAPON</small><b>${esc(r.weapon)}</b></div>
    <div class="profilefield"><small>RARITY</small><b>${esc(r.rarity)}-Star</b></div><div class="profilefield"><small>DEBUT VERSION</small><b>${esc(r.version)}</b></div>
  </div><p class="profile-note">Builds, exact weapon rankings, skill multipliers and voice lines are not added until they can be sourced reliably. Artwork can be set with the <code>artwork</code> field in <code>resonators.json</code>.</p>
  <div class="profile-buttons"><button class="btn primary" data-add="${esc(r.id)}">ADD TO TEAM ↗</button><button class="btn ghost" data-fav="${esc(r.id)}">${favorites.has(r.id) ? '★ FAVORITED' : '☆ ADD FAVORITE'}</button>
  ${r.guideUrl ? `<a class="btn ghost" href="${esc(r.guideUrl)}" target="_blank" rel="noopener">OPEN BUILD GUIDE ↗</a>` : ''}</div>`;
  $('#modal').classList.add('open');
  $('#modal').setAttribute('aria-hidden', 'false');
  tone(600);
}
function closeModal() {
  $('#modal')?.classList.remove('open');
  $('#modal')?.setAttribute('aria-hidden', 'true');
}
function renderSlots() {
  $('#slots').innerHTML = [0, 1, 2].map(index => {
    const r = roster.find(item => item.id === team[index]);
    return `<div class="slot ${r ? 'filled' : ''}">${r ? `<button class="remove" data-remove="${index}" aria-label="Remove ${esc(r.name)}">×</button>
      <span class="initial" style="color:${colors[r.element] || '#76f4e2'}">${esc(initials(r.name))}</span><b class="slot-name">${esc(r.name)}</b><span class="slot-meta">${esc(r.element)} / ${esc(r.weapon)}</span>`
      : `<span class="initial">＋</span><b class="slot-name">OPEN SLOT ${index + 1}</b><span class="slot-meta">Choose below</span>`}</div>`;
  }).join('');
}
function renderPicker() {
  const node = $('#pickGrid');
  if (!node) return;
  const q = ($('#teamSearch')?.value || '').trim().toLowerCase();
  node.innerHTML = roster.filter(r => String(r.name || '').toLowerCase().includes(q)).map(r =>
    `<button class="pick" data-add="${esc(r.id)}" ${team.includes(r.id) ? 'disabled' : ''}><b>${esc(r.name)}</b><small>${esc(r.element)}${team.includes(r.id) ? ' · ADDED' : ''}</small></button>`
  ).join('') || '<p class="muted">No Resonators match that search.</p>';
}
function addTeam(id) {
  if (!roster.some(r => r.id === id)) return;
  if (team.includes(id)) return toast('Already in your team');
  if (team.length >= 3) return toast('Team full — remove a slot first');
  team.push(id);
  renderSlots(); renderPicker(); tone(640);
}
function renderSaved() {
  $('#savedTeams').innerHTML = saved.length ? saved.map((item, index) =>
    `<div class="saved-item"><div><b>${esc(item.name)}</b><small>${(item.members || []).map(id => esc(roster.find(r => r.id === id)?.name || 'Unknown')).join(' / ')}</small></div>
    <div><button data-load="${index}">LOAD</button> <button data-delete="${index}" aria-label="Delete saved team">×</button></div></div>`
  ).join('') : '<p class="muted">No saved teams yet.</p>';
}
function renderGacha() {
  $('#pity5').textContent = `${gacha.p5} / 80`;
  $('#pity4').textContent = `${gacha.p4} / 10`;
  $('#pullCount').textContent = gacha.total;
  $('#results').innerHTML = gacha.results.length ? gacha.results.map(result =>
    `<div class="result ${result.rarity === 5 ? 'five' : result.rarity === 4 ? 'four' : ''}"><div class="stars">${'★'.repeat(result.rarity)}</div><div><b>${esc(result.name)}</b><small>PULL #${result.n} / ${result.rarity}-STAR SIMULATED</small></div></div>`
  ).join('') : '<div class="blank">Your results will appear here.</div>';
}
function pull(count) {
  for (let i = 0; i < count; i += 1) {
    gacha.total += 1; gacha.p5 += 1; gacha.p4 += 1;
    let rarity = 3;
    if (gacha.p5 >= 80 || Math.random() < 0.008) { rarity = 5; gacha.p5 = 0; gacha.p4 = 0; }
    else if (gacha.p4 >= 10 || Math.random() < 0.1) { rarity = 4; gacha.p4 = 0; }
    const pool = roster.filter(r => Number(r.rarity) === rarity);
    gacha.results.unshift({ rarity, name: pool.length ? pool[Math.floor(Math.random() * pool.length)].name : 'Simulated item', n: gacha.total });
  }
  gacha.results = gacha.results.slice(0, 80);
  renderGacha(); tone(gacha.results[0]?.rarity === 5 ? 850 : 500);
}
function calculate() {
  const base = Math.max(0, Number($('#base').value) || 0);
  const bonus = (Number($('#bonus').value) || 0) / 100;
  const critRate = Math.max(0, Math.min(100, Number($('#crit').value) || 0)) / 100;
  const critDamage = Math.max(0, Number($('#critDmg').value) || 0) / 100;
  const multiplier = Math.max(0, Math.min(100, Number($('#mult').value) || 0)) / 100;
  const normal = base * (1 + bonus) * multiplier;
  const critical = normal * critDamage;
  const average = normal * (1 - critRate) + critical * critRate;
  $('#normal').textContent = Math.round(normal).toLocaleString();
  $('#critical').textContent = Math.round(critical).toLocaleString();
  $('#average').textContent = Math.round(average).toLocaleString();
  $('#expected').textContent = Math.round(average).toLocaleString();
}
function renderEchoes() {
  const query = ($('#echoSearch').value || '').toLowerCase();
  $('#echoes').innerHTML = echoes.filter(item => item.join(' ').toLowerCase().includes(query)).map(item =>
    `<div class="echo"><b>${esc(item[0])}</b><span>${esc(item[1])}</span></div>`
  ).join('') || '<p class="muted">No match in starter index.</p>';
}
function renderTimeline() {
  $('#timeline').innerHTML = versions.slice().reverse().map(item =>
    `<div class="timeline-item"><b>${esc(item[0])}</b><span>${esc(item[1])}</span></div>`
  ).join('');
}
function selectRoster(selector) {
  $(selector).innerHTML = roster.map(r => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join('');
}
function loadBuild() {
  const id = $('#buildChar').value;
  const build = builds[id] || {};
  $('#buildWeapon').value = build.weapon || '';
  $('#buildEcho').value = build.echo || '';
  $('#buildMain').value = build.main || '';
  $('#buildSubs').value = build.subs || '';
  $('#buildNotes').value = build.notes || '';
}
function renderTierBoard() {
  $('#tierBoard').innerHTML = Object.entries(tiers).length ? Object.entries(tiers).map(([id, tier]) => {
    const r = roster.find(item => item.id === id);
    if (!r) return '';
    return `<div class="tierrow"><span class="tierbadge">${esc(tier[0])}</span><b>${esc(r.name)}<small style="display:block;color:var(--muted);font-size:8px;margin-top:3px">${esc(tier[1])}</small></b><button data-tierremove="${esc(id)}" aria-label="Remove tier ranking">×</button></div>`;
  }).join('') : '<p class="muted">No personal rankings saved yet.</p>';
}
function initializeWorkshop() {
  selectRoster('#buildChar'); selectRoster('#tierChar'); loadBuild(); renderTierBoard();
  $('#buildChar').addEventListener('change', loadBuild);
  $('#saveBuild').addEventListener('click', () => {
    const id = $('#buildChar').value;
    builds[id] = { weapon: $('#buildWeapon').value.trim(), echo: $('#buildEcho').value.trim(), main: $('#buildMain').value.trim(), subs: $('#buildSubs').value.trim(), notes: $('#buildNotes').value.trim() };
    saveLocal('solaris-builds', builds); toast('Build notes saved on this device');
  });
  $('#searchGuide').addEventListener('click', () => {
    const r = roster.find(item => item.id === $('#buildChar').value);
    if (r) window.open('https://www.google.com/search?q=' + encodeURIComponent(`Wuthering Waves ${r.name} build guide weapon echo site:wutheringlab.com OR site:prydwen.gg`), '_blank', 'noopener');
  });
  $('#addTier').addEventListener('click', () => {
    const id = $('#tierChar').value;
    const value = $('#tierValue').value;
    const tier = value.startsWith('UNRANKED') ? '—' : value.split(' — ')[0];
    tiers[id] = [tier, value]; saveLocal('solaris-tierboard', tiers); renderTierBoard(); toast('Personal tier updated');
  });
  $('#tierBoard').addEventListener('click', event => {
    const button = event.target.closest('[data-tierremove]');
    if (button) { delete tiers[button.dataset.tierremove]; saveLocal('solaris-tierboard', tiers); renderTierBoard(); }
  });
}
async function loadUpcoming() {
  const node = $('#upcoming');
  if (node.dataset.loaded === '1') return;
  try {
    const response = await fetch('upcoming.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const items = await response.json();
    if (!Array.isArray(items)) throw new Error('Unexpected data format');
    node.innerHTML = items.map(item => `<div class="upcoming-item"><b>${esc(item.name)}</b> — ${esc(item.status)}<br><small>${esc(item.rarity)}★ / ${esc(item.element)} / ${esc(item.weapon)}</small></div>`).join('') || '<p class="muted">No upcoming records listed.</p>';
    node.dataset.loaded = '1';
  } catch (error) {
    node.textContent = 'Unable to load upcoming data. Check that upcoming.json is beside index.html.';
  }
}
async function init() {
  const cards = $('#cards');
  try {
    const response = await fetch('resonators.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Roster data is not an array');
    roster = data.filter(item => item && item.id && item.name);
  } catch (error) {
    if (cards) cards.innerHTML = '<div class="blank" style="grid-column:1/-1">Could not load resonators.json. Make sure it is in the same folder as index.html and app.js.</div>';
    if ($('#rosterCount')) $('#rosterCount').textContent = '—';
    if ($('#shownCount')) $('#shownCount').textContent = '—';
    console.error('Solaris Archive roster loading failed:', error);
    return;
  }

  const versionsInRoster = [...new Set(roster.map(r => r.version).filter(Boolean))].sort((a, b) => {
    const [aMajor = 0, aMinor = 0] = String(a).split('.').map(Number);
    const [bMajor = 0, bMinor = 0] = String(b).split('.').map(Number);
    return aMajor - bMajor || aMinor - bMinor;
  });
  $('#version').innerHTML = '<option value="">All versions</option>' + versionsInRoster.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
  renderCards(); renderSlots(); renderPicker(); renderSaved(); renderGacha(); renderEchoes(); renderTimeline(); calculate(); initializeWorkshop();

  ['search', 'element', 'weapon', 'rarity', 'version'].forEach(id => $('#' + id).addEventListener('input', renderCards));
  $('#favOnly').addEventListener('click', () => { onlyFav = !onlyFav; $('#favOnly').setAttribute('aria-pressed', String(onlyFav)); renderCards(); });
  $('#reset').addEventListener('click', () => {
    ['search', 'element', 'weapon', 'rarity', 'version'].forEach(id => { $('#' + id).value = ''; });
    onlyFav = false; $('#favOnly').setAttribute('aria-pressed', 'false'); renderCards();
  });
  $('#cards').addEventListener('click', event => {
    const favoriteButton = event.target.closest('[data-fav]');
    const openButton = event.target.closest('[data-open]');
    if (favoriteButton) { event.stopPropagation(); toggleFav(favoriteButton.dataset.fav); }
    else if (openButton) profile(openButton.dataset.open);
  });
  $('#modalContent').addEventListener('click', event => {
    const favoriteButton = event.target.closest('[data-fav]');
    const addButton = event.target.closest('[data-add]');
    if (favoriteButton) { const id = favoriteButton.dataset.fav; toggleFav(id); profile(id); }
    else if (addButton) { const id = addButton.dataset.add; closeModal(); addTeam(id); }
  });
  $('#modal').addEventListener('click', event => { if (event.target.dataset.close) closeModal(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
    if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) { event.preventDefault(); $('#search').focus(); }
  });
  $('#teamSearch').addEventListener('input', renderPicker);
  $('#pickGrid').addEventListener('click', event => { const button = event.target.closest('[data-add]'); if (button && !button.disabled) addTeam(button.dataset.add); });
  $('#slots').addEventListener('click', event => {
    const button = event.target.closest('[data-remove]');
    if (button) { team.splice(Number(button.dataset.remove), 1); renderSlots(); renderPicker(); }
  });
  $('#saveTeam').addEventListener('click', () => {
    if (!team.length) return toast('Choose at least one Resonator');
    saved.unshift({ name: $('#teamName').value.trim() || `Squad ${saved.length + 1}`, members: [...team] });
    saved = saved.slice(0, 30); saveLocal('solaris-teams', saved); renderSaved(); toast('Team saved on this device'); tone(800);
  });
  $('#savedTeams').addEventListener('click', event => {
    const loadButton = event.target.closest('[data-load]');
    const deleteButton = event.target.closest('[data-delete]');
    if (loadButton) { team = (saved[Number(loadButton.dataset.load)]?.members || []).filter(id => roster.some(r => r.id === id)).slice(0, 3); renderSlots(); renderPicker(); toast('Team loaded'); }
    if (deleteButton) { saved.splice(Number(deleteButton.dataset.delete), 1); saveLocal('solaris-teams', saved); renderSaved(); }
  });
  $('#clearTeams').addEventListener('click', () => {
    if (confirm('Delete every locally saved team?')) { saved = []; saveLocal('solaris-teams', saved); renderSaved(); }
  });
  $('#pull1').addEventListener('click', () => pull(1));
  $('#pull10').addEventListener('click', () => pull(10));
  $('#resetGacha').addEventListener('click', () => { gacha = { p5: 0, p4: 0, total: 0, results: [] }; renderGacha(); });
  $('#clearResults').addEventListener('click', () => { gacha.results = []; renderGacha(); });
  $('#calc').addEventListener('click', calculate);
  ['base', 'bonus', 'crit', 'critDmg', 'mult'].forEach(id => $('#' + id).addEventListener('input', calculate));
  $('#echoSearch').addEventListener('input', renderEchoes);
  $('#nextQuote').addEventListener('click', () => { quoteIndex = (quoteIndex + 1) % quoteList.length; $('#quote').textContent = quoteList[quoteIndex]; });
  $('#theme').addEventListener('click', () => {
    document.body.classList.toggle('light');
    try { localStorage.setItem('solaris-theme', document.body.classList.contains('light') ? 'light' : 'dark'); } catch (_) {}
    tone(450);
  });
  try { if (localStorage.getItem('solaris-theme') === 'light') document.body.classList.add('light'); } catch (_) {}
  $('#sound').addEventListener('click', () => { soundOn = !soundOn; $('#sound').style.color = soundOn ? 'var(--cyan)' : ''; toast(soundOn ? 'UI sounds enabled' : 'UI sounds muted'); tone(600); });
  $('#menu').addEventListener('click', () => $('#nav').classList.toggle('open'));
  $('#nav').addEventListener('click', event => { if (event.target.closest('a')) $('#nav').classList.remove('open'); });
  $('#upcomingToggle').addEventListener('click', async () => {
    const node = $('#upcoming');
    if (node.dataset.loaded !== '1') await loadUpcoming();
    node.classList.toggle('hidden');
    $('#upcomingToggle').textContent = node.classList.contains('hidden') ? 'SHOW ANNOUNCED / UPCOMING ↗' : 'HIDE ANNOUNCED / UPCOMING ↗';
  });
}

init();
