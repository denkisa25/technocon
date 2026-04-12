// Technocon CMS Backend
const express    = require('express');
const session    = require('express-session');
const multer     = require('multer');
const bcrypt     = require('bcryptjs');
const Database   = require('better-sqlite3');
const path       = require('path');
const fs         = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// ── Directories ────────────────────────────────────────────────────────
['uploads','data'].forEach(d => {
  if (!fs.existsSync(path.join(ROOT, d))) fs.mkdirSync(path.join(ROOT, d));
});

// ── Database ───────────────────────────────────────────────────────────
const db = new Database(path.join(ROOT, 'data/technocon.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id            INTEGER PRIMARY KEY,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS content (
    key   TEXT NOT NULL,
    lang  TEXT NOT NULL DEFAULT 'en',
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    type  TEXT NOT NULL DEFAULT 'text',
    PRIMARY KEY (key, lang)
  );
  CREATE TABLE IF NOT EXISTS projects (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    key            TEXT UNIQUE NOT NULL,
    sort_order     INTEGER DEFAULT 0,
    status         TEXT DEFAULT 'completed',
    badge          TEXT DEFAULT 'completed',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS project_translations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER NOT NULL,
    lang            TEXT NOT NULL DEFAULT 'en',
    title           TEXT NOT NULL DEFAULT '',
    client          TEXT DEFAULT '',
    period          TEXT DEFAULT '',
    location        TEXT DEFAULT '',
    contract_value  TEXT DEFAULT '',
    description     TEXT DEFAULT '',
    scope           TEXT DEFAULT '[]',
    UNIQUE(project_id, lang),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS project_images (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id  INTEGER NOT NULL,
    filename    TEXT NOT NULL,
    sort_order  INTEGER DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );
`);

// ── Seed admin ─────────────────────────────────────────────────────────
if (!db.prepare('SELECT id FROM admin_users WHERE username=?').get('admin')) {
  db.prepare('INSERT INTO admin_users (username,password_hash) VALUES (?,?)')
    .run('admin', bcrypt.hashSync('technocon2026', 10));
}

// ── Seed content ───────────────────────────────────────────────────────
const CONTENT_SEED = {
  en: [
    ['hero.tag',            'Energy & Industrial Infrastructure — Bulgaria 2026', 'Hero: Tag Line',          'text'],
    ['hero.subtitle',       'Engineering, procurement, construction and project management for the energy and industrial sector across Europe and beyond.', 'Hero: Subtitle', 'textarea'],
    ['stat.1.n',            '€11M+',              'Stat 1: Number',        'text'],
    ['stat.1.l',            'Contract Value',      'Stat 1: Label',         'text'],
    ['stat.2.n',            '4,000+',             'Stat 2: Number',        'text'],
    ['stat.2.l',            'Tracked Items',       'Stat 2: Label',         'text'],
    ['stat.3.n',            '7+',                 'Stat 3: Number',        'text'],
    ['stat.3.l',            'Major Projects',      'Stat 3: Label',         'text'],
    ['stat.4.n',            '3',                  'Stat 4: Number',        'text'],
    ['stat.4.l',            'ISO Certifications', 'Stat 4: Label',         'text'],
    ['services.intro',      'From mechanical installation to full turnkey project execution — Technocon delivers integrated solutions across the complete project lifecycle in energy and industrial infrastructure.', 'Services: Intro', 'textarea'],
    ['about.text',          'A Bulgarian-based company specialising in energy and industrial infrastructure projects across Europe. We combine proven engineering expertise, flexible delivery capacity, and lean team structure to deliver results at every project stage — from mobilisation through commissioning and beyond.', 'About: Description', 'textarea'],
    ['contact.address',     'Osogovo st. 51, 1303 Sofia, Bulgaria', 'Contact: Address',      'text'],
    ['contact.email1',      'dcc@techno-con.eu',  'Contact: Email 1',      'text'],
    ['contact.email2',      'office@techno-con.eu','Contact: Email 2',     'text'],
    ['contact.phone1',      '+359 88 9627304',    'Contact: Phone 1',      'text'],
    ['contact.phone2',      '+359 88 8304414',    'Contact: Phone 2',      'text'],
    ['contact.web',         'www.techno-con.eu',  'Contact: Website',      'text'],
    ['contact.intl.email',  'nea@techno-con.eu',  'Contact: Intl Email',   'text'],
    ['contact.intl.phone',  '+359 888 304 414',   'Contact: Intl Phone',   'text'],
    ['contact.intl.person', 'Evgeny Nosovskiy — Member of the Board', 'Contact: Intl Person', 'text'],
  ],
  bg: [
    ['hero.tag',            'Енергийна и промишлена инфраструктура — България 2026', 'Hero: Tag Line',   'text'],
    ['hero.subtitle',       'Инженеринг, доставки, строителство и управление на проекти за енергийния и индустриален сектор в Европа и извън нея.', 'Hero: Subtitle', 'textarea'],
    ['stat.1.n',            '€11M+',              'Stat 1: Number',        'text'],
    ['stat.1.l',            'Стойност договори',  'Stat 1: Label',         'text'],
    ['stat.2.n',            '4,000+',             'Stat 2: Number',        'text'],
    ['stat.2.l',            'Проследени позиции', 'Stat 2: Label',         'text'],
    ['stat.3.n',            '7+',                 'Stat 3: Number',        'text'],
    ['stat.3.l',            'Основни проекти',    'Stat 3: Label',         'text'],
    ['stat.4.n',            '3',                  'Stat 4: Number',        'text'],
    ['stat.4.l',            'ISO Сертификации',   'Stat 4: Label',         'text'],
    ['services.intro',      'От механичен монтаж до изпълнение на ключови проекти — Техноcon предоставя интегрирани решения в целия жизнен цикъл на проекти в енергийната и промишлената инфраструктура.', 'Services: Intro', 'textarea'],
    ['about.text',          'Българска компания, специализирана в проекти за енергийна и промишлена инфраструктура в Европа. Комбинираме доказан инженерен опит, гъвкав капацитет за изпълнение и компактна структура за постигане на резултати.', 'About: Description', 'textarea'],
    ['contact.address',     'ул. Осогово 51, 1303 София, България', 'Contact: Address',    'text'],
    ['contact.email1',      'dcc@techno-con.eu',  'Contact: Email 1',      'text'],
    ['contact.email2',      'office@techno-con.eu','Contact: Email 2',     'text'],
    ['contact.phone1',      '+359 88 9627304',    'Contact: Phone 1',      'text'],
    ['contact.phone2',      '+359 88 8304414',    'Contact: Phone 2',      'text'],
    ['contact.web',         'www.techno-con.eu',  'Contact: Website',      'text'],
    ['contact.intl.email',  'nea@techno-con.eu',  'Contact: Intl Email',   'text'],
    ['contact.intl.phone',  '+359 888 304 414',   'Contact: Intl Phone',   'text'],
    ['contact.intl.person', 'Евгений Носовски — Член на Съвета на директорите', 'Contact: Intl Person', 'text'],
  ]
};
const insContent = db.prepare('INSERT OR IGNORE INTO content (key,lang,value,label,type) VALUES (?,?,?,?,?)');
for (const [lang, rows] of Object.entries(CONTENT_SEED)) {
  for (const [key,value,label,type] of rows) insContent.run(key, lang, value, label, type);
}

// ── Seed projects ──────────────────────────────────────────────────────
if (db.prepare('SELECT COUNT(*) as c FROM projects').get().c === 0) {
  const insP = db.prepare('INSERT INTO projects (key,status,badge,sort_order) VALUES (?,?,?,?)');
  const insT = db.prepare('INSERT INTO project_translations (project_id,lang,title,client,period,location,contract_value,description,scope) VALUES (?,?,?,?,?,?,?,?,?)');
  const insI = db.prepare('INSERT INTO project_images (project_id,filename,sort_order) VALUES (?,?,?)');

  const DEFAULTS = [
    { key:'checkpoint', status:'ongoing',   badge:'ongoing',
      en:{ title:'Border Checkpoint Reconstruction', client:'Glavbolgarstroy AD', period:'Oct 2025 – Present', location:'Bulgaria', cv:'760 t steel structures', desc:'Strategic infrastructure modernisation of a border checkpoint, with high coordination and execution requirements. Full multi-discipline scope from engineering through construction.', scope:['Detail design','Raw material procurement','Engineering','Steel structures manufacturing','Galvanization','Quality control','Tracking & expediting','Construction works'] },
      bg:{ title:'Реконструкция на граничен контролно-пропускателен пункт', client:'Главболгарстрой АД', period:'Окт 2025 – Настоящем', location:'България', cv:'760 т стоманени конструкции', desc:'Стратегическа модернизация на инфраструктурата на граничен пункт с висока координация и изисквания за изпълнение.', scope:['Работен проект','Доставка на материали','Инженеринг','Производство на стоманени конструкции','Поцинковане','Контрол на качеството','Проследяване','Строително-монтажни работи'] },
      imgs:['brand_assets/CHIREN PRES-1.jpeg','brand_assets/CHIREN PRES-3.jpeg','brand_assets/DJI_0005.JPG'] },
    { key:'balkan', status:'completed', badge:'completed',
      en:{ title:'Bulgarian Gas Pipeline Extension — Balkan Stream', client:'Bulgartransgaz EAD', period:'2019–2021 + O&M ongoing', location:'Bulgaria', cv:'Pipeline route Turkish–Serbian border', desc:'Gas transmission pipeline across Bulgaria (Balkan Stream) including related facilities and commissioning. Currently under ongoing O&M support.', scope:['Materials & equipment supply','Line pipes incl. GRP insulation','Engineering support','Technical coordination','As-built documentation','Testing & commissioning','Start-up assistance','Ongoing O&M support'] },
      bg:{ title:'Разширение на газопровод — Балкански поток', client:'Булгартрансгаз ЕАД', period:'2019–2021 + текуща поддръжка', location:'България', cv:'Трасе турска–сръбска граница', desc:'Газопреносен тръбопровод Балкански поток, включително съоръжения и въвеждане в експлоатация.', scope:['Доставка материали и оборудване','Тръбопроводи с GRP изолация','Инженерна поддръжка','Техническа координация','Документация "as-built"','Изпитвания и пускане','Стартова помощ','Текуща поддръжка'] },
      imgs:['brand_assets/DJI_0012.JPG','brand_assets/DJI_0005.JPG','brand_assets/CHIREN PRES-2.jpeg'] },
    { key:'enefit', status:'completed', badge:'completed',
      en:{ title:'Enefit-280 Construction — Narva Oil Plant', client:'Eesti Energia', period:'2023–2025', location:'Narva, Estonia', cv:'~EUR 11M', desc:'Construction of an oil shale processing plant including the condensation block. 400 t equipment & steel structures, 360 t piping, 50 t stainless steel, 4,300 pipe supports.', scope:['Mechanical installation','Prefabrication','Painting & coating','Welding works','Equipment installation','Electrical works','Automation works','Commissioning assistance'] },
      bg:{ title:'Строителство Enefit-280 — Нарва', client:'Eesti Energia', period:'2023–2025', location:'Нарва, Естония', cv:'~EUR 11M', desc:'Изграждане на завод за преработка на нефтени шисти, включително кондензационен блок.', scope:['Механичен монтаж','Предварителна обработка','Боядисване и покрития','Заваряване','Монтаж оборудване','Електро монтаж','Автоматизация','Помощ при пускане'] },
      imgs:['brand_assets/CHIREN PRES-2.jpeg','brand_assets/CHIREN PRES-1.jpeg','brand_assets/CHIREN PRES-3.jpeg'] },
    { key:'lozen', status:'completed', badge:'completed',
      en:{ title:'Lozen Pig Launcher/Receiver Station Reconstruction', client:'Bulgartransgaz EAD', period:'Oct 2024 – Nov 2025', location:'Lozen, Bulgaria', cv:'~EUR 1M', desc:'Full reconstruction of the Lozen Pig Launcher/Receiver Station including access road, fire protection strip, perimeter drainage, and internal site works on the active 48" gas pipeline.', scope:['Access road reconstruction','Embankment & drainage','Slope stabilisation (geogrid)','Fire protection strip','Reno mattress installation','Trench breakers'] },
      bg:{ title:'Реконструкция на станция Лозен', client:'Булгартрансгаз ЕАД', period:'Окт 2024 – Ноем 2025', location:'Лозен, България', cv:'~EUR 1M', desc:'Цялостна реконструкция на станцията за пуск и приемане на диагностичен уред в Лозен.', scope:['Реконструкция на пътни настилки','Насипи и дренаж','Стабилизация на откоси','Противопожарна лента','Габионни дюшеци','Уплътнения на траншеи'] },
      imgs:['brand_assets/CHIREN PRES-3.jpeg','brand_assets/CHIREN PRES-1.jpeg','brand_assets/CHIREN PRES-2.jpeg'] },
    { key:'chiren', status:'completed', badge:'completed',
      en:{ title:'Chiren UGS Expansion — Aboveground Part', client:'Glavbolgarstroy AD', period:'Jun – Dec 2024', location:'Chiren, Bulgaria', cv:'~EUR 1.5M', desc:'Construction of a new aboveground area for Chiren Underground Gas Storage (UGS), including gas injection and withdrawal systems.', scope:['Welding & installation works','Process equipment','Auxiliary network piping','TEG regeneration','Gas drying installation','Compression systems'] },
      bg:{ title:'Разширение на ПГХ Чирен — Надземна част', client:'Главболгарстрой АД', period:'Юни – Дек 2024', location:'Чирен, България', cv:'~EUR 1.5M', desc:'Изграждане на нова надземна площадка за подземното газохранилище Чирен.', scope:['Заваряване и монтаж','Технологично оборудване','Спомагателни тръбопроводи','ТЕГ регенерация','Газово сушене','Компресорни системи'] },
      imgs:['brand_assets/DJI_0005.JPG','brand_assets/CHIREN PRES-2.jpeg','brand_assets/CHIREN PRES-3.jpeg'] },
    { key:'adnoc', status:'ongoing', badge:'ongoing',
      en:{ title:'ADNOC Procurement Services', client:'ADNOC', period:'Ongoing', location:'UAE', cv:'Procurement', desc:'International procurement services for ADNOC including supply of fire-rated pre-fabricated Store Accommodation Buildings (LGS system) and refurbished ISO-modified container units.', scope:['Fire-rated LGS buildings (12×6m)','20ft storage containers','40ft kitchen/bakery containers','Full fit-out & delivery'] },
      bg:{ title:'Procurement услуги за ADNOC', client:'ADNOC', period:'Текущо', location:'ОАЕ', cv:'Доставки', desc:'Международни procurement услуги за ADNOC, включително доставка на противопожарни сглобяеми сгради и контейнерни модули.', scope:['Противопожарни сгради LGS (12×6м)','20ft контейнери за склад','40ft контейнери кухня/пекарна','Монтаж и доставка'] },
      imgs:['brand_assets/CHIREN PRES-2.jpeg','brand_assets/CHIREN PRES-1.jpeg','brand_assets/DJI_0012.JPG'] },
  ];

  DEFAULTS.forEach((p, i) => {
    const r = insP.run(p.key, p.status, p.badge, i + 1);
    const pid = r.lastInsertRowid;
    for (const lang of ['en','bg']) {
      const t = p[lang];
      insT.run(pid, lang, t.title, t.client, t.period, t.location, t.cv, t.desc, JSON.stringify(t.scope));
    }
    p.imgs.forEach((f, idx) => insI.run(pid, f, idx));
  });
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
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e6)}${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (_, file, cb) => cb(null, /\.(jpe?g|png|webp|gif)$/i.test(file.originalname)),
  limits: { fileSize: 15 * 1024 * 1024 }
});

const requireAdmin = (req, res, next) =>
  req.session?.admin ? next() : res.status(401).json({ error: 'Unauthorized' });

// ── Static ─────────────────────────────────────────────────────────────
app.use('/uploads',      express.static(path.join(ROOT, 'uploads')));
app.use('/brand_assets', express.static(path.join(ROOT, 'brand_assets')));
app.get('/admin', (_, res) => res.sendFile(path.join(ROOT, 'admin.html')));
app.get('/',      (_, res) => res.sendFile(path.join(ROOT, 'index.html')));

// ── Auth ───────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM admin_users WHERE username=?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid credentials' });
  req.session.admin = { id: user.id, username: user.username };
  res.json({ ok: true, username: user.username });
});
app.post('/api/auth/logout', (req, res) => { req.session.destroy(); res.json({ ok: true }); });
app.get('/api/auth/me', (req, res) =>
  req.session?.admin ? res.json({ ok: true, username: req.session.admin.username }) : res.status(401).json({ ok: false })
);
app.put('/api/auth/password', requireAdmin, (req, res) => {
  const { current, newPass } = req.body;
  const user = db.prepare('SELECT * FROM admin_users WHERE id=?').get(req.session.admin.id);
  if (!bcrypt.compareSync(current, user.password_hash))
    return res.status(400).json({ error: 'Current password incorrect' });
  db.prepare('UPDATE admin_users SET password_hash=? WHERE id=?')
    .run(bcrypt.hashSync(newPass, 10), user.id);
  res.json({ ok: true });
});

// ── Content ────────────────────────────────────────────────────────────
app.get('/api/content', (req, res) => {
  const lang = req.query.lang || 'en';
  const rows = db.prepare('SELECT key,value FROM content WHERE lang=?').all(lang);
  const obj = {};
  rows.forEach(r => obj[r.key] = r.value);
  res.json(obj);
});
app.get('/api/content/all', requireAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM content ORDER BY lang, key').all());
});
app.put('/api/content/:key', requireAdmin, (req, res) => {
  const { value, lang = 'en' } = req.body;
  db.prepare('UPDATE content SET value=? WHERE key=? AND lang=?').run(value, req.params.key, lang);
  res.json({ ok: true });
});

// ── Projects ───────────────────────────────────────────────────────────
app.get('/api/projects', (req, res) => {
  const lang = req.query.lang || 'en';
  const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order, id').all();
  const images   = db.prepare('SELECT * FROM project_images ORDER BY sort_order, id').all();
  const trans    = db.prepare('SELECT * FROM project_translations WHERE lang=?').all(lang);
  const transMap = {};
  trans.forEach(t => transMap[t.project_id] = t);
  const result = projects.map(p => {
    const t = transMap[p.id] || {};
    return {
      id: p.id, key: p.key, status: p.status, badge: p.badge, sort_order: p.sort_order,
      title: t.title || '', client: t.client || '', period: t.period || '',
      location: t.location || '', contract_value: t.contract_value || '',
      description: t.description || '',
      scope: JSON.parse(t.scope || '[]'),
      images: images.filter(i => i.project_id === p.id).map(i => ({ id: i.id, filename: i.filename }))
    };
  });
  res.json(result);
});

app.get('/api/projects/:id', requireAdmin, (req, res) => {
  const p = db.prepare('SELECT * FROM projects WHERE id=?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const imgs  = db.prepare('SELECT * FROM project_images WHERE project_id=? ORDER BY sort_order').all(p.id);
  const trans = db.prepare('SELECT * FROM project_translations WHERE project_id=?').all(p.id);
  res.json({ ...p, images: imgs, translations: trans });
});

app.post('/api/projects', requireAdmin, (req, res) => {
  const { key, status, badge, sort_order, translations } = req.body;
  const safeKey = (key || ('project-' + Date.now())).toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM projects').get().m || 0;
  const r = db.prepare('INSERT INTO projects (key,status,badge,sort_order) VALUES (?,?,?,?)')
    .run(safeKey, status || 'completed', badge || status || 'completed', sort_order || maxOrder + 1);
  const pid = r.lastInsertRowid;
  if (translations) {
    const ins = db.prepare('INSERT OR REPLACE INTO project_translations (project_id,lang,title,client,period,location,contract_value,description,scope) VALUES (?,?,?,?,?,?,?,?,?)');
    for (const [lang, t] of Object.entries(translations)) {
      ins.run(pid, lang, t.title||'', t.client||'', t.period||'', t.location||'', t.contract_value||'', t.description||'', JSON.stringify(t.scope||[]));
    }
  }
  res.json({ ok: true, id: pid });
});

app.put('/api/projects/:id', requireAdmin, (req, res) => {
  const { status, badge, sort_order, translations } = req.body;
  db.prepare('UPDATE projects SET status=?,badge=?,sort_order=? WHERE id=?')
    .run(status || 'completed', badge || status || 'completed', sort_order || 0, req.params.id);
  if (translations) {
    const upd = db.prepare('INSERT OR REPLACE INTO project_translations (project_id,lang,title,client,period,location,contract_value,description,scope) VALUES (?,?,?,?,?,?,?,?,?)');
    for (const [lang, t] of Object.entries(translations)) {
      upd.run(req.params.id, lang, t.title||'', t.client||'', t.period||'', t.location||'', t.contract_value||'', t.description||'', JSON.stringify(t.scope||[]));
    }
  }
  res.json({ ok: true });
});

app.delete('/api/projects/:id', requireAdmin, (req, res) => {
  const imgs = db.prepare('SELECT filename FROM project_images WHERE project_id=?').all(req.params.id);
  imgs.forEach(img => {
    if (img.filename.startsWith('uploads/')) {
      const fp = path.join(ROOT, img.filename);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
  });
  db.prepare('DELETE FROM projects WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Project images ─────────────────────────────────────────────────────
app.post('/api/projects/:id/images', requireAdmin, upload.array('images', 20), (req, res) => {
  const pid      = parseInt(req.params.id);
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM project_images WHERE project_id=?').get(pid)?.m || 0;
  const ins      = db.prepare('INSERT INTO project_images (project_id,filename,sort_order) VALUES (?,?,?)');
  req.files.forEach((f, i) => ins.run(pid, `uploads/${f.filename}`, maxOrder + i + 1));
  res.json({ ok: true, count: req.files.length });
});

app.delete('/api/projects/:id/images/:imgId', requireAdmin, (req, res) => {
  const img = db.prepare('SELECT * FROM project_images WHERE id=? AND project_id=?').get(req.params.imgId, req.params.id);
  if (!img) return res.status(404).json({ error: 'Not found' });
  if (img.filename.startsWith('uploads/')) {
    const fp = path.join(ROOT, img.filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  db.prepare('DELETE FROM project_images WHERE id=?').run(img.id);
  res.json({ ok: true });
});

// ── Start ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  Technocon CMS running at http://localhost:${PORT}`);
  console.log(`  Admin panel:          http://localhost:${PORT}/admin`);
  console.log(`  Default login:        admin / technocon2026\n`);
});
