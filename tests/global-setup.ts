import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

// Builds the static site once, before any test worker starts, so the several
// dist-consuming property tests (Properties 5/6/7/8) share a single clean
// dist/ instead of each triggering a concurrent `astro build` into the same
// directory (which corrupts the output). Runs once per `vitest run`.
export default function setup(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const projectRoot = resolve(here, '..');
  rmSync(join(projectRoot, 'dist'), { recursive: true, force: true });
  execFileSync('npm', ['run', 'build'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}
