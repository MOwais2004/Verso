(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ── smooth scroll ── */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var el = document.querySelector(a.getAttribute('href'));
        if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -60 }); }
      });
    });
  }

  var root   = document.documentElement;
  var stage  = document.getElementById('stage');
  var film   = document.getElementById('film');
  var rail   = document.getElementById('rail');
  var track  = document.getElementById('track');
  var steps  = [].slice.call(document.querySelectorAll('#copy .step'));
  var shots  = [].slice.call(document.querySelectorAll('#media img'));
  var bars   = [].slice.call(document.querySelectorAll('#srail b'));
  var drift  = [].slice.call(document.querySelectorAll('#drift .d'));
  var figure = document.getElementById('figure');
  var pars   = [].slice.call(document.querySelectorAll('[data-par]'));
  var current = -1, lastY = -1, wide = true;


  /* Positions measured once, not inside the loop — reading layout every
     frame while writing styles is what makes a scroll feel like it catches. */
  var M = { vh: 0, trackTop: 0, trackSpan: 1, figTop: 0, figH: 1, railW: 0 };
  var parM = [];
  function measure() {
    M.vh = innerHeight;
    wide = matchMedia('(min-width:901px)').matches;
    if (track && steps.length) track.style.height = (wide && !reduce) ? (steps.length * 100) + 'svh' : 'auto';
    if (track)  { M.trackTop = track.getBoundingClientRect().top + scrollY;
                  M.trackSpan = Math.max(1, track.offsetHeight - M.vh); }
    if (figure) { M.figTop = figure.getBoundingClientRect().top + scrollY;
                  M.figH = figure.offsetHeight; }
    if (rail)   { M.railW = rail.scrollWidth / 2; }
    parM = pars.map(function (el) {
      var b = el.getBoundingClientRect();
      return { el: el, top: b.top + scrollY, h: b.height };
    });
    lastY = -1;
  }

  function update(y) {
    document.body.classList.toggle('past-hero', y > M.vh * .68);

    /* the hero: full bleed at rest, drawing itself in as you leave it */
    if (stage && !reduce) {
      var p = clamp(y / (M.vh * .85), 0, 1);
      root.style.setProperty('--p', p.toFixed(4));
      if (film) film.style.transform = 'translate3d(0,' + (p * 60).toFixed(1) + 'px,0) scale(' + (1 + p * .06).toFixed(4) + ')';
    }

    /* the client rail creeps sideways with the scroll and wraps */
    if (rail && M.railW && !reduce) {
      rail.style.transform = 'translate3d(' + (-(y * .07) % M.railW).toFixed(1) + 'px,0,0)';
    }

    /* three steps, scrubbed rather than switched */
    if (track && steps.length && !reduce && wide) {
      var n = steps.length;
      var prog = clamp((y - M.trackTop) / M.trackSpan, 0, .9999);
      var cur = Math.floor(prog * n);
      if (cur !== current) {
        current = cur;
        steps.forEach(function (st, k) { st.classList.toggle('on', k === cur); });
      }
      var FADE = .3, OVER = .18;
      for (var k = 0; k < n; k++) {
        var q = prog * n - k;
        var op = k === 0     ? clamp((1 + OVER - q) / FADE, 0, 1)
               : k === n - 1 ? clamp((q + OVER) / FADE, 0, 1)
               : clamp(Math.min((q + OVER) / FADE, (1 + OVER - q) / FADE), 0, 1);
        var ty = clamp(.5 - q, -.5, .5) * 60;
        steps[k].style.opacity = op.toFixed(3);
        steps[k].style.transform = 'translate3d(0,' + ty.toFixed(1) + 'px,0)';
        if (shots[k]) {
          shots[k].style.opacity = op.toFixed(3);
          shots[k].style.transform = 'scale(' + (1 + clamp(1 - q, 0, 1) * .055).toFixed(4) + ')';
        }
        if (bars[k]) bars[k].style.width = (clamp(q, 0, 1) * 100).toFixed(1) + '%';
      }
    }

    /* pictures drift inside their own frames as the frames pass */
    if (!reduce) {
      for (var i = 0; i < parM.length; i++) {
        var pm = parM[i], t = pm.top - y;
        if (t < M.vh && t + pm.h > 0) {
          var r = (M.vh - t) / (M.vh + pm.h) - .5;
          pm.el.style.transform = 'translate3d(0,' + (r * -0.09 * pm.h).toFixed(1) + 'px,0) scale(1.12)';
        }
      }
    }

    /* the work drifts past the figure, each card at its own pace */
    if (drift.length && figure && !reduce) {
      var top = M.figTop - y;
      if (top < M.vh + 240 && top + M.figH > -240) {
        var qq = (M.vh - top) / (M.vh + M.figH);
        var k2 = qq - .5;
        var edge = clamp(Math.min(qq, 1 - qq) * 4.5, 0, 1);
        drift.forEach(function (d) {
          d.style.opacity = edge.toFixed(3);
          d.style.transform =
            'translate3d(' + (k2 * (+d.dataset.x || 0)).toFixed(1) + 'px,' +
            (k2 * (+d.dataset.speed || -60)).toFixed(1) + 'px,0) rotate(' +
            (k2 * (+d.dataset.rot || 0)).toFixed(2) + 'deg)';
        });
      }
    }
  }

  function sync() { var y = scrollY; if (y === lastY) return; lastY = y; update(y); }
  function frame(t) { if (lenis) lenis.raf(t); sync(); requestAnimationFrame(frame); }

  measure();
  addEventListener('resize', measure);
  addEventListener('load', function () { measure(); sync(); });
  addEventListener('scroll', sync, { passive: true });
  requestAnimationFrame(frame);
  update(scrollY);

  /* ── the field types a real description; only the frames that answer
        it come up out of grey ── */
  (function () {
    var Q = [
      ['the horizon soft, just after sunset', [0]],
      ['green, the camera still moving', [1]],
      ['warm brown, nothing sharp in it', [2]],
      ['deep green, nothing quite in focus', [3, 0]]
    ];
    var out = document.getElementById('q');
    var figs = [].slice.call(document.querySelectorAll('#hits .hit'));
    if (!out || !figs.length) return;
    function show(list) {
      figs.forEach(function (f) { f.classList.remove('on'); });
      list.forEach(function (n, i) {
        setTimeout(function () { figs[n].classList.add('on'); }, 150 + i * 200);
      });
    }
    if (reduce) { out.textContent = Q[0][0]; show(Q[0][1]); return; }
    var qi = 0, ci = 0, dir = 1;
    function tick() {
      var t = Q[qi][0];
      ci += dir;
      out.textContent = t.slice(0, ci);
      var wait = dir > 0 ? 54 : 18;
      if (dir > 0 && ci === t.length) { show(Q[qi][1]); wait = 3000; dir = -1; }
      else if (dir < 0 && ci === 0) {
        figs.forEach(function (f) { f.classList.remove('on'); });
        qi = (qi + 1) % Q.length; dir = 1; wait = 460;
      }
      setTimeout(tick, wait);
    }
    new IntersectionObserver(function (e, o) {
      if (e[0].isIntersecting) { o.disconnect(); tick(); }
    }, { threshold: .2 }).observe(document.getElementById('hits'));
  })();

  /* ── the last row is still being written ── */
  (function () {
    var out = document.getElementById('wq');
    if (!out) return;
    var LINE = 'Deep green, the camera still moving — nothing quite in focus.';
    if (reduce) { out.textContent = LINE; return; }
    var i = 0, holding = false;
    function tick() {
      if (holding) { i = 0; holding = false; out.textContent = ''; return setTimeout(tick, 700); }
      i++;
      out.textContent = LINE.slice(0, i);
      if (i >= LINE.length) { holding = true; return setTimeout(tick, 4200); }
      setTimeout(tick, 46);
    }
    new IntersectionObserver(function (e, o) {
      if (e[0].isIntersecting) { o.disconnect(); tick(); }
    }, { threshold: .4 }).observe(out.closest('.wr'));
  })();

  /* ── the close: a real drop target. Hover, focus or drag a folder onto
        it and Verso describes a frame on the spot. Nothing is uploaded —
        the files never leave the page; we only count them. ── */
  (function () {
    var drop = document.getElementById('drop');
    if (!drop) return;
    var shot = document.getElementById('dropshot');
    var name = document.getElementById('dropname');
    var line = document.getElementById('dropline');
    var FRAMES = [
      ['assets/grass-200.webp', '_DSC4471.NEF', 'Pale grass going past the window, late afternoon.'],
      ['assets/blossom-white-200.webp', 'IMG_0098.CR3', 'White blossom smeared across green, the camera still moving.'],
      ['assets/dusk-200.webp', 'SCAN_031.TIF', 'A soft horizon just after sunset, almost no detail left.'],
      ['assets/blossom-pink-200.webp', 'A7R_11204.ARW', 'Pink blossom against deep green, shot wide open.']
    ];
    var i = -1, timer = null;

    function read(label) {
      clearTimeout(timer);
      i = (i + 1) % FRAMES.length;
      var f = FRAMES[i];
      shot.src = f[0];
      name.textContent = label || f[1];
      line.textContent = '';
      drop.classList.add('reading');
      if (reduce) { line.textContent = f[2]; return; }
      var n = 0;
      (function type() {
        line.textContent = f[2].slice(0, ++n);
        if (n < f[2].length) timer = setTimeout(type, 26);
      })();
    }
    function rest() { clearTimeout(timer); drop.classList.remove('reading'); }

    drop.addEventListener('mouseenter', function () { read(); });
    /* touch has no hover — a tap reads the next frame and keeps it up */
    drop.addEventListener('click', function () { read(); });
    drop.addEventListener('mouseleave', function () { if (!matchMedia('(hover: none)').matches) rest(); });
    drop.addEventListener('focus', function () { read(); });
    drop.addEventListener('blur', rest);
    drop.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); read(); }
    });
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        if (!drop.classList.contains('reading')) read();
      });
    });
    drop.addEventListener('dragleave', rest);
    drop.addEventListener('drop', function (e) {
      e.preventDefault();
      var n = (e.dataTransfer && e.dataTransfer.items ? e.dataTransfer.items.length : 0);
      read(n ? n + (n === 1 ? ' frame' : ' frames') + ' · reading' : null);
    });
  })();

  /* ── counters ── */
  (function () {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    if (reduce) {
      els.forEach(function (e) { e.textContent = (+e.dataset.count).toLocaleString() + (e.dataset.suffix || ''); });
      return;
    }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, target = +el.dataset.count, sfx = el.dataset.suffix || '', t0 = performance.now();
        (function step(now) {
          /* rAF can hand back a timestamp older than t0, so clamp */
          var p = clamp((now - t0) / 1700, 0, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString() + sfx;
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: .4 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ── entrances ── */
  (function () {
    var els = document.querySelectorAll('.up, .rise');
    if (reduce) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: .1, rootMargin: '0px 0px -70px' });
    els.forEach(function (e) { io.observe(e); });
    requestAnimationFrame(function () {
      document.querySelectorAll('.hero .up, .hero .rise').forEach(function (e) { e.classList.add('in'); });
    });
  })();

  /* ── faq, animating its own height ── */
  document.querySelectorAll('#faq .qa').forEach(function (q) {
    var btn = q.querySelector('button'), a = q.querySelector('.a');
    btn.addEventListener('click', function () {
      var open = !q.classList.contains('open');
      document.querySelectorAll('#faq .qa.open').forEach(function (o) {
        o.classList.remove('open'); o.querySelector('.a').style.height = '0px';
      });
      if (open) { q.classList.add('open'); a.style.height = a.scrollHeight + 'px'; }
    });
  });
  addEventListener('resize', function () {
    document.querySelectorAll('#faq .qa.open .a').forEach(function (a) { a.style.height = a.scrollHeight + 'px'; });
  });
})();
