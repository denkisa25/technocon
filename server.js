// Technocon CMS Backend — JSON file storage (no native modules, works on Node 10+)
const express    = require('express');
const session    = require('express-session');
const multer     = require('multer');
const bcrypt     = require('bcryptjs');
const path       = require('path');
const fs         = require('fs');
const nodemailer = require('nodemailer');

const app  = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');

// ── Ensure directories exist ───────────────────────────────────────────
['uploads', 'data'].forEach(d => {
  if (!fs.existsSync(path.join(ROOT, d))) fs.mkdirSync(path.join(ROOT, d));
});

// ── JSON store helpers ─────────────────────────────────────────────────
const FILES = {
  users:    path.join(DATA, 'users.json'),
  content:  path.join(DATA, 'content.json'),
  projects: path.join(DATA, 'projects.json'),
  partners: path.join(DATA, 'partners.json'),
};

function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { return fallback; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// ── Seed users ─────────────────────────────────────────────────────────
if (!fs.existsSync(FILES.users)) {
  writeJSON(FILES.users, [
    { id: 1, username: 'admin', password_hash: bcrypt.hashSync('technocon2026', 10) }
  ]);
}

// ── Content defaults (used for seed and migration) ─────────────────────
var CONTENT_DEFAULTS = {
  en: {
    'hero.tag':           'Energy & Industrial Infrastructure — Bulgaria 2026',
    'hero.subtitle':      'Engineering, procurement, construction and project management for the energy and industrial sector across Europe and beyond.',
    'stat.1.n':           '€11M+',
    'stat.1.l':           'Contract Value',
    'stat.2.n':           '4,000+',
    'stat.2.l':           'Tracked Items',
    'stat.3.n':           '7+',
    'stat.3.l':           'Major Projects',
    'stat.4.n':           '3',
    'stat.4.l':           'ISO Certifications',
    'services.tag':       'Fields of Activity',
    'services.h2':        'Our Services',
    'services.intro':     'From mechanical installation to full turnkey project execution — Technocon delivers integrated solutions across the complete project lifecycle in energy and industrial infrastructure.',
    'services.1.title':   'Construction & Installation',
    'services.1.items':   ['Mechanical equipment installation','Welding and piping works','Testing and commissioning assistance','Steel structure erection','Civil works','Supervision & QA/QC'],
    'services.2.title':   'Engineering & Turnkey Execution',
    'services.2.items':   ['Design and design coordination','Technical supervision','Engineering support','Scope integration','End-to-end project delivery','As-built documentation'],
    'services.3.title':   'Procurement',
    'services.3.items':   ['Procurement coordination & expediting','Process equipment & raw materials','Surplus materials','Vendor list & vendor follow-up','TBE preparation','Transport & warehouse logistics'],
    'services.4.title':   'Project Management & Controls',
    'services.4.items':   ['Progress reporting & planning','Final installation management','Weekly/daily reports','Interface management','Multi-discipline coordination','Subcontractor management'],
    'tracking.h':              'QR / Barcode Tracking System',
    'tracking.sub':            'In-house materials control — competitive advantage',
    'tracking.p':              'Technocon operates a proprietary tracking system for steel structures, piping materials, and concrete precast units. Each item receives a unique QR/barcode ID and is tracked through defined statuses and locations across production, warehouse, and site — in real time.',
    'tracking.stat.n':         '4,000+',
    'tracking.stat.l':         'produced items tracked across multi-project operations',
    'tracking.workflow.label': 'Status Workflow',
    'tracking.flow.prd':       'Produced — manufactured & labelled',
    'tracking.flow.qc':        'Quality Control — inspected & approved',
    'tracking.flow.rdy':       'Ready — cleared for dispatch',
    'tracking.flow.dsp':       'Dispatched — in transport',
    'tracking.flow.dlv':       'Delivered — confirmed on-site',
    'tracking.flow.ins':       'Installed — final status logged',
    'about.tag':          'Who We Are',
    'about.h2':           'About Technocon',
    'about.text':         'A Bulgarian-based company specialising in energy and industrial infrastructure projects across Europe. We combine proven engineering expertise, flexible delivery capacity, and lean team structure to deliver results at every project stage — from mobilisation through commissioning and beyond.',
    'about.caps':         [
      'Fast Internal Coordination||Rapid decision-making and high adaptability in changing project environments.',
      'Strong Ownership||Experience in technical documentation, site interfaces, and execution follow-up.',
      'Lean Structure||Hands-on project involvement with efficient communication across all disciplines.',
      'Quick Mobilisation||Ability to mobilise core resources and expand through partner network when required.'
    ],
    'quality.label':      'Quality Assurance',
    'quality.title':      'ISO Certified',
    'quality.desc':       'Technocon holds three internationally recognised ISO certifications — reflecting our commitment to quality management, environmental responsibility, and occupational health & safety across all operations.',
    'quality.isos':       [
      'ISO 9001:2015||Quality Management System||brand_assets/ISO_9001_2015.png',
      'ISO 14001:2015||Environmental Management System||brand_assets/ISO_14001_2015.png',
      'ISO 45001:2018||Occupational Health & Safety Management||brand_assets/ISO_45001_2018.png'
    ],
    'team.label':         'Our Team',
    'team.title':         'How We Work',
    'team.desc':          'A lean, senior-led team built for complex industrial environments — combining hands-on execution with tight coordination across all project phases.',
    'team.strengths':     [
      'Proven Execution||Track record in industrial and infrastructure projects across multiple countries and disciplines.',
      'Flexible Delivery||Engineering coordination + site execution + subcontractor management under one roof.',
      'Fast Response||Rapid mobilisation and adaptability to client requirements and project-specific procedures.',
      'Multi-Stage Entry||Can enter projects at mobilisation, installation, support, or recovery scope phases.',
      'Strong Coordination||Tight integration between technical, commercial, and execution functions.',
      'Scalable Capacity||Lean core team that expands through a vetted partner network as project scope requires.'
    ],
    'contact.address':    'Osogovo st. 51, 1303 Sofia, Bulgaria',
    'contact.email1':     'dcc@techno-con.eu',
    'contact.email2':     'office@techno-con.eu',
    'contact.phone1':     '+359 88 9627304',
    'contact.phone2':     '+359 88 8304414',
    'contact.web':        'www.techno-con.eu',
  },
  bg: {
    'hero.tag':           'Енергийна и промишлена инфраструктура — България 2026',
    'hero.subtitle':      'Инженеринг, доставки, строителство и управление на проекти за енергийния и индустриален сектор в Европа и извън нея.',
    'stat.1.n':           '€11M+',
    'stat.1.l':           'Стойност договори',
    'stat.2.n':           '4,000+',
    'stat.2.l':           'Проследени позиции',
    'stat.3.n':           '7+',
    'stat.3.l':           'Основни проекти',
    'stat.4.n':           '3',
    'stat.4.l':           'ISO Сертификации',
    'services.tag':       'Области на дейност',
    'services.h2':        'Нашите услуги',
    'services.intro':     'От механичен монтаж до изпълнение на ключови проекти — Техноcon предоставя интегрирани решения в целия жизнен цикъл на проекти в енергийната и промишлената инфраструктура.',
    'services.1.title':   'Строителство и монтаж',
    'services.1.items':   ['Монтаж на механично оборудване','Заваръчни и тръбопроводни работи','Помощ при изпитвания и въвеждане в експлоатация','Монтаж на стоманени конструкции','Строителни работи','Надзор и контрол на качеството'],
    'services.2.title':   'Инженеринг и ключови проекти',
    'services.2.items':   ['Проектиране и координация на проекти','Технически надзор','Инженерна поддръжка','Интеграция на обхвата','Цялостно изпълнение на проекти','Документация "as-built"'],
    'services.3.title':   'Доставки',
    'services.3.items':   ['Координация и expediting на доставки','Технологично оборудване и суровини','Излишни материали','Списък и следене на доставчици','Подготовка на TBE','Транспорт и складова логистика'],
    'services.4.title':   'Управление на проекти и контрол',
    'services.4.items':   ['Отчитане на напредък и планиране','Управление на финалния монтаж','Седмични/дневни отчети','Управление на интерфейси','Многодисциплинарна координация','Управление на подизпълнители'],
    'tracking.h':              'QR / Баркод Система за проследяване',
    'tracking.sub':            'Вътрешен контрол на материалите — конкурентно предимство',
    'tracking.p':              'Техноcon използва собствена система за проследяване на стоманени конструкции, тръбопроводни материали и сглобяеми бетонни елементи. Всяка позиция получава уникален QR/баркод идентификатор и се проследява по дефинирани статуси и местоположения в производство, склад и обект — в реално време.',
    'tracking.stat.n':         '4,000+',
    'tracking.stat.l':         'проследени позиции в мулти-проектни операции',
    'tracking.workflow.label': 'Работен процес',
    'tracking.flow.prd':       'Произведено — изработено и маркирано',
    'tracking.flow.qc':        'Контрол на качеството — проверено и одобрено',
    'tracking.flow.rdy':       'Готово — разрешено за изпращане',
    'tracking.flow.dsp':       'Изпратено — в транспорт',
    'tracking.flow.dlv':       'Доставено — потвърдено на обект',
    'tracking.flow.ins':       'Монтирано — финален статус записан',
    'about.tag':          'Кои сме ние',
    'about.h2':           'За Техноcon',
    'about.text':         'Българска компания, специализирана в проекти за енергийна и промишлена инфраструктура в Европа. Комбинираме доказан инженерен опит, гъвкав капацитет за изпълнение и компактна структура за постигане на резултати.',
    'about.caps':         [
      'Бърза вътрешна координация||Бързо вземане на решения и висока адаптивност в динамична проектна среда.',
      'Силна отговорност||Опит в техническата документация, интерфейси на обекти и проследяване на изпълнението.',
      'Компактна структура||Пряко участие в проектите с ефективна комуникация между всички дисциплини.',
      'Бърза мобилизация||Способност за мобилизиране на основни ресурси и разширяване чрез партньорска мрежа.'
    ],
    'quality.label':      'Осигуряване на качеството',
    'quality.title':      'ISO Сертифициран',
    'quality.desc':       'Техноcon притежава три международно признати ISO сертификации — отразяващи нашия ангажимент към управление на качеството, опазване на околната среда и охрана на труда и безопасност.',
    'quality.isos':       [
      'ISO 9001:2015||Система за управление на качеството||brand_assets/ISO_9001_2015.png',
      'ISO 14001:2015||Система за управление на околната среда||brand_assets/ISO_14001_2015.png',
      'ISO 45001:2018||Управление на здравето и безопасността при работа||brand_assets/ISO_45001_2018.png'
    ],
    'team.label':         'Нашият екип',
    'team.title':         'Как работим',
    'team.desc':          'Компактен, ръководен от опитни специалисти екип, създаден за сложна индустриална среда — съчетаващ практическо изпълнение с прецизна координация на всички проектни фази.',
    'team.strengths':     [
      'Доказано изпълнение||Опит в промишлени и инфраструктурни проекти в множество страни и дисциплини.',
      'Гъвкаво изпълнение||Инженерна координация + изпълнение на обекти + управление на подизпълнители под един покрив.',
      'Бърза реакция||Бърза мобилизация и адаптивност към изискванията на клиента и процедурите на проекта.',
      'Многофазно включване||Може да се включи в проекти на фазата на мобилизация, монтаж, поддръжка или възстановяване.',
      'Силна координация||Тясна интеграция между техническите, търговските и изпълнителните функции.',
      'Мащабируем капацитет||Компактен основен екип, който се разширява чрез проверена партньорска мрежа при нужда.'
    ],
    'contact.address':    'ул. Осогово 51, 1303 София, България',
    'contact.email1':     'dcc@techno-con.eu',
    'contact.email2':     'office@techno-con.eu',
    'contact.phone1':     '+359 88 9627304',
    'contact.phone2':     '+359 88 8304414',
    'contact.web':        'www.techno-con.eu',
  }
};

// ── Seed content (first run) + migrate missing keys ────────────────────
(function() {
  var content = fs.existsSync(FILES.content)
    ? readJSON(FILES.content, { en: {}, bg: {} })
    : { en: {}, bg: {} };
  var changed = false;
  ['en', 'bg'].forEach(function(lang) {
    if (!content[lang]) { content[lang] = {}; changed = true; }
    Object.keys(CONTENT_DEFAULTS[lang]).forEach(function(key) {
      if (content[lang][key] === undefined) {
        content[lang][key] = CONTENT_DEFAULTS[lang][key];
        changed = true;
      }
    });
  });
  if (changed) writeJSON(FILES.content, content);
})();

// ── Seed projects ──────────────────────────────────────────────────────
if (!fs.existsSync(FILES.projects)) {
  writeJSON(FILES.projects, [
    { id:1, key:'checkpoint', status:'ongoing', badge:'ongoing', sort_order:1,
      translations:{
        en:{ title:'Border Checkpoint Reconstruction', client:'Glavbolgarstroy AD', period:'Oct 2025 – Present', location:'Bulgaria', contract_value:'760 t steel structures', description:'Strategic infrastructure modernisation of a border checkpoint, with high coordination and execution requirements. Full multi-discipline scope from engineering through construction.', scope:['Detail design','Raw material procurement','Engineering','Steel structures manufacturing','Galvanization','Quality control','Tracking & expediting','Construction works'] },
        bg:{ title:'Реконструкция на граничен контролно-пропускателен пункт', client:'Главболгарстрой АД', period:'Окт 2025 – Настоящем', location:'България', contract_value:'760 т стоманени конструкции', description:'Стратегическа модернизация на инфраструктурата на граничен пункт с висока координация и изисквания за изпълнение.', scope:['Работен проект','Доставка на материали','Инженеринг','Производство на стоманени конструкции','Поцинковане','Контрол на качеството','Проследяване','Строително-монтажни работи'] }
      },
      images:[{id:1,filename:'brand_assets/CHIREN PRES-1.jpeg',sort_order:0},{id:2,filename:'brand_assets/CHIREN PRES-3.jpeg',sort_order:1},{id:3,filename:'brand_assets/DJI_0005.JPG',sort_order:2}] },
    { id:2, key:'balkan', status:'completed', badge:'completed', sort_order:2,
      translations:{
        en:{ title:'Bulgarian Gas Pipeline Extension — Balkan Stream', client:'Bulgartransgaz EAD', period:'2019–2021 + O&M ongoing', location:'Bulgaria', contract_value:'Pipeline route Turkish–Serbian border', description:'Gas transmission pipeline across Bulgaria (Balkan Stream) including related facilities and commissioning. Currently under ongoing O&M support.', scope:['Materials & equipment supply','Line pipes incl. GRP insulation','Engineering support','Technical coordination','As-built documentation','Testing & commissioning','Start-up assistance','Ongoing O&M support'] },
        bg:{ title:'Разширение на газопровод — Балкански поток', client:'Булгартрансгаз ЕАД', period:'2019–2021 + текуща поддръжка', location:'България', contract_value:'Трасе турска–сръбска граница', description:'Газопреносен тръбопровод Балкански поток, включително съоръжения и въвеждане в експлоатация.', scope:['Доставка материали и оборудване','Тръбопроводи с GRP изолация','Инженерна поддръжка','Техническа координация','Документация "as-built"','Изпитвания и пускане','Стартова помощ','Текуща поддръжка'] }
      },
      images:[{id:4,filename:'brand_assets/DJI_0012.JPG',sort_order:0},{id:5,filename:'brand_assets/DJI_0005.JPG',sort_order:1},{id:6,filename:'brand_assets/CHIREN PRES-2.jpeg',sort_order:2}] },
    { id:3, key:'enefit', status:'completed', badge:'completed', sort_order:3,
      translations:{
        en:{ title:'Enefit-280 Construction — Narva Oil Plant', client:'Eesti Energia', period:'2023–2025', location:'Narva, Estonia', contract_value:'~EUR 11M', description:'Construction of an oil shale processing plant including the condensation block. 400 t equipment & steel structures, 360 t piping, 50 t stainless steel, 4,300 pipe supports.', scope:['Mechanical installation','Prefabrication','Painting & coating','Welding works','Equipment installation','Electrical works','Automation works','Commissioning assistance'] },
        bg:{ title:'Строителство Enefit-280 — Нарва', client:'Eesti Energia', period:'2023–2025', location:'Нарва, Естония', contract_value:'~EUR 11M', description:'Изграждане на завод за преработка на нефтени шисти, включително кондензационен блок.', scope:['Механичен монтаж','Предварителна обработка','Боядисване и покрития','Заваряване','Монтаж оборудване','Електро монтаж','Автоматизация','Помощ при пускане'] }
      },
      images:[{id:7,filename:'brand_assets/CHIREN PRES-2.jpeg',sort_order:0},{id:8,filename:'brand_assets/CHIREN PRES-1.jpeg',sort_order:1},{id:9,filename:'brand_assets/CHIREN PRES-3.jpeg',sort_order:2}] },
    { id:4, key:'lozen', status:'completed', badge:'completed', sort_order:4,
      translations:{
        en:{ title:'Lozen Pig Launcher/Receiver Station Reconstruction', client:'Bulgartransgaz EAD', period:'Oct 2024 – Nov 2025', location:'Lozen, Bulgaria', contract_value:'~EUR 1M', description:'Full reconstruction of the Lozen Pig Launcher/Receiver Station including access road, fire protection strip, perimeter drainage, and internal site works on the active 48" gas pipeline.', scope:['Access road reconstruction','Embankment & drainage','Slope stabilisation (geogrid)','Fire protection strip','Reno mattress installation','Trench breakers'] },
        bg:{ title:'Реконструкция на станция Лозен', client:'Булгартрансгаз ЕАД', period:'Окт 2024 – Ноем 2025', location:'Лозен, България', contract_value:'~EUR 1M', description:'Цялостна реконструкция на станцията за пуск и приемане на диагностичен уред в Лозен.', scope:['Реконструкция на пътни настилки','Насипи и дренаж','Стабилизация на откоси','Противопожарна лента','Габионни дюшеци','Уплътнения на траншеи'] }
      },
      images:[{id:10,filename:'brand_assets/CHIREN PRES-3.jpeg',sort_order:0},{id:11,filename:'brand_assets/CHIREN PRES-1.jpeg',sort_order:1},{id:12,filename:'brand_assets/CHIREN PRES-2.jpeg',sort_order:2}] },
    { id:5, key:'chiren', status:'completed', badge:'completed', sort_order:5,
      translations:{
        en:{ title:'Chiren UGS Expansion — Aboveground Part', client:'Glavbolgarstroy AD', period:'Jun – Dec 2024', location:'Chiren, Bulgaria', contract_value:'~EUR 1.5M', description:'Construction of a new aboveground area for Chiren Underground Gas Storage (UGS), including gas injection and withdrawal systems.', scope:['Welding & installation works','Process equipment','Auxiliary network piping','TEG regeneration','Gas drying installation','Compression systems'] },
        bg:{ title:'Разширение на ПГХ Чирен — Надземна част', client:'Главболгарстрой АД', period:'Юни – Дек 2024', location:'Чирен, България', contract_value:'~EUR 1.5M', description:'Изграждане на нова надземна площадка за подземното газохранилище Чирен.', scope:['Заваряване и монтаж','Технологично оборудване','Спомагателни тръбопроводи','ТЕГ регенерация','Газово сушене','Компресорни системи'] }
      },
      images:[{id:13,filename:'brand_assets/DJI_0005.JPG',sort_order:0},{id:14,filename:'brand_assets/CHIREN PRES-2.jpeg',sort_order:1},{id:15,filename:'brand_assets/CHIREN PRES-3.jpeg',sort_order:2}] },
    { id:6, key:'adnoc', status:'ongoing', badge:'ongoing', sort_order:6,
      translations:{
        en:{ title:'ADNOC Procurement Services', client:'ADNOC', period:'Ongoing', location:'UAE', contract_value:'Procurement', description:'International procurement services for ADNOC including supply of fire-rated pre-fabricated Store Accommodation Buildings (LGS system) and refurbished ISO-modified container units.', scope:['Fire-rated LGS buildings (12×6m)','20ft storage containers','40ft kitchen/bakery containers','Full fit-out & delivery'] },
        bg:{ title:'Procurement услуги за ADNOC', client:'ADNOC', period:'Текущо', location:'ОАЕ', contract_value:'Доставки', description:'Международни procurement услуги за ADNOC, включително доставка на противопожарни сглобяеми сгради и контейнерни модули.', scope:['Противопожарни сгради LGS (12×6м)','20ft контейнери за склад','40ft контейнери кухня/пекарна','Монтаж и доставка'] }
      },
      images:[{id:16,filename:'brand_assets/CHIREN PRES-2.jpeg',sort_order:0},{id:17,filename:'brand_assets/CHIREN PRES-1.jpeg',sort_order:1},{id:18,filename:'brand_assets/DJI_0012.JPG',sort_order:2}] },
  ]);
}

// ── Seed partners ──────────────────────────────────────────────────────
if (!fs.existsSync(FILES.partners)) {
  writeJSON(FILES.partners, [
    { id:1, name_en:'Vemak',             name_bg:'Вемак',              logo:'' },
    { id:2, name_en:'Arkad S.p.A.',      name_bg:'Аркад С.п.А.',       logo:'' },
    { id:3, name_en:'Sicilsaldo Group',  name_bg:'Сицилсалдо Груп',    logo:'' },
    { id:4, name_en:'Camel Oil Tanzania',name_bg:'Камел Оил Танзания',  logo:'' },
    { id:5, name_en:'Bulgartransgaz',    name_bg:'Булгартрансгаз',     logo:'' },
    { id:6, name_en:'Eesti Energia',     name_bg:'Ееsти Енергия',      logo:'' },
    { id:7, name_en:'Glavbolgarstroy',   name_bg:'Главболгарстрой',    logo:'' },
    { id:8, name_en:'ADNOC',             name_bg:'АДНОK',              logo:'' },
  ]);
}

// ── Next ID helper ─────────────────────────────────────────────────────
function nextId(items) {
  return items.reduce((max, x) => Math.max(max, x.id || 0), 0) + 1;
}
function nextImgId(projects) {
  return projects.reduce((max, p) =>
    Math.max(max, (p.images || []).reduce((m, i) => Math.max(m, i.id || 0), 0)), 0) + 1;
}

// ── Middleware ─────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'technocon-cms-2026-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 }
}));

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    var projects = readJSON(FILES.projects, []);
    var p = projects.find(function(x) { return x.id == req.params.id; });
    var key = p ? p.key : 'unknown';
    var dir = path.join(ROOT, 'uploads', 'projects', key);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    var ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + ext);
  }
});
const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    cb(null, /\.(jpe?g|png|webp|gif)$/i.test(file.originalname));
  },
  limits: { fileSize: 15 * 1024 * 1024 }
});

const partnerStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    var dir = path.join(ROOT, 'uploads', 'partners');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    var ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + ext);
  }
});
const partnerUpload = multer({
  storage: partnerStorage,
  fileFilter: function(req, file, cb) {
    cb(null, /\.(jpe?g|png|webp|gif|svg)$/i.test(file.originalname));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

const requireAdmin = function(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.status(401).json({ error: 'Unauthorized' });
};

// ── Subdirectory prefix stripping ──────────────────────────────────────
// When hosted at e.g. /temp/, Passenger may forward the full path
// (/temp/admin, /temp/api/...) instead of stripping the prefix.
// This middleware strips any leading segment that isn't a known app route.
var KNOWN_PREFIXES = ['api', 'uploads', 'brand_assets', 'admin'];
app.use(function(req, res, next) {
  var parts = req.path.split('/').filter(Boolean);
  if (parts.length > 0 && KNOWN_PREFIXES.indexOf(parts[0]) === -1) {
    // Unknown first segment — treat it as a subpath prefix and strip it
    var stripped = '/' + parts.slice(1).join('/');
    req.url = (stripped === '/' ? '/' : stripped) +
              (req.url.indexOf('?') !== -1 ? req.url.slice(req.url.indexOf('?')) : '');
  }
  next();
});

// ── Static ─────────────────────────────────────────────────────────────
app.use('/uploads',      express.static(path.join(ROOT, 'uploads')));
app.use('/brand_assets', express.static(path.join(ROOT, 'brand_assets'), { maxAge: '7d' }));
app.get('/admin', function(req, res) { res.sendFile(path.join(ROOT, 'admin.html')); });
app.get('/',      function(req, res) { res.sendFile(path.join(ROOT, 'index.html')); });

// ── Auth ───────────────────────────────────────────────────────────────
app.post('/api/auth/login', function(req, res) {
  var users = readJSON(FILES.users, []);
  var user  = users.find(function(u) { return u.username === req.body.username; });
  if (!user || !bcrypt.compareSync(req.body.password, user.password_hash))
    return res.status(401).json({ error: 'Invalid credentials' });
  req.session.admin = { id: user.id, username: user.username };
  res.json({ ok: true, username: user.username });
});

app.post('/api/auth/logout', function(req, res) {
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/auth/me', function(req, res) {
  if (req.session && req.session.admin)
    return res.json({ ok: true, username: req.session.admin.username });
  res.status(401).json({ ok: false });
});

app.put('/api/auth/password', requireAdmin, function(req, res) {
  var users = readJSON(FILES.users, []);
  var idx   = users.findIndex(function(u) { return u.id === req.session.admin.id; });
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  if (!bcrypt.compareSync(req.body.current, users[idx].password_hash))
    return res.status(400).json({ error: 'Current password incorrect' });
  users[idx].password_hash = bcrypt.hashSync(req.body.newPass, 10);
  writeJSON(FILES.users, users);
  res.json({ ok: true });
});

// ── Content ────────────────────────────────────────────────────────────
app.get('/api/content', function(req, res) {
  var lang    = req.query.lang || 'en';
  var content = readJSON(FILES.content, { en: {}, bg: {} });
  res.json(content[lang] || {});
});

app.get('/api/content/all', requireAdmin, function(req, res) {
  var content = readJSON(FILES.content, { en: {}, bg: {} });
  // Return flat array matching the old SQLite shape so admin.html stays compatible
  var rows = [];
  ['en','bg'].forEach(function(lang) {
    Object.keys(content[lang] || {}).forEach(function(key) {
      rows.push({ key: key, lang: lang, value: content[lang][key], label: key, type: 'text' });
    });
  });
  res.json(rows);
});

app.put('/api/content/:key', requireAdmin, function(req, res) {
  var content = readJSON(FILES.content, { en: {}, bg: {} });
  var lang    = req.body.lang || 'en';
  if (!content[lang]) content[lang] = {};
  content[lang][req.params.key] = req.body.value;
  writeJSON(FILES.content, content);
  res.json({ ok: true });
});

// ── Projects ───────────────────────────────────────────────────────────
app.get('/api/projects', function(req, res) {
  var lang     = req.query.lang || 'en';
  var projects = readJSON(FILES.projects, []);
  var result   = projects.sort(function(a,b) { return (a.sort_order||0)-(b.sort_order||0); })
    .map(function(p) {
      var t = (p.translations && p.translations[lang]) || {};
      return {
        id: p.id, key: p.key, status: p.status, badge: p.badge, sort_order: p.sort_order,
        title:          t.title || '',
        client:         t.client || '',
        period:         t.period || '',
        location:       t.location || '',
        contract_value: t.contract_value || '',
        description:    t.description || '',
        scope:          t.scope || [],
        images:         (p.images || []).map(function(i) { return { id: i.id, filename: i.filename, is_main: i.is_main || false }; })
      };
    });
  res.json(result);
});

app.get('/api/projects/:id', requireAdmin, function(req, res) {
  var projects = readJSON(FILES.projects, []);
  var p = projects.find(function(x) { return x.id == req.params.id; });
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

app.post('/api/projects', requireAdmin, function(req, res) {
  var projects = readJSON(FILES.projects, []);
  var safeKey  = ((req.body.key || ('project-' + Date.now()))).toLowerCase().replace(/[^a-z0-9-]/g, '-');
  var maxOrder = projects.reduce(function(m,p) { return Math.max(m, p.sort_order||0); }, 0);
  var newProj  = {
    id: nextId(projects),
    key: safeKey,
    status: req.body.status || 'completed',
    badge:  req.body.badge  || req.body.status || 'completed',
    sort_order: req.body.sort_order || maxOrder + 1,
    translations: req.body.translations || {},
    images: []
  };
  projects.push(newProj);
  writeJSON(FILES.projects, projects);
  res.json({ ok: true, id: newProj.id });
});

app.put('/api/projects/reorder', requireAdmin, function(req, res) {
  var order = req.body.order; // [{id, sort_order}]
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order array required' });
  var projects = readJSON(FILES.projects, []);
  order.forEach(function(item) {
    var p = projects.find(function(x) { return x.id == item.id; });
    if (p) p.sort_order = item.sort_order;
  });
  writeJSON(FILES.projects, projects);
  res.json({ ok: true });
});

app.put('/api/projects/:id', requireAdmin, function(req, res) {
  var projects = readJSON(FILES.projects, []);
  var idx = projects.findIndex(function(p) { return p.id == req.params.id; });
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  projects[idx].status     = req.body.status || projects[idx].status;
  projects[idx].badge      = req.body.badge  || req.body.status || projects[idx].badge;
  projects[idx].sort_order = req.body.sort_order != null ? req.body.sort_order : projects[idx].sort_order;
  if (req.body.translations) {
    if (!projects[idx].translations) projects[idx].translations = {};
    Object.assign(projects[idx].translations, req.body.translations);
  }
  writeJSON(FILES.projects, projects);
  res.json({ ok: true });
});

app.delete('/api/projects/:id', requireAdmin, function(req, res) {
  var projects = readJSON(FILES.projects, []);
  var p = projects.find(function(x) { return x.id == req.params.id; });
  if (p) {
    (p.images || []).forEach(function(img) {
      if (img.filename && img.filename.startsWith('uploads/')) {
        var fp = path.join(ROOT, img.filename);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      }
    });
  }
  writeJSON(FILES.projects, projects.filter(function(x) { return x.id != req.params.id; }));
  res.json({ ok: true });
});

// ── Project images ─────────────────────────────────────────────────────
app.post('/api/projects/:id/images', requireAdmin, upload.array('images', 20), function(req, res) {
  var projects = readJSON(FILES.projects, []);
  var idx = projects.findIndex(function(p) { return p.id == req.params.id; });
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  if (!projects[idx].images) projects[idx].images = [];
  var key      = projects[idx].key;
  var baseId   = nextImgId(projects);
  var maxOrder = projects[idx].images.reduce(function(m,i) { return Math.max(m, i.sort_order||0); }, 0);
  req.files.forEach(function(f, i) {
    projects[idx].images.push({ id: baseId + i, filename: 'uploads/projects/' + key + '/' + f.filename, sort_order: maxOrder + i + 1 });
  });
  writeJSON(FILES.projects, projects);
  res.json({ ok: true, count: req.files.length });
});

app.delete('/api/projects/:id/images/:imgId', requireAdmin, function(req, res) {
  var projects = readJSON(FILES.projects, []);
  var pIdx = projects.findIndex(function(p) { return p.id == req.params.id; });
  if (pIdx === -1) return res.status(404).json({ error: 'Not found' });
  var img = (projects[pIdx].images || []).find(function(i) { return i.id == req.params.imgId; });
  if (!img) return res.status(404).json({ error: 'Image not found' });
  if (img.filename && img.filename.startsWith('uploads/')) {
    var fp = path.join(ROOT, img.filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  projects[pIdx].images = projects[pIdx].images.filter(function(i) { return i.id != req.params.imgId; });
  writeJSON(FILES.projects, projects);
  res.json({ ok: true });
});

app.put('/api/projects/:id/images/:imgId/main', requireAdmin, function(req, res) {
  var projects = readJSON(FILES.projects, []);
  var pIdx = projects.findIndex(function(p) { return p.id == req.params.id; });
  if (pIdx === -1) return res.status(404).json({ error: 'Not found' });
  (projects[pIdx].images || []).forEach(function(i) {
    i.is_main = (i.id == req.params.imgId);
  });
  writeJSON(FILES.projects, projects);
  res.json({ ok: true });
});

// ── Contact form ───────────────────────────────────────────────────────
// Uses sendmail transport (available on cPanel hosting).
// Falls back to SMTP if SMTP_HOST env var is set.
var mailer = nodemailer.createTransport(
  process.env.SMTP_HOST
    ? {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      }
    : { sendmail: true, newline: 'unix', path: '/usr/sbin/sendmail' }
);

app.post('/api/contact', function(req, res) {
  var b = req.body;
  if (!b.firstName || !b.email || !b.message) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }
  var name    = (b.firstName + ' ' + (b.lastName || '')).trim();
  var company = b.company ? ' (' + b.company + ')' : '';
  var mailOpts = {
    from:    '"Technocon Website" <office@techno-con.eu>',
    to:      process.env.CONTACT_TO || 'denkisa@gmail.com',
    replyTo: b.email,
    subject: 'Website enquiry from ' + name + company,
    text: [
      'Name:    ' + name,
      'Company: ' + (b.company || '—'),
      'Email:   ' + b.email,
      '',
      b.message,
    ].join('\n'),
    html: [
      '<p><strong>Name:</strong> '    + name + '</p>',
      '<p><strong>Company:</strong> ' + (b.company || '—') + '</p>',
      '<p><strong>Email:</strong> <a href="mailto:' + b.email + '">' + b.email + '</a></p>',
      '<hr>',
      '<p>' + b.message.replace(/\n/g, '<br>') + '</p>',
    ].join(''),
  };
  mailer.sendMail(mailOpts, function(err) {
    if (err) {
      console.error('Contact mail error:', err);
      return res.status(500).json({ ok: false, error: 'Mail delivery failed' });
    }
    res.json({ ok: true });
  });
});

// ── Partners ───────────────────────────────────────────────────────────
app.get('/api/partners', function(req, res) {
  res.json(readJSON(FILES.partners, []));
});

app.post('/api/partners', requireAdmin, partnerUpload.single('logo'), function(req, res) {
  var partners = readJSON(FILES.partners, []);
  var logo = req.file ? 'uploads/partners/' + req.file.filename : '';
  var p = { id: nextId(partners), name_en: req.body.name_en || '', name_bg: req.body.name_bg || '', logo: logo };
  partners.push(p);
  writeJSON(FILES.partners, partners);
  res.json(p);
});

app.put('/api/partners/:id', requireAdmin, partnerUpload.single('logo'), function(req, res) {
  var partners = readJSON(FILES.partners, []);
  var idx = partners.findIndex(function(x) { return x.id == req.params.id; });
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  partners[idx].name_en = req.body.name_en !== undefined ? req.body.name_en : partners[idx].name_en;
  partners[idx].name_bg = req.body.name_bg !== undefined ? req.body.name_bg : partners[idx].name_bg;
  if (req.file) {
    if (partners[idx].logo && partners[idx].logo.startsWith('uploads/')) {
      var oldPath = path.join(ROOT, partners[idx].logo);
      if (fs.existsSync(oldPath)) try { fs.unlinkSync(oldPath); } catch(e) {}
    }
    partners[idx].logo = 'uploads/partners/' + req.file.filename;
  } else if (req.body.clear_logo) {
    if (partners[idx].logo && partners[idx].logo.startsWith('uploads/')) {
      var clrPath = path.join(ROOT, partners[idx].logo);
      if (fs.existsSync(clrPath)) try { fs.unlinkSync(clrPath); } catch(e) {}
    }
    partners[idx].logo = '';
  }
  writeJSON(FILES.partners, partners);
  res.json(partners[idx]);
});

app.delete('/api/partners/:id', requireAdmin, function(req, res) {
  var partners = readJSON(FILES.partners, []);
  var p = partners.find(function(x) { return x.id == req.params.id; });
  if (p && p.logo && p.logo.startsWith('uploads/')) {
    var oldPath = path.join(ROOT, p.logo);
    if (fs.existsSync(oldPath)) try { fs.unlinkSync(oldPath); } catch(e) {}
  }
  writeJSON(FILES.partners, partners.filter(function(x) { return x.id != req.params.id; }));
  res.json({ ok: true });
});

// ── Start ──────────────────────────────────────────────────────────────
app.listen(PORT, function() {
  console.log('\n  Technocon CMS running at http://localhost:' + PORT);
  console.log('  Admin panel:          http://localhost:' + PORT + '/admin');
  console.log('  Default login:        admin / technocon2026\n');
});
