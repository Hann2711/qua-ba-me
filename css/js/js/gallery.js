/* =========================================================
   THE MEMORY GALLERY – gallery.js
   Click ảnh -> camera zoom vào giữa màn hình -> trả về đúng vị trí cũ
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     DANH SÁCH ẢNH – sửa ở đây (8–12 ảnh là đẹp nhất)
     Ảnh đầu tiên nên là ảnh gia đình bốn người.
  --------------------------------------------------------- */
  const PHOTOS = [
    { src: 'assets/images/gallery-01.jpg', caption: 'Bốn người, một mái nhà.' },
    { src: 'assets/images/gallery-02.jpg', caption: '[Chú thích ngắn, giàu cảm xúc]' },
    { src: 'assets/images/gallery-03.jpg', caption: '[Chú thích ngắn, giàu cảm xúc]' },
    { src: 'assets/images/gallery-04.jpg', caption: '[Chú thích ngắn, giàu cảm xúc]' },
    { src: 'assets/images/gallery-05.jpg', caption: '[Chú thích ngắn, giàu cảm xúc]' },
    { src: 'assets/images/gallery-06.jpg', caption: '[Chú thích ngắn, giàu cảm xúc]' },
    { src: 'assets/images/gallery-07.jpg', caption: '[Chú thích ngắn, giàu cảm xúc]' },
    { src: 'assets/images/gallery-08.jpg', caption: '[Chú thích ngắn, giàu cảm xúc]' }
  ];

  const OPEN_MS = 800;    // 650–900ms
  const CLOSE_MS = 620;   // 500–750ms

  const $ = s => document.querySelector(s);
  const gallery = $('#gallery');
  const lb = $('#lightbox'), stage = $('#lbStage'), img = $('#lbImg'), ph = $('#lbPh'),
        cap = $('#lbCaption'), count = $('#lbCount');
  if (!gallery || !lb) return;

  let items = [], cur = -1, isOpen = false, busy = false;

  /* ---- Render lưới ---- */
  PHOTOS.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'g-item';
    b.setAttribute('aria-label', 'Xem ảnh ' + (i + 1));
    b.innerHTML = `<img src="${p.src}" alt="${p.caption.replace(/"/g, '&quot;')}" loading="lazy"><span class="g-ph">Ảnh ${i + 1}</span>`;
    const im = b.querySelector('img');
    const ph = b.querySelector('.g-ph');
    im.addEventListener('error', () => im.classList.add('noimg'));
    im.addEventListener('load', () => ph.remove());
    b.addEventListener('click', () => open(i));
    gallery.appendChild(b);
    items.push(b);
  });

  /* ---- Tính khung đích (giữa màn hình, tỉ lệ ảnh) ---- */
  function targetRect() {
    const vw = innerWidth, vh = innerHeight;
    const maxW = vw * (vw < 700 ? 0.92 : 0.7), maxH = vh * (vw < 700 ? 0.62 : 0.72);
    const nat = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 4 / 3;
    let w = maxW, h = w / nat;
    if (h > maxH) { h = maxH; w = h * nat; }
    return { left: (vw - w) / 2, top: Math.max(20, (vh - h) / 2 - vh * 0.04), width: w, height: h };
  }
  function setRect(r) {
    stage.style.left = r.left + 'px'; stage.style.top = r.top + 'px';
    stage.style.width = r.width + 'px'; stage.style.height = r.height + 'px';
  }
  function thumbRect(i) {
    const r = items[i].getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }
  function loadInto(i) {
    const p = PHOTOS[i];
    img.classList.remove('noimg');
    img.src = p.src; img.alt = p.caption;
    ph.textContent = 'Ảnh ' + (i + 1);
    cap.textContent = p.caption;
    count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(PHOTOS.length).padStart(2, '0');
  }
  img.addEventListener('error', () => img.classList.add('noimg'));

  /* ---- MỞ ---- */
  function open(i) {
    if (busy || isOpen) return;
    busy = true; cur = i;
    gallery.classList.add('dim');
    items.forEach((it, k) => it.classList.toggle('on', k === i));

    loadInto(i);
    const start = thumbRect(i);
    stage.classList.remove('animating');
    setRect(start);
    items[i].classList.add('hidden-src');

    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const go = () => {
      stage.style.setProperty('--dur', OPEN_MS + 'ms');
      void stage.offsetWidth;                // reflow
      stage.classList.add('animating');
      setRect(targetRect());
      setTimeout(() => { lb.classList.add('ready'); isOpen = true; busy = false; }, OPEN_MS);
    };
    // đợi ảnh có kích thước thật để tính tỉ lệ đúng
    if (img.complete) go(); else { img.onload = go; img.onerror = go; }
  }

  /* ---- ĐÓNG ---- */
  function close() {
    if (!isOpen || busy) return;
    busy = true; lb.classList.remove('ready');
    const back = thumbRect(cur);
    stage.style.setProperty('--dur', CLOSE_MS + 'ms');
    stage.classList.add('animating');
    setRect(back);
    lb.querySelector('.lb-backdrop').style.opacity = 0;
    setTimeout(() => {
      lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
      lb.querySelector('.lb-backdrop').style.opacity = '';
      items.forEach(it => it.classList.remove('hidden-src', 'on'));
      gallery.classList.remove('dim');
      document.body.style.overflow = '';
      stage.classList.remove('animating');
      isOpen = false; busy = false;
    }, CLOSE_MS);
  }

  /* ---- Chuyển ảnh ---- */
  function go(dir) {
    if (!isOpen || busy) return;
    busy = true;
    const next = (cur + dir + PHOTOS.length) % PHOTOS.length;
    img.style.opacity = 0; cap.style.opacity = 0;
    setTimeout(() => {
      items[cur].classList.remove('hidden-src', 'on');
      cur = next;
      items[cur].classList.add('hidden-src', 'on');
      loadInto(cur);
      const show = () => {
        stage.style.setProperty('--dur', '.5s');
        stage.classList.add('animating');
        setRect(targetRect());
        img.style.opacity = 1; cap.style.opacity = '';
        setTimeout(() => { busy = false; }, 520);
      };
      if (img.complete) show(); else { img.onload = show; img.onerror = show; }
    }, 300);
  }

  /* ---- Điều khiển ---- */
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => go(-1));
  $('#lbNext').addEventListener('click', () => go(1));
  lb.querySelector('.lb-backdrop').addEventListener('click', close);

  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
  });

  // Vuốt trên điện thoại
  let sx = 0, sy = 0;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
  }, { passive: true });

  addEventListener('resize', () => { if (isOpen && !busy) { stage.classList.remove('animating'); setRect(targetRect()); } });
})();

