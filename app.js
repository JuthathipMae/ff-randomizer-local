/**
 * FF RANDOM — Free Fire Loadout & Generator
 * Fully vanilla JavaScript, Web Audio API, No Emojis, Responsive UI
 */

// SVG Icon Definitions (Strictly No Emojis - Lucide Icons)
const ICONS = {
  character: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  weapon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>`,
  pet: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"></circle><circle cx="18" cy="8" r="2"></circle><circle cx="20" cy="16" r="2"></circle><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"></path></svg>`,
  map: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>`,
  zap: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  check: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
};

// 9 Standard Free Fire Weapon Categories
const WEAPON_CATEGORIES = [
  { key: 'Pistols', label: 'ปืนพก (Pistols)', short: 'ปืนพก', desc: 'USP, Desert Eagle, G18, M500, UZI, Hand Cannon...' },
  { key: 'AR', label: 'ปืนไรเฟิลจู่โจม (AR)', short: 'AR', desc: 'SCAR, AK47, M4A1, Groza, FAMAS, XM8, AN94, AUG...' },
  { key: 'Snipers', label: 'ปืนสไนเปอร์ (Snipers)', short: 'สไนเปอร์', desc: 'AWM, M82B, Kar98k, M24, AC80, SKS, SVD, Woodpecker...' },
  { key: 'Shotguns', label: 'ปืนลูกซอง (Shotguns)', short: 'ลูกซอง', desc: 'M1887, M1014, MAG-7, SPAS12, Trogon, M590, Charge Buster' },
  { key: 'SMG', label: 'ปืนกลมือ (SMG)', short: 'SMG', desc: 'MP40, UMP, MP5, Thompson, P90, Vector, MAC10, Bizon...' },
  { key: 'LMG', label: 'ปืนกลเบา (LMG)', short: 'LMG', desc: 'M249, Kord, Gatling, M60' },
  { key: 'Melee', label: 'อาวุธประชิด (Melee)', short: 'ประชิด', desc: 'Katana, Pan, Bat, Scythe, Parang, FF Knife' },
  { key: 'Throwables', label: 'อาวุธขว้าง (Throwables)', short: 'อาวุธขว้าง', desc: 'Grenade, Flash Freeze, Smoke, Gloo Melter, Gloo Wall' },
  { key: 'Special Weapons', label: 'อาวุธพิเศษ (Special Weapons)', short: 'พิเศษ', desc: 'Crossbow, RGS-50, M79, MGL140, Flamethrower, FGL-24...' }
];

// Web Audio API Synthesizer (No external audio files)
class SoundFX {
  constructor() {
    this.enabled = localStorage.getItem('ffr_sound_muted') !== 'true';
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 200, t);
      osc.frequency.exponentialRampToValueAtTime(350, t + 0.035);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch (_) {}
  }

  playWin() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const start = t + i * 0.075;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch (_) {}
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('ffr_sound_muted', this.enabled ? 'false' : 'true');
    this.updateUI();
    if (this.enabled) this.playTick();
  }

  updateUI() {
    const onIcon = document.getElementById('soundOnIcon');
    const offIcon = document.getElementById('soundOffIcon');
    const label = document.getElementById('soundLabel');
    const btn = document.getElementById('soundToggleBtn');

    if (this.enabled) {
      if (onIcon) onIcon.hidden = false;
      if (offIcon) offIcon.hidden = true;
      if (label) label.textContent = 'เสียง: เปิด';
      if (btn) btn.classList.remove('muted');
    } else {
      if (onIcon) onIcon.hidden = true;
      if (offIcon) offIcon.hidden = false;
      if (label) label.textContent = 'เสียง: ปิด';
      if (btn) btn.classList.add('muted');
    }
  }
}

const soundFX = new SoundFX();

// Global Application State
const state = {
  raw: {
    characters: [],
    weapons: [],
    pets: [],
    maps: []
  },
  used: {
    character: new Set(),
    weapon: new Set(),
    pet: new Set(),
    map: new Set()
  },
  filters: {
    // Multi-select categories: all 9 selected by default
    types: new Set(WEAPON_CATEGORIES.map(c => c.key))
  },
  activeCategory: 'character',
  mode: 'single', // single | squad
  noRepeat: true,
  history: [],
  isRolling: false
};

// Categorize weapon into 9 Free Fire standard categories
function getWeaponCategory(w) {
  if (w.category) return w.category;
  const n = (w.name || '').trim().toLowerCase();
  const t = (w.type || '').trim().toLowerCase();

  // 1. Throwables
  if (
    t.includes('throwable') ||
    t.includes('projectile') ||
    n.includes('grenade') ||
    n.includes('gloo') ||
    n.includes('flash freeze') ||
    n.includes('landmine')
  ) {
    return 'Throwables';
  }

  // 2. Special Weapons
  if (
    n === 'crossbow' ||
    n === 'rgs-50' ||
    n === 'm79' ||
    n === 'mgl140' ||
    n === 'flamethrower' ||
    n === 'hydro blaster' ||
    n === 'fgl-24' ||
    t.includes('launcher') ||
    t.includes('bow') ||
    t.includes('event weapon')
  ) {
    return 'Special Weapons';
  }

  // 3. Melee
  if (t.includes('melee') || ['katana', 'pan', 'bat', 'machete', 'scythe', 'parang', 'ff knife'].includes(n)) {
    return 'Melee';
  }

  // 4. Pistols
  if (
    ['usp', 'usp-2', 'g18', 'desert eagle', 'm500', 'm1917', 'm1873', 'uzi', 'hand cannon', 'healing pistol'].includes(n) ||
    t.includes('pistol')
  ) {
    return 'Pistols';
  }

  // 5. Shotguns
  if (
    t.includes('shotgun') ||
    ['m1887', 'm1014', 'mag-7', 'spas12', 'trogon', 'm590', 'charge buster'].includes(n)
  ) {
    return 'Shotguns';
  }

  // 6. Snipers & Marksman
  if (
    t.includes('sniper') ||
    t.includes('marksman') ||
    ['awm', 'm82b', 'kar98k', 'm24', 'vsk94', 'healing sniper', 'ac80', 'sks', 'svd', 'woodpecker', 'winchester'].includes(n)
  ) {
    return 'Snipers';
  }

  // 7. LMG
  if (t.includes('machine gun') || ['m249', 'kord', 'gatling', 'm60'].includes(n)) {
    return 'LMG';
  }

  // 8. SMG
  if (
    t.includes('smg') ||
    ['mp40', 'ump', 'mp5', 'thompson', 'p90', 'vector', 'mac10', 'bizon', 'vss', 'cg15'].includes(n)
  ) {
    return 'SMG';
  }

  // 9. AR
  if (
    t.includes('assault') ||
    ['scar', 'ak47', 'm4a1', 'groza', 'famas', 'xm8', 'an94', 'aug', 'parafal', 'g36', 'm14', 'kingfisher', 'plasma', 'shield gun', 'treatment laser gun'].includes(n)
  ) {
    return 'AR';
  }

  return 'Special Weapons';
}

// Filter weapons strictly by selected categories
function getFilteredWeapons() {
  return state.raw.weapons.filter(w => {
    const cat = getWeaponCategory(w);
    return state.filters.types.has(cat);
  });
}

// Generate image path
function slugifyName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\./g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

function resolveImagePath(item, category) {
  if (item.local_image_path) return item.local_image_path;
  if (item.image) return item.image;

  const slug = slugifyName(item.name);
  if (category === 'character') return `assets/img/characters/${slug}.png`;
  if (category === 'weapon') return `assets/img/weapons/${slug}.png`;
  if (category === 'pet') return `assets/img/pets/${slug}.png`;
  if (category === 'map') return `assets/img/maps/${slug}.png`;

  return '';
}

// Handle image load error: try SVG then fallback
window.handleImgError = function (imgEl, category) {
  const src = imgEl.getAttribute('src') || '';
  if (src.endsWith('.png') && !imgEl.dataset.triedSvg) {
    imgEl.dataset.triedSvg = 'true';
    imgEl.src = src.replace(/\.png$/, '.svg');
    return;
  }
  imgEl.style.display = 'none';
  const fallbackEl = imgEl.nextElementSibling;
  if (fallbackEl) fallbackEl.style.display = 'inline-block';
};

// Toast notification helper
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// Fetch and initialize fallback.json
async function initData() {
  const statusText = document.getElementById('dataStatusText');
  try {
    const res = await fetch('data/fallback.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('โหลดไฟล์ fallback.json ไม่สำเร็จ');
    const json = await res.json();

    state.raw.characters = json.characters || [];
    // Keep all 75 weapons including throwables for full 9 categories!
    state.raw.weapons = json.weapons || [];
    state.raw.pets = json.pets || [];
    state.raw.maps = json.maps || [];

    const totalValid =
      state.raw.characters.length +
      state.raw.weapons.length +
      state.raw.pets.length +
      state.raw.maps.length;

    renderWeaponTypeChips();
    updateWeaponFilterSummary();
    updateCounts();
    soundFX.updateUI();

    if (statusText) {
      statusText.textContent = `ฐานข้อมูลพร้อม (${totalValid} รายการ)`;
    }
  } catch (err) {
    console.error(err);
    if (statusText) statusText.textContent = 'โหลดข้อมูลไม่สำเร็จ';
    showToast('ไม่สามารถโหลดข้อมูล data/fallback.json ได้');
  }
}

// Render dynamic weapon category chips with multi-select toggle
function renderWeaponTypeChips() {
  const container = document.getElementById('weaponTypesGrid');
  if (!container) return;

  // Calculate count per category
  const categoryCounts = {};
  state.raw.weapons.forEach(w => {
    const cat = getWeaponCategory(w);
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  container.innerHTML = WEAPON_CATEGORIES.map(cat => {
    const isChecked = state.filters.types.has(cat.key);
    const count = categoryCounts[cat.key] || 0;
    return `
      <button 
        class="weapon-chip ${isChecked ? 'active' : ''}" 
        type="button" 
        role="checkbox" 
        aria-checked="${isChecked}"
        data-cat="${cat.key}"
      >
        <div class="chip-left">
          <span class="chip-checkbox">
            ${ICONS.check}
          </span>
          <div class="chip-text-group">
            <strong class="chip-label">${cat.label}</strong>
            <span class="chip-desc">${cat.desc}</span>
          </div>
        </div>
        <span class="chip-badge">${count}</span>
      </button>
    `;
  }).join('');

  // Add click handlers for chips
  container.querySelectorAll('.weapon-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const catKey = chip.dataset.cat;
      if (state.filters.types.has(catKey)) {
        state.filters.types.delete(catKey);
        chip.classList.remove('active');
        chip.setAttribute('aria-checked', 'false');
      } else {
        state.filters.types.add(catKey);
        chip.classList.add('active');
        chip.setAttribute('aria-checked', 'true');
      }

      soundFX.playTick();
      updateSelectAllButtonState();
      updateWeaponFilterSummary();
      updateCounts();
    });
  });

  updateSelectAllButtonState();
}

// Update "Select All / Clear All" Toggle Button state
function updateSelectAllButtonState() {
  const btn = document.getElementById('toggleAllTypesBtn');
  const text = document.getElementById('toggleAllTypesText');
  if (!btn || !text) return;

  const totalCategories = WEAPON_CATEGORIES.length;
  const selectedCount = state.filters.types.size;

  if (selectedCount === totalCategories) {
    btn.classList.add('active');
    text.textContent = 'ปืนทั้งหมด (คลิกเพื่อล้าง)';
  } else if (selectedCount === 0) {
    btn.classList.remove('active');
    text.textContent = 'เลือกทั้งหมด (Select All)';
  } else {
    btn.classList.add('active');
    text.textContent = `เลือกทั้งหมด (${selectedCount}/${totalCategories})`;
  }
}

// Toggle Select All / Clear All in one click
function toggleAllWeaponTypes() {
  const totalCategories = WEAPON_CATEGORIES.length;
  const isAllSelected = state.filters.types.size === totalCategories;

  if (isAllSelected) {
    state.filters.types.clear();
  } else {
    state.filters.types = new Set(WEAPON_CATEGORIES.map(c => c.key));
  }

  // Update chip elements in DOM
  const chips = document.querySelectorAll('#weaponTypesGrid .weapon-chip');
  chips.forEach(chip => {
    const isChecked = state.filters.types.has(chip.dataset.cat);
    chip.classList.toggle('active', isChecked);
    chip.setAttribute('aria-checked', isChecked ? 'true' : 'false');
  });

  soundFX.playTick();
  updateSelectAllButtonState();
  updateWeaponFilterSummary();
  updateCounts();
}

function updateWeaponFilterSummary() {
  const available = getFilteredWeapons();
  const summaryEl = document.getElementById('activeWeaponCount');
  if (summaryEl) {
    summaryEl.textContent = `${available.length} กระบอก (${state.filters.types.size}/${WEAPON_CATEGORIES.length} หมวดหมู่)`;
  }
}

// Update remaining counts & category badges
function updateCounts() {
  const filteredWeaponCount = getFilteredWeapons().length;

  const countChar = document.getElementById('count-character');
  const countWep = document.getElementById('count-weapon');
  const countPet = document.getElementById('count-pet');
  const countMap = document.getElementById('count-map');

  if (countChar) countChar.textContent = state.raw.characters.length;
  if (countWep) countWep.textContent = filteredWeaponCount;
  if (countPet) countPet.textContent = state.raw.pets.length;
  if (countMap) countMap.textContent = state.raw.maps.length;

  // Remaining in pool
  const remChar = document.getElementById('rem-character');
  const remWep = document.getElementById('rem-weapon');
  const remPet = document.getElementById('rem-pet');
  const remMap = document.getElementById('rem-map');

  if (remChar) remChar.textContent = Math.max(0, state.raw.characters.length - state.used.character.size);
  if (remWep) remWep.textContent = Math.max(0, filteredWeaponCount - state.used.weapon.size);
  if (remPet) remPet.textContent = Math.max(0, state.raw.pets.length - state.used.pet.size);
  if (remMap) remMap.textContent = Math.max(0, state.raw.maps.length - state.used.map.size);

  const poolTag = document.getElementById('categoryPoolCount');
  if (poolTag) {
    let avail = 0;
    if (state.activeCategory === 'character') avail = state.raw.characters.length - state.used.character.size;
    else if (state.activeCategory === 'weapon') avail = filteredWeaponCount - state.used.weapon.size;
    else if (state.activeCategory === 'pet') avail = state.raw.pets.length - state.used.pet.size;
    else if (state.activeCategory === 'map') avail = state.raw.maps.length - state.used.map.size;
    poolTag.textContent = `คงเหลือ: ${Math.max(0, avail)} รายการ`;
  }
}

// Get candidate pool respecting deduplication toggle
function getCandidatePool(category, customList = null) {
  let list = [];
  if (customList) {
    list = customList;
  } else if (category === 'character') {
    list = state.raw.characters;
  } else if (category === 'weapon') {
    list = getFilteredWeapons();
  } else if (category === 'pet') {
    list = state.raw.pets;
  } else if (category === 'map') {
    list = state.raw.maps;
  }

  if (list.length === 0) return [];

  if (!state.noRepeat) {
    return list;
  }

  // Deduplication active: filter out items whose names are in used Set
  const usedSet = state.used[category] || new Set();
  let available = list.filter(item => !usedSet.has(item.name));

  // If pool exhausted, reset this category's pool
  if (available.length === 0) {
    usedSet.clear();
    available = list;
    showToast(`รีเซ็ตรายการในหมวด ${category.toUpperCase()} แล้ว`);
  }

  return available;
}

// Pick one random item
function pickItem(category, customList = null) {
  const candidates = getCandidatePool(category, customList);
  if (!candidates || candidates.length === 0) return null;

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  if (state.noRepeat && chosen) {
    state.used[category].add(chosen.name);
  }
  return chosen;
}

// SINGLE ITEM ROLL WITH SLOT ANIMATION
function rollSingleItem() {
  if (state.isRolling) return;

  const category = state.activeCategory;

  // Validation: if rolling weapon, check if user has selected categories
  if (category === 'weapon') {
    if (state.filters.types.size === 0) {
      showToast('กรุณาเลือกประเภทอาวุธอย่างน้อย 1 ประเภทก่อนสุ่ม');
      return;
    }
    const filteredWeps = getFilteredWeapons();
    if (filteredWeps.length === 0) {
      showToast('กรุณาเลือกประเภทอาวุธอย่างน้อย 1 ประเภทก่อนสุ่ม');
      return;
    }
  }

  const pool = getCandidatePool(category);

  if (!pool || pool.length === 0) {
    if (category === 'weapon') {
      showToast('กรุณาเลือกประเภทอาวุธอย่างน้อย 1 ประเภทก่อนสุ่ม');
    } else {
      showToast('ไม่มีรายการในหมวดนี้');
    }
    return;
  }

  state.isRolling = true;
  const spinBtn = document.getElementById('spinBtn');
  if (spinBtn) spinBtn.disabled = true;

  const finalItem = pickItem(category);
  const dropContent = document.getElementById('dropContent');
  const dropStatus = document.getElementById('dropStatus');
  if (dropStatus) dropStatus.textContent = 'กำลังสุ่ม...';

  // Slot Roll Deceleration Animation
  let step = 0;
  const totalSteps = 12;

  function doTick() {
    step++;
    const randomPreview = pool[Math.floor(Math.random() * pool.length)];
    renderCardContent(dropContent, randomPreview, category, true);
    soundFX.playTick();

    if (step < totalSteps) {
      const delay = 50 + Math.pow(step, 1.8) * 8;
      setTimeout(doTick, delay);
    } else {
      renderCardContent(dropContent, finalItem, category, false);
      soundFX.playWin();
      if (dropStatus) dropStatus.textContent = category.toUpperCase();

      state.isRolling = false;
      if (spinBtn) spinBtn.disabled = false;
      addToHistory(finalItem, category);
      updateCounts();
    }
  }

  doTick();
}

// Render Single Drop Card Content
function renderCardContent(container, item, category, isRolling = false) {
  if (!item) {
    container.innerHTML = `<p style="color:var(--muted)">ไม่มีข้อมูลในหมวดหมู่นี้</p>`;
    return;
  }

  const imgPath = resolveImagePath(item, category);
  const typeLabel = item.category_th || item.standard_type || item.skill_type || item.type || category.toUpperCase();
  const roleLabel = item.role || item.armory || '';
  const skillTitle = item.skill ? `สกิล: ${item.skill}` : '';

  let badgeClass = 'badge';
  if ((item.skill_type || '').toLowerCase() === 'active') badgeClass += ' active-badge';
  else if ((item.skill_type || '').toLowerCase() === 'passive') badgeClass += ' passive-badge';
  else if (roleLabel) badgeClass += ' secondary';

  container.innerHTML = `
    <div class="result-card ${isRolling ? 'rolling' : 'revealed'}">
      <div class="result-img-box">
        <img 
          src="${imgPath}" 
          alt="${item.name}" 
          class="result-img"
          onerror="handleImgError(this, '${category}')"
        />
        <div class="result-fallback-icon">${ICONS[category] || ICONS.zap}</div>
      </div>
      <div class="result-badges">
        <span class="${badgeClass}">${typeLabel}</span>
        ${roleLabel ? `<span class="badge secondary">${roleLabel}</span>` : ''}
      </div>
      <h3 class="result-title">${item.name}</h3>
      ${skillTitle ? `<p class="result-skill">${skillTitle}</p>` : ''}
      <p class="result-desc">${item.description || ''}</p>
    </div>
  `;
}

// FULL LOADOUT GENERATOR
// 4 Characters (1 Active + 3 Passive), 2 Weapons (Slot 1 Primary + Slot 2 Secondary), 1 Pet
function generateFullLoadout() {
  if (state.isRolling) return;

  // 1. Validate weapon selection according to requirement
  if (state.filters.types.size === 0) {
    showToast('กรุณาเลือกประเภทอาวุธอย่างน้อย 1 ประเภทก่อนสุ่ม');
    return;
  }

  const weaponCandidates = getCandidatePool('weapon');
  if (!weaponCandidates || weaponCandidates.length < 2) {
    showToast('กรุณาเลือกประเภทอาวุธอย่างน้อย 1 ประเภทก่อนสุ่ม (ต้องมีอาวุธอย่างน้อย 2 ชิ้น)');
    return;
  }

  // 2. Validate character candidates
  const charCandidates = getCandidatePool('character');
  const activeCharsPool = charCandidates.filter(c => (c.skill_type || '').toLowerCase() === 'active');
  const passiveCharsPool = charCandidates.filter(c => (c.skill_type || '').toLowerCase() === 'passive');

  if (activeCharsPool.length === 0 || passiveCharsPool.length < 3) {
    showToast('ข้อมูลตัวละครไม่เพียงพอสำหรับจัดเซ็ต');
    return;
  }

  // 3. Validate pets candidates
  const petsPool = getCandidatePool('pet');
  if (!petsPool || petsPool.length === 0) {
    showToast('ข้อมูลสัตว์เลี้ยงไม่เพียงพอสำหรับจัดเซ็ต');
    return;
  }

  state.isRolling = true;
  const spinSquadBtn = document.getElementById('spinSquadBtn');
  if (spinSquadBtn) spinSquadBtn.disabled = true;

  const resultsContainer = document.getElementById('squadResultsContainer');

  // Slot roll animation on squad
  let step = 0;
  const totalSteps = 10;

  function doSquadTick() {
    step++;
    soundFX.playTick();

    if (step < totalSteps) {
      // Pick random temporary set for visual shuffle
      const tempActive = activeCharsPool[Math.floor(Math.random() * activeCharsPool.length)];
      const tempPassives = [...passiveCharsPool].sort(() => 0.5 - Math.random()).slice(0, 3);
      const shuffledWeps = [...weaponCandidates].sort(() => 0.5 - Math.random());
      const tempPrimary = shuffledWeps[0];
      const tempSecondary = shuffledWeps[1] || shuffledWeps[0];
      const tempPet = petsPool[Math.floor(Math.random() * petsPool.length)];

      renderSquadCards(resultsContainer, {
        active: tempActive,
        passives: tempPassives,
        primaryWeapon: tempPrimary,
        secondaryWeapon: tempSecondary,
        pet: tempPet
      }, true);

      setTimeout(doSquadTick, 60 + step * 16);
    } else {
      // FINAL SQUAD SELECTION
      // Character 1: Active
      const chosenActive = activeCharsPool[Math.floor(Math.random() * activeCharsPool.length)];
      // Characters 2-4: 3 distinct passives
      const filteredPassives = passiveCharsPool.filter(p => p.name !== chosenActive.name);
      const chosenPassives = [];
      const passivePoolCopy = [...filteredPassives];
      for (let i = 0; i < 3 && passivePoolCopy.length > 0; i++) {
        const idx = Math.floor(Math.random() * passivePoolCopy.length);
        chosenPassives.push(passivePoolCopy.splice(idx, 1)[0]);
      }

      // Weapons 1 & 2: 2 distinct weapons drawn from selected categories
      const chosenPrimary = weaponCandidates[Math.floor(Math.random() * weaponCandidates.length)];
      const remainingWeapons = weaponCandidates.filter(w => w.name !== chosenPrimary.name);
      const chosenSecondary = remainingWeapons.length > 0
        ? remainingWeapons[Math.floor(Math.random() * remainingWeapons.length)]
        : chosenPrimary;

      // Pet: 1 companion
      const chosenPet = petsPool[Math.floor(Math.random() * petsPool.length)];

      // Deduplication handling if noRepeat is true
      if (state.noRepeat) {
        state.used.character.add(chosenActive.name);
        chosenPassives.forEach(p => state.used.character.add(p.name));
        state.used.weapon.add(chosenPrimary.name);
        state.used.weapon.add(chosenSecondary.name);
        state.used.pet.add(chosenPet.name);
      }

      // Render Final Squad Cards
      renderSquadCards(resultsContainer, {
        active: chosenActive,
        passives: chosenPassives,
        primaryWeapon: chosenPrimary,
        secondaryWeapon: chosenSecondary,
        pet: chosenPet
      }, false);

      soundFX.playWin();
      state.isRolling = false;
      if (spinSquadBtn) spinSquadBtn.disabled = false;

      // Add to history
      addToHistory(chosenActive, 'character');
      addToHistory(chosenPrimary, 'weapon');
      addToHistory(chosenSecondary, 'weapon');
      addToHistory(chosenPet, 'pet');

      updateCounts();
      showToast('จัดเซ็ตพร้อมลงสนามสำเร็จ!');
    }
  }

  doSquadTick();
}

// Render tactical squad cards
function renderSquadCards(container, squad, isRolling = false) {
  const { active, passives, primaryWeapon, secondaryWeapon, pet } = squad;

  container.innerHTML = `
    <!-- 4 Character Skills Combo Section -->
    <div class="squad-section-title">
      ${ICONS.character}
      <span>คอมโบสกิล 4 ช่อง (Active 1 + Passive 3)</span>
    </div>
    <div class="squad-chars-grid ${isRolling ? 'rolling' : ''}">
      <!-- Active Slot -->
      <div class="tactical-card active-char">
        <span class="card-slot-badge red">SLOT 1 • ACTIVE</span>
        <div class="tactical-card-img-wrap">
          <img src="${resolveImagePath(active, 'character')}" alt="${active.name}" class="tactical-card-img" onerror="handleImgError(this, 'character')" />
        </div>
        <strong class="tactical-card-name">${active.name}</strong>
        <p class="tactical-card-skill">${active.skill ? `สกิล: ${active.skill}` : 'สกิลกดใช้'}</p>
        <p class="tactical-card-desc">${active.description || ''}</p>
      </div>

      <!-- Passive Slots -->
      ${passives.map((p, idx) => `
        <div class="tactical-card">
          <span class="card-slot-badge cyan">SLOT ${idx + 2} • PASSIVE</span>
          <div class="tactical-card-img-wrap">
            <img src="${resolveImagePath(p, 'character')}" alt="${p.name}" class="tactical-card-img" onerror="handleImgError(this, 'character')" />
          </div>
          <strong class="tactical-card-name">${p.name}</strong>
          <p class="tactical-card-skill">${p.skill ? `สกิล: ${p.skill}` : 'สกิลติดตัว'}</p>
          <p class="tactical-card-desc">${p.description || ''}</p>
        </div>
      `).join('')}
    </div>

    <!-- 2 Weapons Armory Section (Primary & Secondary from user-selected categories) -->
    <div class="squad-section-title" style="margin-top:1.5rem;">
      ${ICONS.weapon}
      <span>คลังอาวุธ (อาวุธหลัก 1 + อาวุธรอง 1 จากหมวดหมู่ที่เลือก)</span>
    </div>
    <div class="squad-weapons-grid ${isRolling ? 'rolling' : ''}">
      <div class="tactical-card primary-weapon">
        <span class="card-slot-badge cyan">PRIMARY • อาวุธหลัก</span>
        <div class="tactical-card-img-wrap">
          <img src="${resolveImagePath(primaryWeapon, 'weapon')}" alt="${primaryWeapon.name}" class="tactical-card-img" onerror="handleImgError(this, 'weapon')" />
        </div>
        <strong class="tactical-card-name">${primaryWeapon.name}</strong>
        <p class="tactical-card-skill">${primaryWeapon.category_th || primaryWeapon.category || primaryWeapon.type || 'อาวุธหลัก'}</p>
        <p class="tactical-card-desc">${primaryWeapon.description || ''}</p>
      </div>

      <div class="tactical-card secondary-weapon">
        <span class="card-slot-badge gold">SECONDARY • อาวุธรอง</span>
        <div class="tactical-card-img-wrap">
          <img src="${resolveImagePath(secondaryWeapon, 'weapon')}" alt="${secondaryWeapon.name}" class="tactical-card-img" onerror="handleImgError(this, 'weapon')" />
        </div>
        <strong class="tactical-card-name">${secondaryWeapon.name}</strong>
        <p class="tactical-card-skill">${secondaryWeapon.category_th || secondaryWeapon.category || secondaryWeapon.type || 'อาวุธรอง'}</p>
        <p class="tactical-card-desc">${secondaryWeapon.description || ''}</p>
      </div>
    </div>

    <!-- 1 Pet Companion Section -->
    <div class="squad-section-title" style="margin-top:1.5rem;">
      ${ICONS.pet}
      <span>สัตว์เลี้ยงคู่หู (Companion)</span>
    </div>
    <div class="squad-weapons-grid ${isRolling ? 'rolling' : ''}">
      <div class="tactical-card" style="grid-column: 1 / -1;">
        <span class="card-slot-badge gold">PET COMPANION</span>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <div class="tactical-card-img-wrap" style="margin: 0; flex-shrink: 0;">
            <img src="${resolveImagePath(pet, 'pet')}" alt="${pet.name}" class="tactical-card-img" onerror="handleImgError(this, 'pet')" />
          </div>
          <div style="flex: 1; min-width: 200px;">
            <strong class="tactical-card-name" style="text-align: left; margin-bottom: 0.15rem;">${pet.name}</strong>
            <p class="tactical-card-skill" style="text-align: left;">${pet.skill ? `สกิล: ${pet.skill}` : ''}</p>
            <p class="tactical-card-desc" style="-webkit-line-clamp: 2;">${pet.description || ''}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Add Item to History
function addToHistory(item, category) {
  state.history.unshift({
    item,
    category,
    time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  });
  if (state.history.length > 14) state.history.pop();
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById('historyList');
  if (!container) return;

  if (state.history.length === 0) {
    container.innerHTML = `<div class="empty-history">ยังไม่มีประวัติการสุ่ม</div>`;
    return;
  }

  container.innerHTML = state.history.map(({ item, category, time }) => {
    const imgPath = resolveImagePath(item, category);
    const subLabel = item.category_th || item.standard_type || item.skill || item.role || item.type || '';
    return `
      <div class="history-item">
        <div class="thumb-box">
          <img src="${imgPath}" alt="${item.name}" class="thumb-img" onerror="handleImgError(this, '${category}')" />
          <div class="thumb-fallback">${ICONS[category] || ICONS.zap}</div>
        </div>
        <div class="history-item-info">
          <strong class="history-item-title">${item.name}</strong>
          <span class="history-item-sub">${subLabel}</span>
          <small class="history-item-time">${time}</small>
        </div>
      </div>
    `;
  }).join('');
}

// Set Active Mode: 'single' | 'squad'
function setMode(mode) {
  state.mode = mode;
  const singleBtn = document.getElementById('singleModeBtn');
  const squadBtn = document.getElementById('squadModeBtn');
  const singleView = document.getElementById('singleView');
  const squadView = document.getElementById('squadView');

  if (mode === 'single') {
    if (singleView) singleView.hidden = false;
    if (squadView) squadView.hidden = true;
    if (singleBtn) {
      singleBtn.classList.add('active');
      singleBtn.setAttribute('aria-selected', 'true');
    }
    if (squadBtn) {
      squadBtn.classList.remove('active');
      squadBtn.setAttribute('aria-selected', 'false');
    }
  } else {
    if (singleView) singleView.hidden = true;
    if (squadView) squadView.hidden = false;
    if (squadBtn) {
      squadBtn.classList.add('active');
      squadBtn.setAttribute('aria-selected', 'true');
    }
    if (singleBtn) {
      singleBtn.classList.remove('active');
      singleBtn.setAttribute('aria-selected', 'false');
    }
  }
}

// Event Listeners setup
document.addEventListener('DOMContentLoaded', () => {
  initData();

  // Mode Switcher Buttons
  const singleBtn = document.getElementById('singleModeBtn');
  const squadBtn = document.getElementById('squadModeBtn');
  const quickSquadBtn = document.getElementById('quickSquadBtn');

  if (singleBtn) singleBtn.addEventListener('click', () => setMode('single'));
  if (squadBtn) squadBtn.addEventListener('click', () => setMode('squad'));
  if (quickSquadBtn) quickSquadBtn.addEventListener('click', () => setMode('squad'));

  // Sound Toggle Button
  const soundBtn = document.getElementById('soundToggleBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => soundFX.toggle());
  }

  // Category Selector Buttons (Single Item Mode)
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.dataset.category;
      updateCounts();
    });
  });

  // Select All / Clear All Toggle Button for Weapon Categories
  const toggleAllBtn = document.getElementById('toggleAllTypesBtn');
  if (toggleAllBtn) {
    toggleAllBtn.addEventListener('click', toggleAllWeaponTypes);
  }

  // Deduplication Toggle
  const noRepeatToggle = document.getElementById('noRepeatToggle');
  const toggleHint = document.getElementById('toggleHint');

  if (noRepeatToggle) {
    noRepeatToggle.addEventListener('change', () => {
      state.noRepeat = noRepeatToggle.checked;
      if (toggleHint) {
        toggleHint.textContent = state.noRepeat
          ? 'ไม่สุ่มซ้ำรายการเดิมในรอบนี้'
          : 'สุ่มซ้ำรายการเดิมได้เรื่อยๆ';
      }
      showToast(state.noRepeat ? 'เปิดระบบตัดไอเทมซ้ำ' : 'อนุญาตให้สุ่มซ้ำได้เรื่อยๆ');
    });
  }

  // Reset Pool Button
  const resetPoolBtn = document.getElementById('resetPoolBtn');
  if (resetPoolBtn) {
    resetPoolBtn.addEventListener('click', () => {
      Object.values(state.used).forEach(set => set.clear());
      updateCounts();
      soundFX.playTick();
      showToast('รีเซ็ตไอเทมทั้งหมดกลับเข้ากองสุ่มแล้ว');
    });
  }

  // Spin Buttons
  const spinBtn = document.getElementById('spinBtn');
  if (spinBtn) {
    spinBtn.addEventListener('click', rollSingleItem);
  }

  const spinSquadBtn = document.getElementById('spinSquadBtn');
  if (spinSquadBtn) {
    spinSquadBtn.addEventListener('click', generateFullLoadout);
  }

  // Clear History Button
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      state.history = [];
      renderHistory();
      showToast('ล้างประวัติการสุ่มเรียบร้อยแล้ว');
    });
  }
});
