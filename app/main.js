// AngkaNusa — hash router + views. All figures come from app/data.js (BPS /
// Bank Indonesia / World Bank releases, labelled with source and year).
// No network requests: every view renders from the bundled dataset.

import {
  YEARS, POPULATION, POP_GROWTH, GDP_GROWTH, GDP_NOMINAL, INFLATION,
  UNEMPLOYMENT, POVERTY, HDI, EXPORTS, IMPORTS, SNAPSHOT_2024,
  PYRAMID_AGE, PYRAMID_MALE, PYRAMID_FEMALE, PROVINCES, INFLATION_TARGET,
  SOURCES,
} from './data.js';
import { lineChart, barChart, pyramidChart } from './charts.js';

const TEAL = '#0f766e';
const AMBER = '#d97706';

const view = document.getElementById('view');
const yearSelect = document.getElementById('year-select');

// ---- state ---------------------------------------------------------------
let year = 2024;
let wilayahQuery = '';
let wilayahSort = 'pop-desc';
let kerjaTab = 'unemployment';
let ekonomiMetric = 'growth';
let drawCharts = null; // redrawn on resize

// ---- helpers -------------------------------------------------------------
const idNum = (n, d = 1) =>
  Number(n).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });

function deltaText(series, y, suffix = '', invert = false) {
  if (y <= YEARS[0]) return '';
  const d = series[y] - series[y - 1];
  const cls = (d >= 0) !== invert ? 'up' : 'down';
  const sign = d > 0 ? '+' : '';
  return `<span class="k-delta ${cls}">${sign}${idNum(d, 2)} ${suffix} vs ${y - 1}</span>`;
}

function kpi(label, value, sub, deltaHtml = '') {
  return `<div class="kpi"><div class="k-label">${label}</div>
    <div class="k-value">${value}</div>
    <div class="k-sub">${sub}</div>${deltaHtml}</div>`;
}

