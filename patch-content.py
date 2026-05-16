#!/usr/bin/env python3
# One-time patch: adds missing BG translations and new EN keys to content.json
# Run: python3 patch-content.py
# Safe: only adds keys that don't already exist — never overwrites existing values.

import json, os

script_dir = os.path.dirname(os.path.abspath(__file__))
file_path  = os.path.join(script_dir, 'data', 'content.json')

with open(file_path, 'r', encoding='utf-8') as f:
    content = json.load(f)

content.setdefault('en', {})
content.setdefault('bg', {})

patch = {
    'en': {
        'footer.subver.label':        '— Subver Office',
        'contact.subver.label':       'Emirates — Subver International FZC',
        'contact.subver.mapq':        'Ajman Free Zone, Ajman, United Arab Emirates',
        'contact.subver.address':     'Ajman Free Zone, Ajman, United Arab Emirates',
        'contact.subver.email':       'info@subver.ae',
        'contact.subver.phone':       '+971 6 500 0000',
        'contact.subver.web':         'www.subver.ae',
        'services.5.title':           'Subver — MENA Procurement Services',
        'services.5.intro':           'SUBVER INTERNATIONAL FZC is a Technocon subsidiary company located in the Emirates, established in 2023 and specialising in procurement for oil and gas facilities across the MENA region. Operating primarily in the UAE, Saudi Arabia, Iraq, and Oman, Subver\'s core focus is the supply of industrial equipment to major operators and contractors — including ADNOC and Borouge — as well as EPC companies and government entities. Maintaining a lean and efficient team enables fast response times and flexible execution. Subver supports clients throughout the full procurement cycle: from sourcing and vendor coordination to delivery and documentation, ensuring compliance with project requirements and local regulations.',
        'services.5.team.h':          'Team Composition',
        'services.5.team.items':      ['Procurement Department — Engineers and procurement managers', 'Technical Department — Specialists for specification assessment', 'Legal & Compliance — Documentation and customs clearance', 'Logistics — International shipping and coordination', 'Sales & Business Development — Regional outreach'],
        'services.5.tag.founded':     'Est. 2023',
        'services.5.tag.regions':     'UAE · KSA · Iraq · Oman',
        'services.5.tag.sector':      'Oil & Gas',
        'services.5.tag.area':        'MENA Region',
    },
    'bg': {
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
        'services.5.team.items':      ['Отдел Доставки — Инженери и мениджъри по доставки', 'Технически отдел — Специалисти за оценка на спецификации', 'Правен и съответствие — Документация и митническо освобождаване', 'Логистика — Международна доставка и координация', 'Продажби и бизнес развитие — Регионален обхват'],
        'services.5.tag.founded':     'Осн. 2023',
        'services.5.tag.regions':     'ОАЕ · КСА · Ирак · Оман',
        'services.5.tag.sector':      'Нефт и Газ',
        'services.5.tag.area':        'Регион MENA',
    }
}

added = 0
for lang in ['en', 'bg']:
    for key, val in patch[lang].items():
        if key not in content[lang]:
            content[lang][key] = val
            print(f'+ [{lang}] {key}')
            added += 1
        else:
            print(f'  [{lang}] {key} — already set, skipped')

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(content, f, ensure_ascii=False, indent=2)

print(f'\nDone — {added} key(s) added.')
