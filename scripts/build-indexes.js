// Node 18+ / 20+ で動く簡易ビルダー
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const BASE = 'https://mizuki020.github.io/chart-log';
const STOCKS_DIR = path.join(ROOT, 'stocks');
const cssLink = '<link rel="stylesheet" href="/chart-log/assets/styles.css">';
const exists = async p => !!(await fs.stat(p).catch(() => false));

async function collect() {
  const map = {};
  if (!await exists(STOCKS_DIR)) return map;
  for (const code of await fs.readdir(STOCKS_DIR)) {
    const codeDir = path.join(STOCKS_DIR, code);
    if (!(await fs.stat(codeDir)).isDirectory()) continue;
    map[code] = [];
    for (const d of await fs.readdir(codeDir)) {
      const dayDir = path.join(codeDir, d);
      if (!(await fs.stat(dayDir)).isDirectory()) continue;
      const htmlPath = path.join(dayDir, 'index.html');
      if (!await exists(htmlPath)) continue;
      let title = `${code} ${d}`;
      const metaPath = path.join(dayDir, 'meta.json');
      if (await exists(metaPath)) {
        try { const m = JSON.parse(await fs.readFile(metaPath,'utf8')); title = m.title || title; } catch {}
      }
      map[code].push({ date: d, url: `${BASE}/stocks/${code}/${d}/`, title });
    }
    map[code].sort((a,b)=> b.date.localeCompare(a.date));
  }
  return map;
}

const tplStockIndex = (code, items) => {
  const list = items.map(i => `<li><a href="${i.url}">${i.date}</a></li>`).join('\n');
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${code} | chart-log</title>${cssLink}
</head><body>
<header class="wrap breadcrumb"><a href="/chart-log/">Top</a> › <strong>${code}</strong></header>
<main class="wrap"><h1>${code}</h1><ul>${list}</ul></main></body></html>`;
};

const tplSitemap = urls => {
  const nodes = urls.map(u=>`  <url><loc>${u}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${nodes}
</urlset>`;
};

async function main(){
  const map = await collect();
  const all = [`${BASE}/`];
  for (const [code, items] of Object.entries(map)) {
    const html = tplStockIndex(code, items);
    await fs.writeFile(path.join(STOCKS_DIR, code, 'index.html'), html, 'utf8');
    all.push(`${BASE}/stocks/${code}/`);
    for (const it of items) all.push(it.url);
  }
  await fs.writeFile(path.join(ROOT,'sitemap.xml'), tplSitemap(all), 'utf8');
  await fs.writeFile(path.join(ROOT,'catalog.json'), JSON.stringify(map,null,2), 'utf8');
}
main().catch(e=>{ console.error(e); process.exit(1); });
