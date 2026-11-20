/* =========================================================
   THE HOME OF OUR HEARTS – main.js
   Bụi vàng · Nhạc · Phong thư · Reveal · Tương tác · Kết thúc
   ========================================================= */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     CẤU HÌNH – sửa ở đây
  --------------------------------------------------------- */
  const CONFIG = {
    musicSrc: 'assets/music/bg.mp3',     // đặt file nhạc vào đây
    musicVolume: 0.45,
    doors: {
      dad: {
        kicker: 'Door 01',
        title: 'Gửi ba',
        thanks: '[Một lời cảm ơn dành cho ba]',
        wish: '[Một lời chúc dành cho ba]',
        gift: '[Một điều hai anh em muốn dành cho ba]'
      },
      mom: {
        kicker: 'Door 02',
        title: 'Gửi mẹ',
        thanks: '[Một lời cảm ơn dành cho mẹ]',
        wish: '[Một lời chúc dành cho mẹ]',
        gift: '[Một điều hai anh em muốn dành cho mẹ]'
      },
      us: {
        kicker: 'Door 03',
        title: 'Cho cả nhà mình',
        thanks: 'Những bữa cơm đủ bốn người.',
        wish: 'Những chuyến đi cùng nhau, những khoảnh khắc bên nhau.',
        gift: 'Và thật nhiều kỷ niệm mới đang chờ được viết tiếp.'
      }
    }
  };

  /* ---------------------------------------------------------
     1. BỤI VÀNG TOÀN TRANG
  --------------------------------------------------------- */
  (function dust() {
    const c = $('#dust');
    if (!c || reduceMotion) return;
    const ctx = c.getContext('2d');
    let w, h, dpr, parts = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.width = innerWidth * dpr;
      h = c.height = innerHeight * dpr;
      const n = innerWidth < 600 ? 28 : 55;
      parts = Array.from({ length: n }, () => spawn(true));
    }
    function spawn(rand) {
      return {
        x: Math.random() * w,
        y: rand ? Math.random() * h : h + 10,
        r: (Math.random() * 1.6 + 0.4) * dpr,
        vy: (Math.random() * 0.25 + 0.08) * dpr,
        vx: (Math.random() - 0.5) * 0.15 * dpr,
        a: Math.random() * 0.6 + 0.2,
        t: Math.random() * 6.28
      };
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y -= p.vy; p.x += p.vx + Math.sin(p.t += 0.01) * 0.2 * dpr;
        if (p.y < -10) Object.assign(p, spawn(false));
        const tw = 0.6 + Math.sin(p.t * 3) * 0.4;
        ctx.beginPath();
        ctx.fillStyle = `rgba(230,196,130,${p.a * tw})`;
        ctx.shadowBlur = 8 * dpr; ctx.shadowColor = 'rgba(230,196,130,.9)';
        ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    addEventListener('resize', resize);
    resize(); tick();
  })();

  /* ---------------------------------------------------------
     2. NHẠC NỀN (không tự phát khi tải trang)
  --------------------------------------------------------- */
  const Music = (function () {
    const btn = $('#musicBtn');
    const label = $('.music-label', btn);
    const audio = new Audio();
    audio.src = CONFIG.musicSrc;
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = 0;
    let wanted = false, failed = false, fadeId;

    audio.addEventListener('error', () => {
      failed = true; label.textContent = 'Chưa có nhạc';
      btn.classList.remove('playing');
    });

    function fadeTo(target, ms = 1500) {
      clearInterval(fadeId);
      const start = audio.volume, steps = 30, dt = ms / steps; let i = 0;
      fadeId = setInterval(() => {
        i++; audio.volume = Math.min(1, Math.max(0, start + (target - start) * (i / steps)));
        if (i >= steps) { clearInterval(fadeId); if (target === 0) audio.pause(); }
      }, dt);
    }
    function play() {
      if (failed) return;
      wanted = true;
      audio.play().then(() => {
        btn.classList.add('playing'); label.textContent = 'Nhạc: bật';
        fadeTo(CONFIG.musicVolume);
        try { sessionStorage.setItem('music', 'on'); } catch (e) {}
      }).catch(() => { btn.classList.remove('playing'); label.textContent = 'Nhạc: tắt'; });
    }
    function pause() {
      wanted = false; fadeTo(0, 800);
      btn.classList.remove('playing'); label.textContent = 'Nhạc: tắt';
      try { sessionStorage.setItem('music', 'off'); } catch (e) {}
    }
    btn.addEventListener('click', () => (audio.paused || !wanted ? play() : pause()));
    return { play, pause, setVolume: v => { if (wanted) fadeTo(v, 1200); } };
  })();

  /* ---------------------------------------------------------
     3. PHONG THƯ MỞ ĐẦU
  --------------------------------------------------------- */
  (function intro() {
    const intro = $('#intro'), env = $('#envelope'), tap = $('#introTap'), btn = $('#enterBtn');
    let opened = false;
    function open() {
      if (opened) return; opened = true;
      env.classList.add('open');
      tap.style.display = 'none';
      let pref = null; try { pref = sessionStorage.getItem('music'); } catch (e) {}
      if (pref !== 'off') Music.play();     // người dùng vừa bấm nên trình duyệt cho phép
      setTimeout(() => btn.classList.remove('hidden'), 1900);
    }
    env.addEventListener('click', open);
    env.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    btn.addEventListener('click', () => {
      intro.classList.add('leaving');
      document.body.classList.remove('locked');
      window.scrollTo(0, 0);
      setTimeout(() => intro.remove(), 1800);
    });
  })();

  /* ---------------------------------------------------------
     4. REVEAL KHI CUỘN + stagger
  --------------------------------------------------------- */
  (function reveal() {
    $$('.wrap').forEach(wrap => {
      $$('.reveal', wrap).forEach((el, i) => el.style.setProperty('--d', (Math.min(i, 8) * 0.12) + 's'));
    });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(el => io.observe(el));

    // Role switch (màn 06)
    const rs = $('#roleSwitch');
    if (rs) {
      const o = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { setTimeout(() => rs.classList.add('in'), 900); o.disconnect(); }
      }), { threshold: 0.6 });
      o.observe(rs);
    }

    // Definitions (màn 13): hiện lần lượt
    const defs = $$('.def');
    defs.forEach((d, i) => d.style.setProperty('--d', (i * 1.1) + 's'));
  })();

  /* ---------------------------------------------------------
     5. PROGRESS BAR + CHAPTER NAV + nhạc nhỏ dần ở giữa
  --------------------------------------------------------- */
  (function nav() {
    const bar = $('#progress span');
    const links = $$('#chapterNav a');
    const targets = links.map(a => $(a.getAttribute('href')));
    function onScroll() {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
      let cur = 0;
      targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < innerHeight * 0.5) cur = i; });
      links.forEach((a, i) => a.classList.toggle('active', i === cur));
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    // cuộn mượt khi bấm chấm
    links.forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      const t = $(a.getAttribute('href')); if (t) t.scrollIntoView({ behavior: 'smooth' });
    }));
  })();

  /* ---------------------------------------------------------
     6. Ghi chú (màn 12) & thẻ "điều chưa nói" (màn 16)
  --------------------------------------------------------- */
  $$('.note-card').forEach(c => c.addEventListener('click', () => c.classList.toggle('open')));
  $$('.unsaid-card').forEach(c => c.addEventListener('click', () => c.classList.toggle('open')));

  /* ---------------------------------------------------------
     7. Timeline fill (màn 17)
  --------------------------------------------------------- */
  (function timeline() {
    const tl = $('#timeline'), fill = $('#tlFill');
    if (!tl) return;
    function upd() {
      const r = tl.getBoundingClientRect();
      const p = (innerHeight * 0.6 - r.top) / r.height;
      fill.style.height = Math.max(0, Math.min(1, p)) * 100 + '%';
    }
    addEventListener('scroll', upd, { passive: true }); upd();
  })();

  /* ---------------------------------------------------------
     8. Chòm sao 4 điểm sáng (màn 14)
  --------------------------------------------------------- */
  (function constellation() {
    const c = $('#constellation'); if (!c) return;
    const sec = c.parentElement, ctx = c.getContext('2d');
    let w, h, dpr, visible = false, t0 = 0, stars = [], bg = [];
    const names = ['Ba', 'Mẹ', 'Anh hai', 'Em'];
    const rel = [[0.22, 0.46], [0.42, 0.30], [0.62, 0.52], [0.80, 0.34]];

    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.width = sec.clientWidth * dpr; h = c.height = sec.clientHeight * dpr;
      stars = rel.map((p, i) => ({ x: p[0] * w, y: p[1] * h, n: names[i] }));
      bg = Array.from({ length: 120 }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 * dpr + .3, p: Math.random() * 6 }));
    }
    function star(x, y, r, a) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
      g.addColorStop(0, `rgba(255,240,190,${a})`); g.addColorStop(1, 'rgba(255,240,190,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 6, 0, 6.283); ctx.fill();
      ctx.fillStyle = `rgba(255,250,230,${a})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
    }
    function draw(ts) {
      if (!visible) return;
      if (!t0) t0 = ts;
      const t = (ts - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      bg.forEach(s => { ctx.fillStyle = `rgba(255,255,255,${.25 + Math.sin(t * 1.5 + s.p) * .2})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); });

      // đường nối vẽ dần
      const prog = Math.min(1, Math.max(0, (t - 1.2) / 4)); // 0..1
      const segs = stars.length - 1, total = prog * segs;
      ctx.strokeStyle = 'rgba(230,196,130,.55)'; ctx.lineWidth = 1.2 * dpr; ctx.shadowColor = 'rgba(230,196,130,.8)'; ctx.shadowBlur = 8 * dpr;
      for (let i = 0; i < segs; i++) {
        const f = Math.min(1, Math.max(0, total - i)); if (f <= 0) break;
        const a = stars[i], b = stars[i + 1];
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f); ctx.stroke();
      }
      ctx.shadowBlur = 0;
      // 4 ngôi sao
      stars.forEach((s, i) => {
        const appear = Math.min(1, Math.max(0, (t - i * 0.5) / 1.2));
        const tw = .75 + Math.sin(t * 2 + i) * .25;
        star(s.x, s.y, (4.5 + Math.sin(t * 2 + i) * 1) * dpr, appear * tw);
        ctx.fillStyle = `rgba(243,232,213,${appear})`;
        ctx.font = `${15 * dpr}px "Cormorant Garamond",serif`; ctx.textAlign = 'center';
        ctx.fillText(s.n, s.x, s.y + 30 * dpr);
      });
      requestAnimationFrame(draw);
    }
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !visible) { visible = true; t0 = 0; requestAnimationFrame(draw); }
      else if (!e.isIntersecting) visible = false;
    }), { threshold: 0.25 }).observe(sec);
    addEventListener('resize', size); size();
  })();

  /* ---------------------------------------------------------
     9. Chương VII – Cuốn sách & ba cánh cửa
  --------------------------------------------------------- */
  (function unwritten() {
    const book = $('#magicBook'), doors = $('#doors'), hint = $('#bookHint'),
          tagline = $('.book-tagline'), tbc = $('#tbc'),
          modal = $('#doorModal'), dmKicker = $('#dmKicker'), dmTitle = $('#dmTitle'), dmBody = $('#dmBody');
    if (!book) return;
    const opened = new Set();

    book.addEventListener('click', () => {
      book.classList.add('opened');
      hint.classList.add('hidden'); tagline.classList.add('hidden');
      setTimeout(() => doors.classList.remove('hidden'), 650);
    });

    function openModal(key) {
      const d = CONFIG.doors[key];
      dmKicker.textContent = d.kicker; dmTitle.textContent = d.title;
      dmBody.innerHTML =
        `<p><span class="label">Lời cảm ơn</span>${d.thanks}</p>` +
        `<p><span class="label">Lời chúc</span>${d.wish}</p>` +
        `<p><span class="label">Điều chúng con muốn dành tặng</span>${d.gift}</p>`;
      modal.classList.remove('hidden'); modal.setAttribute('aria-hidden', 'false');
    }
    function closeModal() {
      modal.classList.add('hidden'); modal.setAttribute('aria-hidden', 'true');
      if (opened.size === 3 && tbc.classList.contains('hidden')) {
        setTimeout(() => {
          $$('.door').forEach(d => d.classList.remove('opened'));
          setTimeout(() => {
            doors.classList.add('hidden');
            tbc.classList.remove('hidden');
            tbc.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 1200);
        }, 500);
      }
    }
    $$('.door').forEach(d => d.addEventListener('click', () => {
      const k = d.dataset.door; d.classList.add('opened'); opened.add(k);
      setTimeout(() => openModal(k), 900);
    }));
    $('#dmClose').addEventListener('click', closeModal);
    $('.dm-backdrop', modal).addEventListener('click', closeModal);
    addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal(); });
  })();

  /* ---------------------------------------------------------
     10. KẾT THÚC – hoa kết thành trái tim
  --------------------------------------------------------- */
  (function ending() {
    const sec = $('#ch8'), c = $('#heartCanvas'); if (!sec || !c) return;
    const ctx = c.getContext('2d');
    let w, h, dpr, flowers = [], running = false, t0 = 0, played = false;
    const COUNT_DESK = 120, COUNT_MOB = 70;

    function heartPt(t) { // đường cong trái tim chuẩn
      return {
        x: 16 * Math.pow(Math.sin(t), 3),
        y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
      };
    }
    function build() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = c.width = sec.clientWidth * dpr; h = c.height = sec.clientHeight * dpr;
      const n = innerWidth < 600 ? COUNT_MOB : COUNT_DESK;
      const scale = Math.min(w, h) / 46;
      const cx = w / 2, cy = h * 0.42;
      flowers = Array.from({ length: n }, (_, i) => {
        const p = heartPt((i / n) * Math.PI * 2);
        const edge = Math.floor(Math.random() * 4);
        const sx = edge < 2 ? Math.random() * w : (edge === 2 ? -40 : w + 40);
        const sy = edge < 2 ? (edge === 0 ? -40 : h + 40) : Math.random() * h;
        return {
          sx, sy, tx: cx + p.x * scale, ty: cy + p.y * scale,
          r: (7 + Math.random() * 6) * dpr, rot: Math.random() * 6.28, spin: (Math.random() - .5) * .04,
          delay: Math.random() * 1.6, hue: Math.random() < .55 ? 0 : 1
        };
      });
    }
    function rose(x, y, r, rot, hue, a) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a;
      const col = hue ? ['#c75b6b', '#8e2b3d'] : ['#9a2e43', '#5a1a28'];
      for (let i = 0; i < 5; i++) {
        ctx.rotate(1.2566);
        ctx.fillStyle = col[i % 2];
        ctx.beginPath(); ctx.ellipse(r * .55, 0, r * .62, r * .4, 0, 0, 6.283); ctx.fill();
      }
      ctx.fillStyle = '#e6c482'; ctx.beginPath(); ctx.arc(0, 0, r * .28, 0, 6.283); ctx.fill();
      ctx.restore();
    }
    const ease = t => 1 - Math.pow(1 - t, 3);

    function frame(ts) {
      if (!running) return;
      if (!t0) t0 = ts;
      const t = (ts - t0) / 1000;
      ctx.clearRect(0, 0, w, h);

      // quầng sáng vàng lan toả sau khi trái tim hoàn thành
      const glow = Math.min(1, Math.max(0, (t - 3) / 2.5));
      if (glow > 0) {
        const g = ctx.createRadialGradient(w / 2, h * .42, 0, w / 2, h * .42, Math.min(w, h) * .6);
        g.addColorStop(0, `rgba(230,196,130,${.32 * glow})`); g.addColorStop(1, 'rgba(230,196,130,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      }
      flowers.forEach(f => {
        const k = Math.min(1, Math.max(0, (t - f.delay) / 2.2));
        const e = ease(k);
        const x = f.sx + (f.tx - f.sx) * e, y = f.sy + (f.ty - f.sy) * e;
        const pulse = t > 4 ? 1 + Math.sin(t * 2.2) * .04 : 1;
        f.rot += f.spin * (1 - k);
        rose(x, y, f.r * pulse, f.rot, f.hue, Math.min(1, k * 2));
      });
      requestAnimationFrame(frame);
    }
    function start() {
      if (running) return;
      build(); running = true; t0 = 0; sec.classList.add('play'); played = true;
      requestAnimationFrame(frame);
    }
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !played) { start(); Music.setVolume(Math.min(.8, CONFIG.musicVolume + .2)); }
    }), { threshold: 0.35 }).observe(sec);
    addEventListener('resize', () => { if (running) build(); });

    $('#replayBtn').addEventListener('click', () => {
      running = false; played = false; sec.classList.remove('play');
      ctx.clearRect(0, 0, w, h);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

})();

