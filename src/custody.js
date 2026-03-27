import { loadDataset } from './data/registry.js';
import { esc, ftLabel } from './util.js';

const app = document.getElementById('app');

const CASE_FIELDS = [
  ['apelido', 'Apelido'],
  ['apelido_contexto', 'Contexto'],
  ['cidade', 'Local'],
  ['unidade_prisional', 'Unidade prisional'],
  ['data_prisao', 'Data da prisão'],
  ['data_incidente', 'Data do incidente'],
  ['data_inicio_mal_estar', 'Início do mal-estar'],
  ['data_morte', 'Óbito'],
  ['idade_morte', 'Idade'],
  ['status_processual', 'Status processual'],
  ['condicao_saude_documentada', 'Condição de saúde (documentada)'],
  ['condicao', 'Condição'],
  ['o_que_moraes_nao_fez', 'O que Moraes não fez'],
  ['o_que_aconteceu', 'O que aconteceu'],
  ['causa_mortis_oficial', 'Causa mortis (oficial)'],
  ['causa_mortis_real', 'Causa mortis (análise)'],
  ['causa_mortis', 'Causa mortis'],
  ['o_que_o_preso_passou_por_ultimo', 'Últimos momentos'],
  ['deixou', 'Deixou'],
  ['responsabilizacao', 'Responsabilização'],
  ['acao_judicial_familia', 'Ação judicial (família)'],
  ['nota_juridica', 'Nota jurídica'],
  ['nota', 'Nota'],
  ['relato_familiar', 'Relato familiar'],
];

function renderField(label, value) {
  if (value == null || value === '') return '';
  if (Array.isArray(value)) return '';
  return `<div class="field"><strong>${esc(label)}</strong>${esc(String(value))}</div>`;
}

function renderList(label, items) {
  if (!items || !items.length) return '';
  const li = items.map((x) => `<li>${esc(x)}</li>`).join('');
  return `<div class="field"><strong>${esc(label)}</strong><ul class="detail">${li}</ul></div>`;
}

function renderCustodyCase(c) {
  const fts = (c.failure_type || []).map((t) => `<span class="tag">${esc(ftLabel(t))}</span>`).join('');
  let body = '';
  for (const [key, label] of CASE_FIELDS) {
    const v = c[key];
    if (v == null || v === '') continue;
    if (Array.isArray(v)) continue;
    body += renderField(label, v);
  }

  if (c.alertas_ignorados?.length) body += renderList('Alertas ignorados', c.alertas_ignorados);
  if (c.questoes_abertas?.length) body += renderList('Questões abertas', c.questoes_abertas);

  const oqe = c.o_que_o_estado_nao_fez;
  if (Array.isArray(oqe) && oqe.length) body += renderList('O que o Estado não fez', oqe);
  else if (typeof oqe === 'string' && oqe) body += renderField('O que o Estado não fez', oqe);

  let fontes = '';
  if (c.fontes?.length) {
    fontes = `<div class="fontes" style="margin-top:14px"><strong>Fontes</strong>${c.fontes.map((u) => `<div><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a></div>`).join('')}</div>`;
  }

  const slug = c.slug || c.id;
  const detailHref = `case.html?slug=${encodeURIComponent(slug)}&dataset=custody_brazil`;

  return `
    <article class="case-card custody-case" id="${esc(slug)}">
      <header>
        <h2>${esc(c.name)}</h2>
        <span class="id">${esc(c.id)}</span>
      </header>
      <div class="tags">${fts}</div>
      ${body}
      <p style="margin-top:12px"><a class="btn-detail" href="${esc(detailHref)}">Abrir ficha completa</a></p>
      ${fontes}
    </article>`;
}

function renderNumeros(obj) {
  if (!obj || typeof obj !== 'object') return '';
  const skip = new Set(['fonte']);
  const cells = [];
  for (const [k, v] of Object.entries(obj)) {
    if (skip.has(k)) continue;
    cells.push(`
      <div class="stat-box">
        <div class="k">${esc(k.replace(/_/g, ' '))}</div>
        <div class="v">${esc(v)}</div>
      </div>`);
  }
  return `<div class="custody-stats">${cells.join('')}</div>${
    obj.fonte
      ? `<p class="block-text" style="font-family:var(--mono);font-size:11px">Fonte agregada: ${esc(obj.fonte)}</p>`
      : ''
  }`;
}

