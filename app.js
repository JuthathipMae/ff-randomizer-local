/**
 * FF RANDOM — Free Fire Loadout & Generator
 * Fully vanilla JavaScript, Web Audio API, No Emojis, Responsive UI
 */

// SVG Icon Definitions (Strictly No Emojis)
const ICONS = {
  character: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  weapon: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>`,
  pet: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"></circle><circle cx="18" cy="8" r="2"></circle><circle cx="20" cy="16" r="2"></circle><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"></path></svg>`,
  map: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>`,
  zap: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  check: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
};

const ALL_WEAPON_TYPES = [
  'Assault Rifle',
  'SMG',
  'Shotgun',
  'Sniper Rifle',
  'Marksman Rifle',
  'Light Machine Gun',
  'Pistol',
  'Melee',
  'Bow',
  'Launcher',
  'Special'
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
      // Synthesize an uplifting 4-note victory arpeggio: C5 -> E5 -> G5 -> C6
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
  filteredWeapons: [],
  used: {
    character: new Set(),
    weapon: new Set(),
    pet: new Set(),
    map: new Set()
  },
  filters: {
    range: 'all', // all | close | long | charge
    types: new Set(ALL_WEAPON_TYPES)
  },
  activeCategory: 'character',
  mode: 'single', // single | squad
  noRepeat: true,
  history: [],
  isRolling: false
};

// Check if weapon is a throwable/projectile to be excluded
function isThrowable(w) {
  const t = (w.type || '').toLowerCase();
  const n = (w.name || '').toLowerCase();
  return (
    t.includes('throwable') ||
    t.includes('projectile') ||
    n.includes('grenade') ||
    n.includes('gloo') ||
    n.includes('flash freeze')
  );
}

// Categorize weapon into 11 main types
function getWeaponCategory(w) {
  const t = (w.type || '').toLowerCase();
  if (t.includes('assault')) return 'Assault Rifle';
  if (t.includes('smg')) return 'SMG';
  if (t.includes('shotgun')) return 'Shotgun';
  if (t.includes('sniper')) return 'Sniper Rifle';
  if (t.includes('marksman')) return 'Marksman Rifle';
  if (t.includes('machine gun')) return 'Light Machine Gun';
  if (t.includes('melee')) return 'Melee';
  if (t.includes('bow')) return 'Bow';
  if (t.includes('launcher')) return 'Launcher';
  if (t.includes('special')) return 'Special';
  if (t.includes('pistol')) return 'Pistol';
  return 'Special';
}

// Determine if weapon is Close, Long, or Charge
function getWeaponRangeTrait(w) {
  const cat = getWeaponCategory(w);
  const n = (w.name || '').toLowerCase();
  const desc = (w.description || '').toLowerCase();
  const attr = (w.special_attributes || '').toLowerCase();

  const isCharge =
    n === 'cg15' ||
    n.includes('charge buster') ||
    desc.includes('charge') ||
    attr.includes('charge');

  const isClose = ['Shotgun', 'SMG', 'Pistol', 'Melee'].includes(cat);
  const isLong = ['Assault Rifle', 'Marksman Rifle', 'Sniper Rifle', 'Light Machine Gun', 'Bow', 'Launcher', 'Special'].includes(cat);

  return { isClose, isLong, isCharge, cat };
}

// Filter weapons by range and selected types
function getFilteredWeapons(overrideRange = null) {
  const targetRange = overrideRange || state.filters.range;

  return state.raw.weapons.filter(w => {
    const { isClose, isLong, isCharge, cat } = getWeaponRangeTrait(w);

    // 1. Must be in checked types
    if (!state.filters.types.has(cat)) return false;

    // 2. Range filter
    if (targetRange === 'close' && !isClose) return false;
    if (targetRange === 'long' && !isLong) return false;
    if (targetRange === 'charge' && !isCharge) return false;

    return true;
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
    // Filter out throwables from weapons entirely!
    state.raw.weapons = (json.weapons || []).filter(w => !isThrowable(w));
    state.raw.pets = json.pets || [];
    state.raw.maps = json.maps || [];

    const totalValid =
      state.raw.characters.length +
      state.raw.weapons.length +
      state.raw.pets.length +
      state.raw.maps.length;

    updateCounts();
    renderWeaponTypeCheckboxes();
    updateWeaponFilterSummary();
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

// Render dynamic weapon type checkboxes
function renderWeaponTypeCheckboxes() {
  const container = document.getElementById('weaponTypesGrid');
  if (!container) return;

  container.innerHTML = ALL_WEAPON_TYPES.map(type => {
    const isChecked = state.filters.types.has(type);
    return `
      <label class="type-checkbox-label">
        <input type="checkbox" value="${type}" ${isChecked ? 'checked' : ''} />
        <span>${type}</span>
      </label>
    `;
  }).join('');

  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        state.filters.types.add(cb.value);
      } else {
        state.filters.types.delete(cb.value);
      }
      updateWeaponFilterSummary();
      updateCounts();
    });
  });
}

function updateWeaponFilterSummary() {
  const available = getFilteredWeapons();
  const summaryEl = document.getElementById('activeWeaponCount');
  if (summaryEl) {
    summaryEl.textContent = `${available.length} กระบอก`;
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
  const pool = getCandidatePool(category);

  if (!pool || pool.length === 0) {
    if (category === 'weapon') {
      showToast('ไม่มีอาวุธที่ตรงตามตัวกรอง กรุณาเลือกประเภทอาวุธเพิ่มเติม');
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
      // Deceleration curve
      const delay = 50 + Math.pow(step, 1.8) * 8;
      setTimeout(doTick, delay);
    } else {
      // Land on final item
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
  const typeLabel = item.skill_type || item.type || category.toUpperCase();
  const roleLabel = item.role || item.armory || '';
  const skillTitle = item.skill ? `สกิล: ${item.skill}` : '';

  let badgeClass = 'badge';
  if (typeLabel.toLowerCase() === 'active') badgeClass += ' active-badge';
  else if (typeLabel.toLowerCase() === 'passive') badgeClass += ' passive-badge';
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

// FULL LOADOUT GENERATOR (4 Characters: 1 Active + 3 Passive, 1 Long Gun, 1 Close Gun, 1 Pet)
function generateFullLoadout() {
  if (state.isRolling) return;

  // 1. Prepare candidates
  const activeCharsPool = state.raw.characters.filter(c => (c.skill_type || '').toLowerCase() === 'active');
  const passiveCharsPool = state.raw.characters.filter(c => (c.skill_type || '').toLowerCase() === 'passive');

  const longGunsPool = getFilteredWeapons('long');
  const closeGunsPool = getFilteredWeapons('close');
  const petsPool = state.raw.pets;

  if (activeCharsPool.length === 0 || passiveCharsPool.length < 3) {
    showToast('ข้อมูลตัวละครไม่เพียงพอสำหรับจัดเซ็ต');
    return;
  }

  if (longGunsPool.length === 0 || closeGunsPool.length === 0) {
    showToast('ไม่พบปืนที่ตรงกับตัวกรองทั้งระยะไกลและระยะใกล้ กรุณาเลือกประเภทปืนเพิ่มเติม');
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
      const tempLong = longGunsPool[Math.floor(Math.random() * longGunsPool.length)];
      const tempClose = closeGunsPool[Math.floor(Math.random() * closeGunsPool.length)];
      const tempPet = petsPool[Math.floor(Math.random() * petsPool.length)];

      renderSquadCards(resultsContainer, {
        active: tempActive,
        passives: tempPassives,
        longGun: tempLong,
        closeGun: tempClose,
        pet: tempPet
      }, true);

      setTimeout(doSquadTick, 60 + step * 18);
    } else {
      // FINAL SQUAD SELECTION
      const chosenActive = pickItem('character', activeCharsPool) || activeCharsPool[0];

      // Pick 3 distinct passives
      const chosenPassives = [];
      const passiveCandidates = getCandidatePool('character', passiveCharsPool);
      const shuffledPassives = [...passiveCandidates].sort(() => 0.5 - Math.random());

      for (const p of shuffledPassives) {
        if (chosenPassives.length >= 3) break;
        if (p.name !== chosenActive.name && !chosenPassives.some(x => x.name === p.name)) {
          chosenPassives.push(p);
          if (state.noRepeat) state.used.character.add(p.name);
        }
      }

      // Fallback if needed
      if (chosenPassives.length < 3) {
        for (const p of passiveCharsPool) {
          if (chosenPassives.length >= 3) break;
          if (p.name !== chosenActive.name && !chosenPassives.some(x => x.name === p.name)) {
            chosenPassives.push(p);
          }
        }
      }

      // Pick 1 Long Gun and 1 Close Gun
      const chosenLong = pickItem('weapon', longGunsPool) || longGunsPool[0];
      const closeCandidates = closeGunsPool.filter(w => w.name !== chosenLong.name);
      const chosenClose = pickItem('weapon', closeCandidates.length ? closeCandidates : closeGunsPool) || closeGunsPool[0];

      // Pick 1 Pet
      const chosenPet = pickItem('pet', petsPool) || petsPool[0];

      renderSquadCards(resultsContainer, {
        active: chosenActive,
        passives: chosenPassives,
        longGun: chosenLong,
        closeGun: chosenClose,
        pet: chosenPet
      }, false);

      soundFX.playWin();
      state.isRolling = false;
      if (spinSquadBtn) spinSquadBtn.disabled = false;

      // Add to history
      addToHistory(chosenActive, 'character');
      addToHistory(chosenLong, 'weapon');
      addToHistory(chosenClose, 'weapon');
      addToHistory(chosenPet, 'pet');

      updateCounts();
      showToast('จัดเซ็ตพร้อมลงสนามสำเร็จ');
    }
  }

  doSquadTick();
}

// Render tactical squad cards
function renderSquadCards(container, squad, isRolling = false) {
  const { active, passives, longGun, closeGun, pet } = squad;

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

    <!-- 2 Weapons Armory Section -->
    <div class="squad-section-title" style="margin-top:1.5rem;">
      ${ICONS.weapon}
      <span>คลังอาวุธ (ปืนไกล 1 + ปืนใกล้ 1)</span>
    </div>
    <div class="squad-weapons-grid ${isRolling ? 'rolling' : ''}">
      <div class="tactical-card primary-weapon">
        <span class="card-slot-badge cyan">PRIMARY • ปืนไกล</span>
        <div class="tactical-card-img-wrap">
          <img src="${resolveImagePath(longGun, 'weapon')}" alt="${longGun.name}" class="tactical-card-img" onerror="handleImgError(this, 'weapon')" />
        </div>
        <strong class="tactical-card-name">${longGun.name}</strong>
        <p class="tactical-card-skill">${longGun.type || 'ระยะกลาง-ไกล'}</p>
        <p class="tactical-card-desc">${longGun.description || ''}</p>
      </div>

      <div class="tactical-card secondary-weapon">
        <span class="card-slot-badge gold">SECONDARY • ปืนใกล้</span>
        <div class="tactical-card-img-wrap">
          <img src="${resolveImagePath(closeGun, 'weapon')}" alt="${closeGun.name}" class="tactical-card-img" onerror="handleImgError(this, 'weapon')" />
        </div>
        <strong class="tactical-card-name">${closeGun.name}</strong>
        <p class="tactical-card-skill">${closeGun.type || 'ระยะประชิด'}</p>
        <p class="tactical-card-desc">${closeGun.description || ''}</p>
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
    const subLabel = item.skill || item.type || category.toUpperCase();
    return `
      <div class="history-item">
        <div class="thumb-box">
          <img src="${imgPath}" alt="${item.name}" class="thumb-img" onerror="handleImgError(this, '${category}')" />
          <div class="thumb-fallback">${ICONS[category] || ICONS.zap}</div>
        </div>
        <div class="history-meta">
          <strong>${item.name}</strong>
          <small>${time} • ${subLabel}</small>
        </div>
      </div>
    `;
  }).join('');
}

// Switch between Single Item mode & Full Loadout mode
function setMode(mode) {
  state.mode = mode;

  const singleView = document.getElementById('singleView');
  const squadView = document.getElementById('squadView');
  const singleBtn = document.getElementById('singleModeBtn');
  const squadBtn = document.getElementById('squadModeBtn');

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

  // Category Selector Buttons
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.dataset.category;
      updateCounts();
    });
  });

  // Range Filter Pills
  document.querySelectorAll('.range-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.range-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.filters.range = pill.dataset.range;
      updateWeaponFilterSummary();
      updateCounts();
      soundFX.playTick();
    });
  });

  // Quick Action Buttons for Weapon Types
  const selectAllBtn = document.getElementById('selectAllTypesBtn');
  const clearAllBtn = document.getElementById('clearAllTypesBtn');

  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      state.filters.types = new Set(ALL_WEAPON_TYPES);
      document.querySelectorAll('#weaponTypesGrid input[type="checkbox"]').forEach(cb => {
        cb.checked = true;
      });
      updateWeaponFilterSummary();
      updateCounts();
      soundFX.playTick();
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      state.filters.types.clear();
      document.querySelectorAll('#weaponTypesGrid input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
      });
      updateWeaponFilterSummary();
      updateCounts();
      soundFX.playTick();
    });
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
