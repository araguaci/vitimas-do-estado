const base = () => import.meta.env.BASE_URL || '/';

let registryPromise = null;

/**
 * Carrega o manifest uma vez (cache em memória).
 * Todas as páginas devem obter caminhos de datasets apenas por aqui.
 */
export async function loadRegistry() {
  if (!registryPromise) {
    registryPromise = (async () => {
      const r = await fetch(`${base()}data/registry.json`);
      if (!r.ok) throw new Error(`registry.json: HTTP ${r.status}`);
      return r.json();
    })();
  }
  return registryPromise;
}

/**
 * Carrega um dataset pelo id definido em registry.json → datasets.
 */
export async function loadDataset(key) {
  const reg = await loadRegistry();
  const ds = reg.datasets?.[key];
  if (!ds?.path) throw new Error(`Dataset desconhecido ou sem path: ${key}`);
  const r = await fetch(`${base()}${ds.path}`);
  if (!r.ok) throw new Error(`${key}: HTTP ${r.status}`);
  return r.json();
}

export async function getDatasetMeta(key) {
  const reg = await loadRegistry();
  return reg.datasets?.[key] ?? null;
}
