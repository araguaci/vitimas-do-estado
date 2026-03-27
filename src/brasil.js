import { loadDataset } from './data/registry.js';
import { esc, ftLabel } from './util.js';

const app = document.getElementById('app');

function panoramaBlock(title, obj) {
  if (!obj || typeof obj !== 'object') return '';
  const skip = new Set(['fonte', 'nota', 'nota_FBSP', 'nota_mutirao']);
  const rows = [];
  for (const [k, v] of Object.entries(obj)) {
    if (skip.has(k)) continue;
    if (Array.isArray(v)) {
      rows.push(`<dt>${esc(k.replace(/_/g, ' '))}</dt><dd>${esc(v.join(', '))}</dd>`);
    } else if (typeof v === 'object' && v !== null) {
      continue;
    } else {
      rows.push(`<dt>${esc(k.replace(/_/g, ' '))}</dt><dd>${esc(v)}</dd>`);
    }
  }
  const nota = obj.nota ? `<p class="note">${esc(obj.nota)}</p>` : '';
  const notaFBSP = obj.nota_FBSP ? `<p class="note">${esc(obj.nota_FBSP)}</p>` : '';
  const notaMut = obj.nota_mutirao ? `<p class="note">${esc(obj.nota_mutirao)}</p>` : '';
  let fonteHtml = '';
  if (Array.isArray(obj.fonte)) {
    fonteHtml = `<div style="margin-top:12px;font-size:11px;font-family:var(--mono)"><strong>Fontes</strong><ul style="margin:6px 0 0 14px">`;
    for (const u of obj.fonte) {
      fonteHtml += `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a></li>`;
    }
    fonteHtml += '</ul></div>';
  }
  return `
    <article class="pan-card">
      <h3>${esc(title)}</h3>
      <dl>${rows.join('')}</dl>
      ${nota}${notaFBSP}${notaMut}
      ${fonteHtml}
    </article>
  `;
}

async function main() {
  let data;
  try {
    data = await loadDataset('brazil');
  } catch (e) {
    app.innerHTML = `<p class="err">Não foi possível carregar os dados: ${esc(e.message)}</p>`;
    return;
  }

  const p = data.panorama_sistemico || {};
  const panoramaHtml = `
    <div class="panorama-grid">
      ${panoramaBlock('Letalidade policial', p.letalidade_policial)}
      ${panoramaBlock('Feminicídio', p.feminicidio)}
      ${panoramaBlock('Presos preventivos e sistema prisional', p.presos_preventivos)}
    </div>
  `;

  const casos = data.casos_individuais || [];
  const casosHtmlFixed = casos
    .map((c) => {
      const fts = (c.failure_type || []).map((t) => `<span class="tag">${esc(ftLabel(t))}</span>`).join('');
      const oQue = (c.o_que_o_estado_nao_fez || [])
        .map((x) => `<li>${esc(x)}</li>`)
        .join('');
      let fontesBlock = '';
      if (c.fontes && c.fontes.length) {
        const links = c.fontes
          .map((u) => `<div><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a></div>`)
          .join('');
        fontesBlock = `<div class="fontes"><strong>Fontes</strong>${links}</div>`;
      }
      const slug = c.slug || c.id;
      const detailHref = `case.html?slug=${encodeURIComponent(slug)}&dataset=brazil`;
      return `
      <article class="case-card" id="${esc(slug)}">
        <header>
          <h2>${esc(c.name)}</h2>
          <span class="id">${esc(c.id)} · ${esc(c.cidade || '')}</span>
        </header>
        <div class="tags">${fts}</div>
        <p class="resumo">${esc(c.resumo)}</p>
        ${oQue ? `<ul>${oQue}</ul>` : ''}
        <p style="margin-top:12px"><a class="btn-detail" href="${esc(detailHref)}">Abrir ficha completa</a></p>
        ${fontesBlock}
      </article>`;
    })
    .join('');

  const nums = data.numeros_que_nao_tem_nome;
  let tableHtml = '';
  if (nums && nums.tabela) {
    const rows = nums.tabela
      .map(
        (row) =>
          `<tr><td>${esc(row.categoria)}</td><td>${esc(row.ano)}</td><td>${esc(row.total)}</td><td>${esc(row.nota)}</td></tr>`
      )
      .join('');
    tableHtml = `
      <h2 class="section-title" style="margin-top:8px">Números que não têm nome</h2>
      <p style="color:var(--fg-2);margin-bottom:16px;font-family:var(--serif);font-size:15px">${esc(nums.descricao)}</p>
      <div class="data-table-wrap">
        <table class="data">
          <thead><tr><th>Categoria</th><th>Ano</th><th>Total</th><th>Nota</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  let primarias = '';
  if (data.fontes_primarias && data.fontes_primarias.length) {
    primarias = `<ul class="sources-list">${data.fontes_primarias.map((f) => `<li><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.titulo)}</a></li>`).join('')}</ul>`;
  }

  app.innerHTML = `
    <div class="hero">
      <h1>${esc(data.registry)}</h1>
      <p class="meta">v${esc(data.version)} · gerado ${esc(data.generated)} · ${esc(data.license)}</p>
      <p class="lead">${esc(data.panorama_sistemico?.descricao || '')}</p>
    </div>
    <h2 class="section-title">Panorama sistêmico</h2>
    ${panoramaHtml}
    <h2 class="section-title">Casos individuais e categorias</h2>
    <div class="case-list">${casosHtmlFixed}</div>
    ${tableHtml}
    <h2 class="section-title">Fontes primárias (agregador)</h2>
    ${primarias}
  `;

  if (location.hash) {
    requestAnimationFrame(() => {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

main();