function srcLine(text) {
  return `<p class="src">Sumber: ${text}</p>`;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function yearTable(series, label, unit) {
  const rows = YEARS.map((y) => {
    const prev = y > YEARS[0] ? series[y - 1] : null;
    const d = prev == null ? '—' : `${series[y] > prev ? '+' : ''}${idNum(series[y] - prev, 2)}`;
    return `<tr><td>${y}</td><td>${idNum(series[y], 2)} ${unit}</td><td class="${prev != null && series[y] > prev ? 'pos' : prev != null && series[y] < prev ? 'neg' : ''}">${d}</td></tr>`;
  }).join('');
  return `<div class="table-scroll"><table class="data">
    <thead><tr><th>Tahun</th><th>${label}</th><th>Perubahan</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

// ---- views ---------------------------------------------------------------

function renderHome() {
  const y = year;
  view.innerHTML = `
    <div class="page-head">
      <h1>Indonesia dalam Angka</h1>
      <p class="en">Indonesia in figures — the country's key statistics at a glance, ${y}.</p>
    </div>
    <p class="lede"><b>AngkaNusa</b> merangkum angka-angka resmi Indonesia — penduduk, ekonomi,
    harga, pekerjaan, dan wilayah — dari rilis Badan Pusat Statistik (BPS), Bank Indonesia,
    dan World Bank, dalam satu portal yang bisa dibuka di desktop maupun ponsel.</p>
    <div class="kpi-grid">
      ${kpi('Penduduk', `${idNum(POPULATION[y])} jt`, `BPS, pertengahan ${y}`, deltaText(POPULATION, y, 'jt'))}
      ${kpi('PDB nominal', `Rp${idNum(GDP_NOMINAL[y], 0)} T`, `BPS, harga berlaku ${y}`, deltaText(GDP_NOMINAL, y, 'T'))}
      ${kpi('Inflasi (Des, yoy)', `${idNum(INFLATION[y], 2)}%`, `BPS, Desember ${y}`, deltaText(INFLATION, y, 'poin', true))}
      ${kpi('Pengangguran terbuka', `${idNum(UNEMPLOYMENT[y], 2)}%`, `BPS, Agustus ${y}`, deltaText(UNEMPLOYMENT, y, 'poin', true))}
      ${kpi('Kemiskinan', `${idNum(POVERTY[y], 2)}%`, `BPS, September ${y}`, deltaText(POVERTY, y, 'poin', true))}
      ${kpi('Indeks Pembangunan Manusia', idNum(HDI[y], 2), `BPS, ${y}`, deltaText(HDI, y, 'poin'))}
      ${kpi('Ekspor', `US$${idNum(EXPORTS[y])} M`, `BPS, ${y}`, deltaText(EXPORTS, y, 'M US$'))}
      ${kpi('Impor', `US$${idNum(IMPORTS[y])} M`, `BPS, ${y}`, deltaText(IMPORTS, y, 'M US$'))}
    </div>
    <p class="small muted">Angka tahun ${y} dari pemilih tahun di atas. Ubah tahun untuk melihat seluruh portal pada tahun itu.</p>
    <div class="grid-2">
      <section class="panel">
        <h2>Piramida Penduduk ${y === 2024 ? '2024' : ''} <span class="en">Population pyramid</span></h2>
        <div class="chart-wrap"><canvas id="ch-pyramid"></canvas></div>
        <p class="chart-note">Struktur umur 2024: kelompok 20–24 tahun adalah yang terbesar. Angka dalam juta jiwa.</p>
        ${srcLine('BPS, struktur umur penduduk 2024 (dibulatkan).')}
      </section>
      <section class="panel">
        <h2>Pertumbuhan PDB <span class="en">GDP growth, 2019–2024</span></h2>
        <div class="chart-wrap"><canvas id="ch-gdp"></canvas></div>
        <p class="chart-note">Ekonomi tumbuh ${idNum(GDP_GROWTH[2024], 2)}% pada 2024 — tahun keempat berturut-turut di atas 5% setelah kontraksi pandemi 2020.</p>
        ${srcLine('BPS, pertumbuhan PDB riil (yoy).')}
      </section>
    </div>
    <section class="panel">
      <h2>Sorotan ${y} <span class="en">Headlines</span></h2>
      <ul class="fact-list">
        <li><b>PDB ${y}:</b> Rp${idNum(GDP_NOMINAL[y], 0)} triliun, tumbuh ${idNum(GDP_GROWTH[y], 2)}% — ${y === 2024 ? '≈ US$1,40 triliun, PDB per kapita ≈ US$4.919 (World Bank / BPS).' : 'harga berlaku, BPS.'}</li>
        <li><b>Perdagangan ${y}:</b> ekspor US$${idNum(EXPORTS[y])} miliar, impor US$${idNum(IMPORTS[y])} miliar, surplus US$${idNum(EXPORTS[y] - IMPORTS[y])} miliar (BPS).</li>
        <li><b>Kemiskinan ${y}:</b> ${idNum(POVERTY[y], 2)}% penduduk — ${y === 2024 ? 'terendah sepanjang sejarah pencatatan BPS.' : 'BPS, September.'}</li>
        <li><b>IPM ${y}:</b> ${idNum(HDI[y], 2)} — ${y === 2024 ? 'harapan hidup ±74 tahun (BPS).' : 'BPS.'}</li>
      </ul>
    </section>
    <section>
      <h2>Jelajahi statistik <span class="en">Explore</span></h2>
      <div class="quick-links">
        <a href="#/penduduk"><b>Penduduk</b><span>281,6 juta jiwa, piramida umur, sebaran provinsi.</span></a>
        <a href="#/ekonomi"><b>Ekonomi</b><span>PDB, pertumbuhan, ekspor–impor 2019–2024.</span></a>
        <a href="#/harga"><b>Harga &amp; Inflasi</b><span>Inflasi tahunan dan sasaran Bank Indonesia.</span></a>
        <a href="#/kerja"><b>Ketenagakerjaan</b><span>Pengangguran dan kemiskinan 2019–2024.</span></a>
        <a href="#/wilayah"><b>Provinsi</b><span>38 provinsi: penduduk, ibu kota, pangsa nasional.</span></a>
        <a href="#/sumber"><b>Sumber Data &amp; Metodologi</b><span>Dari mana angka-angka ini berasal.</span></a>
      </div>
    </section>`;
  drawCharts = () => {
    pyramidChart(document.getElementById('ch-pyramid'), {
      ages: PYRAMID_AGE, male: PYRAMID_MALE, female: PYRAMID_FEMALE,
      title: 'Penduduk menurut kelompok umur, 2024',
    });
    lineChart(document.getElementById('ch-gdp'), {
      title: 'Pertumbuhan PDB riil (% yoy)',
      years: YEARS,
      series: [{ label: 'PDB', color: TEAL, values: GDP_GROWTH }],
      yLabel: '% per tahun',
      highlightYear: year,
    });
  };
}

function renderPenduduk() {
  const y = year;
  const top5 = [...PROVINCES].sort((a, b) => b.pop - a.pop).slice(0, 5);
  const maxPop = top5[0].pop;
  view.innerHTML = `
    <div class="page-head">
      <h1>Penduduk</h1>
      <p class="en">Population — how many Indonesians there are, how fast the number grows, and where they live.</p>
    </div>
    <p class="lede">Pada pertengahan ${y}, penduduk Indonesia mencapai <b>${idNum(POPULATION[y])} juta jiwa</b>,
    tumbuh sekitar <b>${idNum(POP_GROWTH[y])}% per tahun</b>. Sejak pemekaran Papua pada 2022, Indonesia
    terdiri dari <b>38 provinsi</b>.</p>
    <div class="kpi-grid">
      ${kpi('Penduduk', `${idNum(POPULATION[y])} jt`, `BPS, pertengahan ${y}`, deltaText(POPULATION, y, 'jt'))}
      ${kpi('Pertumbuhan penduduk', `${idNum(POP_GROWTH[y])}%`, `BPS, ${y}`, deltaText(POP_GROWTH, y, 'poin', true))}
      ${kpi('Provinsi terbanyak', 'Jawa Barat', '49,9 juta jiwa (2024)')}
      ${kpi('Ibu kota terbanyak', 'DKI Jakarta', '10,6 juta jiwa (2024)')}
    </div>
    <div class="grid-2">
      <section class="panel">
        <h2>Jumlah penduduk 2019–${y} <span class="en">Population</span></h2>
        <div class="chart-wrap"><canvas id="ch-pop"></canvas></div>
        ${srcLine('BPS; 2020 adalah hasil Sensus Penduduk.')}
      </section>
      <section class="panel">
        <h2>Piramida penduduk 2024 <span class="en">Age structure</span></h2>
        <div class="chart-wrap"><canvas id="ch-pyramid2"></canvas></div>
        <p class="chart-note">Piramida masih lebar di bawah: Indonesia berada pada bonus demografi, dengan penduduk usia kerja yang besar.</p>
        ${srcLine('BPS, struktur umur 2024 (dibulatkan).')}
      </section>
    </div>
    <section class="panel">
      <h2>Provinsi berpenduduk terbanyak <span class="en">Largest provinces, 2024</span></h2>
      ${top5.map((p) => `<div class="bar-row"><span>${esc(p.name)}</span>
        <span class="bar-track"><span class="bar-fill" style="display:block;width:${((p.pop / maxPop) * 100).toFixed(1)}%"></span></span>
        <span class="bar-val">${idNum(p.pop)} jt</span></div>`).join('')}
      <p class="chart-note">Lima provinsi di Pulau Jawa menampung lebih dari separuh penduduk Indonesia. Lihat seluruh 38 provinsi di <a href="#/wilayah">halaman Wilayah</a>.</p>
      ${srcLine('BPS, estimasi penduduk pertengahan 2024 (dibulatkan).')}
    </section>
    <section class="panel">
      <h2>Pertumbuhan penduduk per tahun <span class="en">Annual growth</span></h2>
      ${yearTable(POP_GROWTH, 'Pertumbuhan', '%')}
      ${srcLine('BPS, dibulatkan ke satu desimal.')}
    </section>`;
  drawCharts = () => {
    lineChart(document.getElementById('ch-pop'), {
      title: 'Penduduk (juta jiwa)',
      years: YEARS,
      series: [{ label: 'Penduduk', color: TEAL, values: POPULATION }],
      yLabel: 'juta jiwa',
      highlightYear: year,
    });
    pyramidChart(document.getElementById('ch-pyramid2'), {
      ages: PYRAMID_AGE, male: PYRAMID_MALE, female: PYRAMID_FEMALE,
      title: 'Penduduk menurut kelompok umur, 2024',
    });
  };
}

function renderEkonomi() {
  const y = year;
  const surplus = EXPORTS[y] - IMPORTS[y];
  const metricBtn = (key, label) =>
    `<button data-metric="${key}" class="${ekonomiMetric === key ? 'active' : ''}">${label}</button>`;
  view.innerHTML = `
    <div class="page-head">
      <h1>Ekonomi</h1>
      <p class="en">Economy — GDP, growth, and trade with the world.</p>
    </div>
    <p class="lede">PDB Indonesia ${y} mencapai <b>Rp${idNum(GDP_NOMINAL[y], 0)} triliun</b> dan tumbuh
    <b>${idNum(GDP_GROWTH[y], 2)}%</b>. Perdagangan ${y} surplus <b>US$${idNum(surplus)} miliar</b>.</p>
    <div class="kpi-grid">
      ${kpi('PDB nominal', `Rp${idNum(GDP_NOMINAL[y], 0)} T`, `BPS, harga berlaku ${y}`, deltaText(GDP_NOMINAL, y, 'T'))}
      ${kpi('Pertumbuhan PDB', `${idNum(GDP_GROWTH[y], 2)}%`, `BPS, ${y} (yoy)`, deltaText(GDP_GROWTH, y, 'poin'))}
      ${kpi('Ekspor', `US$${idNum(EXPORTS[y])} M`, `BPS, ${y}`, deltaText(EXPORTS, y, 'M US$'))}
      ${kpi('Neraca dagang', `US$${idNum(surplus)} M`, `${surplus >= 0 ? 'Surplus' : 'Defisit'}, BPS ${y}`, '')}
    </div>
    <section class="panel">
      <h2>Grafik ekonomi <span class="en">Chart</span></h2>
      <div class="controls">
        <label>Metrik:</label>
        <div class="btn-group" id="metric-switch">
          ${metricBtn('growth', 'Pertumbuhan PDB')}
          ${metricBtn('nominal', 'PDB nominal')}
          ${metricBtn('trade', 'Ekspor–Impor')}
        </div>
      </div>
      <div class="chart-wrap"><canvas id="ch-eco"></canvas></div>
      <p class="chart-note" id="eco-note"></p>
      ${srcLine('BPS. PDB nominal dalam triliun rupiah harga berlaku; perdagangan dalam miliar dolar AS.')}
    </section>
    <section class="panel">
      <h2>Perdagangan luar negeri <span class="en">Trade, billion US$</span></h2>
      <div class="table-scroll"><table class="data">
        <thead><tr><th>Tahun</th><th>Ekspor</th><th>Impor</th><th>Neraca</th></tr></thead>
        <tbody>${YEARS.map((yy) => `<tr><td>${yy}</td><td>US$${idNum(EXPORTS[yy])} M</td><td>US$${idNum(IMPORTS[yy])} M</td><td class="${EXPORTS[yy] - IMPORTS[yy] >= 0 ? 'pos' : 'neg'}">US$${idNum(EXPORTS[yy] - IMPORTS[yy])} M</td></tr>`).join('')}</tbody>
      </table></div>
      ${srcLine('BPS, dibulatkan.')}
    </section>
    <section class="panel">
      <h2>Catatan ${y} <span class="en">Notes</span></h2>
      <ul class="fact-list">
        <li><b>PDB per kapita ${y === 2024 ? '2024' : y}:</b> ${y === 2024 ? '≈ US$4.919 (World Bank / BPS).' : 'lihat halaman Beranda untuk tahun terbaru.'}</li>
        <li><b>Kontraksi 2020:</b> PDB menyusut 2,07% saat pandemi COVID-19, lalu pulih 3,70% pada 2021 dan di atas 5% sejak 2022.</li>
        <li><b>Surplus dagang:</b> Indonesia mencatat surplus perdagangan setiap tahun sejak 2020, puncaknya US$54,5 miliar pada 2022.</li>
      </ul>
    </section>`;
  document.getElementById('metric-switch').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-metric]');
    if (!btn) return;
    ekonomiMetric = btn.dataset.metric;
    document.querySelectorAll('#metric-switch button').forEach((b) =>
      b.classList.toggle('active', b === btn));
    drawCharts();
  });
  drawCharts = () => {
    const note = document.getElementById('eco-note');
    const canvas = document.getElementById('ch-eco');
    if (ekonomiMetric === 'growth') {
      lineChart(canvas, {
        title: 'Pertumbuhan PDB riil (% yoy)',
        years: YEARS,
        series: [{ label: 'PDB', color: TEAL, values: GDP_GROWTH }],
        yLabel: '% per tahun',
        highlightYear: year,
      });
      note.textContent = 'Tumbuh 5,03% pada 2024 — tahun keempat berturut-turut di atas 5%.';
    } else if (ekonomiMetric === 'nominal') {
      barChart(canvas, {
        title: 'PDB nominal (triliun rupiah)',
        labels: YEARS.map(String),
        values: YEARS.map((yy) => GDP_NOMINAL[yy]),
        yLabel: 'Rp triliun',
        decimals: 0,
        highlightIndex: YEARS.indexOf(year),
      });
      note.textContent = 'PDB nominal naik dari Rp15.834 triliun (2019) menjadi Rp22.139 triliun (2024).';
    } else {
      lineChart(canvas, {
        title: 'Ekspor vs impor (miliar US$)',
        years: YEARS,
        series: [
          { label: 'Ekspor', color: TEAL, values: EXPORTS },
          { label: 'Impor', color: AMBER, values: IMPORTS },
        ],
        yLabel: 'miliar US$',
        highlightYear: year,
      });
      note.textContent = 'Ekspor selalu di atas impor sejak 2020; surplus 2024 sebesar US$31,0 miliar.';
    }
  };
}

function renderHarga() {
  const y = year;
  const t = INFLATION_TARGET;
  view.innerHTML = `
    <div class="page-head">
      <h1>Harga &amp; Inflasi</h1>
      <p class="en">Prices &amp; inflation — how fast prices rise, and the central bank's target.</p>
    </div>
    <p class="lede">Inflasi Desember ${y} tercatat <b>${idNum(INFLATION[y], 2)}% (yoy)</b> — ${y === 2024 ? 'di bawah batas bawah sasaran Bank Indonesia.' : 'BPS.'}</p>
    <div class="callout"><b>Sasaran inflasi Bank Indonesia:</b> ${idNum(t.mid, 1)}% ±1 poin persentase
    (rentang ${idNum(t.low, 1)}%–${idNum(t.high, 1)}%). Pada 2024 inflasi 1,57% berada di bawah rentang sasaran.</div>
    <div class="kpi-grid">
      ${kpi('Inflasi', `${idNum(INFLATION[y], 2)}%`, `BPS, Desember ${y} (yoy)`, deltaText(INFLATION, y, 'poin', true))}
      ${kpi('Sasaran BI', `${idNum(t.mid, 1)}% ±1`, 'Rentang 1,5%–3,5%')}
      ${kpi('Tertinggi 2019–2024', '5,51%', 'Desember 2022')}
      ${kpi('Terendah 2019–2024', '1,57%', 'Desember 2024')}
    </div>
    <section class="panel">
      <h2>Inflasi Desember (yoy) 2019–2024 <span class="en">Headline inflation</span></h2>
      <div class="chart-wrap"><canvas id="ch-inf"></canvas></div>
      <p class="chart-note">Lonjakan 2022 (5,51%) mengikuti penyesuaian harga BBM bersubsidi; inflasi kembali ke kisaran sasaran pada 2023 dan melandai ke 1,57% pada 2024.</p>
      ${srcLine('BPS, inflasi IHK Desember year-on-year. Sasaran: Bank Indonesia.')}
    </section>
    <section class="panel">
      <h2>Inflasi per tahun <span class="en">By year</span></h2>
      ${yearTable(INFLATION, 'Inflasi (Des, yoy)', '%')}
      ${srcLine('BPS.')}
    </section>`;
  drawCharts = () => {
    lineChart(document.getElementById('ch-inf'), {
      title: 'Inflasi Desember, year-on-year (%)',
      years: YEARS,
      series: [{ label: 'Inflasi', color: AMBER, values: INFLATION }],
      yLabel: '% per tahun',
      highlightYear: year,
    });
  };
}

function renderKerja() {
  const y = year;
  const isUnemp = kerjaTab === 'unemployment';
  const series = isUnemp ? UNEMPLOYMENT : POVERTY;
  const label = isUnemp ? 'Pengangguran terbuka' : 'Kemiskinan';
  const unit = '%';
  view.innerHTML = `
    <div class="page-head">
      <h1>Ketenagakerjaan</h1>
      <p class="en">Jobs &amp; welfare — who works, who looks for work, and who lives below the poverty line.</p>
    </div>
    <p class="lede">Tingkat pengangguran terbuka Agustus ${y} sebesar <b>${idNum(UNEMPLOYMENT[y], 2)}%</b>,
    dan tingkat kemiskinan September ${y} sebesar <b>${idNum(POVERTY[y], 2)}%</b> — keduanya terendah sejak 2020.</p>
    <div class="kpi-grid">
      ${kpi('Pengangguran terbuka', `${idNum(UNEMPLOYMENT[y], 2)}%`, `BPS, Agustus ${y}`, deltaText(UNEMPLOYMENT, y, 'poin', true))}
      ${kpi('Kemiskinan', `${idNum(POVERTY[y], 2)}%`, `BPS, September ${y}`, deltaText(POVERTY, y, 'poin', true))}
      ${kpi('IPM', idNum(HDI[y], 2), `BPS, ${y}`, deltaText(HDI, y, 'poin'))}
      ${kpi('Harapan hidup', '±74 thn', 'BPS, 2024')}
    </div>
    <section class="panel">
      <h2>${label} <span class="en">${isUnemp ? 'Open unemployment' : 'Poverty rate'}</span></h2>
      <div class="tabs" id="kerja-tabs">
        <button data-tab="unemployment" class="${isUnemp ? 'active' : ''}">Pengangguran</button>
        <button data-tab="poverty" class="${!isUnemp ? 'active' : ''}">Kemiskinan</button>
      </div>
      <div class="chart-wrap"><canvas id="ch-kerja"></canvas></div>
      <p class="chart-note">${isUnemp
        ? 'Pengangguran melonjak ke 7,07% pada Agustus 2020 saat pandemi, lalu turun setiap tahun hingga 4,91% pada 2024.'
        : 'Kemiskinan naik ke 10,19% pada 2020, lalu turun bertahap hingga 8,57% pada September 2024 — terendah dalam pencatatan BPS.'}</p>
      ${srcLine(isUnemp ? 'BPS, Survei Angkatan Kerja Nasional (Sakernas), Agustus.' : 'BPS, Survei Sosial Ekonomi Nasional, September.')}
    </section>
    <section class="panel">
      <h2>${label} per tahun <span class="en">By year</span></h2>
      ${yearTable(series, label, unit)}
      ${srcLine('BPS.')}
    </section>`;
  document.getElementById('kerja-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-tab]');
    if (!btn) return;
    kerjaTab = btn.dataset.tab;
    renderKerja();
    requestAnimationFrame(() => drawCharts && drawCharts());
  });
  drawCharts = () => {
    lineChart(document.getElementById('ch-kerja'), {
      title: `${label} (%)`,
      years: YEARS,
      series: [{ label, color: isUnemp ? TEAL : AMBER, values: series }],
      yLabel: '%',
      highlightYear: year,
    });
  };
}

function filteredProvinces() {
  const q = wilayahQuery.trim().toLowerCase();
  let list = PROVINCES.filter((p) =>
    !q || p.name.toLowerCase().includes(q) || p.capital.toLowerCase().includes(q));
  const byPopDesc = (a, b) => b.pop - a.pop;
  const byPopAsc = (a, b) => a.pop - b.pop;
  const byName = (a, b) => a.name.localeCompare(b.name, 'id');
  if (wilayahSort === 'pop-desc') list.sort(byPopDesc);
  else if (wilayahSort === 'pop-asc') list.sort(byPopAsc);
  else if (wilayahSort === 'name-asc') list.sort(byName);
  else if (wilayahSort === 'name-desc') list.sort((a, b) => byName(b, a));
  return list;
}

function renderWilayah() {
  const total = PROVINCES.reduce((s, p) => s + p.pop, 0);
  const list = filteredProvinces();
  const top10 = [...PROVINCES].sort((a, b) => b.pop - a.pop).slice(0, 10);
  const maxPop = top10[0].pop;
  view.innerHTML = `
    <div class="page-head">
      <h1>Provinsi</h1>
      <p class="en">Provinces — all 38 provinces, their populations, capitals, and share of the nation.</p>
    </div>
    <p class="lede">Indonesia terdiri dari <b>38 provinsi</b> sejak pemekaran Papua pada 2022.
    Jawa Barat adalah yang terpadat (<b>49,9 juta jiwa</b>), Papua Selatan yang paling sedikit (<b>0,5 juta jiwa</b>).</p>
    <section class="panel">
      <h2>Sepuluh provinsi terpadat <span class="en">Top 10 by population, 2024</span></h2>
      ${top10.map((p) => `<div class="bar-row"><span>${esc(p.name)}</span>
        <span class="bar-track"><span class="bar-fill ${p.name.startsWith('DKI') ? 'amber' : ''}" style="display:block;width:${((p.pop / maxPop) * 100).toFixed(1)}%"></span></span>
        <span class="bar-val">${idNum(p.pop)} jt</span></div>`).join('')}
      ${srcLine('BPS, estimasi penduduk pertengahan 2024 (dibulatkan).')}
    </section>
    <section class="panel">
      <h2>Semua provinsi <span class="en">All provinces</span></h2>
      <div class="controls">
        <label for="prov-search">Cari:</label>
        <input class="input" id="prov-search" type="search" placeholder="Nama provinsi atau ibu kota…" value="${esc(wilayahQuery)}" autocomplete="off">
        <label for="prov-sort">Urutkan:</label>
        <select class="input" id="prov-sort">
          <option value="pop-desc" ${wilayahSort === 'pop-desc' ? 'selected' : ''}>Penduduk terbanyak</option>
          <option value="pop-asc" ${wilayahSort === 'pop-asc' ? 'selected' : ''}>Penduduk tersedikit</option>
          <option value="name-asc" ${wilayahSort === 'name-asc' ? 'selected' : ''}>Nama A–Z</option>
          <option value="name-desc" ${wilayahSort === 'name-desc' ? 'selected' : ''}>Nama Z–A</option>
        </select>
      </div>
      <p class="small muted" id="prov-count">Menampilkan ${list.length} dari 38 provinsi · total provinsi ${idNum(total)} juta jiwa (estimasi 2024).</p>
      <div class="table-scroll"><table class="data" id="prov-table">
        <thead><tr><th data-sort="name-asc">Provinsi</th><th>Ibu kota</th><th data-sort="pop-desc">Penduduk (jt)</th><th>Pangsa</th></tr></thead>
        <tbody>${list.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.capital)}</td><td>${idNum(p.pop)}</td><td>${idNum((p.pop / total) * 100, 2)}%</td></tr>`).join('') || '<tr><td colspan="4">Tidak ada provinsi yang cocok dengan pencarian.</td></tr>'}</tbody>
      </table></div>
      ${srcLine('BPS, estimasi penduduk pertengahan 2024 (dibulatkan ke 0,1 juta). Pangsa dihitung dari total provinsi.')}
    </section>`;
  const search = document.getElementById('prov-search');
  search.addEventListener('input', () => {
    wilayahQuery = search.value;
    const pos = search.selectionStart;
    renderWilayah();
    const next = document.getElementById('prov-search');
    next.focus();
    next.setSelectionRange(pos, pos);
  });
  document.getElementById('prov-sort').addEventListener('change', (e) => {
    wilayahSort = e.target.value;
    renderWilayah();
    document.getElementById('prov-search').focus();
  });
  document.getElementById('prov-table').addEventListener('click', (e) => {
    const th = e.target.closest('th[data-sort]');
    if (!th) return;
    wilayahSort = th.dataset.sort === 'pop-desc'
      ? (wilayahSort === 'pop-desc' ? 'pop-asc' : 'pop-desc')
      : (wilayahSort === 'name-asc' ? 'name-desc' : 'name-asc');
    renderWilayah();
  });
  drawCharts = null;
}

