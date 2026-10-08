const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const CANVAS_W = 1024;
const CANVAS_H = 768;
const PAD = 40;
const HEADER_H = 110;
const WEEKDAY_H = 50;

const API_URL = new URL('/backend-php/calendar.php', window.location.origin).href;

function generateLocalMonthData(year, month, theme) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;

  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      dayOfMonth: d,
      isToday: isCurrentMonth && today.getDate() === d
    });
  }

  return {
    year,
    month,
    monthName: MONTHS[month - 1],
    firstWeekday,
    days,
    theme
  };
}

async function fetchMonthData(year, month) {
  const tzOffset = new Date().getTimezoneOffset();
  const url = `${API_URL}?year=${year}&month=${month}&tz=${tzOffset}`;
  const res = await fetch(url, { credentials: 'omit' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function drawCalendar(ctx, w, h, data) {
  const todayRing = data.theme === 'kaede' ? '#9d4edd' : '#c7ba00';

  ctx.fillStyle = '#f5f0e6';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#d4c8b0';
  ctx.lineWidth = 4;
  ctx.strokeRect(PAD, PAD, w - PAD * 2, h - PAD * 2);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 60px "Segoe UI", Arial, sans-serif';
  ctx.fillText(`${data.monthName} ${data.year}`, w / 2, PAD + HEADER_H / 2);

  const cellW = (w - PAD * 2) / 7;
  const gridTop = PAD + HEADER_H;

  ctx.fillStyle = '#8a7a5a';
  ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
  for (let i = 0; i < 7; i++) {
    ctx.fillText(WEEKDAYS[i], PAD + cellW * (i + 0.5), gridTop + WEEKDAY_H / 2);
  }

  ctx.strokeStyle = '#e0d5bd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, gridTop + WEEKDAY_H);
  ctx.lineTo(w - PAD, gridTop + WEEKDAY_H);
  ctx.stroke();

  const gridH = h - PAD - gridTop - WEEKDAY_H;
  const cellH = gridH / 6;

  data.days.forEach(d => {
    const idx = d.dayOfMonth + data.firstWeekday - 1;
    const row = Math.floor(idx / 7);
    const col = idx % 7;
    const cx = PAD + cellW * (col + 0.5);
    const cy = gridTop + WEEKDAY_H + cellH * (row + 0.5);
    const radius = Math.min(cellW, cellH) * 0.35;

    if (d.isToday) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = todayRing;
      ctx.lineWidth = 5;
      ctx.stroke();
    }

    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
    ctx.fillText(String(d.dayOfMonth), cx, cy);
  });
}

function applyData(group, data) {
  group.userData.data = data;
  drawCalendar(group.userData.ctx, CANVAS_W, CANVAS_H, data);
  group.userData.texture.needsUpdate = true;
}

export function createCalendarMesh(options = {}) {
  const {
    theme = 'kaede',
    width = 1,
    height = 0.75,
    depth = 0.04,
    date = new Date()
  } = options;

  const group = new THREE.Group();
  group.name = 'calendar';

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: theme === 'kaede' ? 0x2a1a3e : 0x3e3418,
    roughness: 0.7,
    metalness: 0.1
  });

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    frameMaterial
  );
  frame.castShadow = true;
  frame.receiveShadow = true;
  group.add(frame);

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');

  const initialData = generateLocalMonthData(date.getFullYear(), date.getMonth() + 1, theme);
  initialData.theme = theme;
  drawCalendar(ctx, CANVAS_W, CANVAS_H, initialData);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.colorSpace = THREE.SRGBColorSpace || undefined;

  const pageMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.9,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });

  const page = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.92, height * 0.92),
    pageMaterial
  );
  page.position.z = depth / 2 + 0.02;
  group.add(page);

  group.userData.texture = texture;
  group.userData.canvas = canvas;
  group.userData.ctx = ctx;
  group.userData.data = initialData;

  group.userData.refresh = async (year, month) => {
    try {
      const data = await fetchMonthData(year, month);
      data.theme = theme;
      applyData(group, data);
    } catch (err) {
      console.warn('[calendar] fetch failed, keeping local date:', err);
    }
  };

  group.userData.refresh(date.getFullYear(), date.getMonth() + 1);

  return group;
}