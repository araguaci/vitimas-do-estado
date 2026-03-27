import { loadDataset } from './data/registry.js';
import { esc, ftLabel, failureTypePt } from './util.js';

const app = document.getElementById('app');

function parseParams() {
  const p = new URLSearchParams(location.search);
  return {
    failure: p.get('failure') || '',
    country: p.get('country') || '',
  };
}

function matchesFilters(c, { failure, country }) {
  if (country && c.country !== country) return false;
  if (failure && !(c.failure_type || []).includes(failure)) return false;
  return true;
}

function buildLegend() {
  const entries = Object.entries(failureTypePt).slice(0, 12);
  const colors = ['t1', 't1', 't2', 't2', 't3', 't3', 't4', 't4', 't1', 't2', 't3', 't4'];
  return `
  <div class="panel-legend" style="margin-bottom:20px">
    <div class="legend-title">Legenda — tipos de falha</div>
    <div class="legend-grid">
      ${entries
        .map(
          ([k, label], i) => `
        <div class="legend-item">
          <span class="legend-dot ${colors[i % colors.length]}"></span>
          <span><span class="legend-code">${esc(k)}</span> — ${esc(label)}</span>
        </div>`
        )
        .join('')}
    </div>
  </div>`;
}

function filterChips(activeFailure, activeCountry) {
  const opts = [
    ['', 'Todos', ''],
    ['judicial_omission', 'Omissão judicial', 'failure'],
    ['preventive_detention_death', 'Prisão preventiva', 'failure'],
    ['police_lethality', 'Violência policial', 'failure'],
    ['medical_negligence_in_custody', 'Negligência em custódia', 'failure'],
    ['impunity_of_aggressor', 'Impunidade', 'failure'],
    ['ES', '🇪🇸 Espanha', 'country'],
    ['NL', '🇳🇱 Holanda', 'country'],
    ['IR', '🇮🇷 Irã', 'country'],
    ['BR', '🇧🇷 Brasil', 'country'],
  ];
  return opts
    .map(([val, label, kind]) => {
      let isActive = false;
      if (kind === 'failure') isActive = activeFailure === val && !activeCountry;
      if (kind === 'country') isActive = activeCountry === val && !activeFailure;
      if (val === '' && !activeFailure && !activeCountry) isActive = true;
      const href =
        val === ''
          ? 'cases.html'
          : kind === 'failure'
            ? `cases.html?failure=${encodeURIComponent(val)}`
            : `cases.html?country=${encodeURIComponent(val)}`;
      return `<a class="filter-chip ${isActive ? 'active' : ''}" href="${esc(href)}" style="text-decoration:none;display:inline-block">${esc(label)}</a>`;
    })
    .join('\n');
}

async function main() {
  const { failure, country } = parseParams();

  let data;
  try {
    data = await loadDataset('global_cases');
  } catch (e) {
    app.innerHTML = `<p class="err">Não foi possível carregar os dados: ${esc(e.message)}</p>`;
    return;
  }

  const all = data.cases || [];
  const cases = all.filter((c) => matchesFilters(c, { failure, country }));

  const activeHint =
    failure || country
      ? `<p class="meta" style="margin-bottom:16px">Filtro: ${failure ? esc(ftLabel(failure)) : ''}${failure && country ? ' · ' : ''}${country ? `país ${esc(country)}` : ''} — <a href="cases.html">limpar</a></p>`
      : '';

  const list = cases
    .map((c) => {
      const fts = (c.failure_type || []).map((t) => `<span class="tag">${esc(ftLabel(t))}</span>`).join('');
      const wsd = (c.what_state_did_not_do || [])
        .map((x) => `<li>${esc(x)}</li>`)
        .join('');
      const sources = (c.sources || [])
        .map(
          (s) =>
            `<div><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.outlet || s.url)}</a> <span style="color:var(--fg-3)">${esc(s.date || '')}</span></div>`
        )
        .join('');
      const actors = (c.state_actors || []).map((x) => `<li>${esc(x)}</li>`).join('');
      const detailHref = `case.html?slug=${encodeURIComponent(c.slug)}&dataset=global_cases`;
      return `
      <article class="case-card" id="${esc(c.slug || c.id)}">
        <header>
          <h2><a href="${esc(detailHref)}" style="color:inherit;text-decoration:none">${esc(c.name)}</a></h2>
          <span class="id">${esc(c.id)} · ${esc(c.country)} · ${esc(c.city || '')}</span>
        </header>
        <div class="tags">${fts}</div>
        <p class="resumo">${esc(c.what_happened)}</p>
        ${wsd ? `<p style="margin-top:12px;font-family:var(--mono);font-size:10px;color:var(--fg-3)">O que o Estado não fez</p><ul>${wsd}</ul>` : ''}
        ${actors ? `<p style="margin-top:12px;font-family:var(--mono);font-size:10px;color:var(--fg-3)">Atores estatais</p><ul>${actors}</ul>` : ''}
        ${c.notes ? `<p style="margin-top:12px;font-size:13px;color:var(--fg-2)">${esc(c.notes)}</p>` : ''}
        <p style="margin-top:12px;font-family:var(--mono);font-size:11px">Status: <strong>${esc(c.status)}</strong> · verificado: ${c.verified ? 'sim' : 'não'} · agressor punido: ${c.aggressor_punished === true ? 'sim' : c.aggressor_punished === false ? 'não' : esc(String(c.aggressor_punished))}</p>
        <p style="margin-top:12px"><a class="btn-detail" href="${esc(detailHref)}">Abrir ficha completa</a></p>
        ${sources ? `<div class="fontes" style="margin-top:14px"><strong>Fontes</strong>${sources}</div>` : ''}
      </article>`;
    })
    .join('');

  app.innerHTML = `
    <div class="hero">
      <h1>${esc(data.registry)}</h1>
      <p class="meta">v${esc(data.version)} · ${all.length} casos no ficheiro · mostrando ${cases.length} · gerado ${esc(data.generated)} · ${esc(data.license)}</p>
      <p class="lead">${esc(data.notes || '')}</p>
      ${activeHint}
    </div>
    ${buildLegend()}
    <div class="filters filters-row" style="margin-bottom:20px">
      ${filterChips(failure, country)}
    </div>
    <h2 class="section-title">Casos</h2>
    <div class="case-list">${list || '<p class="meta">Nenhum caso com este filtro.</p>'}</div>
  `;
}

main();
