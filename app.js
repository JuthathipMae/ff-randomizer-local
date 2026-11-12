const CONFIG = {
  dataUrl: "data/fallback.json",
  maxHistory: 12
};

const LABELS = {
  characters: "CHARACTER",
  weapons: "WEAPON",
  pets: "PET",
  maps: "MAP"
};

const ICONS = {
  characters: "♟",
  weapons: "⌁",
  pets: "♧",
  maps: "❖"
};

const state = {
  catalog: { characters: [], weapons: [], pets: [], maps: [] },
  category: "characters",
  history: JSON.parse(localStorage.getItem("ffr-history") || "[]"),
  drawn: JSON.parse(localStorage.getItem("ffr-drawn") || "{}"),
  lastSquad: []
};

const $ = id => document.getElementById(id);

function safeText(value, fallback = "Unknown") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeItem(raw, category) {
  return {
    id: String(raw.itemID ?? raw.id ?? ""),
    name: safeText(raw.name, "Unknown"),
    type: String(raw.type ?? category),
    range: String(raw.range ?? ""), // close | long
    subType: String(raw.subType ?? ""),
    desc: String(raw.desc ?? ""),
    rarity: String(raw.rarity ?? "COMMON")
  };
}

function classifyItems(items) {
  const result = { characters: [], weapons: [], pets: [], maps: [] };
  for (const item of items) {
    const t = item.type.toLowerCase();
    if (/character|ตัวละคร/.test(t)) result.characters.push(item);
    else if (/weapon|gun|ปืน/.test(t)) result.weapons.push(item);
    else if (/pet|สัตว์/.test(t)) result.pets.push(item);
    else if (/map|แมพ|แผนที่/.test(t)) result.maps.push(item);
  }
  return result;
}

