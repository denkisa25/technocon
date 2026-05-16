// One-time patch: adds missing BG translations and new EN keys to content.json
// Run once on the server: node patch-content.mjs
// Safe: only adds keys that don't already exist — never overwrites existing values.

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const file  = join(__dir, 'data/content.json');

const content = JSON.parse(readFileSync(file, 'utf8'));
if (!content.en) content.en = {};
if (!content.bg) content.bg = {};

const patch = {
  en: {
    'footer.subver.label':        '— Subver Office',
    'contact.subver.label':       'Emirates — Subver International FZC',
    'contact.subver.mapq':        'Ajman Free Zone, Ajman, United Arab Emirates',
    'contact.subver.address':     'Ajman Free Zone, Ajman, United Arab Emirates',
    'contact.subver.email':       'info@subver.ae',
    'contact.subver.phone':       '+971 6 500 0000',
    'contact.subver.web':         'www.subver.ae',
  },
  bg: {
    'footer.subver.label':        '— Офис Subver',
    'nav.subver':                 'SUBVER',
    'contact.subver.label':       'Емирства — Subver International FZC',
    'contact.subver.mapq':        'Ajman Free Zone, Ajman, United Arab Emirates',
    'contact.subver.address':     'Ajman Free Zone, Аджман, ОАЕ',
    'contact.subver.email':       'info@subver.ae',
    'contact.subver.phone':       '+971 6 500 0000',
    'contact.subver.web':         'www.subver.ae',
    'contact.form.inquiry.subver':'Subver',
    'services.5.title':           'Subver — MENA Услуги по доставки',
    'services.5.intro':           'SUBVER INTERNATIONAL FZC е дъщерно дружество на Technocon, намиращо се в Емирствата, основано през 2023 г. и специализирано в доставки за нефтени и газови съоръжения в региона MENA. Работи основно в ОАЕ, Саудитска Арабия, Ирак и Оман, като основният фокус на Subver е доставката на промишлено оборудване на водещи оператори и изпълнители — включително ADNOC и Borouge — както и на EPC компании и правителствени структури. Поддържайки компактен и ефективен екип, компанията осигурява бързи срокове за реакция и гъвкаво изпълнение. Subver подкрепя клиентите си в целия цикъл на доставки: от търсене и координация с доставчици до доставка и документация, гарантирайки спазване на изискванията на проекта и местните регулации.',
    'services.5.team.h':          'Екипен състав',
    'services.5.team.items':      ['Отдел Доставки — Инженери и мениджъри по доставки','Технически отдел — Специалисти за оценка на спецификации','Правен и съответствие — Документация и митническо освобождаване','Логистика — Международна доставка и координация','Продажби и бизнес развитие — Регионален обхват'],
    'services.5.tag.founded':     'Осн. 2023',
    'services.5.tag.regions':     'ОАЕ · КСА · Ирак · Оман',
    'services.5.tag.sector':      'Нефт и Газ',
    'services.5.tag.area':        'Регион MENA',
  }
};

let added = 0;
for (const lang of ['en', 'bg']) {
  for (const [key, val] of Object.entries(patch[lang])) {
    if (content[lang][key] === undefined) {
      content[lang][key] = val;
      console.log(`+ [${lang}] ${key}`);
      added++;
    } else {
      console.log(`  [${lang}] ${key} — already set, skipped`);
    }
  }
}

writeFileSync(file, JSON.stringify(content, null, 2));
console.log(`\nDone — ${added} key(s) added.`);
