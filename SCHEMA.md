# Schema dos dados — State Victims Registry / Vítimas do Estado

Este documento descreve a estrutura dos ficheiros JSON usados pelo site. Os ficheiros **editáveis** na raiz do repositório são copiados para `public/data/` pelo script `scripts/sync-data.mjs` antes de `npm run dev` e `npm run build`.

**Repositório:** [github.com/araguaci/vitimas-do-estado](https://github.com/araguaci/vitimas-do-estado)

---

## 1. `registry.json` — manifest de datasets

Define quais ficheiros existem, o caminho público (relativo à pasta `data/` no site) e a página HTML associada.

| Campo | Tipo | Descrição |
|--------|------|------------|
| `manifest_version` | `string` | Versão do formato do manifest (ex.: `"1.0.0"`). |
| `project_name` | `string` | Nome legível do projeto. |
| `description` | `string` | Texto curto. |
| `datasets` | `object` | Mapa de identificadores internos para configuração. |

Cada entrada em `datasets` (ex.: `brazil`, `custody_brazil`, `global_cases`) deve conter:

| Campo | Tipo | Descrição |
|--------|------|------------|
| `path` | `string` | Caminho servido pelo site, ex.: `data/state-victims-cases.json`. |
| `label` | `string` | Etiqueta para navegação / UI. |
| `href` | `string` | Página HTML (ex.: `cases.html`). |

O código em `src/data/registry.js` usa estas chaves em `loadDataset('global_cases')`, etc.

---

## 2. `state-victims-cases.json` — casos internacionais

### 2.1 Raiz do ficheiro

| Campo | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `registry` | `string` | sim | Nome do registo. |
| `version` | `string` | sim | Versão semântica do dataset. |
| `generated` | `string` | sim | Data de geração (ex.: ISO `YYYY-MM-DD`). |
| `license` | `string` | sim | Licença dos dados (ex.: `CC0 1.0 Universal`). |
| `total_cases` | `number` | recomendado | Número esperado de entradas em `cases`; deve coincidir com `cases.length`. |
| `notes` | `string` | não | Notas do curador. |
| `cases` | `array` | sim | Lista de objetos **Caso global** (ver §2.2). |
| `cases_needed` | `object` | não | Metadados sobre lacunas e prioridades (ver §2.3). |

### 2.2 Objeto **Caso global** (elemento de `cases`)

Campos usados pela UI e pela ficha (`case.html?dataset=global_cases`):

| Campo | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | `string` | sim | Identificador estável (ex.: `"001"`). |
| `slug` | `string` | sim | Identificador único na URL; apenas caracteres seguros para path (`a-z`, `0-9`, `-`). |
| `name` | `string` | sim | Nome da vítima ou título do registo. |
| `country` | `string` | sim | Código ISO 3166-1 alpha-2 (ex.: `BR`, `ES`, `US`). |
| `city` | `string` | não | Localização livre. |
| `age_at_key_event` | `number` \| `null` | não | Idade relevante. |
| `date_of_incident` | `string` \| `null` | não | Data ou período (ex.: `YYYY-MM-DD`; podem existir meses/dias `00` em dados aproximados). |
| `date_of_death` | `string` \| `null` | não | Idem; `null` se ainda aplicável. |
| `failure_type` | `array` de `string` | sim | Lista de códigos da taxonomia (ver §5). |
| `what_happened` | `string` | sim | Narrativa factual. |
| `what_state_did_not_do` | `array` de `string` \| `null` | não | Lista de omissões; pode ser `null`. |
| `what_state_did` | `array` de `string` | não | Ações estatais documentadas (quando relevante). |
| `state_actors` | `array` de `string` | não | Entidades ou sistemas envolvidos. |
| `aggressor_punished` | `boolean` | não | Se o agressor foi punido (quando aplicável). |
| `aggressor_status` | `string` | não | Estado processual ou descritivo do agressor. |
| `status` | `string` | sim | Estado do caso (ex.: `DECEASED`, texto livre para risco ou categorias). |
| `verified` | `boolean` | recomendado | Se o registo foi verificado editorialmente. |
| `notes` | `string` | não | Notas internas ou de contexto. |
| `impact` | `string` | não | Efeitos documentados (ex.: mudança de política). |
| `sources` | `array` | sim | Lista de **Fonte** (ver §2.4); mínimo uma entrada com URL. |

### 2.3 Objeto `cases_needed` (opcional)

| Campo | Tipo | Descrição |
|--------|------|------------|
| `description` | `string` | Texto sobre lacunas. |
| `priority_countries` | `array` de `string` | Códigos de país prioritários. |
| `priority_types` | `array` de `string` | Tipos de falha desejados (podem estender a taxonomia). |
| `how_to_contribute` | `string` | Instruções e link para o repositório. |

### 2.4 Objeto **Fonte** (elemento de `sources`)

| Campo | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `outlet` | `string` | sim | Meio ou documento. |
| `url` | `string` | sim | URL HTTPS (ou http se inevitável). |
| `date` | `string` | não | Data da peça ou consulta (formato flexível). |

---

## 3. `state-victims-brazil.json` — Brasil (panorama + casos)

### 3.1 Raiz

| Campo | Tipo | Descrição |
|--------|------|------------|
| `registry` | `string` | Título do dataset. |
| `country` | `string` | Ex.: `BR`. |
| `version` | `string` | Versão do ficheiro. |
| `generated` | `string` | Data. |
| `license` | `string` | Licença. |
| `curator` | `string` | Identificador do curador. |
| `panorama_sistemico` | `object` | Blocos temáticos (`letalidade_policial`, `feminicidio`, `presos_preventivos`, etc.) com campos numéricos, notas e `fonte` (string ou array de URLs). |
| `casos_individuais` | `array` | Casos e categorias (ver §3.2). |
| `numeros_que_nao_tem_nome` | `object` | `descricao` + `tabela` (linhas com `categoria`, `ano`, `total`, `nota`). |
| `fontes_primarias` | `array` | Objetos `{ "titulo", "url" }`. |

### 3.2 Caso Brasil (`casos_individuais`)

Campos comuns (nem todos em todos os registos):

| Campo | Tipo | Descrição |
|--------|------|------------|
| `id` | `string` | Ex.: `BR-001`. |
| `slug` | `string` | Para URL e âncoras. |
| `name` | `string` | Nome ou título. |
| `cidade` | `string` | Local. |
| `idade` | `number` | Opcional. |
| `data_prisao`, `data_morte` | `string` | Datas quando aplicável. |
| `failure_type` | `array` | Taxonomia §5. |
| `resumo` | `string` | Texto principal. |
| `o_que_o_estado_nao_fez` | `array` de `string` | |
| `agressor_punido` | `boolean` \| `string` | |
| `agressor_status` | `string` | |
| `status` | `string` | |
| `fontes` | `array` de `string` (URLs) | |
| `nota_ministerio` | `string` | Opcional. |

Registos podem representar **categorias agregadas** (sem pessoa nomeada); nesse caso `name` e `status` refletem isso (ex.: `CATEGORIA_ABERTA`).

---

## 4. `state-victims-brazil-custody-deaths.json` — mortes em custódia (Brasil)

### 4.1 Raiz

Inclui blocos narrativos (`declaracao_do_proprio_estado`, `frase_do_cnj`, `numeros_do_sistema`, `por_que_nao_ha_mais_nomes`), secções `casos_sem_nome_documentados`, `jurisprudencia_aplicavel`, `chamada_para_contribuicao`, etc.

### 4.2 Casos (`casos_individuais_verificados`)

Estrutura **flexível**: muitos campos opcionais consoante o processo (identidade preservada, tuberculose, etc.). Campos frequentes:

| Campo | Tipo | Descrição |
|--------|------|------------|
| `id`, `slug`, `name` | `string` | Identificação. |
| `apelido` | `string` | Opcional. |
| `cidade`, `unidade_prisional` | `string` | |
| `idade_morte` | `number` \| `string` | |
| `data_prisao`, `data_morte`, `data_incidente`, `data_inicio_mal_estar` | `string` | Conforme disponível. |
| `status_processual` | `string` | |
| `condicao_saude_documentada`, `condicao` | `string` | |
| `alertas_ignorados` | `array` de `string` | |
| `o_que_moraes_nao_fez` | `string` | Quando aplicável. |
| `o_que_aconteceu` | `string` | |
| `o_que_o_estado_nao_fez` | `array` de `string` \| `string` | |
| `questoes_abertas` | `array` de `string` | |
| `causa_mortis_oficial`, `causa_mortis_real`, `causa_mortis` | `string` | |
| `o_que_o_preso_passou_por_ultimo` | `string` | |
| `deixou`, `responsabilizacao`, `acao_judicial_familia`, `nota_juridica`, `nota`, `relato_familiar` | `string` | Conforme o caso. |
| `failure_type` | `array` | Taxonomia §5. |
| `fontes` | `array` de `string` (URLs) | |

---

## 5. Taxonomia `failure_type`

Valores usados no código (`src/util.js`) e nas interfaces:

| Código | Uso |
|--------|-----|
| `preventive_detention_death` | Morte ou dano fatal ligado a prisão preventiva. |
| `judicial_omission` | Omissão do poder judicial. |
| `medical_negligence_in_custody` | Negligência médica sob custódia estatal. |
| `police_lethality` | Letalidade policial. |
| `impunity_of_aggressor` | Impunidade do agressor. |
| `institutional_retaliation` | Retaliação institucional. |
| `failure_to_protect_witness` | Falha em proteger vítima/testemunha. |
| `state_custody_failure` | Falha genérica de custódia estatal. |
| `state_law_as_weapon` | Uso do ordenamento como instrumento de dano. |

Novos códigos são aceites como texto livre na UI (rótulo = código se não houver tradução). Para prioridades de recolha, `cases_needed.priority_types` pode referir tipos adicionais (ex.: `death_in_psychiatric_custody`) — documentar ao introduzir.

---

## 6. Convenções

- **Datas:** Preferir `YYYY-MM-DD`. Meses ou dias desconhecidos podem usar `00` (ex.: `2017-00-00`) se o consumidor aceitar; a UI trata como texto onde necessário.
- **URLs:** Preferir HTTPS; evitar links que expiram sem arquivo associado quando possível.
- **Slug:** Único por dataset; apenas minúsculas, números e hífens.
- **Encoding:** Ficheiros UTF-8.
- **Validação local:** `node scripts/sync-data.mjs` valida JSON sintático; validação de schema semântico pode ser alargada (ex.: CI com [Ajv](https://ajv.js.org/) em evolução futura).

---

## 7. Referência rápida de ficheiros

| Ficheiro na raiz | Conteúdo principal |
|------------------|-------------------|
| `registry.json` | Manifest e rotas. |
| `state-victims-cases.json` | Casos globais + `cases_needed`. |
| `state-victims-brazil.json` | Panorama BR + casos + tabela de números + fontes primárias. |
| `state-victims-brazil-custody-deaths.json` | Mortes em custódia BR (narrativa + casos verificados). |

Para alterar dados: editar estes ficheiros na **raiz**, executar `npm run sync-data` (ou deixar `predev`/`prebuild` correr), e validar o site com `npm run dev`.

---

*Última atualização alinhada ao repositório [vitimas-do-estado](https://github.com/araguaci/vitimas-do-estado).*
