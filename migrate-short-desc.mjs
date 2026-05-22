/**
 * Migration: add short_desc to existing projects without overwriting any other data.
 * Run once on the production server: node migrate-short-desc.mjs
 *
 * - Only fills short_desc where it is missing or empty.
 * - All existing titles, descriptions, scopes, images are untouched.
 * - Writes a backup before modifying.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, 'data', 'projects.json');
const BACKUP = FILE + '.bak-' + Date.now();

// Sensible defaults keyed by project key + lang.
// Only used if the project has no short_desc set at all.
const DEFAULTS = {
  checkpoint: {
    en: 'Strategic modernisation of a border checkpoint — full multi-discipline scope from engineering through construction.',
    bg: 'Стратегическа модернизация на гранична инфраструктура — пълен обхват от инженеринг до строителство.',
  },
  balkan: {
    en: 'Gas transmission pipeline across Bulgaria — Turkish to Serbian border — including commissioning and O&M support.',
    bg: 'Газопреносен тръбопровод Балкански поток — от турската до сръбската граница — включително въвеждане в експлоатация.',
  },
  enefit: {
    en: '400 t steel structures, 360 t piping, 50 t stainless steel — oil shale processing plant construction and commissioning.',
    bg: '400 т стоманени конструкции, 360 т тръбопроводи — изграждане на завод за преработка на нефтени шисти.',
  },
  lozen: {
    en: 'Full reconstruction on the active 48" gas pipeline — access road, perimeter drainage, and fire protection strip.',
    bg: 'Цялостна реконструкция на активния 48" газопровод — пътища, дренаж и противопожарна лента.',
  },
  chiren: {
    en: 'New aboveground area for Chiren Underground Gas Storage — compressor station, gas treatment, TEG regeneration.',
    bg: 'Нова надземна площадка за ПГХ Чирен — компресорна станция, газова обработка и ТЕГ регенерация.',
  },
  adnoc: {
    en: 'Fire-rated LGS buildings and refurbished ISO container units — fully fitted and ready for deployment in the UAE.',
    bg: 'Противопожарни LGS сгради и рефурбишнати ISO контейнери — напълно оборудвани за UAE.',
  },
};

const projects = JSON.parse(fs.readFileSync(FILE, 'utf8'));

// Write backup first
fs.copyFileSync(FILE, BACKUP);
console.log(`Backup written to ${BACKUP}`);

let changed = 0;

for (const p of projects) {
  if (!p.translations) continue;
  for (const lang of Object.keys(p.translations)) {
    const t = p.translations[lang];
    if (!t.short_desc) {
      t.short_desc = (DEFAULTS[p.key] && DEFAULTS[p.key][lang]) || '';
      if (t.short_desc) {
        console.log(`  + ${p.key} [${lang}]: set default short_desc`);
        changed++;
      }
    } else {
      console.log(`  ✓ ${p.key} [${lang}]: short_desc already present, skipped`);
    }
  }
}

fs.writeFileSync(FILE, JSON.stringify(projects, null, 2));
console.log(`\nDone — ${changed} field(s) added. ${changed === 0 ? 'Nothing changed.' : 'File updated.'}`);
