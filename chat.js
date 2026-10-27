/* =========================================================
   ORBIT — scripted space-mascot assistant.
   Load AFTER script.js (reads the global PROJECTS array).
   No backend, no inline styles/scripts -> compatible with your CSP.
   It is NOT a live human chat and the UI says so.
   ========================================================= */
(function orbit(){
  if (typeof PROJECTS === 'undefined') return;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, cls, text){
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  const href = (sel, fb) => { const a = $(sel); return a ? a.href : fb; };

  /* Single source of truth: pull contact links from the page itself */
  const LINKS = {
    wa:   href('a[href^="https://wa.me"]', '#contact'),
    mail: href('a[href^="mailto:"]', '#contact'),
    gh:   href('a[href*="github.com"]', '#contact'),
    li:   href('a[href*="linkedin.com"]', '#contact'),
    cv:   href('a[download]', '#contact')
  };
  const contactLinks = [
    { label: 'WhatsApp', href: LINKS.wa, ext: true },
    { label: 'Email', href: LINKS.mail },
    { label: 'GitHub', href: LINKS.gh, ext: true },
    { label: 'LinkedIn', href: LINKS.li, ext: true }
  ];

  const MASCOT = '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
    '<line x1="32" y1="8" x2="32" y2="15" stroke="#B98F52" stroke-width="2"/>' +
    '<circle cx="32" cy="6" r="3" fill="#E8B86D"/>' +
    '<circle cx="32" cy="38" r="22" fill="#131A2B" stroke="#E9ECF4" stroke-width="2"/>' +
    '<ellipse cx="32" cy="37" rx="15" ry="12" fill="#0B0E1A" stroke="#6B78C4" stroke-width="1.5"/>' +
    '<circle cx="26" cy="36" r="2.4" fill="#E8B86D"/><circle cx="38" cy="36" r="2.4" fill="#E8B86D"/>' +
    '<path d="M27 42 Q32 46 37 42" fill="none" stroke="#E8B86D" stroke-width="1.5" stroke-linecap="round"/></svg>';

  /* ---------- Build UI ---------- */
  const fab = el('button', 'orbit-fab');
  fab.type = 'button';
  fab.setAttribute('aria-label', 'Open chat with Orbit, the portfolio assistant');
  fab.setAttribute('aria-expanded', 'false');
  fab.setAttribute('aria-controls', 'orbit-panel');
  fab.innerHTML = MASCOT;

  const panel = el('section', 'orbit-panel');
  panel.id = 'orbit-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Chat with Orbit');

  const head = el('div', 'orbit-head');
  const avatar = el('span', 'orbit-avatar'); avatar.innerHTML = MASCOT;
  const titles = el('div', 'orbit-titles');
  titles.append(el('strong', null, 'ORBIT'), el('span', null, 'Automated assistant · answers about Djody'));
  const closeBtn = el('button', 'orbit-close', '×');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close chat');
  head.append(avatar, titles, closeBtn);

  const log = el('div', 'orbit-log');
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');

  const chips = el('div', 'orbit-chips');

  const form = el('form', 'orbit-form');
  form.setAttribute('autocomplete', 'off');
  const input = el('input');
  input.type = 'text'; input.maxLength = 160;
  input.placeholder = 'Ask about projects, stack, contact...';
  input.setAttribute('aria-label', 'Your message');
  const send = el('button', null, 'Send');
  send.type = 'submit';
  form.append(input, send);

  const note = el('p', 'orbit-note', 'Scripted bot, not a live person. For a real reply, use WhatsApp or email.');

  panel.append(head, log, chips, form, note);
  const hint = el('button', 'orbit-hint', 'Chat with Orbit: projects, stack, contact');
  hint.type = 'button';
  hint.hidden = true;

  document.body.append(fab, panel, hint);

  /* ---------- Messaging ---------- */
  function addMsg(who, text, links){
    const m = el('div', 'orbit-msg orbit-' + who);
    m.appendChild(el('p', null, text));
    if (links && links.length){
      const row = el('div', 'orbit-links');
      links.forEach(l => {
        const a = el('a', null, l.label);
        a.href = l.href;
        if (l.ext){ a.target = '_blank'; a.rel = 'noopener noreferrer'; }
        if (l.href.startsWith('#')) a.dataset.local = '1';
        row.appendChild(a);
      });
      m.appendChild(row);
    }
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
  }

  let chain = Promise.resolve();
  function say(text, links){
    chain = chain.then(() => new Promise(res => {
      const t = el('div', 'orbit-msg orbit-bot orbit-typing');
      t.append(el('span'), el('span'), el('span'));
      t.setAttribute('aria-hidden', 'true');
      log.appendChild(t);
      log.scrollTop = log.scrollHeight;
      setTimeout(() => { t.remove(); addMsg('bot', text, links); res(); },
                 reduce ? 0 : Math.min(700, 250 + text.length * 5));
    }));
    return chain;
  }

  function setChips(items){
    chain = chain.then(() => {
      chips.textContent = '';
      items.forEach(([label, fn]) => {
        const b = el('button', 'orbit-chip', label);
        b.type = 'button';
        b.addEventListener('click', () => { addMsg('user', label); fn(); });
        chips.appendChild(b);
      });
    });
  }

  /* ---------- Content (derived from the page, not duplicated) ---------- */
  const trunc = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;

  function projectDetail(i){
    const p = PROJECTS[i];
    const links = [{ label: 'See card', href: '#card-' + i }];
    if (p.liveUrl) links.push({ label: 'Live site', href: p.liveUrl, ext: true });
    if (p.repoUrl) links.push({ label: 'Source code', href: p.repoUrl, ext: true });
    say(p.title + ' — ' + p.desc + ' Stack: ' + p.tags.join(', ') + '.', links);
    menu();
  }

  const intents = [
    { id: 'projects', label: 'Projects', keys: ['project', 'proyek', 'portfolio', 'work', 'built', 'karya'],
      run(){
        say('Djody has ' + PROJECTS.length + ' projects listed here. Pick one for details.');
        chain = chain.then(() => {
          chips.textContent = '';
          PROJECTS.forEach((p, i) => {
            const b = el('button', 'orbit-chip', trunc(p.title, 26));
            b.type = 'button';
            b.addEventListener('click', () => { addMsg('user', p.title); projectDetail(i); });
            chips.appendChild(b);
          });
          const back = el('button', 'orbit-chip orbit-chip-dim', '← Menu');
          back.type = 'button';
          back.addEventListener('click', menu);
          chips.appendChild(back);
        });
      } },
    { id: 'stack', label: 'Tech stack', keys: ['stack', 'skill', 'tech', 'language', 'php', 'laravel', 'react', 'node', 'mysql', 'bahasa'],
      run(){
        const rows = $$('.instrument-row').map(r => r.children[0].textContent + ': ' + r.children[1].textContent);
        say(rows.join('\n'));
        menu();
      } },
    { id: 'experience', label: 'Experience', keys: ['experience', 'pengalaman', 'career', 'job', 'history', 'role', 'kerja'],
      run(){
        const rows = $$('.timeline-item').map(t =>
          $('.timeline-period', t).textContent + ' · ' + $('h3', t).textContent + ' @ ' +
          $('.timeline-company', t).textContent.split(' · ')[0]);
        say(rows.join('\n'), [{ label: 'Full timeline', href: '#experience' }]);
        menu();
      } },
    { id: 'about', label: 'Who is Djody?', keys: ['who', 'about', 'siapa', 'tentang', 'background'],
      run(){
        const p = $('.about-text p');
        say(p ? p.textContent : 'Full-stack web developer based in Purwakarta, Indonesia.', [{ label: 'About section', href: '#about' }]);
        menu();
      } },
    { id: 'availability', label: 'Availability', keys: ['hire', 'hiring', 'available', 'availability', 'open to', 'remote', 'freelance', 'rate', 'salary', 'gaji', 'tarif'],
      run(){
        say('Open to remote full-stack roles, freelance projects, and collaboration. Rates, notice period, and timezone overlap are not something I can answer. Ask Djody directly.', contactLinks.slice(0, 2));
        menu();
      } },
    { id: 'cv', label: 'Download CV', keys: ['cv', 'resume', 'resumé'],
      run(){ say('Here is the CV (PDF).', [{ label: 'Download CV', href: LINKS.cv }]); menu(); } },
    { id: 'contact', label: 'Contact', keys: ['contact', 'kontak', 'email', 'whatsapp', 'wa', 'reach', 'hubungi', 'github', 'linkedin'],
      run(){ say('Fastest way to get a real reply:', contactLinks); menu(); } }
  ];

  function menu(){
    setChips(intents.map(it => [it.label, () => it.run()]));
  }

  function route(text){
    const q = text.toLowerCase();
    const pi = PROJECTS.findIndex(p => q.includes(p.title.toLowerCase()));
    if (pi >= 0) return projectDetail(pi);
    if (/^(hi|hello|hey|halo|hai|yo)\b/.test(q)){
      say('Hello. Pick a topic below or type a question.'); return menu();
    }
    const hit = intents.find(it => it.keys.some(k => new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(q)));
    if (hit) return hit.run();
    say("I only know what is on this page, and I didn't catch that. Pick a topic, or message Djody directly.", contactLinks.slice(0, 2));
    menu();
  }

  /* ---------- Open / close ---------- */
  let greeted = false;
  function setOpen(open){
    panel.hidden = !open;
    fab.setAttribute('aria-expanded', String(open));
    if (open) place();
    if (open){
      if (!greeted){
        greeted = true;
        say("Hi, I'm Orbit, the signal relay for this site. I can walk you through Djody's projects, stack, and experience.");
        menu();
      }
      if (window.matchMedia('(hover: hover)').matches) input.focus();
    } else {
      fab.focus();
    }
  }

  /* Discoverability hint: shown once per session, auto-hides */
  function hideHint(){
    hint.hidden = true;
    try { sessionStorage.setItem('orbitHint', '1'); } catch (e) {}
  }
  let hintSeen = false;
  try { hintSeen = sessionStorage.getItem('orbitHint') === '1'; } catch (e) {}
  if (!hintSeen){
    setTimeout(() => { if (panel.hidden){ hint.hidden = false; place(); } }, 2500);
    setTimeout(() => { if (!hint.hidden) hideHint(); }, 16000);
  }
  hint.addEventListener('click', () => { hideHint(); setOpen(true); });

  fab.addEventListener('click', () => {
    if (suppressClick) return; // this click is just the end of a drag
    hideHint();
    setOpen(panel.hidden);
  });
  closeBtn.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) setOpen(false); });
  log.addEventListener('click', e => {
    const a = e.target.closest('a[data-local]');
    if (a && window.matchMedia('(max-width: 640px)').matches) panel.hidden = true, fab.setAttribute('aria-expanded', 'false');
  });

  /* ---------- Draggable mascot ----------
     Drag the mascot button (or the panel header on desktop).
     Panel and hint follow the mascot. Position persists in localStorage.
     Uses el.style.* (CSSOM), which your CSP allows; inline style="" attributes it would not. */
  const MARGIN = 4;
  const isMobile = () => window.matchMedia('(max-width: 480px)').matches;
  let suppressClick = false;

  function clampPos(x, y){
    return [
      Math.min(Math.max(MARGIN, x), window.innerWidth - fab.offsetWidth - MARGIN),
      Math.min(Math.max(MARGIN, y), window.innerHeight - fab.offsetHeight - MARGIN)
    ];
  }

  function place(){
    const f = fab.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight, m = 8, gap = 12;

    if (!panel.hidden){
      if (isMobile()){
        // bottom sheet handled by CSS
        panel.style.left = panel.style.top = panel.style.right = panel.style.bottom = '';
      } else {
        const w = panel.offsetWidth, h = panel.offsetHeight;
        let left = f.right - w, top;
        if (f.top - gap - h >= m){ top = f.top - gap - h; }                 // above
        else if (f.bottom + gap + h <= vh - m){ top = f.bottom + gap; }     // below
        else {                                                              // beside
          left = (f.left - gap - w >= m) ? f.left - gap - w : f.right + gap;
          top = f.top + f.height - h;
        }
        left = Math.min(Math.max(m, left), vw - w - m);
        top = Math.min(Math.max(m, top), vh - h - m);
        panel.style.left = left + 'px'; panel.style.top = top + 'px';
        panel.style.right = 'auto'; panel.style.bottom = 'auto';
      }
    }

    if (!hint.hidden){
      const w = hint.offsetWidth, h = hint.offsetHeight;
      let left = f.left - 10 - w;
      if (left < m) left = f.right + 10;
      left = Math.min(Math.max(m, left), vw - w - m);
      const top = Math.min(Math.max(m, f.top + (f.height - h) / 2), vh - h - m);
      hint.style.left = left + 'px'; hint.style.top = top + 'px';
      hint.style.right = 'auto'; hint.style.bottom = 'auto';
    }
  }

  function moveFab(x, y){
    const p = clampPos(x, y);
    fab.style.left = p[0] + 'px'; fab.style.top = p[1] + 'px';
    fab.style.right = 'auto'; fab.style.bottom = 'auto';
    place();
  }

  function savePos(){
    const r = fab.getBoundingClientRect();
    try { localStorage.setItem('orbitPos', JSON.stringify({ x: r.left, y: r.top })); } catch (e) {}
  }

  function resetPos(){
    fab.style.left = fab.style.top = fab.style.right = fab.style.bottom = '';
    try { localStorage.removeItem('orbitPos'); } catch (e) {}
    place();
  }

  function makeDraggable(handle, opts){
    let s = null;
    handle.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (opts.ignore && e.target.closest(opts.ignore)) return;
      if (opts.desktopOnly && isMobile()) return;
      const r = fab.getBoundingClientRect();
      s = { id: e.pointerId, px: e.clientX, py: e.clientY, fx: r.left, fy: r.top, drag: false };
    });
    handle.addEventListener('pointermove', e => {
      if (!s || e.pointerId !== s.id) return;
      const dx = e.clientX - s.px, dy = e.clientY - s.py;
      if (!s.drag){
        if (Math.hypot(dx, dy) < 6) return; // below threshold = still a click
        s.drag = true;
        handle.setPointerCapture(s.id);
        handle.classList.add('orbit-dragging');
        hideHint();
      }
      moveFab(s.fx + dx, s.fy + dy);
    });
    const end = e => {
      if (!s || e.pointerId !== s.id) return;
      if (s.drag){
        handle.classList.remove('orbit-dragging');
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 50);
        savePos();
      }
      s = null;
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }

  makeDraggable(fab, {});
  makeDraggable(head, { ignore: '.orbit-close', desktopOnly: true });
  head.addEventListener('dblclick', e => { if (!e.target.closest('.orbit-close')) resetPos(); });

  // Keyboard: Shift + Arrow keys move the mascot
  fab.addEventListener('keydown', e => {
    const step = 24;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!e.shiftKey || !d) return;
    e.preventDefault();
    const r = fab.getBoundingClientRect();
    moveFab(r.left + d[0], r.top + d[1]);
    savePos();
  });

  window.addEventListener('resize', () => {
    if (fab.style.left){ const r = fab.getBoundingClientRect(); moveFab(r.left, r.top); }
    else place();
  });

  try {
    const saved = JSON.parse(localStorage.getItem('orbitPos'));
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) moveFab(saved.x, saved.y);
  } catch (e) {}

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMsg('user', text);
    route(text);
  });
})();