// State Management
const state = {
  data: {
    character: [],
    weapon: [],
    pet: [],
    map: []
  },
  usedIds: {
    character: new Set(),
    weapon: new Set(),
    pet: new Set(),
    map: new Set()
  },
  activeCategory: 'character',
  history: []
};

const CATEGORY_ICONS = {
  character: '👤',
  weapon: '🔫',
  pet: '🐾',
  map: '🗺️'
};

// แปลงชื่อไอเทมให้เป็นชื่อไฟล์ตามโครงสร้าง assets/img/
function slugifyName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\./g, '-')       // เช่น J.Biebs -> j-biebs, Dr. Beanie -> dr-beanie
    .replace(/\s+/g, '-')      // เว้นวรรคเป็นขีดกลาง เช่น Desert Eagle -> desert-eagle
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

// หา Path รูปภาพที่ถูกต้องที่สุด (รองรับทั้ง local_image_path, .png, .svg และรูปสำรอง)
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

// จัดการกรณีโหลดรูป .png ไม่เจอ ให้ลองเปลี่ยนเป็น .svg ก่อน ถ้ายังไม่เจอให้แสดงไอคอนแทน
window.handleImgError = function (imgEl, category) {
  const currentSrc = imgEl.getAttribute('src') || '';
  if (currentSrc.endsWith('.png') && !imgEl.dataset.triedSvg) {
    imgEl.dataset.triedSvg = 'true';
    imgEl.src = currentSrc.replace(/\.png$/, '.svg');
    return;
  }
  imgEl.style.display = 'none';
  const fallbackEl = imgEl.nextElementSibling;
  if (fallbackEl) fallbackEl.style.display = 'block';
};

// โหลดข้อมูลจาก data/fallback.json
async function initData() {
  const statusEl = document.getElementById('dataStatus');
  try {
    const res = await fetch('data/fallback.json');
    if (!res.ok) throw new Error('โหลดไฟล์ fallback.json ไม่สำเร็จ');
    const json = await res.json();

    state.data.character = json.characters || json.character || [];
    state.data.weapon = json.weapons || json.weapon || [];
    state.data.pet = json.pets || json.pet || [];
    state.data.map = json.maps || json.map || [];

    const total =
      state.data.character.length +
      state.data.weapon.length +
      state.data.pet.length +
      state.data.map.length;

    document.getElementById('count-character').textContent = state.data.character.length;
    document.getElementById('count-weapon').textContent = state.data.weapon.length;
    document.getElementById('count-pet').textContent = state.data.pet.length;
    document.getElementById('count-map').textContent = state.data.map.length;
    document.getElementById('totalCount').textContent = total;

    statusEl.innerHTML = `<span class="dot"></span> LOCAL JSON • พร้อมใช้งาน (${total} รายการ)`;
  } catch (err) {
    console.error(err);
    statusEl.innerHTML = `<span class="dot" style="background:#ef4444;"></span> โหลดข้อมูลไม่สำเร็จ`;
    showToast('⚠️ ไม่พบไฟล์ data/fallback.json');
  }
}

// สุ่มไอเทมแบบไม่ซ้ำในรอบปัจจุบัน
function pickRandomItem(category) {
  const pool = state.data[category];
  if (!pool || pool.length === 0) return null;

  let available = pool.filter((_, idx) => !state.usedIds[category].has(idx));
  if (available.length === 0) {
    state.usedIds[category].clear();
    available = pool;
    showToast(`🔄 รีเซ็ตรอบการสุ่มหมวด ${category.toUpperCase()} แล้ว`);
  }

  const chosen = available[Math.floor(Math.random() * available.length)];
  const originalIndex = pool.indexOf(chosen);
  state.usedIds[category].add(originalIndex);

  return chosen;
}

