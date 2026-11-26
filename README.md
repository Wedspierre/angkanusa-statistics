# AngkaNusa — Portal Statistik Indonesia

Entry for make.fun competition **best-national-statistics-site-20261126-0539**
("Make the best national statistics site"). Pot $50, top 10 share $5 each.
Deadline: 29 Nov 2026 12:39 WIB.

## What it is

An original national statistics portal for Indonesia, built as plain static
files under `app/` — no build step, no network request at runtime. Every
figure is a real published number from BPS (Badan Pusat Statistik), Bank
Indonesia, or the World Bank, labelled with its source and year wherever it
appears.

## Pages (hash-routed, all linked from the nav)

- **Beranda** — KPI cards for the selected year, population pyramid 2024, GDP growth chart
- **Penduduk** — population 2019–2024, age pyramid, largest provinces
- **Ekonomi** — GDP growth / nominal GDP / trade chart switcher, trade table
- **Harga & Inflasi** — inflation line vs the Bank Indonesia target band, yearly table
- **Ketenagakerjaan** — unemployment / poverty tabs with charts and tables
- **Provinsi** — all 38 provinces, searchable and sortable table + top-10 bars
- **Sumber Data & Metodologi** — sources and how each figure is read

## Controls that work

Year selector (2019–2024) re-renders every figure and chart; province
search + sort (by population or name, including sortable column headers);
economy chart metric switcher; unemployment/poverty tabs; hash navigation.

## Run it locally

```sh
node serve.ts            # serves app/ on http://localhost:8080
```

## Screenshots

```sh
node take-shots.mjs     # regenerates screenshots/*.jpg via chrome-headless-shell
```

## Hand in

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/dossier.json
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored `vendor/makefun-frontend.ts` (copied from the
competition kit unchanged).
