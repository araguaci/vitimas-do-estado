import { loadDataset } from './data/registry.js';
import { esc, ftLabel } from './util.js';

const app = document.getElementById('app');

function renderGlobal(c) {
  const fts = (c.failure_type || []).map((t) => `<span class="tag">${esc(ftLabel(t))}</span>`).join('');
  const wsd = (c.what_state_did_not_do || []).map((x) => `<li>${esc(x)}</li>`).join('');
  const actors = (c.state_actors || []).map((x) => `<li>${esc(x)}</li>`).join('');
  const sources = (c.sources || [])
    .map(
      (s) =>
        `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.outlet || s.url)}</a> <span style="color:var(--fg-3)">${esc(s.date || '')}</span></li>`
    )
    .join('');
  return `
    <div class="hero">
      <h1>${esc(c.name)}</h1>
      <p class="meta">${esc(c.id)} · ${esc(c.country)} · ${esc(c.city || '')}</p>
      <div class="tags" style="margin-top:12px">${fts}</div>
    </div>
    <p class="lead" style="margin-top:16px">${esc(c.what_happened)}</p>
    ${wsd ? `<h2 class="section-title" style="margin-top:24px">O que o Estado não fez</h2><ul>${wsd}</ul>` : ''}
    ${actors ? `<h2 class="section-title" style="margin-top:20px">Atores estatais</h2><ul>${actors}</ul>` : ''}
    ${c.notes ? `<p style="margin-top:16px;color:var(--fg-2)">${esc(c.notes)}</p>` : ''}
    <p style="margin-top:16px;font-family:var(--mono);font-size:12px">Status: <strong>${esc(c.status)}</strong> · verificado: ${c.verified ? 'sim' : 'não'}</p>
    ${sources ? `<h2 class="section-title" style="margin-top:24px">Fontes</h2><ul class="sources-list">${sources}</ul>` : ''}
  `;
}

function renderBrazil(c) {
  const fts = (c.failure_type || []).map((t) => `<span class="tag">${esc(ftLabel(t))}</span>`).join('');
  const oq = (c.o_que_o_estado_nao_fez || []).map((x) => `<li>${esc(x)}</li>`).join('');
  const fontes = (c.fontes || []).map((u) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a></li>`).join('');
  return `
    <div class="hero">
      <h1>${esc(c.name)}</h1>
      <p class="meta">${esc(c.id)} · ${esc(c.cidade || '')}</p>
      <div class="tags" style="margin-top:12px">${fts}</div>
    </div>
    <p class="lead" style="margin-top:16px">${esc(c.resumo)}</p>
    ${oq ? `<h2 class="section-title" style="margin-top:24px">O que o Estado não fez</h2><ul>${oq}</ul>` : ''}
    ${fontes ? `<h2 class="section-title" style="margin-top:24px">Fontes</h2><ul class="sources-list">${fontes}</ul>` : ''}
  `;
}

function renderCustody(c) {
  const fts = (c.failure_type || []).map((t) => `<span class="tag">${esc(ftLabel(t))}</span>`).join('');
  const alerts = (c.alertas_ignorados || []).map((x) => `<li>${esc(x)}</li>`).join('');
  const oqe = Array.isArray(c.o_que_o_estado_nao_fez)
    ? c.o_que_o_estado_nao_fez.map((x) => `<li>${esc(x)}</li>`).join('')
    : c.o_que_o_estado_nao_fez
      ? `<p>${esc(c.o_que_o_estado_nao_fez)}</p>`
      : '';
  const fontes = (c.fontes || []).map((u) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a></li>`).join('');
  return `
    <div class="hero">
      <h1>${esc(c.name)}</h1>
      <p class="meta">${esc(c.id)} · ${esc(c.cidade || '')}</p>
      <div class="tags" style="margin-top:12px">${fts}</div>
    </div>
    ${c.condicao_saude_documentada ? `<p style="margin-top:16px;color:var(--fg-2)">${esc(c.condicao_saude_documentada)}</p>` : ''}
    ${c.o_que_moraes_nao_fez ? `<p style="margin-top:12px"><strong>Moraes</strong>: ${esc(c.o_que_moraes_nao_fez)}</p>` : ''}
    ${c.o_que_aconteceu ? `<p class="lead" style="margin-top:16px">${esc(c.o_que_aconteceu)}</p>` : ''}
    ${alerts ? `<h2 class="section-title" style="margin-top:20px">Alertas ignorados</h2><ul>${alerts}</ul>` : ''}
    ${oqe ? `<h2 class="section-title" style="margin-top:20px">O que o Estado não fez</h2>${Array.isArray(c.o_que_o_estado_nao_fez) ? `<ul>${oqe}</ul>` : oqe}` : ''}
    ${c.causa_mortis_real ? `<p style="margin-top:16px"><strong>Causa (análise)</strong>: ${esc(c.causa_mortis_real)}</p>` : ''}
    ${c.responsabilizacao ? `<p style="margin-top:12px;color:var(--fg-2)">${esc(c.responsabilizacao)}</p>` : ''}
    ${fontes ? `<h2 class="section-title" style="margin-top:24px">Fontes</h2><ul class="sources-list">${fontes}</ul>` : ''}
  `;
}

async function main() {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const dataset = params.get('dataset') || 'global_cases';

  if (!slug) {
    app.innerHTML = `<p class="err">Parâmetro <code>slug</code> em falta. Ex.: <a href="cases.html">casos globais</a></p>`;
    return;
  }

  let data;
  try {
    data = await loadDataset(dataset);
  } catch (e) {
    app.innerHTML = `<p class="err">${esc(e.message)}</p>`;
    return;
  }

  let c;
  if (dataset === 'global_cases') c = (data.cases || []).find((x) => x.slug === slug);
  else if (dataset === 'brazil') c = (data.casos_individuais || []).find((x) => x.slug === slug);
  else if (dataset === 'custody_brazil') c = (data.casos_individuais_verificados || []).find((x) => x.slug === slug);
  else {
    app.innerHTML = `<p class="err">Dataset desconhecido.</p>`;
    return;
  }

  if (!c) {
    app.innerHTML = `<p class="err">Caso não encontrado: <strong>${esc(slug)}</strong></p>`;
    return;
  }

  let inner = '';
  if (dataset === 'global_cases') inner = renderGlobal(c);
  else if (dataset === 'brazil') inner = renderBrazil(c);
  else inner = renderCustody(c);

  const back =
    dataset === 'global_cases'
      ? './cases.html'
      : dataset === 'brazil'
        ? './brasil.html'
        : './custody.html';

  app.innerHTML = `
    <p style="margin-bottom:20px"><a href="${back}" class="btn-detail">← Voltar</a></p>
    ${inner}
  `;
}

main();