// แสดงผลลัพธ์ในการ์ดหลัก
function renderMainDrop(item, category) {
  const container = document.getElementById('dropContent');
  const statusTag = document.getElementById('dropStatus');

  if (!item) {
    container.innerHTML = `<p style="color:var(--muted)">ไม่มีข้อมูลในหมวดหมู่นี้</p>`;
    return;
  }

  const imgPath = resolveImagePath(item, category);
  const typeLabel = item.skill_type || item.type || category.toUpperCase();
  const roleLabel = item.role || item.armory || '';
  const skillTitle = item.skill ? `สกิล: ${item.skill}` : '';

  statusTag.textContent = category.toUpperCase();

  container.innerHTML = `
    <div class="result-card">
      <div class="result-img-box">
        <img 
          src="${imgPath}" 
          alt="${item.name}" 
          class="result-img"
          onerror="handleImgError(this, '${category}')"
        />
        <span class="result-fallback-icon">${CATEGORY_ICONS[category]}</span>
      </div>
      <div class="result-badges">
        <span class="badge">${typeLabel}</span>
        ${roleLabel ? `<span class="badge secondary">${roleLabel}</span>` : ''}
      </div>
      <h3 class="result-title">${item.name}</h3>
      ${skillTitle ? `<p class="result-skill">${skillTitle}</p>` : ''}
      <p class="result-desc">${item.description || ''}</p>
    </div>
  `;
}

// บันทึกและแสดงประวัติการสุ่ม
function addToHistory(item, category) {
  state.history.unshift({ item, category, time: new Date().toLocaleTimeString('th-TH') });
  if (state.history.length > 12) state.history.pop();

  document.getElementById('historyCount').textContent = state.history.length;
  const listEl = document.getElementById('historyList');

  listEl.innerHTML = state.history
    .map(({ item, category, time }) => {
      const imgPath = resolveImagePath(item, category);
      return `
        <div class="history-item">
          <div class="thumb-box">
            <img 
              src="${imgPath}" 
              alt="${item.name}" 
              class="thumb-img"
              onerror="handleImgError(this, '${category}')"
            />
            <span class="thumb-fallback">${CATEGORY_ICONS[category]}</span>
          </div>
          <div class="item-meta">
            <strong>${item.name}</strong>
            <small>${category.toUpperCase()} • ${time}</small>
          </div>
        </div>
      `;
    })
    .join('');
}

// สุ่มยกเซ็ต (ตัวละคร + ปืน + สัตว์เลี้ยง + แมพ)
function generateFullLoadout() {
  const squadSection = document.getElementById('squadSection');
  const squadGrid = document.getElementById('squadGrid');

  const picks = [
    { category: 'character', label: 'ตัวละครหลัก', item: pickRandomItem('character') },
    { category: 'weapon', label: 'อาวุธคู่ใจ', item: pickRandomItem('weapon') },
    { category: 'pet', label: 'สัตว์เลี้ยง', item: pickRandomItem('pet') },
    { category: 'map', label: 'แผนที่', item: pickRandomItem('map') }
  ].filter(p => p.item !== null);

  if (picks.length === 0) return;

  squadSection.hidden = false;
  squadGrid.innerHTML = picks
    .map(({ category, label, item }) => {
      const imgPath = resolveImagePath(item, category);
      return `
        <div class="squad-card">
          <div class="thumb-box">
            <img 
              src="${imgPath}" 
              alt="${item.name}" 
              class="thumb-img"
              onerror="handleImgError(this, '${category}')"
            />
            <span class="thumb-fallback">${CATEGORY_ICONS[category]}</span>
          </div>
          <div class="item-meta">
            <small style="color:var(--accent); font-weight:700;">${label}</small>
            <strong>${item.name}</strong>
            <small>${item.skill || item.type || ''}</small>
          </div>
        </div>
      `;
    })
    .join('');

  showToast('🛡️ สุ่มเซ็ตไอเทมพร้อมลงสนามเรียบร้อย!');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initData();

  // เลือกหมวดหมู่
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.dataset.category;
    });
  });

  // ปุ่มกดสุ่ม
  document.getElementById('spinBtn').addEventListener('click', () => {
    const item = pickRandomItem(state.activeCategory);
    if (item) {
      renderMainDrop(item, state.activeCategory);
      addToHistory(item, state.activeCategory);
    }
  });

  // ปุ่มสุ่มยกเซ็ต
  document.getElementById('squadBtn').addEventListener('click', generateFullLoadout);

  // ปุ่มรีเซ็ตประวัติ
  document.getElementById('resetBtn').addEventListener('click', () => {
    state.history = [];
    Object.values(state.usedIds).forEach(set => set.clear());
    document.getElementById('historyCount').textContent = '0';
    document.getElementById('historyList').innerHTML = `<div class="empty-history">ยังไม่มีประวัติการสุ่ม</div>`;
    document.getElementById('squadSection').hidden = true;
    showToast('↺ รีเซ็ตประวัติการสุ่มทั้งหมดแล้ว');
  });
});