function renderSumber() {
  view.innerHTML = `
    <div class="page-head">
      <h1>Sumber Data &amp; Metodologi</h1>
      <p class="en">Sources &amp; methodology — where every number on this portal comes from, and how to read it.</p>
    </div>
    <p class="lede">Semua angka di AngkaNusa berasal dari rilis resmi yang tercantum di bawah.
    Tidak ada angka yang diambil dari sumber tak bernama, dan tidak ada data yang dimuat dari internet saat halaman dibuka.</p>
    <section class="panel">
      <h2>Sumber <span class="en">Sources</span></h2>
      ${SOURCES.map((s) => `<div class="source-card"><b>${esc(s.name)}</b><p>${esc(s.note)}</p></div>`).join('')}
      <p class="small muted">Angka yang ditandai “dibulatkan” sudah dibulatkan ke satu desimal dari rilis aslinya; nilai yang presisi (misalnya inflasi 1,57%) ditulis apa adanya dari rilis BPS.</p>
    </section>
    <section class="panel">
      <h2>Metodologi <span class="en">How the figures are read</span></h2>
      <ol class="method-list">
        <li><b>Penduduk:</b> estimasi pertengahan tahun BPS; angka 2020 adalah hasil Sensus Penduduk 2020. Total 38 provinsi dihitung dari estimasi masing-masing provinsi.</li>
        <li><b>PDB:</b> pertumbuhan adalah PDB riil year-on-year (harga konstan); PDB nominal memakai harga berlaku. PDB per kapita dalam dolar AS memakai kurs dan rilis World Bank.</li>
        <li><b>Inflasi:</b> Indeks Harga Konsumen, Desember year-on-year. Sasaran Bank Indonesia adalah 2,5% ±1 poin persentase.</li>
        <li><b>Pengangguran:</b> tingkat pengangguran terbuka dari Sakernas, diukur setiap Agustus. <b>Kemiskinan:</b> persentase penduduk di bawah garis kemiskinan, diukur setiap September (dan Maret).</li>
        <li><b>IPM:</b> Indeks Pembangunan Manusia BPS, skala 0–100, menggabungkan kesehatan, pendidikan, dan standar hidup layak.</li>
        <li><b>Perdagangan:</b> nilai ekspor dan impor barang dalam dolar AS; neraca adalah ekspor dikurangi impor.</li>
        <li><b>Tahun:</b> pemilih tahun di bilah atas mengubah seluruh angka dan grafik pada portal ke tahun yang dipilih (2019–2024).</li>
      </ol>
    </section>
    <section class="panel">
      <h2>Tentang AngkaNusa <span class="en">About</span></h2>
      <p>AngkaNusa adalah portal statistik orisinal — nama, desain, dan tulisannya dibuat untuk portal ini.
      AngkaNusa bukan situs resmi Badan Pusat Statistik dan tidak berafiliasi dengan BPS, Bank Indonesia, atau World Bank;
      angka-angka resmi mereka dikutip di sini beserta sumber dan tahunnya.</p>
      <p class="small muted">Portal ini berjalan sepenuhnya dari berkas statis (HTML, CSS, dan JavaScript) tanpa permintaan jaringan apa pun.</p>
    </section>`;
  drawCharts = null;
}

// ---- router ----------------------------------------------------------------

const ROUTES = {
  '/': renderHome,
  '/penduduk': renderPenduduk,
  '/ekonomi': renderEkonomi,
  '/harga': renderHarga,
  '/kerja': renderKerja,
  '/wilayah': renderWilayah,
  '/sumber': renderSumber,
};

function currentRoute() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  return ROUTES[hash] ? hash : '/';
}

function render() {
  const route = currentRoute();
  document.querySelectorAll('.main-nav a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === `#${route}`);
  });
  ROUTES[route]();
  window.scrollTo(0, 0);
  requestAnimationFrame(() => {
    if (drawCharts) drawCharts();
  });
}

yearSelect.addEventListener('change', () => {
  year = Number(yearSelect.value);
  render();
});

window.addEventListener('hashchange', render);

let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (drawCharts) drawCharts();
  }, 200);
});

render();
