// Comprueba los enlaces internos en la salida `dist/`.
//
// Escanea cada .html emitido, recoge los atributos href/src internos y detecta dos fallos:
//  - Rutas raíz-absolutas ("/...") que no empiezan por el prefijo `base` configurado.
//  - Referencias que apuntan a un archivo inexistente bajo `dist/`.
// Nombra el recurso afectado y la página donde aparece, y termina con codigo distinto de
// cero si hay algun problema. Las rutas validas se dejan intactas (solo se informan).

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { parse } from 'node-html-parser';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectRoot, 'dist');

// Importa la config de Astro para obtener el valor de `base` realmente en uso,
// evitando analizar el texto fuente (que usa una variable y variantes comentadas).
async function readBase() {
  const configUrl = pathToFileURL(path.join(projectRoot, 'astro.config.mjs')).href;
  const mod = await import(configUrl);
  const base = mod.default?.base ?? '/';
  return base.endsWith('/') ? base : `${base}/`;
}

function walkHtmlFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...walkHtmlFiles(full));
    } else if (entry.endsWith('.html')) {
      found.push(full);
    }
  }
  return found;
}

const SKIP_PREFIXES = ['http://', 'https://', '//', 'mailto:', 'tel:', 'data:', '#', 'javascript:'];

function isExternalOrIgnorable(ref) {
  if (!ref) return true;
  const value = ref.trim();
  if (value === '') return true;
  return SKIP_PREFIXES.some((prefix) => value.toLowerCase().startsWith(prefix));
}

function stripQueryAndHash(ref) {
  return ref.split('#')[0].split('?')[0];
}

function collectReferences(root) {
  const refs = [];
  for (const el of root.querySelectorAll('[href]')) {
    refs.push(el.getAttribute('href'));
  }
  for (const el of root.querySelectorAll('[src]')) {
    refs.push(el.getAttribute('src'));
  }
  for (const el of root.querySelectorAll('[srcset]')) {
    const srcset = el.getAttribute('srcset') ?? '';
    for (const candidate of srcset.split(',')) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url) refs.push(url);
    }
  }
  return refs;
}

function resolveToFile(ref, base) {
  const clean = stripQueryAndHash(ref);
  let relative = clean.slice(base.length);
  if (relative.startsWith('/')) relative = relative.slice(1);

  const targetBase = path.join(distDir, ...relative.split('/'));

  if (clean.endsWith('/') || relative === '') {
    return path.join(targetBase, 'index.html');
  }
  return targetBase;
}

async function checkLinks() {
  if (!existsSync(distDir)) {
    console.error(`check:links: no existe la carpeta dist/ (${distDir}). Ejecuta "npm run build" primero.`);
    process.exit(1);
  }

  const base = await readBase();
  const htmlFiles = walkHtmlFiles(distDir);
  const problems = [];
  let internalCount = 0;

  for (const file of htmlFiles) {
    const pageRel = path.relative(distDir, file).split(path.sep).join('/');
    const root = parse(readFileSync(file, 'utf8'));

    for (const ref of collectReferences(root)) {
      if (isExternalOrIgnorable(ref)) continue;

      const clean = stripQueryAndHash(ref);

      // Rutas relativas (no empiezan por '/'): fuera del alcance de la comprobacion de base.
      if (!clean.startsWith('/')) continue;

      internalCount += 1;

      if (!clean.startsWith(base)) {
        problems.push({
          page: pageRel,
          ref,
          reason: `ruta raiz-absoluta sin el prefijo base "${base}"`,
        });
        continue;
      }

      const targetFile = resolveToFile(ref, base);
      if (!existsSync(targetFile)) {
        problems.push({
          page: pageRel,
          ref,
          reason: `no resuelve a ningun archivo (${path.relative(distDir, targetFile).split(path.sep).join('/')})`,
        });
      }
    }
  }

  console.log(`check:links: base="${base}" | ${htmlFiles.length} paginas | ${internalCount} referencias internas comprobadas`);

  if (problems.length > 0) {
    console.error(`\ncheck:links: se encontraron ${problems.length} enlace(s) con problemas:\n`);
    for (const p of problems) {
      console.error(`  [${p.page}] ${p.ref}\n    -> ${p.reason}`);
    }
    process.exit(1);
  }

  console.log('check:links: todos los enlaces internos son base-safe y resuelven correctamente.');
  process.exit(0);
}

checkLinks().catch((err) => {
  console.error(`check:links: error inesperado: ${err?.stack ?? err}`);
  process.exit(1);
});
