// Technocon CMS Backend — JSON file storage (no native modules, works on Node 10+)
const express = require('express');
const session = require('express-session');
const multer  = require('multer');
const bcrypt  = require('bcryptjs');
const path    = require('path');
const fs      = require('fs');

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

// ── Seed content ───────────────────────────────────────────────────────
if (!fs.existsSync(FILES.content)) {
  writeJSON(FILES.content, {
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
      'services.intro':     'From mechanical installation to full turnkey project execution — Technocon delivers integrated solutions across the complete project lifecycle in energy and industrial infrastructure.',
      'about.text':         'A Bulgarian-based company specialising in energy and industrial infrastructure projects across Europe. We combine proven engineering expertise, flexible delivery capacity, and lean team structure to deliver results at every project stage — from mobilisation through commissioning and beyond.',
      'contact.address':    'Osogovo st. 51, 1303 Sofia, Bulgaria',
      'contact.email1':     'dcc@techno-con.eu',
      'contact.email2':     'office@techno-con.eu',
      'contact.phone1':     '+359 88 9627304',
      'contact.phone2':     '+359 88 8304414',
      'contact.web':        'www.techno-con.eu',
      'contact.intl.email': 'nea@techno-con.eu',
      'contact.intl.phone': '+359 888 304 414',
      'contact.intl.person':'Evgeny Nosovskiy — Member of the Board',
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
      'services.intro':     'От механичен монтаж до изпълнение на ключови проекти — Техноcon предоставя интегрирани решения в целия жизнен цикъл на проекти в енергийната и промишлената инфраструктура.',
      'about.text':         'Българска компания, специализирана в проекти за енергийна и промишлена инфраструктура в Европа. Комбинираме доказан инженерен опит, гъвкав капацитет за изпълнение и компактна структура за постигане на резултати.',
      'contact.address':    'ул. Осогово 51, 1303 София, България',
      'contact.email1':     'dcc@techno-con.eu',
      'contact.email2':     'office@techno-con.eu',
      'contact.phone1':     '+359 88 9627304',
      'contact.phone2':     '+359 88 8304414',
      'contact.web':        'www.techno-con.eu',
      'contact.intl.email': 'nea@techno-con.eu',
      'contact.intl.phone': '+359 888 304 414',
      'contact.intl.person':'Евгений Носовски — Член на Съвета на директорите',
    }
  });
}

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
  destination: path.join(ROOT, 'uploads'),
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
app.use('/brand_assets', express.static(path.join(ROOT, 'brand_assets')));
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
        images:         (p.images || []).map(function(i) { return { id: i.id, filename: i.filename }; })
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
  var baseId   = nextImgId(projects);
  var maxOrder = projects[idx].images.reduce(function(m,i) { return Math.max(m, i.sort_order||0); }, 0);
  req.files.forEach(function(f, i) {
    projects[idx].images.push({ id: baseId + i, filename: 'uploads/' + f.filename, sort_order: maxOrder + i + 1 });
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

// ── Start ──────────────────────────────────────────────────────────────
app.listen(PORT, function() {
  console.log('\n  Technocon CMS running at http://localhost:' + PORT);
  console.log('  Admin panel:          http://localhost:' + PORT + '/admin');
  console.log('  Default login:        admin / technocon2026\n');
});
