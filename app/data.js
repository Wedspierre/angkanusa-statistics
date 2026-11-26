// AngkaNusa figures. Every number below comes from a public release of Badan Pusat
// Statistik (BPS), Bank Indonesia, or the World Bank, and is labelled with its source
// and year wherever it is shown. Values marked "rounded" are rounded to one decimal
// from the published release; nothing here is invented, and nothing is fetched at
// runtime — the whole dataset ships in this file.

export const YEARS = [2019, 2020, 2021, 2022, 2023, 2024];

// Mid-year population, millions of people (BPS; 2020 is the census count).
export const POPULATION = {
  2019: 266.9, 2020: 270.2, 2021: 272.7, 2022: 275.8, 2023: 278.7, 2024: 281.6,
};

// Annual population growth, percent (BPS, rounded).
export const POP_GROWTH = {
  2019: 1.0, 2020: 1.25, 2021: 0.9, 2022: 1.1, 2023: 1.0, 2024: 0.8,
};

// Real GDP growth, percent year-on-year (BPS).
export const GDP_GROWTH = {
  2019: 5.02, 2020: -2.07, 2021: 3.70, 2022: 5.31, 2023: 5.05, 2024: 5.03,
};

// Nominal GDP, trillion rupiah, current prices (BPS, rounded).
export const GDP_NOMINAL = {
  2019: 15834, 2020: 15434, 2021: 16977, 2022: 19588, 2023: 20892, 2024: 22139,
};

// Consumer price inflation, December year-on-year, percent (BPS).
export const INFLATION = {
  2019: 2.72, 2020: 1.68, 2021: 1.87, 2022: 5.51, 2023: 2.61, 2024: 1.57,
};

// Open unemployment rate, August, percent (BPS).
export const UNEMPLOYMENT = {
  2019: 5.28, 2020: 7.07, 2021: 6.49, 2022: 5.86, 2023: 5.32, 2024: 4.91,
};

// Poverty rate, September, percent of population (BPS).
export const POVERTY = {
  2019: 9.22, 2020: 10.19, 2021: 10.14, 2022: 9.57, 2023: 9.36, 2024: 8.57,
};

// Human Development Index (BPS).
export const HDI = {
  2019: 71.92, 2020: 71.94, 2021: 72.29, 2022: 72.91, 2023: 74.39, 2024: 75.02,
};

// Trade, billion US dollars (BPS, rounded).
export const EXPORTS = {
  2019: 167.7, 2020: 163.2, 2021: 231.6, 2022: 291.9, 2023: 258.8, 2024: 264.7,
};
export const IMPORTS = {
  2019: 171.3, 2020: 141.6, 2021: 196.2, 2022: 237.4, 2023: 221.9, 2024: 233.7,
};

// 2024 snapshot figures shown on the dashboard.
export const SNAPSHOT_2024 = {
  population: '281,6 juta',
  populationNote: 'BPS, pertengahan 2024',
  gdpNominal: 'Rp22.139 triliun',
  gdpUsd: '≈ US$1,40 triliun',
  gdpPerCapita: '≈ US$4.919',
  gdpPerCapitaNote: 'World Bank / BPS, 2024',
  inflation: '1,57%',
  inflationNote: 'BPS, Desember 2024 (yoy)',
  unemployment: '4,91%',
  unemploymentNote: 'BPS, Agustus 2024',
  poverty: '8,57%',
  povertyNote: 'BPS, September 2024',
  hdi: '75,02',
  hdiNote: 'BPS, 2024',
  lifeExpectancy: '±74 tahun',
  lifeExpectancyNote: 'BPS, 2024',
  exports: 'US$264,7 miliar',
  imports: 'US$233,7 miliar',
  tradeSurplus: 'US$31,0 miliar',
  gini: '0,379',
  giniNote: 'BPS, September 2024',
  provinces: '38 provinsi',
  provincesNote: 'Sejak pemekaran Papua, 2022',
};

// Population pyramid, 2024, millions per 5-year age band (BPS structure, rounded).
// Values are rounded estimates of the published age structure; the two columns add
// to roughly the 2024 total of 281,6 million.
export const PYRAMID_AGE = [
  '0–4', '5–9', '10–14', '15–19', '20–24', '25–29', '30–34', '35–39',
  '40–44', '45–49', '50–54', '55–59', '60–64', '65–69', '70–74', '75+',
];
export const PYRAMID_MALE = [
  11.2, 11.7, 11.5, 11.3, 11.9, 11.6, 11.2, 10.7,
  10.2, 9.4, 8.4, 7.2, 5.9, 4.5, 3.0, 2.9,
];
export const PYRAMID_FEMALE = [
  10.7, 11.2, 11.0, 10.8, 11.4, 11.2, 10.9, 10.5,
  10.1, 9.3, 8.4, 7.3, 6.1, 4.8, 3.4, 3.5,
];

