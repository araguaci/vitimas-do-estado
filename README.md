# Vítimas do Estado / State Victims Registry

Site estático que publica o **Registro de Vítimas do Estado** — documentação verificável de situações em que o poder público falha (por omissão, negligência ou ação) e causa dano irreversível ou morte a pessoas sob a sua responsabilidade. Os dados vivem em **ficheiros JSON** versionados; a interface é gerada com [Vite](https://vitejs.dev/) e pode ser hospedada em qualquer servidor de ficheiros estáticos (GitHub Pages, Netlify, etc.).

**Repositório:** [github.com/araguaci/vitimas-do-estado](https://github.com/araguaci/vitimas-do-estado)

---

## Objetivo

- **Memória e responsabilidade:** manter um registo consultável, com fontes, sobre falhas estatais que afetam vidas reais.
- **Transparência:** dados em formato aberto (JSON), reprodutíveis e auditáveis por terceiros.
- **Sem base de dados central:** o “verdadeiro” arquivo são os JSON no repositório; o site apenas lê e apresenta.

Licença dos dados descrita nos próprios ficheiros (ex.: **CC0 1.0 Universal** onde indicado).

---

## Recursos

| Área | Descrição |
|------|------------|
| **Painel (página principal)** | Estatísticas calculadas a partir do JSON de casos globais, alertas (risco, inconsistências, notas do curador), tabela com filtros por tipo de falha, legenda taxonómica, busca textual, exportação JSON/CSV. |
| **Casos globais** | Lista de casos internacionais com filtros por URL (`failure`, `country`), legenda e ligação para **ficha detalhada**. |
| **Brasil** | Panorama sistémico e casos/categorias a partir de `state-victims-brazil.json`. |
| **Mortes em custódia** | Narrativa e casos verificados a partir de `state-victims-brazil-custody-deaths.json`. |
| **Ficha de caso** | Página `case.html?slug=…&dataset=…` com visualização unificada (casos globais, Brasil ou custódia). |
| **Contribuir** | Página estática com fluxo editorial e ligações ao GitHub. |
| **Manifest de dados** | `registry.json` define os datasets e respetivos ficheiros e páginas HTML. |

---

## Fontes de dados

Os conjuntos principais (editados na **raiz** do repositório e copiados para `public/data/` antes do build) são:

| Ficheiro | Conteúdo |
|----------|----------|
| `registry.json` | Manifest: chaves dos datasets, paths relativos e etiquetas para a navegação. |
| `state-victims-cases.json` | Casos globais (vários países), com `failure_type`, fontes, status, etc. |
| `state-victims-brazil.json` | Panorama Brasil + casos/categorias nacionais. |
| `state-victims-brazil-custody-deaths.json` | Mortes em custódia, números de referência e casos verificados. |

Cada registo de caso deve incluir **fontes verificáveis** (URLs, e quando possível arquivo). A qualidade factual é responsabilidade editorial dos contribuidores e revisores.

---

## Como funciona (técnico)

1. **Fonte única na raiz** — Editam-se os `.json` na raiz do projeto (junto ao `package.json`).
2. **Sincronização** — O script `scripts/sync-data.mjs` valida JSON e copia os ficheiros para `public/data/`. Corre automaticamente antes de `npm run dev` e `npm run build` (`predev` / `prebuild`).
3. **Carregamento no browser** — `src/data/registry.js` lê `registry.json` e expõe `loadDataset(chave)` para as páginas que renderizam conteúdo dinâmico.
4. **Build** — `npm run build` gera a pasta `dist/`, pronta para deploy. Os JSON ficam em `dist/data/`.

Fluxo resumido:

```
JSON (raiz) → sync-data → public/data → Vite → dist/
```

---

## Requisitos e comandos

- [Node.js](https://nodejs.org/) (LTS recomendado)

```bash
npm install
```

| Comando | Efeito |
|---------|--------|
| `npm run sync-data` | Copia e valida JSON da raiz para `public/data/`. |
| `npm run dev` | Sincroniza dados e inicia servidor de desenvolvimento (Vite). |
| `npm run build` | Sincroniza dados e gera `dist/` para produção. |
| `npm run preview` | Serve localmente a pasta `dist/` após o build. |

---

## Guia do utilizador

### Navegação global

Na barra superior encontram-se ligações para: **Início** (painel), **Painel** (secção de casos na página principal), **Casos globais**, **Brasil**, **Custódia** e **Contribuir**.

### Página principal (`index.html`)

- **Estatísticas:** números reais derivados do JSON de casos globais (total de casos, países, tipos de falha únicos, soma de referências em fontes).
- **Alertas:** avisos sobre inconsistências, casos em risco, notas do curador.
- **Filtros e busca:** chips por tipo de falha e campo de pesquisa; a tabela filtra em tempo real.
- **Exportar:** descarregar o JSON oficial ou exportar CSV a partir dos dados carregados.
- **Sidebar:** atalhos para secções âncora (estrutura, roadmap, taxonomia, manifesto, contribuição) e filtros pré-definidos para a página de casos globais.

### Casos globais (`cases.html`)

- Filtros por parâmetros na URL, por exemplo: `cases.html?country=ES`, `cases.html?failure=judicial_omission`.
- Cada caso pode abrir a **ficha completa** (`case.html?slug=…&dataset=global_cases`).

### Brasil e custódia

- Páginas geradas a partir dos JSON correspondentes; ligações **Abrir ficha completa** usam `dataset=brazil` ou `dataset=custody_brazil` conforme o contexto.

### Ficha de detalhe (`case.html`)

Parâmetros:

- `slug` — identificador do caso (campo `slug` no JSON).
- `dataset` — `global_cases` (omissão = padrão), `brazil`, ou `custody_brazil`.

---

## Contribuição

Toda a colaboração passa pelo repositório público:

| Ação | Ligação |
|------|---------|
| Repositório | [github.com/araguaci/vitimas-do-estado](https://github.com/araguaci/vitimas-do-estado) |
| Fork | [Fork no GitHub](https://github.com/araguaci/vitimas-do-estado/fork) |
| Issues | [Lista de issues](https://github.com/araguaci/vitimas-do-estado/issues) |
| Nova issue | [Abrir issue](https://github.com/araguaci/vitimas-do-estado/issues/new) |
| Pull requests | [Pull requests](https://github.com/araguaci/vitimas-do-estado/pulls) |
| Comparar / PR | [Comparar branches](https://github.com/araguaci/vitimas-do-estado/compare) |

Fluxo sugerido: **fork** → alterar ou adicionar JSON (e/ou código) → **pull request** com descrição clara e fontes verificáveis. O ficheiro `SCHEMA.md` (quando existir no repo) deve descrever o formato esperado dos casos.

Princípios editoriais (resumo):

- Sem anonimato editorial nas contribuições de conteúdo.
- Afirmações graves com suporte em fonte.
- Respeito pelas vítimas e famílias na redação.

---

## Estrutura do projeto (resumo)

```
├── index.html              # Dashboard / painel
├── brasil.html, cases.html, custody.html, case.html, contribuir.html
├── registry.json           # Manifest (fonte na raiz)
├── state-victims-*.json    # Datasets (fonte na raiz)
├── public/data/            # Cópia sincronizada para o Vite
├── scripts/sync-data.mjs
├── src/                    # JS, CSS partilhados (registry, páginas, dashboard)
├── vite.config.js
└── package.json
```

---

## Créditos e nota legal

Este projeto é uma ferramenta de **informação e memória coletiva**. Não substitui parecer jurídico, jornalismo de investigação completo ou decisões de autoridades. A verificação factual permanece responsabilidade de quem submete e revisa cada registo.