async function main() {
  let data;
  try {
    data = await loadDataset('custody_brazil');
  } catch (e) {
    app.innerHTML = `<p class="err">Não foi possível carregar os dados: ${esc(e.message)}</p>`;
    return;
  }

  const decl = data.declaracao_do_proprio_estado;
  const declHtml = decl
    ? `<div class="custody-quote">
        <p>${esc(decl.texto)}</p>
        <div class="src">${esc(decl.fonte)} · <a href="${esc(decl.url)}" target="_blank" rel="noopener">link</a></div>
        ${decl.nota_critica ? `<p class="block-text" style="margin-top:14px">${esc(decl.nota_critica)}</p>` : ''}
      </div>`
    : '';

  const cnj = data.frase_do_cnj;
  const cnjHtml = cnj
    ? `<div class="custody-quote">
        <p>${esc(cnj.texto)}</p>
        <div class="src">${esc(cnj.fonte)} · <a href="${esc(cnj.url)}" target="_blank" rel="noopener">link</a></div>
      </div>`
    : '';

  const pq = data.por_que_nao_ha_mais_nomes;
  const pqHtml = pq
    ? `<div class="por-que">
        <h2 class="section-title">Por que não há mais nomes</h2>
        <p class="block-text">${esc(pq.explicacao)}</p>
        <ul>${(pq.mecanismos_de_ocultamento || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        ${pq.conclusao_CNJ ? `<p class="conclusao">${esc(pq.conclusao_CNJ)}</p>` : ''}
        ${pq.fonte ? `<p class="block-text" style="margin-top:12px;font-family:var(--mono);font-size:10px"><a href="${esc(pq.fonte)}" target="_blank" rel="noopener">${esc(pq.fonte)}</a></p>` : ''}
      </div>`
    : '';

  const casos = (data.casos_individuais_verificados || []).map(renderCustodyCase).join('');

  const semNome = data.casos_sem_nome_documentados;
  let semNomeHtml = '';
  if (semNome) {
    const padroes = (semNome.padroes_recorrentes || [])
      .map(
        (p) => `
      <div class="pattern-card">
        <h4>${esc(p.padrao)}</h4>
        <p class="block-text" style="margin:0">${esc(p.descricao)}</p>
        <div class="freq">${esc(p.frequencia)}</div>
      </div>`
      )
      .join('');
    semNomeHtml = `
      <h2 class="section-title" style="margin-top:32px">Padrões sem nome</h2>
      <p class="block-text">${esc(semNome.descricao)}</p>
      <div class="pattern-grid">${padroes}</div>`;
  }

  const juris = data.jurisprudencia_aplicavel?.stf_responsabilidade_objetiva;
  let jurisHtml = '';
  if (juris) {
    jurisHtml = `
      <div class="juris-box">
        <h3>STF — responsabilidade objetiva</h3>
        <p class="block-text">${esc(juris.descricao)}</p>
        <p class="tese">${esc(juris.tese)}</p>
        <p class="block-text" style="font-family:var(--mono);font-size:11px">${esc(juris.relator)}</p>
        ${juris.fonte ? `<p><a href="${esc(juris.fonte)}" target="_blank" rel="noopener">${esc(juris.fonte)}</a></p>` : ''}
      </div>
      ${data.jurisprudencia_aplicavel.nota_pratica ? `<p class="block-text">${esc(data.jurisprudencia_aplicavel.nota_pratica)}</p>` : ''}`;
  }

  const cta = data.chamada_para_contribuicao;
  let ctaHtml = '';
  if (cta) {
    ctaHtml = `
      <div class="cta-box">
        <h2 class="section-title">Contribuir</h2>
        <p class="block-text">${esc(cta.descricao)}</p>
        <p class="block-text" style="font-family:var(--mono);font-size:12px">${esc(cta.como_contribuir)}</p>
        <ul>${(cta.o_que_precisamos || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>`;
  }

  app.innerHTML = `
    <div class="custody-hero">
      <div class="eyebrow">Brasil · ${esc(data.subcategoria || 'deaths_in_custody')}</div>
      <h1>${esc(data.registry)}</h1>
      <p class="meta">v${esc(data.version)} · gerado ${esc(data.generated)} · ${esc(data.license)}</p>
    </div>
    ${declHtml}
    ${cnjHtml}
    <h2 class="section-title">Números do sistema</h2>
    ${renderNumeros(data.numeros_do_sistema)}
    ${pqHtml}
    <h2 class="section-title">Casos individuais verificados</h2>
    <div class="case-list">${casos}</div>
    ${semNomeHtml}
    ${jurisHtml}
    ${ctaHtml}
  `;

  if (location.hash) {
    requestAnimationFrame(() => {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

main();
