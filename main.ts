// main.ts — the hand-in program for the Langit Kepulauan flight game.
//
// It gathers the two deliverable folders that sit next to this file,
// game/ and screenshots/, copies them into the output directory named by
// MAKEFUN_OUTPUT_DIR (or /output when that variable is absent), and then
// writes dossier.json there using buildDossier from the vendored library
// under vendor/makefun-game.ts. Only the Node.js standard library is used,
// and the same inputs always produce the same output bytes.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const OUTPUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyDeliverableFolder(name: string): void {
  const source = join(REPO_ROOT, name);
  if (!existsSync(source)) {
    throw new Error(`missing deliverable folder next to main.ts: ${name}`);
  }
  cpSync(source, join(OUTPUT_DIR, name), { recursive: true });
}

function checkDeliverablesReady(): void {
  const indexHtml = join(REPO_ROOT, 'game', 'index.html');
  if (!existsSync(indexHtml)) {
    throw new Error('game/index.html is missing, so there is no playable game to hand in');
  }
  const shots = join(REPO_ROOT, 'screenshots');
  const shotFiles = existsSync(shots)
    ? readdirSync(shots).filter((f) => !f.startsWith('.'))
    : [];
  if (shotFiles.length < 3) {
    throw new Error(`screenshots/ holds ${shotFiles.length} images, but at least 3 are needed`);
  }
}

function handInEntry(): void {
  checkDeliverablesReady();
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyDeliverableFolder('game');
  copyDeliverableFolder('screenshots');
  const dossier = buildDossier(OUTPUT_DIR, DOSSIER_CAPS);
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
}

handInEntry();
