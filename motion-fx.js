/* motion-fx.js — professional motion layer for the sponsorship MOTION page only.
   Loaded ONLY by sponsorship-q2-2026-motion.html (plain JS, no build step).
   GSAP + ScrollTrigger drive the choreography; a lightweight canvas paints an
   animated "data-mesh" hero backdrop. Degrades gracefully: markup is visible by
   default in CSS, so if GSAP/canvas fail to load nothing is hidden. Fully
   disabled under prefers-reduced-motion. Scoped via the data-page check. */
(function () {
  'use strict';
  var body = document.body;
  if (!body || body.dataset.page !== 'sponsorship-motion') return;
  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var TOUCH = !!(window.matchMedia && window.matchMedia('(hover: none)').matches);

  function whenReady(cb) {
    var tries = 0;
    var iv = setInterval(function () {
      var ok = document.querySelector('.sponsorship-hero') && document.querySelector('.sp-stats-grid');
      if (ok || ++tries > 100) { clearInterval(iv); if (document.querySelector('.sponsorship-hero')) cb(); }
    }, 80);
  }

  function parseNum(txt) {
    var m = String(txt).match(/^(\D*)(\d[\d,]*(?:\.\d+)?)(.*)$/);
    if (!m) return null;
    var d = m[2].replace(/,/g, '');
    return { prefix: m[1], target: parseFloat(d), suffix: m[3], dec: d.indexOf('.') > -1 ? d.split('.')[1].length : 0, raw: String(txt) };
  }

  whenReady(function () {
    initCanvas();
    if (REDUCE) return;
    if (window.gsap && window.ScrollTrigger) initGsap();
    if (!TOUCH) { initTilt(); initMagnetic(); }
  });

  /* ───────── GSAP choreography ───────── */
  function initGsap() {
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    // Hero intro (on load). .from() hides immediately then animates → no flash.
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.sp-hero-copy', { opacity: 0, y: 52, duration: 1.0 })
      .from('.sp-hero-visual', { opacity: 0, y: 64, scale: .95, duration: 1.15 }, '-=.7');

    // Everything else with .reveal: hide up front, then reveal (staggered) on scroll.
    var rest = gsap.utils.toArray('.reveal').filter(function (el) { return !el.closest('.sponsorship-hero'); });
    gsap.set(rest, { opacity: 0, y: 60 });
    window.ScrollTrigger.batch(rest, {
      start: 'top 86%',
      onEnter: function (els) {
        gsap.to(els, { opacity: 1, y: 0, duration: .9, stagger: .12, ease: 'power3.out', overwrite: true });
      }
    });

    // KPI numbers count up, tied to scroll.
    gsap.utils.toArray('.sp-stat-value strong').forEach(function (el) {
      var info = parseNum(el.textContent.trim());
      if (!info) return;
      var o = { v: 0 };
      gsap.to(o, {
        v: info.target, duration: 2.0, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: function () { el.textContent = info.prefix + o.v.toFixed(info.dec) + info.suffix; },
        onComplete: function () { el.textContent = info.raw; el.classList.add('spm-pop'); }
      });
    });

    // Smooth scrubbed parallax on the decorative chart layer.
    gsap.to('.sp-hero-chart', {
      yPercent: 36, ease: 'none',
      scrollTrigger: { trigger: '.sponsorship-hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    window.ScrollTrigger.refresh();
  }

  /* ───────── 3D tilt on cards ───────── */
  function initTilt() {
    var cards = document.querySelectorAll('.sp-stat, .sp-product-card, .sp-placement, .sp-package, .sp-an-card');
    [].forEach.call(cards, function (card) {
      var raf = 0, ev = null;
      card.addEventListener('mousemove', function (e) {
        ev = e;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var r = card.getBoundingClientRect();
          var px = (ev.clientX - r.left) / r.width - .5;
          var py = (ev.clientY - r.top) / r.height - .5;
          card.style.transform = 'perspective(900px) rotateX(' + (-py * 6).toFixed(2) + 'deg) rotateY(' + (px * 6).toFixed(2) + 'deg) translateY(-10px) scale(1.02)';
        });
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ───────── Magnetic CTA buttons ───────── */
  function initMagnetic() {
    var btns = document.querySelectorAll('.sp-hero-actions .btn, .sp-final-section .sp-contact-actions a');
    [].forEach.call(btns, function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        b.style.transform = 'translate(' + (x * .22).toFixed(1) + 'px,' + (y * .3).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* ───────── Animated canvas "data-mesh" hero backdrop ───────── */
  function initCanvas() {
    var hero = document.querySelector('.sponsorship-hero');
    if (!hero || !window.requestAnimationFrame) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'spm-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    hero.insertBefore(canvas, hero.firstChild);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var W = 0, H = 0, pts = [], raf = 0, mouse = { x: -1e4, y: -1e4 };
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function build() {
      var n = Math.max(26, Math.min(82, Math.round((W * H) / 16000)));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28 });
      }
    }
    function size() {
      W = hero.clientWidth; H = hero.clientHeight;
      if (!W || !H) return;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    function render() {
      ctx.clearRect(0, 0, W, H);
      var i, j;
      for (i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        var mdx = mouse.x - p.x, mdy = mouse.y - p.y, md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 150 && md > 0.1) { p.x += mdx / md * .5; p.y += mdy / md * .5; }
      }
      for (i = 0; i < pts.length; i++) {
        for (j = i + 1; j < pts.length; j++) {
          var a = pts[i], b = pts[j];
          var dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 134) {
            var al = (1 - d / 134) * .55;
            ctx.strokeStyle = (d < 76 ? 'rgba(177,138,59,' : 'rgba(29,90,158,') + al.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < pts.length; i++) {
        ctx.fillStyle = 'rgba(177,138,59,.55)';
        ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, 1.7, 0, 6.2832); ctx.fill();
      }
    }
    function loop() { render(); raf = requestAnimationFrame(loop); }
    function start() { if (!raf) raf = requestAnimationFrame(loop); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    size();
    window.addEventListener('resize', size);
    hero.addEventListener('mousemove', function (e) { var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('mouseleave', function () { mouse.x = mouse.y = -1e4; });

    if (REDUCE) { render(); return; }   // one static frame, no loop
    start();
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
      }, { threshold: 0 }).observe(hero);
    }
  }
})();