async function loadCatalog() {
  setStatus("กำลังโหลดข้อมูล...");
  try {
    const response = await fetch(CONFIG.dataUrl, { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const items = (data.items || []).map(x => normalizeItem(x, x.type));

    state.catalog = classifyItems(items);
    renderCounts();

    const total = Object.values(state.catalog).reduce((n, a) => n + a.length, 0);
    $("totalCount").textContent = total.toLocaleString("en-US");
    setStatus(`LOCAL JSON • พร้อมใช้งาน (${total} รายการ)`);
    renderHistory();
  } catch (error) {
    console.error(error);
    setStatus("โหลดข้อมูลไม่สำเร็จ");
    showToast("โหลด data/fallback.json ไม่ได้ กรุณาเปิดผ่าน Show Preview หรือ Live Server");
  }
}

function setStatus(text) {
  $("dataStatus").textContent = text;
}

function renderCounts() {
  for (const key of Object.keys(state.catalog)) {
    $(`count-${key}`).textContent = state.catalog[key].length.toLocaleString("en-US");
  }
}

function rarityClass(rarity) {
  const s = String(rarity).toLowerCase();
  if (/legend|orange|mythic|gold|red/.test(s)) return "legendary";
  if (/epic|purple|violet/.test(s)) return "epic";
  if (/rare|blue/.test(s)) return "rare";
  return "";
}

function itemAllowed(item, category) {
  // 1. กรองระยะของปืน (เฉพาะหมวด weapons)
  if (category === "weapons") {
    const selectedRange = $("weaponRangeFilter").value;
    if (selectedRange !== "all" && item.range !== selectedRange) {
      return false;
    }
  }

  // 2. กรองระดับความหายาก
  const selectedRarity = $("rarityFilter").value;
  if (selectedRarity === "all") return true;
  const s = item.rarity.toLowerCase();
  if (selectedRarity === "legendary") return /legend|orange|mythic|gold|red/.test(s);
  if (selectedRarity === "epic") return /epic|purple|violet/.test(s);
  if (selectedRarity === "rare") return /rare|blue/.test(s);
  if (selectedRarity === "common") return /common|green|white|normal/.test(s);
  return true;
}

function renderItem(item, category) {
  $("resultPlaceholder").hidden = true;
  $("itemInfo").hidden = false;

  $("itemEmblem").textContent = ICONS[category] || "✦";

  let typeLabel = LABELS[category] || category.toUpperCase();
  if (category === "weapons" && item.range) {
    typeLabel += item.range === "close" ? " • ปืนชาร์จ / ระยะใกล้" : " • ปืนไกล / ระยะกลาง-ไกล";
  }
  $("itemType").textContent = typeLabel;

  $("itemName").textContent = item.name;
  $("itemDesc").textContent = item.desc || item.subType || "—";
  $("itemTag").textContent = item.subType ? `TYPE: ${item.subType}` : `ID: ${item.id}`;

  const rarity = $("rarityBadge");
  rarity.textContent = item.rarity.toUpperCase();
  rarity.className = `rarity ${rarityClass(item.rarity)}`;

  $("resultStage").classList.remove("reveal");
  void $("resultStage").offsetWidth;
  $("resultStage").classList.add("reveal");
}

function pickRandom(category) {
  const all = state.catalog[category] || [];
  let candidates = all.filter(item => itemAllowed(item, category));

  if (!candidates.length && all.length) {
    showToast("ไม่มีรายการตรงตามตัวกรองที่เลือก จะสุ่มจากทั้งหมดในหมวดนี้");
    candidates = all;
  }

  if ($("noRepeat").checked) {
    const used = state.drawn[category] || [];
    const remaining = candidates.filter(x => !used.includes(x.id));
    if (remaining.length) {
      candidates = remaining;
    } else {
      state.drawn[category] = [];
      showToast("สุ่มครบทุกรายการตามเงื่อนไขแล้ว เริ่มรอบใหม่!");
    }
  }

  if (!candidates.length) {
    showToast("ยังไม่มีข้อมูลในหมวดนี้");
    return null;
  }

  const item = candidates[Math.floor(Math.random() * candidates.length)];

  if ($("noRepeat").checked) {
    state.drawn[category] = [...(state.drawn[category] || []), item.id];
    localStorage.setItem("ffr-drawn", JSON.stringify(state.drawn));
  }

  return item;
}

function saveHistory(item, category) {
  state.history.unshift({ ...item, category, time: new Date().toISOString() });
  state.history = state.history.slice(0, CONFIG.maxHistory);
  localStorage.setItem("ffr-history", JSON.stringify(state.history));
  renderHistory();
}

function roll(category = state.category) {
  const item = pickRandom(category);
  if (!item) return;
  renderItem(item, category);
  saveHistory(item, category);
  $("historyCount").textContent = state.history.length;
}

function renderHistory() {
  $("historyCount").textContent = state.history.length;
  const list = $("historyList");
  if (!state.history.length) {
    list.innerHTML = '<div class="empty-history">ยังไม่มีประวัติ ลองสุ่มรายการแรกของคุณ</div>';
    return;
  }
  list.innerHTML = state.history.map(item => `
    <article class="history-card">
      <div class="history-badge">${ICONS[item.category] || "✦"}</div>
      <div style="min-width:0">
        <b title="${escapeAttr(item.name)}">${escapeHtml(item.name)}</b>
        <small>${escapeHtml(LABELS[item.category] || item.category)} • ${escapeHtml(item.subType || item.rarity)}</small>
      </div>
    </article>`).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(value) { return escapeHtml(value); }

function rollSquad() {
  const categories = ["characters", "weapons", "pets", "maps"];
  const picks = categories.map(category => ({ category, item: pickRandom(category) })).filter(x => x.item);
  state.lastSquad = picks;
  $("squadSection").hidden = false;
  $("squadGrid").innerHTML = picks.map(({ category, item }) => `
    <article class="squad-card">
      <div class="squad-icon">${ICONS[category] || "✦"}</div>
      <small>${LABELS[category]}</small>
      <b>${escapeHtml(item.name)}</b>
      <span>${escapeHtml(item.subType || item.rarity)}</span>
    </article>`).join("");

  if (picks.length) {
    const first = picks[0];
    renderItem(first.item, first.category);
    picks.forEach(x => saveHistory(x.item, x.category));
  }
  $("squadSection").scrollIntoView({ behavior: "smooth", block: "start" });
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

document.querySelectorAll(".tab").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
  button.classList.add("active");
  state.category = button.dataset.category;
  $("resultPlaceholder").hidden = false;
  $("itemInfo").hidden = true;
  $("rarityBadge").textContent = "READY";
  $("rarityBadge").className = "rarity";
}));

$("rollBtn").addEventListener("click", () => roll());
$("rollAllBtn").addEventListener("click", rollSquad);
$("rerollSquadBtn").addEventListener("click", rollSquad);
$("refreshBtn").addEventListener("click", loadCatalog);
$("resetBtn").addEventListener("click", () => {
  state.drawn = {};
  localStorage.removeItem("ffr-drawn");
  showToast("รีเซ็ตการสุ่มซ้ำแล้ว");
});
$("clearHistoryBtn").addEventListener("click", () => {
  state.history = [];
  localStorage.removeItem("ffr-history");
  renderHistory();
  showToast("ล้างประวัติแล้ว");
});

loadCatalog();