// Provinces, mid-2024 population in millions (BPS estimates, rounded to one
// decimal). Shares are computed from these figures in the table view.
export const PROVINCES = [
  { name: 'Jawa Barat', pop: 49.9, capital: 'Bandung' },
  { name: 'Jawa Timur', pop: 41.8, capital: 'Surabaya' },
  { name: 'Jawa Tengah', pop: 37.9, capital: 'Semarang' },
  { name: 'Sumatera Utara', pop: 15.6, capital: 'Medan' },
  { name: 'Banten', pop: 12.4, capital: 'Serang' },
  { name: 'DKI Jakarta', pop: 10.6, capital: 'Jakarta' },
  { name: 'Sulawesi Selatan', pop: 9.5, capital: 'Makassar' },
  { name: 'Lampung', pop: 9.4, capital: 'Bandar Lampung' },
  { name: 'Sumatera Selatan', pop: 8.8, capital: 'Palembang' },
  { name: 'Riau', pop: 6.9, capital: 'Pekanbaru' },
  { name: 'Sumatera Barat', pop: 6.0, capital: 'Padang' },
  { name: 'Kalimantan Barat', pop: 5.8, capital: 'Pontianak' },
  { name: 'Nusa Tenggara Timur', pop: 5.7, capital: 'Kupang' },
  { name: 'Aceh', pop: 5.6, capital: 'Banda Aceh' },
  { name: 'Nusa Tenggara Barat', pop: 5.6, capital: 'Mataram' },
  { name: 'Bali', pop: 4.4, capital: 'Denpasar' },
  { name: 'Kalimantan Selatan', pop: 4.3, capital: 'Banjarmasin' },
  { name: 'Kalimantan Timur', pop: 4.0, capital: 'Samarinda' },
  { name: 'Jambi', pop: 3.7, capital: 'Jambi' },
  { name: 'DI Yogyakarta', pop: 3.8, capital: 'Yogyakarta' },
  { name: 'Sulawesi Tengah', pop: 3.1, capital: 'Palu' },
  { name: 'Kalimantan Tengah', pop: 2.8, capital: 'Palangka Raya' },
  { name: 'Sulawesi Tenggara', pop: 2.8, capital: 'Kendari' },
  { name: 'Sulawesi Utara', pop: 2.7, capital: 'Manado' },
  { name: 'Kepulauan Riau', pop: 2.2, capital: 'Tanjung Pinang' },
  { name: 'Bengkulu', pop: 2.1, capital: 'Bengkulu' },
  { name: 'Maluku', pop: 2.0, capital: 'Ambon' },
  { name: 'Sulawesi Barat', pop: 1.6, capital: 'Mamuju' },
  { name: 'Kepulauan Bangka Belitung', pop: 1.5, capital: 'Pangkal Pinang' },
  { name: 'Papua Pegunungan', pop: 1.5, capital: 'Wamena' },
  { name: 'Papua Tengah', pop: 1.4, capital: 'Nabire' },
  { name: 'Maluku Utara', pop: 1.4, capital: 'Sofifi' },
  { name: 'Gorontalo', pop: 1.3, capital: 'Gorontalo' },
  { name: 'Papua', pop: 1.1, capital: 'Jayapura' },
  { name: 'Kalimantan Utara', pop: 0.7, capital: 'Tanjung Selor' },
  { name: 'Papua Barat', pop: 0.6, capital: 'Manokwari' },
  { name: 'Papua Barat Daya', pop: 0.6, capital: 'Sorong' },
  { name: 'Papua Selatan', pop: 0.5, capital: 'Merauke' },
];

// Bank Indonesia's inflation target band, percent (Bank Indonesia).
export const INFLATION_TARGET = { low: 1.5, mid: 2.5, high: 3.5 };

export const SOURCES = [
  { name: 'Badan Pusat Statistik (BPS)', note: 'Penduduk, PDB, inflasi, pengangguran, kemiskinan, IPM, perdagangan, provinsi.' },
  { name: 'Bank Indonesia', note: 'Sasaran inflasi 2,5% ±1 poin persentase.' },
  { name: 'World Bank', note: 'PDB per kapita dalam dolar AS.' },
];
