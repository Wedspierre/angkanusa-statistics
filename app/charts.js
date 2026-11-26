// Canvas charts for AngkaNusa — drawn by hand, no chart library, no network.
// Every chart gets a title, axis labels, and a source line in the HTML around it.

const TEAL = '#0f766e';
const AMBER = '#d97706';
const NAVY = '#0c2340';
const GRID = '#e2e8ec';
const AXIS = '#5b6b7a';
const MALE = '#0f766e';
const FEMALE = '#d97706';

// Size a canvas to its element box at device pixel ratio so lines stay crisp.
function setupCanvas(canvas, cssHeight) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
  const height = cssHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

function fmtNum(n, decimals = 2) {
  return n.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function drawAxes(ctx, pad, w, h, yMin, yMax, yLabel, xLabels) {
  ctx.strokeStyle = GRID;
  ctx.fillStyle = AXIS;
  ctx.font = '11px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const steps = 4;
  for (let i = 0; i <= steps; i += 1) {
    const v = yMin + ((yMax - yMin) * i) / steps;
    const y = pad.top + ((h - pad.top - pad.bottom) * (1 - i / steps));
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
    ctx.fillText(fmtNum(v, Math.abs(yMax - yMin) < 10 ? 1 : 0), pad.left - 8, y);
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  xLabels.forEach((lab, i) => {
    const x = pad.left + ((w - pad.left - pad.right) * i) / (xLabels.length - 1 || 1);
    ctx.fillText(String(lab), x, h - pad.bottom + 6);
  });
  // y-axis label
  ctx.save();
  ctx.translate(12, h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = AXIS;
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();
}

// Line chart. series: [{label, color, values: {year: number}}]; years: number[].
// highlightYear is drawn with a dot + vertical guide.
export function lineChart(canvas, { title, years, series, yLabel, yMin, yMax, highlightYear, cssHeight = 260 }) {
  const { ctx, width: w, height: h } = setupCanvas(canvas, cssHeight);
  const pad = { top: 26, right: 14, bottom: 26, left: 52 };
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = NAVY;
  ctx.font = 'bold 14px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(title, pad.left, 4);

  const all = series.flatMap((s) => years.map((y) => s.values[y]));
  const lo = yMin ?? Math.min(...all);
  const hi = yMax ?? Math.max(...all);
  const span = hi - lo || 1;
  const yPad = span * 0.12;
  const ymin = lo - yPad;
  const ymax = hi + yPad;

  drawAxes(ctx, pad, w, h, ymin, ymax, yLabel, years);

  const xAt = (i) => pad.left + ((w - pad.left - pad.right) * i) / (years.length - 1);
  const yAt = (v) => pad.top + ((h - pad.top - pad.bottom) * (1 - (v - ymin) / (ymax - ymin)));

  // zero line, when in range
  if (ymin < 0 && ymax > 0) {
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, yAt(0));
    ctx.lineTo(w - pad.right, yAt(0));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  series.forEach((s) => {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    years.forEach((y, i) => {
      const px = xAt(i);
      const py = yAt(s.values[y]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    // value labels + dots
    ctx.font = '11px -apple-system, "Segoe UI", Roboto, sans-serif';
    years.forEach((y, i) => {
      const px = xAt(i);
      const py = yAt(s.values[y]);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = NAVY;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(fmtNum(s.values[y]), px, py - 6);
    });
  });

  if (highlightYear != null) {
    const i = years.indexOf(highlightYear);
    if (i >= 0) {
      const px = xAt(i);
      ctx.strokeStyle = AMBER;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(px, pad.top);
      ctx.lineTo(px, h - pad.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

// Vertical bar chart for one series.
export function barChart(canvas, { title, labels, values, yLabel, color = TEAL, highlightIndex = -1, cssHeight = 260, decimals = 1 }) {
  const { ctx, width: w, height: h } = setupCanvas(canvas, cssHeight);
  const pad = { top: 26, right: 14, bottom: 26, left: 52 };
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = NAVY;
  ctx.font = 'bold 14px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(title, pad.left, 4);

  const maxV = Math.max(...values);
  const minV = Math.min(0, ...values);
  const yMax = maxV * 1.15;
  const yMin = minV < 0 ? minV * 1.15 : 0;
  drawAxes(ctx, pad, w, h, yMin, yMax, yLabel, labels);

  const slot = (w - pad.left - pad.right) / labels.length;
  const barW = Math.min(56, slot * 0.62);
  const yAt = (v) => pad.top + ((h - pad.top - pad.bottom) * (1 - (v - yMin) / (yMax - yMin)));
  const zeroY = yAt(0);
  values.forEach((v, i) => {
    const x = pad.left + slot * i + (slot - barW) / 2;
    const y = yAt(v);
    ctx.fillStyle = i === highlightIndex ? AMBER : color;
    ctx.fillRect(x, Math.min(y, zeroY), barW, Math.abs(zeroY - y));
    ctx.fillStyle = NAVY;
    ctx.font = '11px -apple-system, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = v >= 0 ? 'bottom' : 'top';
    ctx.fillText(fmtNum(v, decimals), x + barW / 2, v >= 0 ? y - 4 : y + 4);
  });
}

// Population pyramid: male bars left, female bars right, age bands centre.
export function pyramidChart(canvas, { ages, male, female, title, cssHeight = 340 }) {
  const { ctx, width: w, height: h } = setupCanvas(canvas, cssHeight);
  const pad = { top: 50, right: 46, bottom: 24, left: 46 };
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = NAVY;
  ctx.font = 'bold 14px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(title, 8, 4);

  const maxV = Math.max(...male, ...female);
  const midX = w / 2;
  const half = (w - pad.left - pad.right) / 2;
  const rowH = (h - pad.top - pad.bottom) / ages.length;

  ctx.font = 'bold 12px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = MALE;
  ctx.textAlign = 'right';
  ctx.fillText('Laki-laki', midX - 8, 26);
  ctx.fillStyle = FEMALE;
  ctx.textAlign = 'left';
  ctx.fillText('Perempuan', midX + 8, 26);

  ages.forEach((age, i) => {
    const y = pad.top + i * rowH + 2;
    const bh = rowH - 4;
    const mW = (male[i] / maxV) * half;
    const fW = (female[i] / maxV) * half;
    ctx.fillStyle = MALE;
    ctx.fillRect(midX - mW, y, mW, bh);
    ctx.fillStyle = FEMALE;
    ctx.fillRect(midX, y, fW, bh);
    // age label in the middle
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10.5px -apple-system, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(age, midX, y + bh / 2);
    // values at the outer ends
    ctx.fillStyle = NAVY;
    ctx.font = '10.5px -apple-system, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(fmtNum(male[i], 1), midX - mW - 4, y + bh / 2);
    ctx.textAlign = 'left';
    ctx.fillText(fmtNum(female[i], 1), midX + fW + 4, y + bh / 2);
  });

  ctx.fillStyle = AXIS;
  ctx.font = '11px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Juta jiwa per kelompok umur', midX, h - 14);
}
