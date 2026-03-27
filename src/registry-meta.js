import { loadRegistry } from './data/registry.js';
import { esc } from './util.js';

const host = document.getElementById('registry-dataset-links');
if (host) {
  loadRegistry()
    .then((reg) => {
      const parts = [];
      for (const ds of Object.values(reg.datasets || {})) {
        parts.push(
          `<a href="${esc(ds.href)}" class="nav-item"><span class="dot dot-red"></span> ${esc(ds.label)}</a>`
        );
      }
      host.innerHTML = parts.join('');
    })
    .catch(() => {
      host.innerHTML =
        '<span class="nav-item" style="color:var(--fg-3);font-size:12px">Manifest indisponível</span>';
    });
}
