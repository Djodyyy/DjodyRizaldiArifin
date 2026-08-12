/* =========================================================
   1. DATA — EDIT THIS SECTION ONLY TO UPDATE YOUR PROJECTS
   ========================================================= */
const PROJECTS = [
  {
    title: "Desa Cibening Information System",
    desc: "Information system that manages public information, the budget, staff, and other general information within the Cibening Village Office administration.",
    tags: ["PHP", "MySQL"],
    liveUrl: "https://desa-cibening.com/index.php",
    repoUrl: ""
  },
  {
    title: "IT-System",
    desc: "IT asset inventory system for tracking data and the status of the company's computer equipment.",
    tags: ["PHP", "MySQL"],
    liveUrl: "",
    repoUrl: "https://github.com/Djodyyy/IT-System"
  },
  {
    title: "Shipment, Invoice & Approval System",
    desc: "A web-based application for PT Yudha Karya Barokah that helps the company manage shipping, invoicing, and approval processes.",
    tags: ["PHP", "MySQL"],
    liveUrl: "https://www.yudhakaryabarokah.com/index.php",
    repoUrl: ""
  },
  {
    title: "Dure Family Coffee",
    desc: "A point-of-sale and inventory management system for Dure Family Coffee.",
    tags: ["JavaScript"],
    liveUrl: "",
    repoUrl: "https://github.com/Djodyyy/dure-family-coffee"
  },
  {
    title: "Jawara Group",
    desc: "A management system for handling operations and membership within an MLM (multi-level marketing) business model.",
    tags: ["PHP", "MySQL"],
    liveUrl: "",
    repoUrl: "https://github.com/Djodyyy/Jawara-Group"
  }
];
/* ========================================================= */

document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Starfield ambient background ---------- */
(function starfield(){
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let w, h, stars;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = document.documentElement.scrollHeight;
    const count = Math.floor((w * Math.min(h, 3000)) / 9000);
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

/* ---------- Constellation map for projects ---------- */
(function constellation(){
  const svg = document.getElementById('constellation-svg');
  const cardsWrap = document.getElementById('project-cards');
  const mobileWrap = document.getElementById('project-list-mobile');
  const NS = 'http://www.w3.org/2000/svg';

  const layout = [
    {x: 140, y: 120}, {x: 420, y: 90}, {x: 700, y: 180}, {x: 880, y: 340},
    {x: 560, y: 360}, {x: 260, y: 320}, {x: 60, y: 400}, {x: 780, y: 60}
  ];

  PROJECTS.forEach((p, i) => {
    const pos = layout[i % layout.length];
    p._pos = pos;
  });

  for(let i = 0; i < PROJECTS.length - 1; i++){
    const a = PROJECTS[i]._pos, b = PROJECTS[i+1]._pos;
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
    g.setAttribute('aria-label', 'View project details: ' + p.title);
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

    g.addEventListener('click', () => selectProject(i));
    g.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); selectProject(i); } });

    svg.appendChild(g);
  });

  PROJECTS.forEach((p, i) => {
    cardsWrap.appendChild(buildCard(p, i, true));
    mobileWrap.appendChild(buildCard(p, i, false));
  });

  function buildCard(p, i, isDesktop){
    const card = document.createElement('div');
    card.className = 'project-card' + (isDesktop ? '' : ' visible');
    if(isDesktop) card.id = 'card-' + i;

    const indexEl = document.createElement('div');
    indexEl.className = 'p-index';
    indexEl.textContent = `TARGET ${String(i+1).padStart(2,'0')} / ${String(PROJECTS.length).padStart(2,'0')}`;

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
    if(p.liveUrl){
      const a = document.createElement('a');
      a.href = p.liveUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = 'Watch Live →';
      linksRow.appendChild(a);
    }
    if(p.repoUrl){
      const a = document.createElement('a');
      a.href = p.repoUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = 'Source Code →';
      linksRow.appendChild(a);
    }

    card.append(indexEl, h3, desc, tagRow, linksRow);
    return card;
  }

  function selectProject(i){
    document.querySelectorAll('.const-node').forEach(n => n.classList.remove('active'));
    document.querySelector(`.const-node[data-index="${i}"]`).classList.add('active');
    document.querySelectorAll('#project-cards .project-card').forEach(c => c.classList.remove('visible'));
    document.getElementById('card-' + i).classList.add('visible');
  }

  if(PROJECTS.length) selectProject(0);
})();