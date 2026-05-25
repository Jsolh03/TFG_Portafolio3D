#!/usr/bin/env node
/**
 * Auto-discovery de ROMs en public/roms/.
 * Genera public/roms/manifest.json con todas las ROMs encontradas.
 *
 * Uso:  node scripts/build-roms-manifest.js
 *  o:   npm run roms
 */

import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(__filename, '..', '..');
const ROMS_DIR = join(ROOT, 'public', 'roms');
const COVERS_DIR = join(ROMS_DIR, 'covers');
const MANIFEST = join(ROMS_DIR, 'manifest.json');

const EXT_TO_CORE = {
  '.nes': 'nes',
  '.smc': 'snes', '.sfc': 'snes',
  '.gb': 'gb', '.gbc': 'gb',
  '.gba': 'gba',
  '.md': 'segaMD', '.smd': 'segaMD', '.gen': 'segaMD',
  '.n64': 'n64', '.z64': 'n64', '.v64': 'n64',
  '.iso': 'psx', '.bin': 'psx', '.cue': 'psx', '.chd': 'psx',
  '.zip': 'arcade'
};

const COVER_EXTS = ['.png', '.jpg', '.jpeg', '.webp'];

// Archivos a ignorar aunque su extensión coincida con un core
// (.md choca con docs Markdown; los otros son ruido común en repos)
const IGNORE_BASENAMES = new Set([
  'readme', 'license', 'licence', 'notes', 'todo', 'changelog', 'contributing'
]);

// Tamaño mínimo en bytes para considerar algo una ROM (un README pesa <2KB)
const MIN_ROM_SIZE = 4 * 1024;

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const prettyTitle = (name) =>
  name
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());

const findCover = (baseName) => {
  if (!existsSync(COVERS_DIR)) return null;
  for (const ext of COVER_EXTS) {
    const filename = baseName + ext;
    if (existsSync(join(COVERS_DIR, filename))) return `/roms/covers/${filename}`;
  }
  return null;
};

const main = () => {
  if (!existsSync(ROMS_DIR)) {
    console.error(`[roms] No existe la carpeta ${ROMS_DIR}`);
    process.exit(1);
  }

  const entries = readdirSync(ROMS_DIR).filter(f => {
    const full = join(ROMS_DIR, f);
    const stats = statSync(full);
    if (!stats.isFile()) return false;
    const ext = extname(f).toLowerCase();
    if (EXT_TO_CORE[ext] === undefined) return false;
    const base = basename(f, ext).toLowerCase();
    if (IGNORE_BASENAMES.has(base)) return false;
    if (stats.size < MIN_ROM_SIZE) return false;
    return true;
  });

  const manifest = entries.map(file => {
    const ext = extname(file).toLowerCase();
    const base = basename(file, ext);
    const id = slug(base);
    return {
      id,
      title: prettyTitle(base),
      core: EXT_TO_CORE[ext],
      rom: `/roms/${file}`,
      cover: findCover(base) || null
    };
  }).sort((a, b) => a.title.localeCompare(b.title));

  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`[roms] Manifest generado con ${manifest.length} entrada${manifest.length === 1 ? '' : 's'}:`);
  manifest.forEach(m => console.log(`  · ${m.title} (${m.core})`));
};

main();
