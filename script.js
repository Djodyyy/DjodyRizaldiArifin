/* =========================================================
   1. DATA — EDIT THIS SECTION ONLY TO UPDATE YOUR PROJECTS
   ========================================================= */
const PROJECTS = [
  {
    title: "Shipment, Invoice & Approval System",
    desc: "Production system for a logistics company: shipment records, split taxable/non-taxable invoicing, per-invoice and consolidated payments, and PDF/Excel/Word exports. Protected with CSRF validation, server-side role checks, row locking, and database transactions.",
    tags: ["PHP", "MySQL", "JavaScript", "Bootstrap"],
    liveUrl: "https://www.yudhakaryabarokah.com/index.php",
    repoUrl: ""
  },
  {
    title: "Desa Cibening Information System",
    desc: "Village administration and public information system: population data and statistics, officials, development programs, budget transparency, and public content, with Admin, Village Head, and Resident roles.",
    tags: ["PHP", "MySQL", "JavaScript", "Bootstrap"],
    liveUrl: "https://desa-cibening.com/index.php",
    repoUrl: ""
  },
  {
    title: "IT-System",
    desc: "Internal IT asset management app: asset, printer and cartridge inventory, IP address management, maintenance history, role-based access, and reports.",
    tags: ["PHP", "MySQL", "JavaScript", "Bootstrap"],
    liveUrl: "",
    repoUrl: "https://github.com/Djodyyy/IT-System"
  },
  {
    title: "Dure Family Coffee",
    desc: "Cafe cashier and inventory system with cost calculation for daily operations.",
    tags: ["Node.js", "Express", "React", "MySQL"],
    liveUrl: "",
    repoUrl: "https://github.com/Djodyyy/dure-family-coffee"
  },
  {
    title: "Jawara Group",
    desc: "MLM management system: member and non-member pricing, member registration, and a sponsor/upline/downline network tree with levels and ranks.",
    tags: ["PHP", "MySQL", "JavaScript", "Bootstrap"],
    liveUrl: "",
    repoUrl: "https://github.com/Djodyyy/Jawara-Group"
  }
];
/* ========================================================= */

document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Starfield (sized to the viewport, not the whole page) ---------- */
(function starfield(){
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let w, h, stars;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.floor((w * h) / 9000);
    stars = Array.from({length: count}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.1 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.6
    }));
  }

  function draw(t){
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#E9ECF4';
    for(const s of stars){
      const tw = reduceMotion ? 0.8 : 0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase);
      ctx.globalAlpha = 0.15 + tw * 0.55;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if(!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
})();

/* ---------- Projects: every card visible, stars jump to their card ---------- */
(function projects(){
  const svg = document.getElementById('constellation-svg');
  const cardsWrap = document.getElementById('project-cards');
  const NS = 'http://www.w3.org/2000/svg';

  const layout = [
    {x: 140, y: 120}, {x: 420, y: 90}, {x: 700, y: 180}, {x: 880, y: 340},
    {x: 560, y: 360}, {x: 260, y: 320}, {x: 60, y: 400}, {x: 780, y: 60}
  ];

  PROJECTS.forEach((p, i) => { p._pos = layout[i % layout.length]; });

  for(let i = 0; i < PROJECTS.length - 1; i++){
    const a = PROJECTS[i]._pos, b = PROJECTS[i + 1]._pos;
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('class', 'const-line');
    svg.appendChild(line);
  }

  PROJECTS.forEach((p, i) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'const-node');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', 'Go to project: ' + p.title);
    g.dataset.index = i;

    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', p._pos.x);
    circle.setAttribute('cy', p._pos.y);
    circle.setAttribute('r', 6);
    g.appendChild(circle);

    const label = document.createElementNS(NS, 'text');
    label.setAttribute('x', p._pos.x + 14);
    label.setAttribute('y', p._pos.y + 4);
    label.textContent = p.title;
    g.appendChild(label);

    g.addEventListener('click', () => selectProject(i, true));
    g.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); selectProject(i, true); }
    });
    svg.appendChild(g);
  });

  PROJECTS.forEach((p, i) => cardsWrap.appendChild(buildCard(p, i)));

  function buildCard(p, i){
    const card = document.createElement('div');
    card.className = 'project-card visible';
    card.id = 'card-' + i;

    const indexEl = document.createElement('div');
    indexEl.className = 'p-index';
    indexEl.textContent = `PROJECT ${String(i + 1).padStart(2, '0')} / ${String(PROJECTS.length).padStart(2, '0')}`;

    const h3 = document.createElement('h3');
    h3.textContent = p.title;

    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = p.desc;

    const tagRow = document.createElement('div');
    tagRow.className = 'tag-row';
    p.tags.forEach(t => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = t;
      tagRow.appendChild(tag);
    });

    const linksRow = document.createElement('div');
    linksRow.className = 'p-links';
    [[p.liveUrl, 'Live site →'], [p.repoUrl, 'Source code →']].forEach(([url, text]) => {
      if(!url) return;
      const a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = text;
      linksRow.appendChild(a);
    });

    card.append(indexEl, h3, desc, tagRow, linksRow);
    return card;
  }

  function selectProject(i, scroll){
    document.querySelectorAll('.const-node').forEach(n => n.classList.toggle('active', n.dataset.index === String(i)));
    document.querySelectorAll('.project-card').forEach(c => c.classList.toggle('selected', c.id === 'card-' + i));
    if(scroll){
      document.getElementById('card-' + i).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }
  }

  if (PROJECTS.length) selectProject(0, false);
  
})();

