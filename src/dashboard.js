import { loadDataset } from './data/registry.js';
import { esc, ftLabel, failureTypePt } from './util.js';

const base = import.meta.env.BASE_URL;

function countryLabel(code) {
  const m = { ES: 'Espanha', BR: 'Brasil', NL: 'Holanda', IR: 'Irã' };
  const f = { ES: '🇪🇸', BR: '🇧🇷', NL: '🇳🇱', IR: '🇮🇷' };
  return `${f[code] || '🌍'} ${m[code] || code}`;
}

function statusBadge(status) {
  const s = (status || '').toUpperCase();
  if (s.includes('DECEASED') || s.includes('MORTO') || s.includes('MORTA')) {
    return '<span class="badge badge-red">FECHADO</span>';
  }
  if (s.includes('RISK') || s.includes('RISCO') || s.includes('SENTENCE') || s.includes('IMINENT')) {
    return '<span class="badge badge-gold">RISCO</span>';
  }
  return '<span class="badge badge-gold">ABERTO</span>';
}

function buildSearchBlob(c) {
  const parts = [
    c.name,
    c.city,
    c.country,
    c.slug,
    ...(c.failure_type || []).map(ftLabel),
    ...(c.failure_type || []),
    c.status,
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
}

function getActiveFilterMode() {
  const active = document.querySelector('.filter-chip.active');
  return active?.getAttribute('data-filter') || 'all';
}

function getSearchQuery() {
  const input = document.getElementById('dashboard-search');
  return (input?.value || '').trim().toLowerCase();
}

function rowPassesChipFilter(row, mode) {
  const fts = (row.getAttribute('data-failure-types') || '').split(/\s+/).filter(Boolean);
  const y = parseInt(row.getAttribute('data-year') || '0', 10);
  if (mode === 'all') return true;
  if (mode === '2022-2026') return y >= 2022 && y <= 2026;
  return fts.includes(mode);
}

function rowPassesSearch(row, q) {
  if (!q) return true;
  const blob = row.getAttribute('data-search') || '';
  return blob.includes(q);
}

function applyAllFilters() {
  const mode = getActiveFilterMode();
  const q = getSearchQuery();
  const rows = document.querySelectorAll('#dashboard-case-rows .case-row');
  rows.forEach((row) => {
    const byChip = rowPassesChipFilter(row, mode);
    const bySearch = rowPassesSearch(row, q);
    row.classList.toggle('is-hidden', !byChip || !bySearch);
  });
  const meta = document.getElementById('dashboard-filter-meta');
  if (meta) {
    const visible = [...rows].filter((r) => !r.classList.contains('is-hidden')).length;
    const parts = [`${visible} de ${rows.length} visíveis`];
    if (q) parts.push(`busca: “${q}”`);
    meta.textContent = parts.join(' · ');
  }
}

function buildLegend() {
  const el = document.getElementById('legend-grid-inner');
  if (!el) return;
  const entries = Object.entries(failureTypePt).slice(0, 12);
  const colors = ['t1', 't1', 't2', 't2', 't3', 't3', 't4', 't4', 't1', 't2', 't3', 't4'];
  el.innerHTML = entries
    .map(
      ([k, label], i) => `
    <div class="legend-item">
      <span class="legend-dot ${colors[i % colors.length]}"></span>
      <span><span class="legend-code">${esc(k)}</span> — ${esc(label)}</span>
    </div>`
    )
    .join('');
}

function computeMetrics(cases) {
  const countries = new Set(cases.map((c) => c.country).filter(Boolean));
  const failureKeys = new Set();
  for (const c of cases) {
    for (const f of c.failure_type || []) failureKeys.add(f);
  }
  let sourceCount = 0;
  for (const c of cases) {
    sourceCount += (c.sources || []).length;
  }
  return {
    n: cases.length,
    nCountries: countries.size,
    countriesList: [...countries].sort().join(' · '),
    nFailureTypes: failureKeys.size,
    failurePreview: [...failureKeys].slice(0, 4).join(', ') || '—',
    sourceCount,
  };
}

function updateStatsDom(data, cases, m) {
  const el = (id, text) => {
    const n = document.getElementById(id);
    if (n) n.textContent = text;
  };
  el('stat-cases-total', String(m.n));
  el('stat-cases-hint', `total_cases no JSON: ${data.total_cases ?? '—'} · ficheiro v${data.version || '—'}`);
  el('stat-countries', String(m.nCountries));
  el('stat-countries-hint', m.countriesList || '—');
  el('stat-failure-types', String(m.nFailureTypes));
  el('stat-failure-hint', m.failurePreview);
  el('stat-sources', String(m.sourceCount));
  el('stat-sources-hint', `${m.n} casos · média ${m.n ? Math.round(m.sourceCount / m.n) : 0} fontes/caso`);
  el('hero-country-count', String(m.nCountries));
  el('hero-generated', data.generated ? `gerados ${data.generated}` : '—');
  el('badge-dataset-version', `v${data.version || '—'}`);
}

function renderAlerts(data, cases) {
  const host = document.getElementById('dashboard-alerts');
  if (!host) return;

  const alerts = [];

  if (typeof data.total_cases === 'number' && data.total_cases !== cases.length) {
    alerts.push({
      class: 'warn',
      html: `<strong>Inconsistência</strong>: <code>total_cases</code> indica ${data.total_cases}, mas o array contém ${cases.length} entradas. Corrija o JSON.`,
    });
  }

  const unverified = cases.filter((c) => c.verified === false);
  if (unverified.length) {
    alerts.push({
      class: 'warn',
      html: `<strong>Sem verificação</strong>: ${unverified.length} caso(s) com <code>verified: false</code>.`,
    });
  }

  const risk = cases.filter((c) => {
    const s = (c.status || '').toUpperCase();
    return s.includes('RISCO') || s.includes('RISK') || s.includes('SENTENCE') || s.includes('IMINENT');
  });
  if (risk.length) {
    const names = risk.map((c) => `<a href="case.html?slug=${encodeURIComponent(c.slug)}&dataset=global_cases">${esc(c.name)}</a>`).join(', ');
    alerts.push({
      class: 'warn',
      html: `<strong>Alerta humanitário</strong>: ${risk.length} registo(s) com status de risco imediato ou pena de morte — ${names}.`,
    });
  }

  if (data.notes) {
    alerts.push({
      class: 'info',
      html: `<strong>Nota do curador</strong>: ${esc(data.notes)}`,
    });
  }

  if (!alerts.length) {
    host.innerHTML = `<div class="alert-card info"><strong>Painel</strong> — ${cases.length} casos carregados do JSON; use filtros, legenda e busca. Clique no nome ou em <strong>Ficha</strong> para detalhes.</div>`;
    return;
  }

  host.innerHTML = alerts
    .map((a) => `<div class="alert-card ${esc(a.class)}">${a.html}</div>`)
    .join('');
}

async function main() {
  const mount = document.getElementById('dashboard-case-rows');
  if (!mount) return;

  let data;
  try {
    data = await loadDataset('global_cases');
  } catch (e) {
    mount.innerHTML = `<p class="err" style="padding:16px">Painel: ${esc(e.message)}</p>`;
    const host = document.getElementById('dashboard-alerts');
    if (host) host.innerHTML = `<div class="alert-card warn">Não foi possível carregar <code>state-victims-cases.json</code>.</div>`;
    return;
  }

  const cases = data.cases || [];
  const m = computeMetrics(cases);
  updateStatsDom(data, cases, m);
  renderAlerts(data, cases);

  const cntEl = document.getElementById('dashboard-case-count');
  if (cntEl) cntEl.textContent = `${cases.length} registros`;

  mount.innerHTML = cases
    .map((c) => {
      const fts = c.failure_type || [];
      const ftAttr = fts.join(' ');
      const y = parseInt(String(c.date_of_death || c.date_of_incident || '').slice(0, 4), 10) || 0;
      const period = `${c.date_of_incident || '—'} → ${c.date_of_death || '—'}`;
      const ftStr = fts.map(ftLabel).join(' + ');
      const detailHref = `case.html?slug=${encodeURIComponent(c.slug)}&dataset=global_cases`;
      const searchBlob = esc(buildSearchBlob(c));
      return `
      <div class="case-row" data-failure-types="${esc(ftAttr)}" data-year="${y || ''}" data-search="${searchBlob}">
        <div class="case-num">${esc(c.id)}</div>
        <div class="case-info">
          <div class="case-name"><a class="case-link" href="${esc(detailHref)}">${esc(c.name)}</a></div>
          <div class="case-country">${esc(countryLabel(c.country))} — ${esc(c.city || '')}</div>
        </div>
        <div class="case-type">${esc(ftStr)}</div>
        <div class="case-date">${esc(period)}</div>
        <div class="case-year">${y || '—'}</div>
        <div>${statusBadge(c.status)}</div>
        <div><a class="btn-detail" href="${esc(detailHref)}">Ficha</a></div>
      </div>`;
    })
    .join('');

  buildLegend();

  document.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      applyAllFilters();
    });
  });

  const searchInput = document.getElementById('dashboard-search');
  if (searchInput) {
    let t;
    searchInput.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => applyAllFilters(), 120);
    });
    searchInput.addEventListener('search', applyAllFilters);
  }

  applyAllFilters();

  const exJson = document.getElementById('export-json');
  const exCsv = document.getElementById('export-csv');
  if (exJson) {
    exJson.href = `${base}data/state-victims-cases.json`;
    exJson.setAttribute('download', 'state-victims-cases.json');
    exJson.addEventListener('click', (e) => {
      if (!exJson.href || exJson.href.endsWith('#')) {
        e.preventDefault();
      }
    });
  }
  if (exCsv) {
    exCsv.addEventListener('click', (e) => {
      e.preventDefault();
      const header = ['id', 'slug', 'name', 'country', 'city', 'failure_type', 'status', 'verified'];
      const lines = [header.join(',')];
      for (const c of cases) {
        lines.push(
          [
            c.id,
            c.slug,
            JSON.stringify(c.name || ''),
            c.country,
            JSON.stringify(c.city || ''),
            JSON.stringify((c.failure_type || []).join('|')),
            JSON.stringify(c.status || ''),
            c.verified,
          ].join(',')
        );
      }
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'state-victims-cases.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }
}

main();
