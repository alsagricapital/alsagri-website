// sections.jsx — Page sections for Alsagri Capital website (multi-page).

const { useState, useEffect, useRef } = React;

/* ── Reveal hook ───────────────────────────────────────────────── */
function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, deps);
}

function parseCountValue(value) {
  const raw = String(value);
  const match = raw.match(/^([^0-9+\-]*)([+\-]?\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const numberText = match[2];
  const target = Number(numberText.replace(/,/g, ''));
  if (!Number.isFinite(target)) return null;
  return {
    prefix: match[1],
    target: Math.abs(target),
    sign: numberText.trim().startsWith('+') ? '+' : (target < 0 ? '-' : ''),
    suffix: match[3],
    decimals: (numberText.split('.')[1] || '').length,
    grouping: numberText.includes(','),
  };
}

function formatCountValue(progress, parts) {
  const current = parts.target * progress;
  const number = parts.grouping
    ? Math.round(current).toLocaleString('en-US')
    : current.toFixed(parts.decimals);
  return `${parts.prefix}${parts.sign}${number}${parts.suffix}`;
}

function CountUpText({ value, as = 'span', className = '' }) {
  const Tag = as;
  const initialParts = parseCountValue(value);
  const [display, setDisplay] = useState(initialParts ? formatCountValue(0, initialParts) : String(value));
  const ref = useRef(null);

  useEffect(() => {
    const parts = parseCountValue(value);
    const node = ref.current;
    if (!parts || !node || typeof window === 'undefined') {
      setDisplay(String(value));
      return undefined;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplay(String(value));
      return undefined;
    }

    let frame = 0;
    let started = false;
    const duration = 1250;
    const start = () => {
      if (started) return;
      started = true;
      const startedAt = performance.now();
      const tick = (now) => {
        const elapsed = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        setDisplay(formatCountValue(eased, parts));
        if (elapsed < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          setDisplay(String(value));
        }
      };
      frame = requestAnimationFrame(tick);
    };

    setDisplay(formatCountValue(0, parts));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          start();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value]);

  return <Tag ref={ref} className={className || undefined} aria-label={String(value)}>{display}</Tag>;
}

/* ── Brand mark SVG (market crest) ───────────────────────── */
function BrandMark({ size = 28 }) {
  return (
    <span className="brand-mark-img" style={{ width: size, height: size }}>
      <img src="assets/alsagri-icon-dark.png" alt="" loading="eager" decoding="async" />
    </span>
  );
}

/* ── Sparkline (mini chart for report cards) ───────────────────── */
function Sparkline({ data }) {
  const w = 240, h = 36, pad = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (h - pad * 2) * (1 - (v - min) / range);
    return [x, y];
  });
  const d = pts.map((p, i) => i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`).join(' ');
  return (
    <svg className="rpt-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={d} />
    </svg>);
}

/* ── Market trend background SVG ───────────────────────────────── */
function ChartLineBackground({ variant = 'hero' }) {
  const W = 1200, H = 360;
  const BASELINE = 336;
  const charts = {
    hero: {
      start: [44, 292],
      end: [1100, 76],
      path: 'M44 292 C118 284 154 250 226 254 C292 258 326 226 388 214 C456 201 490 224 548 203 C620 178 654 142 725 151 C792 160 830 119 898 111 C970 102 1018 88 1100 76',
      nodes: [[226, 254], [388, 214], [548, 203], [725, 151], [898, 111], [1100, 76]],
      bars: [[126, 278, 42, .1], [286, 238, 58, .14], [462, 218, 76, .1], [642, 158, 88, .14], [810, 128, 68, .1], [984, 98, 76, .16]],
    },
  };
  const chart = charts[variant] || charts.hero;
  const areaPath = `${chart.path} L${chart.end[0]} ${BASELINE} L${chart.start[0]} ${BASELINE} Z`;

  return (
    <svg className={'trend-chart trend-chart-' + variant} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id={`trend-line-${variant}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#8FB0D1" stopOpacity="0.2" />
          <stop offset="42%" stopColor="#3B82F6" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#0A1628" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`trend-area-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
          <stop offset="72%" stopColor="#3B82F6" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>
        <filter id={`trend-shadow-${variant}`} x="-10%" y="-40%" width="120%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#3B82F6" floodOpacity="0.22" />
        </filter>
      </defs>

      {[84, 148, 212, 276, 336].map((y, i) => (
        <line key={i} x1="0" y1={y} x2={W} y2={y}
              stroke="#0A1628" strokeOpacity="0.07" strokeWidth="1"
              strokeDasharray={i === 4 ? '0' : '2 10'} />
      ))}
      {[160, 360, 560, 760, 960].map((x, i) => (
        <line key={i} x1={x} y1="42" x2={x} y2={BASELINE}
              stroke="#0A1628" strokeOpacity="0.045" strokeWidth="1" />
      ))}

      {chart.bars.map(([x, y, h, opacity], i) => (
        <rect key={i} x={x} y={y} width="18" height={h} rx="9"
              className="trend-bar" style={{ animationDelay: `${i * 0.12}s` }}
              fill="#3B82F6" opacity={opacity} />
      ))}

      <path className="trend-area" d={areaPath} fill={`url(#trend-area-${variant})`} />
      {variant === 'hero' && (
        <path className="trend-line-base" d={chart.path} fill="none" stroke="#8A97A8" strokeOpacity="0.26"
              strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      )}
      <path className="trend-line-main" d={chart.path} fill="none" stroke={`url(#trend-line-${variant})`}
            strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
            filter={`url(#trend-shadow-${variant})`} opacity="0.92"
            pathLength="1"
            strokeDasharray={variant === 'hero' ? '0.66 1' : undefined} />
      <path className="trend-line-gloss" d={chart.path} fill="none" stroke="#FFFFFF" strokeOpacity="0.32"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            pathLength="1"
            strokeDasharray={variant === 'hero' ? '0.66 1' : undefined} />

      {chart.nodes.map(([x, y], i) => (
        <g className="trend-node" style={{ animationDelay: `${i * 0.18}s` }} key={i}>
          <circle className="trend-node-halo" cx={x} cy={y} r="12" fill={variant === 'hero' && i > 3 ? '#8A97A8' : '#3B82F6'} opacity={variant === 'hero' && i > 3 ? '0.06' : '0.1'} />
          <circle className="trend-node-core" cx={x} cy={y} r="4.5" fill="#FAFAF7" stroke={variant === 'hero' && i > 3 ? '#8A97A8' : '#3B82F6'} strokeOpacity={variant === 'hero' && i > 3 ? '0.45' : '1'} strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

/* ── NAV ───────────────────────────────────────────────────────── */
function Nav({ currentPage, drawerOpen, setDrawerOpen }) {
  const isEnglishUsa = document.body.dataset.page === 'sponsorshipusa-en';
  const isEnglishSaudiQ3 = document.body.dataset.page === 'sponsorship-q3-saudi-en';
  const isEnglish = isEnglishUsa || isEnglishSaudiQ3;
  const isSaudiQ3 = document.body.dataset.market === 'saudi-q3';
  const isUsaSponsorshipPage = (document.body.dataset.page === 'sponsorshipusa' || isEnglishUsa) && !isSaudiQ3;
  const isBilingualSponsorshipPage = isUsaSponsorshipPage || isSaudiQ3;
  const arabicSponsorshipHref = isSaudiQ3 ? 'sponsorship-q3-2026.html' : 'sponsorshipusa-q2-2026.html';
  const englishSponsorshipHref = isSaudiQ3 ? 'sponsorship-q3-2026-en.html' : 'sponsorshipusa-q2-2026-en.html';
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // Lock body scroll while drawer is open
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [drawerOpen]);
  // Close drawer if user resizes past mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 861px)');
    const onChange = (e) => { if (e.matches) setDrawerOpen(false); };
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange);
    };
  }, [setDrawerOpen]);
  // Close drawer on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen, setDrawerOpen]);
  const items = [
    { id: 'about',     label: isEnglish ? 'About' : 'عن المنصة',   n: '01', href: 'about.html' },
    { id: 'services',  label: isEnglish ? 'Services' : 'الخدمات',     n: '02', href: 'services.html' },
    { id: 'tools',     label: isEnglish ? 'Tools' : 'أدوات مفيدة', n: '03', href: 'tools.html' },
    { id: 'cfa',       label: isEnglish ? 'CFA Resources' : 'مصادر CFA',   n: '04', href: 'cfa.html' },
    { id: 'newsletter', label: isEnglish ? 'Newsletter' : 'النشرة البريدية', n: '05', href: 'newsletter.html' },
  ];

  return (
    <React.Fragment>
    <header className={'nav ' + (scrolled ? 'scrolled' : '')}>
      <div className="wrap nav-inner">
        <a className="brand" href="index.html" aria-label="Alsagri Capital">
          <img
            className="brand-logo-img"
            src="assets/alsagri-logo-horizontal.png"
            alt="Alsagri Capital"
            loading="eager"
            decoding="async"
          />
        </a>
        <nav>
          <ul className="nav-links">
            {items.map((it) => (
              <li key={it.id}>
                <a href={it.href}
                   className={currentPage === it.id ? 'active' : ''}>
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {isBilingualSponsorshipPage && (
          <div className="nav-lang-switch" aria-label="Language switcher">
            <a className={!isEnglish ? 'active' : ''} href={arabicSponsorshipHref} lang="ar" dir="rtl">عربي</a>
            <span aria-hidden="true"></span>
            <a className={isEnglish ? 'active' : ''} href={englishSponsorshipHref} lang="en" dir="ltr">English</a>
          </div>
        )}
        <a className="nav-cta" href="contact.html">
          <span className="dot"></span>
          {isEnglish ? 'Contact' : 'تواصل معي'}
        </a>
        <button
          className={'nav-burger ' + (drawerOpen ? 'open' : '')}
          aria-label={isEnglish ? 'Menu' : 'القائمة'}
          aria-expanded={drawerOpen ? 'true' : 'false'}
          aria-controls="mobile-drawer"
          onClick={() => setDrawerOpen((v) => !v)}>
          <span></span><span></span>
        </button>
      </div>
    </header>
    <div
      className={'drawer-backdrop ' + (drawerOpen ? 'open' : '')}
      onClick={() => setDrawerOpen(false)}
      aria-hidden="true"
    ></div>
    <div
      id="mobile-drawer"
      className={'drawer ' + (drawerOpen ? 'open' : '')}
      role="dialog"
      aria-modal="true"
      aria-hidden={drawerOpen ? 'false' : 'true'}>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <a href={it.href} onClick={() => setDrawerOpen(false)}>
              <span>{it.label}</span>
            </a>
          </li>
        ))}
      </ul>
      <a className="drawer-cta" href="contact.html" onClick={() => setDrawerOpen(false)}>{isEnglish ? 'Contact →' : 'تواصل معي ←'}</a>
    </div>
    </React.Fragment>);
}

/* ── X Subscription Banner (shared across pages) ────────────────── */
function XSubBanner() {
  return (
    <a className="top-announcement" href="https://x.com/alsagricapital" target="_blank" rel="noreferrer">
      <span className="tb-text">
        جميع خدمات المنصة متاحة في قسم الاشتراك بـ
        <span className="tb-xlogo" aria-label="X" role="img">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </span>
      </span>
      <span className="tb-arr">←</span>
    </a>);
}

/* ── PAGE BANNER (interior pages) ──────────────────────────────── */
function PageBanner({ num, eyebrow, title, sub, variant = 'about', showXSub = false, sideContent = null, afterSubContent = null }) {
  return (
    <section className={'page-banner ' + (sideContent ? 'page-banner-with-card' : '')}>
      <div className="wrap">
        <div className="pb-layout">
          <div className="pb-copy">
            <div className="pb-eyebrow">/{num} — {eyebrow}</div>
            <h1 className="pb-title">{title}</h1>
            {sub && <p className="pb-sub">{sub}</p>}
            {afterSubContent}
            {showXSub && (
              <div style={{ marginTop: 24 }}>
                <XSubBanner />
              </div>
            )}
          </div>
          {sideContent && (
            <div className="pb-side">
              {sideContent}
            </div>
          )}
        </div>
      </div>
    </section>);
}

/* ── HERO (homepage — DARK BANNER) ─────────────────────────────── */
function XInlineIcon({ className = '' }) {
  return (
    <span className={'x-inline-icon ' + className} aria-label="X" role="img">
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </span>);
}

function HomeServicesCallout({ className = '' }) {
  return (
    <a className={'home-services-callout reveal ' + className} href="services.html">
      <strong>هنا تتعرّف على خدمات ومميزات الاشتراك في حساب الصقري على <XInlineIcon /></strong>
      <span className="hsc-bottom">
        <span>الخدمات، المميزات، والنماذج السابقة في صفحة واحدة.</span>
        <span className="hsc-action">
          اضغط هنا
          <span className="hsc-arrow">←</span>
        </span>
      </span>
    </a>);
}

function Hero() {
  return (
    <React.Fragment>
    <section id="top" className="hero-dark">
      <div className="hero-glow" aria-hidden="true"></div>
      <div className="hero-chart" aria-hidden="true">
        <ChartLineBackground variant="hero" />
      </div>
      <HomeServicesCallout className="home-services-callout-desktop" />
      <div className="hero-quote-card" aria-hidden="false">
        <div className="hqc-dots"></div>
        <div className="hqc-glow"></div>
        <div className="hqc-top">
          <div className="hqc-brand">
            <BrandMark size={22} />
            <span className="hqc-name">الصقري</span>
          </div>
          <div className="hqc-handle">@alsagricapital</div>
        </div>
        <div className="hqc-quote">
          <span className="hqc-q-open">“</span>
          إنه من الأفضل بكثير شراء شركة رائعة بسعرٍ جيّد،
          من شراء شركة جيدة بسعرٍ رائع.
        </div>
        <div className="hqc-attr">
          <span className="hqc-attr-line"></span>
          <span className="hqc-person">
            <img className="hqc-avatar" src="assets/warren-buffett.jpg" alt="" loading="eager" decoding="async" />
            <span className="hqc-attr-name">وارن بافت</span>
          </span>
        </div>
      </div>
      <div className="wrap">
        <div className="hero-grid" style={{ maxWidth: 1080 }}>
          <div className="hero-copy">
            <div className="eyebrow" style={{ marginBottom: 32 }}>SAUDI · LISTED · EQUITIES</div>
            <h1>
              <span className="line">قراءةٌ مُفصَّلة لشركات السوق <span className="em">السعودي</span></span>
            </h1>
            <p className="hero-sub">
              منصةٌ تعرض ملخصات وتحليلات مكتوبة لمكالمات نتائج الشركات السعودية المدرجة، تقارير بيوت الأبحاث، والتقارير النوعية عن الشركات وقطاعات السوق.
            </p>
            <HomeServicesCallout className="home-services-callout-mobile" />
            <div className="hero-actions">
              <a href="services.html" className="btn btn-primary">
                استعرض الخدمات
                <span className="arrow">←</span>
              </a>
              <a href="about.html" className="btn btn-ghost">
                عن المنصة
              </a>
            </div>
          </div>
        </div>

        <div className="ticker-strip">
          {window.TICKER_STATS.map((s) => (
            <div className="tk" key={s.k}>
              <div className="ar-label" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{s.ar}</div>
              <div className="k">{s.k}</div>
              <div className="v">
                <span className="lat">{s.v}</span>
                <span className="unit">{s.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    <HomeCalmBanner />
    </React.Fragment>);
}

function XProfileCard({ className = '' }) {
  return (
    <a className={'hero-profile-card ' + className} href="https://x.com/AlsagriCapital" target="_blank" rel="noreferrer" aria-label="حساب الصقري على منصة X">
      <div className="hpc-frame-glow" aria-hidden="true"></div>
      <div className="hpc-cover">
        <img src="assets/alsagri-x-cover.jpg" alt="" loading="eager" decoding="async" />
        <span className="hpc-source">X · @alsagricapital</span>
      </div>
      <div className="hpc-body">
        <img className="hpc-avatar" src="assets/alsagri-profile.jpg" alt="الصقري | Alsagri" loading="eager" decoding="async" />
        <div className="hpc-name-row">
          <span className="hpc-name">الصقري | Alsagri</span>
          <span className="hpc-verify" aria-label="موثّق">✓</span>
        </div>
        <div className="hpc-handle">@AlsagriCapital</div>
        <div className="hpc-bio">باحث مستقل | مهتم بالاستثمار والتوعية المالية | تقارير ومراجعة للشركات</div>
        <div className="hpc-meta">
          <span>خدمات مالية</span>
          <span>الرياض</span>
        </div>
      </div>
    </a>);
}

function HomeCalmBanner() {
  return (
    <section className="home-calm-band">
      <div className="wrap">
        <div className="home-calm-card reveal">
          <div className="home-calm-glow" aria-hidden="true"></div>
          <div className="home-calm-profile">
            <div className="home-profile-avatar-wrap">
              <BrandMark size={38} />
              <span className="home-profile-status" aria-hidden="true"></span>
            </div>
            <div className="home-profile-copy">
              <span className="home-profile-name">الصقري | Alsagri</span>
              <span className="home-profile-handle">@AlsagriCapital</span>
            </div>
          </div>
          <div className="home-calm-copy">
            <span className="home-calm-kicker">قراءة هادئة للسوق</span>
            <p>تنظيم المعلومة قبل اتخاذ القرار: مكالمات نتائج، تقارير أبحاث، وأدوات مختصرة في مكان واحد.</p>
          </div>
          <div className="home-calm-tags" aria-label="محاور المنصة">
            <a href="service-earnings.html">مكالمات النتائج</a>
            <a href="service-brokerage.html">تقارير الأبحاث</a>
            <a href="tools.html">أدوات مفيدة</a>
          </div>
        </div>
      </div>
    </section>);
}

/* ── ABOUT page ────────────────────────────────────────────────── */
function About() {
  return (
    <React.Fragment>
      <PageBanner
        num="01"
        eyebrow="ABOUT"
        title="عن المنصة"
        sub="محتوى تحليلي منظّم موجّه للمستثمرين والمهتمّين بالسوق السعودي، يقدّم قراءة مكتوبة ومبسّطة لأهم ما يُنشر حول الشركات المدرجة في السوق السعودي."
        variant="about"
        showXSub={true}
        sideContent={<XProfileCard className="about-hero-profile-card" />} />

      <section id="about" className="section first">
        <div className="wrap">
          <div className="about-grid">
            <div className="about-text reveal">
              <p>
                من خلال الاشتراك، تحصل على محتوى يركّز على <span className="em">مكالمات عرض النتائج، تقارير بيوت الخبرة، والتحليلات النوعية</span> للشركات السعودية، مع تنظيم المعلومات بطريقة واضحة تساعدك على فهم أداء الشركات، توجّهات الإدارات، ونظرة المحلّلين للقطاع والسوق.
              </p>
              <p>
                المنصة <span className="em">لا تقدّم توصيات شراء أو بيع</span>، ولا تُعدّ استشارة مالية، وإنما تهدف إلى تجميع المعلومة المتاحة علناً، تحليلها، وترتيبها بأسلوب مختصر ومحايد يساعد المستثمر على تكوين فهم أعمق.
              </p>
            </div>
            <div className="about-pillars reveal d3">
              <div className="pillar">
                <div className="p-n">01</div>
                <div>
                  <div className="p-ttl">وضوح العرض</div>
                  <div className="p-desc">تقسيم المعلومات إلى أرقام رئيسية، تعليقات الإدارة، ملاحظات المحلّلين، والمحركات المستقبلية لكل شركة.</div>
                </div>
              </div>
              <div className="pillar">
                <div className="p-n">02</div>
                <div>
                  <div className="p-ttl">عُمق القراءة</div>
                  <div className="p-desc">التركيز على ما وراء الأرقام: أسباب النمو أو التراجع، تغيّر الهوامش، جودة الأرباح، التوجّهات التشغيلية، والمخاطر المحتملة.</div>
                </div>
              </div>
              <div className="pillar">
                <div className="p-n">03</div>
                <div>
                  <div className="p-ttl">حياد المضمون</div>
                  <div className="p-desc">عرض موضوعي لما هو منشور ومتاح علناً، دون توصيات استثمارية أو توجيه بالشراء أو البيع.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>);
}

/* ── Report card (used inline within Services) ─────────────────── */
function ReportCard({ r, catLabel, viewCount, viewsLabel = 'مشاهدات', compact = false, viewsPlacement = 'body', clickLabel = '' }) {
  const arCat = ({
    earnings: 'مكالمة عرض النتائج',
    brokerage: 'تقرير بحثي',
    qualitative: 'تقرير نوعي',
    ipo: 'اكتتاب أولي',
  })[r.cat] || '';
  const isResearchReport = r.cat === 'brokerage' && r.cover;
  const coverClass = r.cover ? ' rpt-has-cover' : '';
  const researchClass = isResearchReport ? ' rpt-research-card' : '';
  const compactClass = compact ? ' rpt-compact' : '';
  const viewsBadge = viewCount && (
    <div className="rpt-views-badge">
      <strong>{viewCount}</strong>
      <span>{viewsLabel}</span>
    </div>
  );

  const reportHref = r.link || r.pdf;
  const Wrapper = reportHref ? 'a' : 'article';
  const wrapperProps = reportHref
    ? { href: reportHref, target: '_blank', rel: 'noreferrer', className: 'rpt rpt-link' + coverClass + researchClass + compactClass }
    : { className: 'rpt' + coverClass + researchClass + compactClass };

  return (
    <Wrapper {...wrapperProps}>
      {isResearchReport && (
        <div className="rpt-cover-heading">
          <span>{r.title}</span>
          {r.researchHouse && <small>{r.researchHouse}</small>}
        </div>
      )}
      {r.cover && (
        <div className="rpt-cover">
          <img src={r.cover} alt={r.co + ' — ' + r.title} loading="eager" decoding="async" />
        </div>
      )}
      {!isResearchReport && (
        <div className="rpt-body">
          <div className="rpt-top">
            <div className="rpt-tag-group">
              {!compact && <span className="rpt-tag-ar">{arCat}</span>}
              <span className="rpt-tag">{catLabel}</span>
              {compact && <span className="rpt-co-top">{r.co}</span>}
            </div>
            <div className="rpt-ticker-stack">
              <span className="rpt-ticker">{r.ticker}</span>
              {viewsPlacement === 'ticker' && viewsBadge}
            </div>
          </div>
          {!compact && <div className="rpt-co">{r.co}</div>}
          {viewsPlacement !== 'ticker' && viewsBadge}
          {!compact && <div className="rpt-title">{r.title}</div>}
          {!r.cover && <Sparkline data={r.spark} />}
          {r.metrics && !r.cover && (
            <div className="rpt-metrics">
              {r.metrics.map((m) => (
                <span className="m" key={m}><span className="dot"></span>{m}</span>
              ))}
            </div>
          )}
          {!compact && (
            <div className="rpt-foot">
              <span className="rpt-date">{r.date}</span>
              {reportHref && (
                <span className="rpt-read">
                  <span className="arr">↗</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}
      {reportHref && clickLabel && (
        <span className="rpt-click-hint">
          <span>{clickLabel}</span>
          <span aria-hidden="true">↗</span>
        </span>
      )}
    </Wrapper>);
}

/* ── SERVICES page ──────────────────────────────────── */
function ServicesXHighlight() {
  return (
    <a className="services-x-highlight reveal" href="https://x.com/AlsagriCapital" target="_blank" rel="noreferrer">
      <span className="sxh-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </span>
      <span className="sxh-copy">
        <span className="sxh-kicker">
          حصرياً لمشتركي
          <span className="sxh-inline-x" aria-label="X" role="img">
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </span>
        </span>
        <strong>
          اشترك في حساب الصقري على
          <span className="sxh-inline-x sxh-inline-x-lg" aria-label="X" role="img">
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </span>
          لتحصل على هذه الخدمات حصرياً وقبل الجميع.
        </strong>
        <span>مكالمات النتائج، تقارير بيوت الأبحاث، والتحليلات النوعية تصل للمشترك أولاً وبصياغة مختصرة تساعده على قراءة الشركة بوضوح أسرع.</span>
      </span>
      <span className="sxh-action">
        الاشتراك عبر
        <span className="sxh-inline-x" aria-label="X" role="img">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </span>
        <span className="sxh-arrow">←</span>
      </span>
    </a>);
}

function Services() {
  return (
    <React.Fragment>
      <PageBanner
        num="02"
        eyebrow="SERVICES"
        title="الخدمات"
        sub="ثلاثُ زوايا لقراءة الشركة السعودية المدرجة: ما قالته الشركة، ما يُقال عنها، وما هي عليه الآن ومستقبلاً."
        variant="services"
        afterSubContent={<ServicesXHighlight />} />

      <section id="services" className="section first">
        <div className="wrap">
          <div className="services-samples-note reveal">
            <span>للاطلاع على نماذج <em className="samples-word">سابقة</em></span>
            <p>هذه نماذج من الخدمات التي يحصل عليها المشترك بشكل دوري: مكالمات نتائج الشركات، تقارير بيوت خبرة، وتحليلات نوعية مبكرة.</p>
          </div>
          <div className="services-grid">
            {window.SERVICES.filter((s) => s.id !== 'ipo').map((s, idx) => (
              <a
                className={'svc svc-tint-' + s.id + ' reveal d' + (idx + 1)}
                key={s.id}
                href={'service-' + s.id + '.html'}>
                <div className="svc-num">
                  <span>{s.num}</span>
                </div>
                <h3>{s.ar}</h3>
                <div className="svc-en">{s.en}</div>
                <p className="svc-desc">{s.desc}</p>
                {s.tags && s.tags.length > 0 && (
                  <div className="svc-tags">
                    {s.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                  </div>
                )}
                <span className="svc-link">
                  <span>اطّلع على النماذج</span>
                  <span className="arr">←</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </React.Fragment>);
}

/* ── SERVICE DETAIL (per-service reports page) ────────── */
function EarningsFeatureBanner({
  quarter = 'الربع الأول 2026',
  href = 'https://x.com/AlsagriCapital/status/2054659950194942119?s=20',
  variant = 'primary',
  isEnglish = false,
} = {}) {
  return (
    <a
      className={'earnings-feature-banner reveal' + (variant === 'secondary' ? ' is-secondary' : '')}
      href={href}
      target="_blank"
      rel="noreferrer">
      <span className="efb-bg" aria-hidden="true"></span>
      <span className="efb-copy">
        <span className="efb-kicker">{isEnglish ? 'COLLECTION' : 'ملف مجمّع'} · {quarter}</span>
        <strong>{isEnglish ? `Investor Calls / Earnings Calls — ${quarter}` : `مكالمات المستثمرين / مكالمات عرض نتائج ${quarter}`}</strong>
        <span>{isEnglish ? 'A curated collection of earnings-call coverage and links, organized in one place for quick reference.' : 'تجميع مرتب لمكالمات النتائج وروابطها في مكان واحد للرجوع السريع.'}</span>
      </span>
      <span className="efb-visual" aria-hidden="true">
        <span className="efb-orbit"></span>
        <svg viewBox="0 0 240 120" preserveAspectRatio="none">
          <path className="efb-area" d="M6 104 C42 96 54 72 88 78 C120 84 132 48 164 54 C196 60 204 26 234 18 L234 120 L6 120 Z" />
          <path className="efb-line-soft" d="M6 104 C42 96 54 72 88 78 C120 84 132 48 164 54 C196 60 204 26 234 18" />
          <path className="efb-line" d="M6 104 C42 96 54 72 88 78 C120 84 132 48 164 54 C196 60 204 26 234 18" />
          <path className="efb-arrow" d="M210 18 H234 V42" />
        </svg>
      </span>
      <span className="efb-action">
        {isEnglish ? 'View collection' : 'عرض التجميع'}
        <span>{isEnglish ? '→' : '←'}</span>
      </span>
    </a>);
}

function BrokerageAccessBanner() {
  return (
    <div className="brokerage-access-banner reveal">
      <span className="bab-sheen" aria-hidden="true"></span>
      <div className="bab-copy">
        <span className="bab-kicker">للمشتركين بالحساب</span>
        <strong>يتم نشر تقارير بيوت الخبرة للمشتركين بالحساب</strong>
        <span className="bab-desc">متابعة مختصرة لأبرز التقارير البحثية: التوصية، السعر المستهدف، وما وراء التحديثات المهمة للشركات السعودية.</span>
        <span className="bab-note">* بيوت الخبرة التي عندنا اتفاقيات معها</span>
      </div>
      <div className="bab-showcase" aria-hidden="true">
        <span className="bab-report bab-report-one">
          <img src="banners/research-united-aramco.jpg" alt="" loading="eager" decoding="async" />
        </span>
        <span className="bab-report bab-report-two">
          <img src="banners/research-alinma-luberef.jpg" alt="" loading="eager" decoding="async" />
        </span>
        <span className="bab-report bab-report-three">
          <img src="banners/research-snb-lejam.jpg" alt="" loading="eager" decoding="async" />
        </span>
      </div>
    </div>);
}

function QualitativeMarketBanner() {
  return (
    <a
      className="qualitative-market-banner reveal"
      href="https://x.com/AlsagriCapital/status/1662714994377498629?s=20"
      target="_blank"
      rel="noreferrer">
      <span className="qmb-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M5 16.5L10 11.5L13.5 14.5L19 7" />
          <path d="M15 7H19V11" />
        </svg>
      </span>
      <span className="qmb-copy">
        <span className="qmb-kicker">أرشيف السوق السعودي</span>
        <strong>التقارير التي كتبت عن شركات السوق السعودي</strong>
        <span>مجموعة قراءات وتحليلات مختارة عن السوق، القطاعات، والشركات المدرجة.</span>
        <span className="qmb-tags" aria-hidden="true">
          <span>TASI</span>
          <span>SECTORS</span>
          <span>COMPANIES</span>
        </span>
      </span>
      <span className="qmb-panel" aria-hidden="true">
        <span className="qmb-panel-num">+80</span>
        <span className="qmb-panel-text">تقرير وقراءة عن شركات وقطاعات السوق</span>
      </span>
      <span className="qmb-action">استعراض التقارير <span>←</span></span>
    </a>);
}

function ServiceDetail() {
  const serviceId = document.body.dataset.serviceId;
  const service = window.SERVICES.find((s) => s.id === serviceId);
  if (!service) return <div className="wrap" style={{ padding: '80px 0' }}>الخدمة غير موجودة</div>;

  const reports = window.REPORTS.filter((r) => r.cat === serviceId);
  const catLabel = ({
    earnings: 'EARNINGS CALL',
    brokerage: 'RESEARCH',
    qualitative: 'QUALITATIVE',
    ipo: 'IPO',
  })[serviceId];

  return (
    <React.Fragment>
      <PageBanner
        num={service.num}
        eyebrow={service.en.toUpperCase()}
        title={service.ar}
        sub={service.desc}
        variant="services" />

      <section className="section first">
        <div className="wrap">
          <div style={{ marginBottom: 32 }}>
            <a href="services.html" style={{ color: 'var(--ink-soft)', textDecoration: 'none', fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span>→</span>
              <span>عودة للخدمات</span>
            </a>
          </div>

          <div className="section-head" style={{ marginBottom: 40 }}>
            <div className="label">
              <span className="num">/{service.num} · نماذج</span>
              <span className="kicker">{reports.length} تقارير</span>
            </div>
            <h2>نماذج من <span style={{ color: 'var(--accent)' }}>{service.ar}</span></h2>
          </div>

          {serviceId === 'earnings' && <EarningsFeatureBanner />}
          {serviceId === 'brokerage' && <BrokerageAccessBanner />}

          <div className="examples-grid">
            {reports.map((r) => <ReportCard key={r.co + r.title} r={r} catLabel={catLabel} />)}
          </div>

          {serviceId === 'qualitative' && <QualitativeMarketBanner />}
        </div>
      </section>
    </React.Fragment>);
}

/* ── CONTACT page ──────────────────────────────────────────────── */
function Contact() {
  return (
    <React.Fragment>
      <PageBanner
        num="04"
        eyebrow="CONTACT"
        title="للمراسلة والاستفسار."
        sub="يُسعدني تلقّي الملاحظات أو الاقتراحات على المحتوى. لا توجد نماذج تسجيلٍ ولا اشتراكاتٍ — مجرّد قنواتٍ مباشرة."
        variant="contact" />

      <section id="contact" className="section first">
        <div className="wrap">
          <div className="contact-list reveal" style={{ maxWidth: 760 }}>
            <a className="contact-row" href="https://x.com/alsagricapital" target="_blank" rel="noreferrer">
              <span className="k">X / TWITTER</span>
              <span className="v">@alsagricapital</span>
              <span className="arr">↗</span>
            </a>
            <a className="contact-row" href="mailto:alsagricapital@gmail.com">
              <span className="k">EMAIL</span>
              <span className="v">alsagricapital@gmail.com</span>
              <span className="arr">↗</span>
            </a>
            <a className="contact-row" href="https://wa.me/966505713333" target="_blank" rel="noreferrer">
              <span className="k">WHATSAPP</span>
              <span className="v">+966 505713333</span>
              <span className="arr">↗</span>
            </a>
          </div>
        </div>
      </section>

      <Disclaimer />
    </React.Fragment>);
}

/* ── DISCLAIMER section (full) ─────────────────────────────────── */
function Disclaimer() {
  return (
    <section id="disclaimer" className="disclaimer">
      <div className="wrap">
        <div className="disclaimer-card reveal">
          <div className="quote-mark">“</div>
          <div className="d-label">DISCLAIMER · إخلاء مسؤولية</div>
          <p className="d-text">
            الخدمة لا تشمل التوصيات المالية أو الاستشارات المالية، والمحتوى المقدَّم لأغراضٍ معلوماتيةٍ وتحليليةٍ فقط.
          </p>
          <p className="d-sub">
            Content presented on this platform is for informational and analytical purposes only. Nothing here constitutes financial advice, investment recommendation, or solicitation to buy or sell any security. Readers are responsible for their own investment decisions.
          </p>
        </div>
      </div>
    </section>);
}

/* ── SPONSORSHIP Q2 2026 page ─────────────────────────────────── */
function SponsorshipQ22026() {
  const sponsorshipPage = document.body.dataset.page;
  const isThreadsSponsorship = sponsorshipPage === 'sponsorship-threads';
  const isEnglishUsa = sponsorshipPage === 'sponsorshipusa-en';
  const isEnglishSaudiQ3 = sponsorshipPage === 'sponsorship-q3-saudi-en';
  const isEnglish = isEnglishUsa || isEnglishSaudiQ3;
  const isSaudiQ3 = sponsorshipPage === 'sponsorship-q3-saudi' || isEnglishSaudiQ3 || document.body.dataset.market === 'saudi-q3';
  const isUsaSponsorship = sponsorshipPage === 'sponsorshipusa' || isEnglishUsa || isSaudiQ3;
  const coverageCount = isSaudiQ3 ? 45 : 35;
  const sponsorshipEndDate = isSaudiQ3 ? (isEnglish ? 'the start of Q4 earnings season' : 'بداية نتائج الربع الرابع') : (isEnglish ? 'September 15, 2026' : '15 سبتمبر 2026');
  const sponsorshipMarket = isSaudiQ3 ? (isEnglish ? 'Saudi' : 'السعودية') : (isEnglish ? 'U.S.' : 'الأمريكية');
  const heroContent = isThreadsSponsorship ? {
    kicker: 'SPONSORSHIP 2026 · INVESTMENT THREADS SERIES',
    title: 'رعاية سلسلة تغريدات استثمارية',
    description: (
      <React.Fragment>
        فرصة رعاية كاملة أمام جمهور مالي نوعي لسلسلة متخصصة تلخص وتحلل أبرز الأعمال والنصائح المالية من كبار المستثمرين بطريقة منظمة ومرتبة.
      </React.Fragment>
    ),
    exampleCaption: 'نموذج ظهور الراعي في تغريدة السلسلة المثبتة',
    exampleAlt: 'مثال توضيحي لسلسلة تغريدات استثمارية مع ظهور شعار الراعي',
    exampleImage: 'assets/sponsorship/threads-example-tweet.png?v=threads1',
  } : {
    kicker: isSaudiQ3 ? 'SPONSORSHIP 2026 · Q3 SAUDI EARNINGS SEASON' : 'SPONSORSHIP 2026 · Q2 EARNINGS CALLS SERIES',
    title: isUsaSponsorship ? (
      <span className="sp-hero-title-with-flag">
        {isEnglish ? `Become the exclusive sponsor of the ${sponsorshipMarket} earnings season` : `كن الراعي الحصري لموسم نتائج الشركات ${sponsorshipMarket}`}
        {isSaudiQ3
          ? <img className="is-saudi-flag" src="assets/sponsorship/sa-flag.svg" alt={isEnglish ? 'Saudi Arabia' : 'علم المملكة العربية السعودية'} loading="eager" decoding="async" />
          : <img src="assets/sponsorship/us-flag.png" alt={isEnglish ? 'United States' : 'علم الولايات المتحدة'} loading="eager" decoding="async" />}
      </span>
    ) : 'رعاية سلسلة مكالمات نتائج الربع الثاني 2026',
    subtitle: null,
    description: (
      <React.Fragment>
        {isEnglish ? (
          <React.Fragment>
            {isSaudiQ3
              ? <React.Fragment>A single exclusive sponsorship opportunity for a specialized series that summarizes and analyzes earnings calls of Saudi listed companies through the <strong>end of the Q3 earnings season</strong>.</React.Fragment>
              : <React.Fragment>An exclusive sponsorship for a specialized Arabic series publishing at least 35 structured earnings-call coverages, with repeated brand visibility in front of an engaged financial audience through <strong>September 15, 2026</strong>.</React.Fragment>}
          </React.Fragment>
        ) : isSaudiQ3 ? (
          <React.Fragment>
            فرصة الرعاية الحصرية الوحيدة للموسم أمام جمهور مالي نوعي، عبر سلسلة متخصصة تلخص وتحلل مكالمات عرض النتائج للشركات المدرجة حتى <strong>نهاية فترة إعلان نتائج الربع الثالث</strong>.
          </React.Fragment>
        ) : isUsaSponsorship ? (
          <React.Fragment>
            فرصة الرعاية الحصرية الوحيدة للموسم أمام جمهور مالي نوعي، عبر سلسلة متخصصة تلخص وتحلل مكالمات عرض النتائج للشركات المدرجة حتى <strong>15 سبتمبر 2026</strong>.
          </React.Fragment>
        ) : (
          <React.Fragment>
            فرصة رعاية كاملة أمام جمهور مالي نوعي لسلسلة متخصصة تلخص وتحلل مكالمات عرض النتائج للشركات المدرجة خلال الفترة من <strong>15 يونيو - 15 سبتمبر</strong>.
          </React.Fragment>
        )}
      </React.Fragment>
    ),
    exampleCaption: isEnglish
      ? 'Sample sponsor placement in the opening post'
      : isUsaSponsorship
        ? 'نموذج ظهور الراعي في المنشور الافتتاحي'
        : 'نموذج ظهور الراعي في التغريدة المثبتة',
    exampleAlt: isEnglish
      ? `Opening post banner for the ${isSaudiQ3 ? 'Q3 Saudi' : 'Q2 U.S.'} earnings calls series with sponsor placement`
      : isUsaSponsorship
        ? 'بنر المنشور الافتتاحي لسلسلة مكالمات نتائج الشركات مع ظهور الراعي'
        : 'مثال توضيحي لتغريدة مكالمات المستثمرين مع ظهور شعار الراعي',
    exampleImage: isUsaSponsorship
      ? 'assets/sponsorship/q2-2026-opening-tweet-banner.png?v=openingusa2'
      : 'assets/sponsorship/q2-2026-example-tweet-enhanced.png?v=q2e',
  };
  const whatsappMessage = isEnglish
    ? `Hello, I would like to discuss the exclusive sponsorship for the ${isSaudiQ3 ? 'Q3 Saudi' : 'U.S.'} earnings season coverage.`
    : isSaudiQ3
      ? 'مرحباً، أرغب في مناقشة الرعاية الحصرية لتغطية موسم نتائج الشركات السعودية للربع الثالث 2026.'
    : isUsaSponsorship
      ? 'مرحباً، أرغب في مناقشة الرعاية الحصرية لتغطية موسم نتائج الشركات الأمريكية.'
      : 'مرحباً، أرغب في مناقشة رعاية سلسلة مكالمات النتائج.';
  const sponsorshipWhatsappUrl = `https://wa.me/966505713333?text=${encodeURIComponent(whatsappMessage)}`;

  // Hero parallax — motion variant only (sponsorship-q2-2026-motion.html). Writes
  // --sp-parallax (px) on the hero; the basic page is untouched. Skipped under
  // reduced-motion, rAF-throttled, cleaned up on unmount.
  React.useEffect(() => {
    if (document.body.dataset.page !== 'sponsorship-motion') return undefined;
    const hero = document.querySelector('.sponsorship-hero');
    if (!hero || !window.matchMedia) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const offset = Math.max(0, -hero.getBoundingClientRect().top);
      hero.style.setProperty('--sp-parallax', String(Math.min(offset, 600)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const stats = isEnglish ? [
    { value: isSaudiQ3 ? '17.1M' : '13.2M', label: 'Account impressions', note: isSaudiQ3 ? 'During the quarter' : 'April 13–July 13, 2026' },
    { value: isSaudiQ3 ? '52.7K' : '52K', label: 'Followers', note: isSaudiQ3 ? 'Snapshot: August 20, 2026' : 'Snapshot: July 13, 2026', badge: isSaudiQ3 ? undefined : '80% active followers' },
    { value: isSaudiQ3 ? '~81K' : '~65K', label: 'Views per coverage', note: isSaudiQ3 ? '81K average views, calculated from Q2 earnings-call coverage.' : '65K average views per coverage, calculated across 27 previously published earnings-call coverages' },
    { value: isSaudiQ3 ? '~355K' : '~322K', label: isSaudiQ3 ? 'Q2 opener views' : 'Previous opener views', note: isSaudiQ3 ? 'Q2 2026 opening post' : 'Q1 2026 opening post' },
  ] : [
    { value: isSaudiQ3 ? '17.1M' : isUsaSponsorship ? '13.2 مليون' : '~13.2M', label: isUsaSponsorship ? 'مرة ظهور للحساب' : 'مرات الظهور', note: isSaudiQ3 ? 'خلال الربع' : isUsaSponsorship ? 'الفترة: 13 أبريل إلى 13 يوليو 2026' : 'Impressions', noteClass: isUsaSponsorship ? 'sp-date-range' : '' },
    { value: isSaudiQ3 ? '52.7K' : isUsaSponsorship ? '52K' : '~51K', label: 'متابع', note: isSaudiQ3 ? 'لقطة بتاريخ 20 أغسطس 2026' : isUsaSponsorship ? 'لقطة بتاريخ 13 يوليو 2026' : 'Followers', badge: isSaudiQ3 ? undefined : '80% متابع نشط' },
    { value: isSaudiQ3 ? '~81K' : isUsaSponsorship ? '~65K' : '~55K', label: isUsaSponsorship ? 'مشاهدة لكل تغطية' : 'مشاهدة لكل مكالمة', note: isSaudiQ3 ? 'متوسط 81 ألف مشاهدة، محسوب على تغطية مكالمة نتائج الربع الثاني.' : isUsaSponsorship ? 'متوسط 65 ألف مشاهدة لكل تغطية، محسوب على 27 تغطية نتائج منشورة سابقاً.' : 'متوسط مشاهدات المحتوى' },
    { value: isSaudiQ3 ? '~355K' : isUsaSponsorship ? '~322K' : '~166K', label: isSaudiQ3 ? 'مشاهدة لافتتاحية الربع الثاني' : 'مشاهدة لافتتاحية الموسم السابق', note: isSaudiQ3 ? 'افتتاحية الربع الثاني 2026' : isUsaSponsorship ? 'افتتاحية الربع الأول 2026' : 'تغريدة مثبتة' },
  ];

  const expectedCompanies = isSaudiQ3 ? [
    { name: 'إس تي سي', ticker: '7010', logo: 'assets/sponsorship/companies/stc.svg' },
    { name: 'موبايلي', ticker: '7020', logo: 'assets/sponsorship/companies/mobily.png' },
    { name: 'أرامكو', ticker: '2222', logo: 'assets/sponsorship/companies/aramco.webp' },
    { name: 'سابك', ticker: '2010', logo: 'assets/sponsorship/companies/sabic.svg' },
    { name: 'سال', ticker: '4263', logo: 'assets/sponsorship/companies/sal.png' },
    { name: 'لوبريف', ticker: '2223', logo: 'assets/sponsorship/companies/luberef.png' },
    { name: 'لجام الرياضية', ticker: '1830', logo: 'assets/sponsorship/companies/leejam-official.svg', logoTone: 'navy' },
    { name: 'مصرف الإنماء', ticker: '1150', logo: 'assets/sponsorship/companies/alinma.png' },
    { name: 'البنك الأهلي', ticker: '1180', logo: 'assets/sponsorship/companies/snb.svg' },
    { name: 'المراعي', ticker: '2280', logo: 'assets/sponsorship/companies/almarai-official.svg' },
    { name: 'الدريس', ticker: '4200', logo: 'assets/sponsorship/companies/aldrees.png' },
    { name: 'بنك الجزيرة', ticker: '1020', logo: 'assets/sponsorship/companies/aljazira-official.svg', logoTone: 'navy' },
    { name: 'مصرف الراجحي', ticker: '1120', logo: 'assets/sponsorship/companies/alrajhi.svg' },
    { name: 'النهدي', ticker: '4164', logo: 'assets/sponsorship/companies/nahdi.png' },
    { name: 'جمجوم فارما', ticker: '4015', logo: 'assets/sponsorship/companies/jamjoom.png' },
    { name: 'أفالون فارما', ticker: '4016', logo: 'assets/sponsorship/companies/avalon.png', logoTone: 'navy' },
    { name: 'البنك السعودي الفرنسي', ticker: '1050', logo: 'assets/sponsorship/companies/bsf.svg' },
    { name: 'البنك السعودي الأول', ticker: '1060', logo: 'assets/sponsorship/companies/sab.svg' },
    { name: 'لومي', ticker: '4262', logo: 'assets/sponsorship/companies/lumi.png', logoTone: 'green' },
    { name: 'علم', ticker: '7203', logo: 'assets/sponsorship/companies/elm.svg' },
    { name: 'بدجت السعودية', ticker: '4260', logo: 'assets/sponsorship/companies/budget.jpg' },
    { name: 'المعمر MIS', ticker: '7200', logo: 'assets/sponsorship/companies/mis.png', logoTone: 'navy' },
    { name: 'كابلات الرياض', ticker: '4142', logo: 'assets/sponsorship/companies/riyadh-cables.png' },
    { name: 'المطاحن الأولى', ticker: '2283', logo: 'assets/sponsorship/companies/firstmills.png' },
    { name: 'أسترا الصناعية', ticker: '1212', logo: 'assets/sponsorship/companies/astra.png' },
    { name: 'دار الأركان', ticker: '4300', logo: 'assets/sponsorship/companies/daralarkan.webp' },
    { name: 'رتال', ticker: '4322', logo: 'assets/sponsorship/companies/retal.png' },
    { name: 'أكوا باور', ticker: '2082', logo: 'assets/sponsorship/companies/acwa.svg', logoTone: 'navy' },
    { name: 'رعاية الطبية', ticker: '4005', logo: 'assets/sponsorship/companies/care.png' },
    { name: 'مياهنا', ticker: '2084', logo: 'assets/sponsorship/companies/miahona.svg' },
  ] : [
    { name: 'Apple', ticker: 'AAPL', logo: 'https://cdn.simpleicons.org/apple/0A1A33' },
    { name: 'Microsoft', ticker: 'MSFT', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg' },
    { name: 'Nvidia', ticker: 'NVDA', logo: 'https://cdn.simpleicons.org/nvidia/76B900' },
    { name: 'Tesla', ticker: 'TSLA', logo: 'https://cdn.simpleicons.org/tesla/CC0000' },
    { name: 'Amazon', ticker: 'AMZN', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
    { name: 'Micron Technology', ticker: 'MU', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Micron_Technology_logo_2024.svg' },
    { name: 'Meta', ticker: 'META', logo: 'https://cdn.simpleicons.org/meta/0866FF' },
    { name: 'Google', ticker: 'GOOGL', logo: 'https://cdn.simpleicons.org/google/4285F4' },
    { name: 'AMD', ticker: 'AMD', logo: 'https://cdn.simpleicons.org/amd/ED1C24' },
    { name: 'Netflix', ticker: 'NFLX', logo: 'https://cdn.simpleicons.org/netflix/E50914' },
  ];

  const analytics = [
    { label: 'Verified followers', value: '2.3K', sub: '/ 50.9K', verified: true },
    { label: 'Active followers', value: '39.9K', sub: '/ 50.9K' },
    { label: 'Impressions', value: '13.2M', up: '140%' },
    { label: 'Profile visits', value: '25.6K', up: '162%' },
    { label: 'Replies', value: '2.1K', up: '140%' },
    { label: 'Likes', value: '15.8K', up: '242%' },
    { label: 'Reposts', value: '2.6K', up: '343%' },
    { label: 'Bookmarks', value: '8.8K', up: '242%' },
    { label: 'Shares', value: '3.6K', up: '178%' },
  ];

  const flow = isEnglish ? [
    { n: '01', title: 'Results announced', text: 'The company officially reports its results' },
    { n: '02', title: 'Coverage published', text: 'The coverage is published on X within hours', metric: isSaudiQ3 ? '81K average views, calculated from Q2 earnings-call coverage' : '65K average views, calculated across 27 published earnings-call coverages from April 13 to July 13, 2026' },
    { n: '03', title: 'Your logo appears', text: 'At the beginning of each coverage and in the opening post' },
    { n: '04', title: 'Quarter-long brand presence', text: 'Your brand appears repeatedly with each company result', metric: isSaudiQ3 ? '17.1M impressions during the quarter' : '+13M impressions during the quarter' },
  ] : [
    { n: '01', title: 'إعلان النتائج', text: 'الشركة تعلن نتائجها رسمياً' },
    { n: '02', title: isUsaSponsorship ? 'نشر التغطية' : 'نشر المكالمة', text: isUsaSponsorship ? 'نشر التغطية على X خلال ساعات' : 'نشر المكالمة في تويتر خلال ساعات', metric: isSaudiQ3 ? 'متوسط 81 ألف مشاهدة، محسوب على تغطية مكالمة نتائج الربع الثاني' : isUsaSponsorship ? 'متوسط 65 ألف مشاهدة، محسوب على 27 تغطية نتائج منشورة خلال الفترة من 13 أبريل إلى 13 يوليو 2026' : 'متوسط مشاهدات 55 ألف للمكالمات' },
    { n: '03', title: 'ظهور شعارك', text: isUsaSponsorship ? 'في بداية كل تغطية وفي المنشور الافتتاحي' : 'أسفل المكالمة وفي التغريدة الافتتاحية المثبتة' },
    { n: '04', title: 'حضور العلامة التجارية طوال الربع', text: 'يتكرر ظهور العلامة التجارية مع نتائج كل شركة', metric: isSaudiQ3 ? 'ظهور 17.1M خلال الربع' : 'ظهور +13M خلال الربع' },
  ];

  const reasons = isEnglish ? [
    { n: '01', title: 'A focused financial audience', text: 'Investors and traders, not a general audience. Every view has context and value.' },
    { n: '02', title: 'A lasting series reference', text: 'The opening post links the season coverage together, so your presence continues beyond a single post.' },
    { n: '03', title: 'Repeated logo exposure', text: `In the opening post and at the beginning of each coverage, with at least ${coverageCount} appearances during the season.` },
    { n: '04', title: 'Professional financial content', text: 'The content is followed by executives, market participants, and decision-makers, based on the analytics we track.' },
    ...(isSaudiQ3 ? [
      { n: '05', title: 'The only account covering Saudi earnings calls', text: 'Continuous coverage of Saudi listed-company earnings calls, organized in one place throughout the season.' },
      { n: '06', title: 'A measurable, optimizable campaign', text: 'An interim report enables message optimization, followed by a final report documenting performance.' },
    ] : []),
  ] : [
    { n: '01', title: 'جمهور مالي نوعي', text: 'مستثمرون ومتداولون، لا جمهور عام. كل مشاهدة لها قيمة.' },
    { n: '02', title: isUsaSponsorship ? 'مرجع مستمر للسلسلة' : 'محتوى دائم ومثبت', text: isUsaSponsorship ? 'يربط المنشور الافتتاحي تغطيات الموسم ببعضها، فلا ينتهي حضورك بانتهاء منشور واحد.' : 'الافتتاحية مثبتة طوال الربع، وحضورك لا ينتهي بانتهاء منشور واحد.' },
    { n: '03', title: 'ظهور متكرر للشعار', text: isUsaSponsorship ? `في المنشور الافتتاحي وبداية كل تغطية، مع ${coverageCount} ظهوراً على الأقل خلال الموسم.` : 'في الافتتاحية وأسفل كل مكالمة، مع أكثر من 25 ظهور خلال الربع.' },
    { n: '04', title: 'ظهور في محتوى احترافي', text: 'يتابع المحتوى رؤساء تنفيذيون لشركات مدرجة وكبار الإداريين والتنفيذيين، بناءً على الأرقام والإحصائيات لدينا.' },
    ...(isSaudiQ3 ? [
      { n: '05', title: 'الحساب الوحيد اللي يغطي مكالمات النتائج', text: 'تغطية مستمرة لمكالمات نتائج الشركات السعودية في مكان واحد طوال الموسم.' },
      { n: '06', title: 'حملة قابلة للقياس والتحسين', text: 'تقرير مرحلي يسمح بتحسين الرسالة، ثم تقرير نهائي يوثق الأداء.' },
    ] : []),
  ];

  const sponsorBenefits = isEnglish ? [
    { title: 'Repeated presence—not a one-off ad', text: `Your brand appears throughout earnings season across at least ${coverageCount} published coverages.` },
    { title: 'Association with specialist financial context', text: 'Your brand appears beside content followed by investors and people interested in companies and markets.' },
    { title: 'Reach beyond the follower base', text: 'A meaningful share of content reach comes from people who do not already follow the account.' },
    { title: 'A measurable, optimizable campaign', text: 'An interim report supports message optimization, followed by a final report documenting performance.' },
  ] : [
    { title: 'حضور متكرر، وليس إعلاناً لمرة واحدة', text: `تظهر العلامة طوال موسم النتائج عبر ${coverageCount} تغطية منشورة على الأقل.` },
    { title: 'ارتباط بسياق مالي متخصص', text: 'تظهر العلامة بجوار محتوى يتابعه المستثمرون والمهتمون بالشركات والأسواق.' },
    { title: 'وصول إلى جمهور جديد', text: 'جزء مهم من وصول المحتوى يأتي من خارج قاعدة المتابعين.' },
    { title: 'حملة قابلة للقياس والتحسين', text: 'تقرير مرحلي يسمح بتحسين الرسالة، ثم تقرير نهائي يوثق الأداء.' },
  ];

  const placements = isThreadsSponsorship ? [
    {
      code: 'A',
      title: 'غلاف التغريدة الافتتاحية المثبتة',
      text: 'تغريدة تعريفية تجمع الثريدات والتقارير العامة، ويظهر فيها شعار الشركة الراعية بوضوح.',
      image: 'assets/sponsorship/threads-example-tweet.png?v=threads1',
      alt: 'مثال توضيحي لغلاف تغريدة سلسلة التغريدات الاستثمارية مع ظهور شعار الشركة الراعية',
    },
    {
      code: 'B',
      title: 'داخل كل ثريد أو تقرير',
      text: 'إشارة شكر وشعار الشركة الراعية يظهران داخل محتوى الثريد أو التقرير المنشور خلال فترة الرعاية.',
    },
    {
      code: 'C',
      title: 'شعار الشركة الراعية داخل صورة السلسلة',
      text: 'مساحة واضحة داخل الصورة المرفقة بالتغريدة مخصصة لعبارة: هنا شعار الشركة الراعية.',
      image: 'assets/sponsorship/threads-sponsor-banner.png?v=threads1',
      alt: 'بنر توضيحي لسلسلة تقارير وملخصات استثمارية مع مساحة شعار الشركة الراعية',
      wide: true,
    },
  ] : isEnglish ? [
    {
      code: 'A',
      title: 'Opening post cover',
      text: 'The opening post launches the series and links together all earnings-call coverage during the season.',
      image: isSaudiQ3 ? 'assets/sponsorship/q2-2026-example-tweet-enhanced.png?v=q3saudi1' : 'assets/sponsorship/q2-2026-opening-tweet-banner.png?v=openingusa2',
      alt: 'Illustrative opening post cover with sponsor logo placement',
    },
    {
      code: 'B',
      title: 'At the beginning of each earnings-call coverage',
      text: 'The sponsor is presented as the exclusive season partner after the coverage introduction and before the full transcript.',
      image: 'assets/sponsorship/q2-2026-inside-call-sponsor-example.png?v=inside1',
      alt: 'Sponsor presentation and logo near the beginning of an earnings-call coverage',
    },
    {
      code: 'C',
      title: 'Brand logo in every coverage banner',
      text: 'The sponsor logo appears inside the main banner for every published coverage throughout the season.',
      image: isSaudiQ3 ? 'assets/sponsorship/q2-2026-call-banner-almarai.png?v=q3saudi1' : 'assets/sponsorship/q2-2026-call-banner-nvidia.png?v=nvidia1',
      alt: isSaudiQ3 ? 'Almarai earnings coverage banner with sponsor logo placement' : 'NVIDIA earnings coverage banner with sponsor logo placement',
      wide: true,
    },
  ] : [
    {
      code: 'A',
      title: isUsaSponsorship ? 'غلاف المنشور الافتتاحي' : 'غلاف التغريدة الافتتاحية المثبتة',
      text: isUsaSponsorship ? 'تنطلق منها السلسلة وتُربط بها جميع تغطيات مكالمات النتائج خلال الموسم.' : 'مثبتة أعلى الحساب طوال الربع، وهي أول ما يراه زائر السلسلة.',
      image: isSaudiQ3 ? 'assets/sponsorship/q2-2026-example-tweet-enhanced.png?v=q3saudi1' : isUsaSponsorship ? 'assets/sponsorship/q2-2026-opening-tweet-banner.png?v=openingusa2' : 'assets/sponsorship/q2-2026-example-tweet-enhanced.png?v=q2e',
      alt: isUsaSponsorship ? 'مثال توضيحي لغلاف المنشور الافتتاحي مع ظهور شعار الراعي' : 'مثال توضيحي لغلاف التغريدة الافتتاحية المثبتة مع ظهور شعار الراعي',
    },
    {
      code: 'B',
      title: isUsaSponsorship ? 'في بداية كل تغطية نتائج' : 'أسفل كل مكالمة نتائج',
      text: isUsaSponsorship ? 'يُقدّم الراعي كشريك حصري للموسم، ويظهر شعاره بعد مقدمة التغطية وقبل بدء النص الكامل.' : 'شعارك أسفل المقال في كل مكالمة، مع أكثر من 25 مرة في الربع.',
      image: isUsaSponsorship ? 'assets/sponsorship/q2-2026-inside-call-sponsor-example.png?v=inside1' : undefined,
      alt: isUsaSponsorship ? 'مثال لتقديم الراعي وشعاره في بداية تغطية نتائج' : undefined,
    },
    {
      code: 'C',
      title: isUsaSponsorship ? 'شعار العلامة التجارية في البنر الأساسي للتغطية' : 'شعار العلامة التجارية في البنر الأساسي للمكالمة',
      text: isUsaSponsorship ? 'شعار الراعي داخل البنر الأساسي للتغطية، ويظهر مع كل تغطية منشورة طوال الموسم.' : 'شعار الراعي داخل البنر الأساسي للمكالمة، يظهر مع كل مكالمة منشورة طوال الموسم.',
      image: isSaudiQ3 ? 'assets/sponsorship/q2-2026-call-banner-almarai.png?v=q3saudi1' : isUsaSponsorship ? 'assets/sponsorship/q2-2026-call-banner-nvidia.png?v=nvidia1' : 'assets/sponsorship/q2-2026-banner-go-telecom.png?v=q2e',
      alt: isSaudiQ3 ? 'بنر مكالمة نتائج المراعي مع موضع شعار الشركة الراعية' : isUsaSponsorship ? 'بنر مكالمة نتائج إنفيديا مع موضع شعار الشركة الراعية' : 'مثال توضيحي لظهور شعار الراعي في البنر الأساسي لمكالمة عرض النتائج',
      wide: true,
    },
  ];
  const usaPlacementSteps = isEnglish ? [
    {
      n: '01',
      title: 'Opening post — the series hub',
      text: `Your logo appears in the opening post that launches the series and links together the coverage through ${sponsorshipEndDate}.`,
      badge: isSaudiQ3 ? 'One series opener — Q1 achieved 325K views and Q2 achieved 355K views.' : 'One series opener — the previous season opener achieved 322K views.',
      image: isSaudiQ3 ? 'assets/sponsorship/q2-2026-example-tweet-enhanced.png?v=q3saudi1' : 'assets/sponsorship/q2-2026-opening-tweet-banner.png?v=openingusa2',
      alt: 'Opening earnings calls post with the sponsor logo placement highlighted',
      visual: 'opening',
    },
    {
      n: '02',
      title: 'Every coverage banner',
      text: 'Your logo is integrated into the cover image published with every earnings-call coverage.',
      badge: isSaudiQ3 ? `${coverageCount} placements minimum · 81K average views per coverage` : '35 placements · 65K average views per coverage',
      image: isSaudiQ3 ? 'assets/sponsorship/q2-2026-call-banner-almarai.png?v=q3saudi1' : 'assets/sponsorship/q2-2026-call-banner-nvidia.png?v=nvidia1',
      alt: isSaudiQ3 ? 'Almarai earnings-call coverage banner showing the sponsor logo placement' : 'NVIDIA earnings-call coverage banner showing the sponsor logo placement',
      visual: 'banner',
    },
    {
      n: '03',
      title: 'Beginning of every coverage — exclusive partner presentation',
      text: 'The sponsor is presented as the exclusive season partner after the coverage introduction and before the full transcript begins.',
      badge: isSaudiQ3 ? `${coverageCount} placements minimum` : '35 placements',
      image: 'assets/sponsorship/q2-2026-inside-call-sponsor-example.png?v=inside1',
      alt: 'Sponsor presentation and logo shown near the beginning of an earnings-call coverage',
      visual: 'inside',
    },
  ] : [
    {
      n: '01',
      title: 'المنشور الافتتاحي — بوابة السلسلة',
      text: `يظهر شعارك في المنشور الافتتاحي الذي تنطلق منه السلسلة، وتُربط به التغطيات حتى ${sponsorshipEndDate}.`,
      badge: isSaudiQ3 ? 'افتتاحية واحدة للسلسلة — الربع الأول 325 ألف مشاهدة، والربع الثاني 355 ألف مشاهدة.' : 'افتتاحية واحدة للسلسلة — حققت افتتاحية الموسم السابق 322 ألف مشاهدة.',
      image: isSaudiQ3 ? 'assets/sponsorship/q2-2026-example-tweet-enhanced.png?v=q3saudi1' : 'assets/sponsorship/q2-2026-opening-tweet-banner.png?v=openingusa2',
      alt: 'المنشور الافتتاحي لمكالمات النتائج مع تحديد موضع شعار الراعي',
      visual: 'opening',
    },
    {
      n: '02',
      title: 'بنر كل تغطية',
      text: 'يُدمج شعارك داخل صورة الغلاف المنشورة مع كل تغطية لمكالمة نتائج.',
      badge: isSaudiQ3 ? `${coverageCount} ظهور على الأقل (متوسط 81 ألف مشاهدة لكل تغطية)` : `${coverageCount} ظهور (متوسط لكل تغطية 65 ألف مشاهدة)`,
      image: isSaudiQ3 ? 'assets/sponsorship/q2-2026-call-banner-almarai.png?v=q3saudi1' : 'assets/sponsorship/q2-2026-call-banner-nvidia.png?v=nvidia1',
      alt: isSaudiQ3 ? 'بنر مكالمة نتائج المراعي يوضح موضع شعار الشركة الراعية' : 'بنر مكالمة نتائج إنفيديا يوضح موضع شعار الشركة الراعية',
      visual: 'banner',
    },
    {
      n: '03',
      title: 'بداية كل تغطية — تقديم الراعي كشريك حصري للموسم',
      text: 'يُقدّم الراعي كشريك حصري للموسم ويظهر شعاره بعد مقدمة التغطية وأسماء الإدارة مباشرة، وقبل بدء النص الكامل.',
      badge: isSaudiQ3 ? `${coverageCount} ظهور على الأقل` : `${coverageCount} ظهور`,
      image: 'assets/sponsorship/q2-2026-inside-call-sponsor-example.png?v=inside1',
      alt: 'مثال لموضع شكر الراعي وشعاره في بداية مكالمة نتائج',
      visual: 'inside',
    },
  ];

  const basePackages = [
    {
      tier: 'SILVER',
      title: isEnglish ? 'Silver Package' : 'الباقة الفضية',
      period: isEnglish ? 'Q2 2026 earnings calls sponsorship' : 'رعاية مكالمات النتائج للربع الثاني من عام 2026',
      priceAmount: '10,000',
      priceLabel: isEnglish ? 'for the period' : 'للفترة',
      features: [
        { text: isEnglish ? 'Sponsor logo appears in the pinned tweet' : 'شعار الشركة الراعية يظهر في التغريدة المثبتة', code: 'A' },
        { text: isEnglish ? 'Sponsor mention and logo appear in 5 calls' : 'إشارة شكر وشعار الشركة الراعية يظهران في 5 مكالمات', code: 'B' },
      ],
    },
    {
      tier: 'GOLD',
      title: isEnglish ? 'Gold Package' : 'الباقة الذهبية',
      period: isEnglish ? 'Q2 2026 earnings calls sponsorship' : 'رعاية مكالمات النتائج للربع الثاني من عام 2026',
      priceAmount: '30,000',
      priceLabel: isEnglish ? 'for the period' : 'للفترة',
      features: [
        { text: isEnglish ? 'Sponsor logo appears in the pinned tweet' : 'شعار الشركة الراعية يظهر في التغريدة المثبتة', code: 'A' },
        { text: isEnglish ? 'Sponsor mention and logo appear in all calls, +25 calls' : 'إشارة شكر وشعار الشركة الراعية يظهران في جميع المكالمات، +25 مكالمة', code: 'B' },
        { text: isEnglish ? 'Sponsor ad placement at any time during the period' : 'إعلان للشركة الراعية في أي وقت حسب رغبتهم خلال الفترة' },
      ],
    },
    {
      tier: 'DIAMOND',
      title: isEnglish ? 'Diamond Package' : 'الباقة الألماسية',
      period: isEnglish ? 'Q2 2026 earnings calls sponsorship' : 'رعاية مكالمات النتائج للربع الثاني من عام 2026',
      priceAmount: '50,000',
      priceLabel: isEnglish ? 'for the period' : 'للفترة',
      featured: true,
      features: [
        { text: isEnglish ? 'Sponsor logo appears in the pinned tweet' : 'شعار الشركة الراعية يظهر في التغريدة المثبتة', code: 'A' },
        { text: isEnglish ? 'Sponsor mention and logo appear in all calls, +25 calls' : 'إشارة شكر وشعار الشركة الراعية يظهران في جميع المكالمات، +25 مكالمة', code: 'B' },
        { text: isEnglish ? 'Sponsor logo added to the main banner of every call' : 'إضافة شعار الشركة الراعية في البنر الأساسي لكل مكالمة', code: 'C' },
        { text: isEnglish ? 'Sponsor ad placement at any time during the period' : 'إعلان للشركة الراعية في أي وقت حسب رغبتهم خلال الفترة' },
        { amount: '+10,000', text: isEnglish ? 'allocated to paid promotion on X for the tweet, supporting brand reach' : 'مخصصة للترويج المدفوع في تويتر للتغريدة، مما يدعم انتشار العلامة التجارية' },
      ],
    },
  ];
  const exclusiveUsaPackage = {
    tier: 'EXCLUSIVE',
    title: isEnglish ? 'Exclusive Sponsorship' : 'الرعاية الحصرية',
    period: isEnglish ? `From signing through ${sponsorshipEndDate}` : `من تاريخ التوقيع حتى ${sponsorshipEndDate}`,
    priceAmount: isSaudiQ3 ? '95,000' : '60,000',
    priceLabel: isEnglish ? 'for the season' : 'للموسم',
    featured: true,
    features: [
      { text: isEnglish ? `No other sponsor will appear within the ${sponsorshipMarket} earnings series throughout the agreement term.` : `لن يظهر أي راعٍ آخر داخل سلسلة نتائج الشركات ${sponsorshipMarket} طوال مدة الاتفاق.` },
      { text: isEnglish ? 'Sponsor visibility in the opening post' : 'الظهور في المنشور الافتتاحي' },
      { text: isEnglish ? 'Logo inside the main banner for every published coverage' : 'الشعار داخل البنر الأساسي لجميع التغطيات المنشورة' },
      { text: isEnglish ? 'Sponsor presented as the exclusive season partner at the beginning of every coverage' : 'تقديم الراعي كشريك حصري للموسم في بداية كل تغطية' },
      { text: isEnglish ? `At least ${coverageCount} published coverages during the season` : `حد أدنى ${coverageCount} تغطية منشورة خلال الموسم` },
      ...(!isSaudiQ3 ? [{ text: isEnglish ? 'One custom promotional post with mutually agreed copy' : 'منشور إعلاني مخصص واحد بصياغة متفق عليها' }] : []),
      { text: isEnglish ? `Tagging the sponsor’s X account in every published coverage (${coverageCount}+ times)` : `إشارة إلى حساب الراعي على X في كل تغطية منشورة (+${coverageCount} مرة)` },
      { text: isEnglish ? 'A mutually agreed call to action, such as “Download the app” or “Learn about the service”' : 'عبارة دعوة للفعل متفق عليها، مثل «حمّل التطبيق» أو «تعرف إلى الخدمة»' },
      { text: isEnglish ? 'Interim performance report after the first 15–20 coverages, followed by a final report at the end of the season' : 'تقرير أداء مرحلي بعد أول 15–20 تغطية، وتقرير نهائي بعد انتهاء الموسم' },
    ],
  };
  const packages = isUsaSponsorship ? [exclusiveUsaPackage] : basePackages;
  const hiddenPreviousExamples = ['لوسيد', 'الأمار', 'المراعي'];
  const previousExampleViews = {
    'لوبريف': '243K',
    'أرامكو السعودية': '28K',
    'أفالون فارما': '35K',
    'وقت اللياقة': '64K',
    'رسن': '113K',
    'سال': '165K',
  };
  const previousExamples = window.REPORTS.filter((r) => r.cat === 'earnings' && !hiddenPreviousExamples.includes(r.co));
  const saudiQ1NameMap = {
    'لوبريف': 'Luberef',
    'أرامكو السعودية': 'Saudi Aramco',
    'رسن': 'Rasan',
  };
  const saudiQ1Examples = window.REPORTS
    .filter((r) => r.cat === 'earnings' && ['لوبريف', 'أرامكو السعودية', 'رسن'].includes(r.co))
    .map((r) => isEnglish ? { ...r, co: saudiQ1NameMap[r.co], title: 'Q1 2026 earnings call' } : r);
  const saudiQ2Examples = [
    {
      cat: 'earnings',
      co: isEnglish ? 'Almarai' : 'المراعي',
      ticker: '2280.SR',
      title: isEnglish ? 'Q2 2026 earnings call' : 'مكالمة نتائج الربع الثاني 2026',
      date: '2026·07·07',
      cover: 'banners/almarai-q2-2026.png',
      link: 'https://x.com/AlsagriCapital/status/2074548263080931355?s=20',
    },
    {
      cat: 'earnings',
      co: isEnglish ? 'Jamjoom Pharma' : 'جمجوم فارما',
      ticker: '4015.SR',
      title: isEnglish ? 'Q2 2026 earnings call' : 'مكالمة نتائج الربع الثاني 2026',
      date: '2026·07·22',
      cover: 'banners/jamjoom-pharma-q2-2026.png',
      link: 'https://x.com/AlsagriCapital/status/2079992576245989449?s=20',
    },
    {
      cat: 'earnings',
      co: isEnglish ? 'Al Rajhi Bank' : 'مصرف الراجحي',
      ticker: '1120.SR',
      title: isEnglish ? 'Q2 2026 earnings call' : 'مكالمة نتائج الربع الثاني 2026',
      date: '2026·07·28',
      cover: 'banners/alrajhi-bank-q2-2026.png',
      link: 'https://x.com/AlsagriCapital/status/2082167228288712815?s=20',
    },
  ];
  const saudiQ2ExampleViews = {
    'المراعي': '89 ألف',
    'جمجوم فارما': '332 ألف',
    'مصرف الراجحي': '99 ألف',
    'Almarai': '89K',
    'Jamjoom Pharma': '332K',
    'Al Rajhi Bank': '99K',
  };
  const saudiQ1ExampleViews = isEnglish ? {
    'Luberef': '243K',
    'Saudi Aramco': '28K',
    'Rasan': '113K',
  } : previousExampleViews;

  const statsEvidence = (
    <React.Fragment>
      <div className="sp-stats-grid">
        {stats.map((stat, idx) => (
          <div className={'sp-stat reveal d' + (idx + 1)} key={stat.value}>
            <div className="sp-stat-value">
              <strong>{stat.value}</strong>
              {stat.badge && <em className="sp-stat-badge">{stat.badge}</em>}
            </div>
            <span>{stat.label}</span>
            <small className={stat.noteClass || undefined}>{stat.note}</small>
          </div>
        ))}
      </div>
      {isUsaSponsorship && (
        <p className="sp-stats-source">
          {isEnglish
            ? isSaudiQ3
              ? 'Source: X analytics and available account audience data. Snapshot dated August 20, 2026.'
              : 'Source: X analytics, data dated July 13, 2026. Impressions mean the total number of times account posts were displayed during the stated period.'
            : isSaudiQ3
              ? 'المصدر: تحليلات منصة X وبيانات جمهور الحساب المتاحة، لقطة بتاريخ 20 أغسطس 2026.'
              : 'المصدر: تحليلات منصة X، البيانات بتاريخ 13 يوليو 2026. مرات الظهور تعني إجمالي مرات عرض منشورات الحساب خلال الفترة الموضحة.'}
        </p>
      )}
      <figure className="sp-analytics">
        <figcaption>
          <span>{isEnglish ? 'Verified source' : 'مصدر موثّق'}</span>
          <small>{isEnglish ? 'Alsagri account analytics on X' : 'تحليلات حساب الصقري على منصة X'}</small>
        </figcaption>
        {isSaudiQ3 ? (
          <div className="sp-analytics-image">
            <img
              src="assets/sponsorship/alsagri-x-analytics-aug-2026-v2.png"
              alt={isEnglish
                ? 'Alsagri account analytics on X, including followers, impressions, engagement, and profile activity'
                : 'تحليلات حساب الصقري على منصة X، وتشمل المتابعين ومرات الظهور والتفاعل ونشاط الملف الشخصي'}
            />
          </div>
        ) : (
          <div className="sp-analytics-grid">
            {analytics.map((a) => (
              <div className="sp-an-card" key={a.label}>
                <div className="sp-an-label">
                  {a.label}
                  {a.verified && (
                    <svg className="sp-an-check" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" fill="#1d9bf0" />
                      <path d="M9.3 12.4l1.9 1.9 3.6-3.9" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="sp-an-val">
                  {a.value}
                  {a.sub && <small>{a.sub}</small>}
                  {a.up && <span className="sp-an-up">↑ {a.up}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </figure>
    </React.Fragment>
  );

  const proofMediaCard = (
    <div className="sp-proof-card sp-proof-media reveal">
      <span className="sp-proof-label">{isEnglish ? 'Verified performance' : 'أداء موثق'}</span>
      {isSaudiQ3 ? (
        <div className="sp-proof-history-metrics">
          <strong>{isEnglish ? <React.Fragment><bdi dir="ltr">~322K</bdi> views on the Q1 2026 earnings calls opener</React.Fragment> : <React.Fragment><bdi dir="ltr">~322K</bdi> مشاهدة لـ افتتاحية مكالمات الربع الأول 2026</React.Fragment>}</strong>
          <strong>{isEnglish ? <React.Fragment><bdi dir="ltr">~355K</bdi> views on the Q2 2026 earnings calls opener</React.Fragment> : <React.Fragment><bdi dir="ltr">~355K</bdi> مشاهدة لـ افتتاحية مكالمات الربع الثاني 2026</React.Fragment>}</strong>
        </div>
      ) : (
        <strong>{isEnglish ? '~322K views on the previous opener' : isUsaSponsorship ? '~322K مشاهدة للافتتاحية السابقة' : '~166K مشاهدة للافتتاحية السابقة'}</strong>
      )}
      <p>{isEnglish ? (isSaudiQ3 ? 'Actual X screenshots from the Q1 and Q2 openers, documenting the series’ historical performance across more than one quarter.' : 'An actual X screenshot from the previous season opener, showing views and engagement around the series.') : isSaudiQ3 ? 'لقطات فعلية من منصة X لافتتاحيتي الربعين الأول والثاني، وتوضح الأداء التاريخي للسلسلة عبر أكثر من ربع.' : 'لقطة فعلية من منصة X للتغريدة الافتتاحية في الموسم السابق، وتوضح حجم المشاهدات والتفاعل على السلسلة.'}</p>
      <figure className="sp-proof-quarter">
        {isSaudiQ3 && <figcaption className="sp-proof-quarter-label">{isEnglish ? 'Q1' : 'الربع الأول'}</figcaption>}
        {isSaudiQ3 ? (
          <a
            className="sp-proof-post-link"
            href="https://x.com/AlsagriCapital/status/2054659950194942119?s=20"
            target="_blank"
            rel="noreferrer"
            aria-label={isEnglish ? 'Open the original Q1 2026 earnings calls post' : 'فتح التغريدة الأصلية لافتتاحية مكالمات الربع الأول 2026'}>
            <div className="sp-proof-window sp-proof-window-image">
              <img
                src="assets/sponsorship/q2-2026-proof-tweet-322k.png"
                alt={isEnglish ? 'Q1 2026 opener performance on X' : 'أداء افتتاحية الربع الأول 2026 على منصة X'}
                loading="lazy"
                decoding="async" />
            </div>
            <span className="sp-proof-post-cta">{isEnglish ? 'View the original post' : 'اضغط هنا للذهاب إلى التغريدة الأصلية'} <span aria-hidden="true">↗</span></span>
          </a>
        ) : (
          <div className="sp-proof-window sp-proof-window-image">
            <img
              src={isUsaSponsorship ? 'assets/sponsorship/q2-2026-proof-tweet-322k.png' : 'assets/sponsorship/q2-2026-proof-tweet.png'}
              alt={isEnglish ? 'Screenshot of an earnings calls tweet showing more than 322K views' : isUsaSponsorship ? 'لقطة من تغريدة مكالمات المستثمرين تظهر أكثر من 322 ألف مشاهدة' : 'لقطة من تغريدة مكالمات المستثمرين تظهر 166.5 ألف مشاهدة وتفاعل المتابعين'}
              loading="lazy"
              decoding="async" />
          </div>
        )}
      </figure>
      {isSaudiQ3 && (
        <figure className="sp-proof-quarter">
          <figcaption className="sp-proof-quarter-label">{isEnglish ? 'Q2' : 'الربع الثاني'}</figcaption>
          <a
            className="sp-proof-post-link"
            href="https://x.com/AlsagriCapital/status/2074617196144361564?s=20"
            target="_blank"
            rel="noreferrer"
            aria-label={isEnglish ? 'Open the original Q2 2026 earnings calls post' : 'فتح التغريدة الأصلية لافتتاحية مكالمات الربع الثاني 2026'}>
            <div className="sp-proof-window sp-proof-window-image">
              <img
                src="assets/sponsorship/q2-2026-proof-tweet-355k-q2.png"
                alt={isEnglish ? 'Q2 2026 opener performance on X showing 355K views' : 'أداء افتتاحية الربع الثاني 2026 على منصة X ويظهر 355 ألف مشاهدة'}
                loading="lazy"
                decoding="async" />
            </div>
            <span className="sp-proof-post-cta">{isEnglish ? 'View the original post' : 'اضغط هنا للذهاب إلى التغريدة الأصلية'} <span aria-hidden="true">↗</span></span>
          </a>
        </figure>
      )}
    </div>
  );

  return (
    <React.Fragment>
      <section className={'sponsorship-hero' + (isEnglish ? ' sp-ltr' : '')}>
        <div className="sp-hero-chart" aria-hidden="true">
          <ChartLineBackground variant="sponsorship" />
        </div>
        <div className="wrap">
          <div className={'sp-hero-grid' + (isUsaSponsorship ? ' is-copy-only' : '')}>
            <div className="sp-hero-copy reveal">
              <div className="sp-kicker">{heroContent.kicker}</div>
              <h1>{heroContent.title}</h1>
              {heroContent.subtitle}
              {isUsaSponsorship && (
                <div className="sp-publisher-proof" aria-label={isEnglish ? 'Publishing account credentials' : 'بيانات الحساب الناشر'}>
                  <span className="sp-publisher-account">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.4l2.15 1.55 2.65-.12 1.06 2.43 2.22 1.46-.58 2.59 1.33 2.3-1.82 1.94.12 2.65-2.43 1.06-1.46 2.22-2.59-.58-2.3 1.33-1.94-1.82-2.65.12-1.06-2.43-2.22-1.46.58-2.59-1.33-2.3 1.82-1.94-.12-2.65 2.43-1.06 1.46-2.22 2.59.58L12 2.4z" fill="currentColor" />
                      <path d="M8.2 12.2l2.35 2.35 5.25-5.3" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{isEnglish ? 'Published on' : 'النشر عبر'}</span>
                    <a href="https://x.com/alsagricapital" target="_blank" rel="noreferrer">@alsagricapital</a>
                  </span>
                  <span className="sp-publisher-credential">{isEnglish ? 'Verified account on X' : 'حساب موثّق على X'}</span>
                  <span className="sp-publisher-credential">
                    {isEnglish ? 'Mawthooq advertising license' : 'رخصة موثوق للإعلانات'}
                    {' '}<bdi>618383</bdi>
                  </span>
                </div>
              )}
              <p>
                {heroContent.description}
              </p>
              {isUsaSponsorship && !isEnglish && (
                <div className="sp-usa-gold-note">
                  {isSaudiQ3 ? 'الحساب الوحيد بـ X اللي يغطي مكالمات نتائج السوق السعودي' : 'الحساب الوحيد بـ X اللي يغطي مكالمات نتائج السوق الأمريكي باللغة العربية'}
                </div>
              )}
              {isUsaSponsorship && (
                <div className="sp-sponsorship-timing">
                  {isEnglish ? `Sponsorship starts on the signing date, continues through ${sponsorshipEndDate}, and includes at least ${coverageCount} published coverages.` : `تبدأ الرعاية من تاريخ التوقيع وتستمر حتى ${sponsorshipEndDate}، وتشمل ${coverageCount} تغطية منشورة على الأقل.`}
                </div>
              )}
              {isUsaSponsorship && !isSaudiQ3 && (
                <div className="sp-expected-companies">
                  <div className="sp-expected-companies-copy">
                    {isSaudiQ3 ? (
                      <React.Fragment>
                        <span className="sp-expected-companies-kicker">قائمة الموسم</span>
                        <div>
                          <strong>شركات تحت المتابعة</strong>
                          <small>تُحدّث القائمة وفق مواعيد مكالمات النتائج وأهمية كل إعلان.</small>
                        </div>
                      </React.Fragment>
                    ) : (
                      <strong>{isEnglish ? 'Among the prominent companies expected to be covered this season — the list may change based on call schedules and the significance of results.' : 'من أبرز الشركات المتوقع تغطيتها خلال الموسم — وقد تتغير القائمة بحسب مواعيد المكالمات وأهمية النتائج.'}</strong>
                    )}
                  </div>
                  <div className="sp-company-marquee">
                    <div className="sp-company-list" role="list" aria-label={isEnglish ? 'Expected companies' : 'الشركات المتوقعة'}>
                      {expectedCompanies.map((company, companyIndex) => (
                        <span
                          role="listitem"
                          key={`${company.ticker}-${companyIndex}`}
                          aria-label={`${company.name} (${company.ticker})`}
                        >
                          {company.logo
                            ? <i className="sp-company-logo-frame"><img className={company.logoTone ? `is-${company.logoTone}-mark` : undefined} src={company.logo} alt={company.name} loading="eager" decoding="async" /></i>
                            : <b className="sp-company-monogram" aria-hidden="true">{company.monogram}</b>}
                          <small>{isSaudiQ3 ? company.name : company.ticker}</small>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="sp-hero-actions">
                {isUsaSponsorship ? (
                  <div className="sp-hero-primary">
                    <a className="btn btn-primary" href="#contact">
                      {isEnglish ? 'Discuss sponsorship via contact channels' : 'ناقش الرعاية عبر وسائل التواصل'}
                      <span className="arrow">{isEnglish ? '→' : '←'}</span>
                    </a>
                    <span className="sp-availability">{isEnglish ? 'Currently available' : 'متاحة حالياً'}</span>
                  </div>
                ) : (
                  <a className="btn btn-primary" href={sponsorshipWhatsappUrl} target="_blank" rel="noreferrer">
                    احجز الرعاية
                    <span className="arrow">←</span>
                  </a>
                )}
                <a className="btn btn-ghost" href="#packages">
                  {isEnglish ? 'View sponsorship' : isUsaSponsorship ? 'استعرض الباقة' : 'استعرض الباقات'}
                </a>
                {isUsaSponsorship && (
                  <a
                    className="btn btn-pdf"
                    href={isSaudiQ3
                      ? 'output/pdf/sponsorship-q3-2026-executive-summary-en.pdf?v=20260825-stats-v5'
                      : 'output/pdf/sponsorshipusa-q2-2026-executive-summary.pdf'}
                    download
                  >
                    {isEnglish ? 'Download executive summary' : 'تحميل الملخص التنفيذي'}
                    <span className="sp-pdf-tag">PDF</span>
                  </a>
                )}
              </div>
              {isUsaSponsorship && !isSaudiQ3 && (
                <div className="sp-saudi-booked-card" dir={isEnglish ? 'ltr' : 'rtl'}>
                  <p>{isEnglish ? 'Argaam has reserved the Q2 2026 earnings calls sponsorship for the Saudi market' : 'أرقام حجزت رعاية سلسلة مكالمات النتائج للربع الثاني 2026 للسوق السعودي'}</p>
                  <img src="assets/sponsorship/argaam-logo.png" alt="أرقام" loading="eager" decoding="async" />
                </div>
              )}
            </div>

            {!isUsaSponsorship && (
              <div className="sp-hero-visual reveal d2" aria-label={isEnglish ? 'Sponsor placement preview' : 'معاينة ظهور الراعي'}>
                <figure className="sp-hero-example-card">
                  <figcaption>
                    <span>{isEnglish ? 'Illustrative example' : 'مثال توضيحي'}</span>
                    <small>{heroContent.exampleCaption}</small>
                  </figcaption>
                  <img
                    src={heroContent.exampleImage}
                    alt={heroContent.exampleAlt}
                    loading="eager"
                    decoding="async" />
                </figure>
                {document.body.dataset.page === 'sponsorship' && (
                  <div className="sp-sponsor-agreed-seal" dir="rtl" aria-label="تم الاتفاق مع راعي للحساب">
                    <span>تم الاتفاق</span>
                    <strong>مع راعي للحساب</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="sp-intro-order">
      <section className="sp-section sp-product-section">
        <div className="wrap">
          <div className="sp-section-head reveal">
            <span>THE PRODUCT · {isUsaSponsorship ? '02' : '01'}</span>
            <h2>{isEnglish ? 'What are earnings calls?' : 'ما هي مكالمات المستثمرين؟'}</h2>
            <p>
              {isEnglish ? 'We turn leading earnings calls into structured coverage that highlights key figures, management guidance, and analyst questions.' : isUsaSponsorship ? 'نحوّل أبرز مكالمات النتائج إلى تغطيات عربية منظمة، تبرز أهم الأرقام، وتوجيهات الإدارة، وأسئلة المحللين.' : 'مكالمات النتائج لقاءات يحضرها الفريق التنفيذي للشركة مع محللي الشركات المالية، وتمتد عادة لنحو ساعة. نعمل على تفريغها كاملة ونشرها للمتابعين والمهتمين في تويتر.'}
            </p>
          </div>
          <div className="sp-product-cards">
            <div className="sp-product-card reveal d1">
              <strong>{isEnglish ? `At least ${coverageCount} published coverages during the season` : isUsaSponsorship ? `${coverageCount} تغطية منشورة على الأقل خلال الموسم` : '+25 مكالمة منشورة في الربع'}</strong>
              <p>{isEnglish ? 'Coverage of key companies after each earnings release during the season.' : 'تغطية لأبرز الشركات بعد كل إعلان نتائج خلال الموسم.'}</p>
              <span className="sp-product-metric">{isEnglish ? (isSaudiQ3 ? 'Historical estimate: total views may exceed 4.2M' : 'Historical estimate: may exceed 2.5M views') : isSaudiQ3 ? 'تقدير تاريخي: متوقع تتجاوز مجموع المشاهدات 4.2 مليون' : isUsaSponsorship ? 'تقدير تاريخي: قد تتجاوز المشاهدات 2.5 مليون' : 'متوقع أكثر من 2 مليون مشاهدة'}</span>
            </div>
            <div className="sp-product-card reveal d2">
              <strong>{isEnglish ? 'Opening post for the series' : isUsaSponsorship ? 'منشور افتتاحي للسلسلة' : 'تغريدة افتتاحية مثبتة 3 أشهر'}</strong>
              <p>{isEnglish ? 'The opening post launches the series and links together all earnings-call coverage during the season.' : isUsaSponsorship ? 'تنطلق منه السلسلة وتُربط به جميع تغطيات مكالمات النتائج طوال الموسم.' : 'رأس السلسلة مثبت أعلى الحساب ومرجع دائم لكل المكالمات.'}</p>
              <span className="sp-product-metric">{isEnglish ? (isSaudiQ3 ? 'The Q1 opener achieved 325K views and the Q2 opener achieved 355K views, with no guarantee of similar performance' : 'The previous opener achieved 322K views; we target similar performance without guarantee') : isSaudiQ3 ? 'حققت افتتاحية الربع الأول 325 ألف مشاهدة، وافتتاحية الربع الثاني 355 ألف مشاهدة، دون ضمان أداء مماثل' : isUsaSponsorship ? 'حققت الافتتاحية السابقة 322 ألف مشاهدة، ونستهدف أداءً مماثلاً دون ضمان' : 'متوقع مشاهدات أعلى من 150 ألف'}</span>
            </div>
          </div>
          <div className="sp-flow reveal d3">
            <h3>{isEnglish ? 'How does the series work?' : 'كيف تعمل السلسلة؟'}</h3>
            <div className="sp-flow-grid">
              {flow.map((item) => (
                <div className="sp-flow-item" key={item.n}>
                  <span>{item.n}</span>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                  {item.metric && <em className="sp-flow-metric">{item.metric}</em>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {isUsaSponsorship && (
        <section className="sp-section sp-audience-section">
          <div className="wrap">
            <div className="sp-section-head reveal">
              <span>AUDIENCE · 01</span>
              <h2>{isEnglish ? 'Who is the audience?' : 'من هو الجمهور؟'}</h2>
              <p>{isEnglish ? 'An audience actively interested in markets, listed companies, investing, and trading—not broad, untargeted reach.' : 'جمهور مهتم فعلياً بالأسواق والاستثمار، ويتابع نتائج الشركات والمحتوى المالي المتخصص، وليس وصولاً عاماً غير مستهدف.'}</p>
            </div>
            <div className="sp-audience-grid">
              <article className="sp-audience-card reveal d1">
                <strong>{isEnglish ? (isSaudiQ3 ? '52.7K' : '52K') : isSaudiQ3 ? '52.7 ألف' : '52 ألف'}</strong>
                <h3>{isEnglish ? 'Followers' : 'متابع'}</h3>
                <p>{isEnglish ? 'A focused financial audience on X.' : 'قاعدة متابعة مالية متخصصة على منصة X.'}</p>
              </article>
              <article className="sp-audience-card reveal d2">
                <strong>95%</strong>
                <h3>{isEnglish ? 'of the audience is in Saudi Arabia' : 'من الجمهور في السعودية'}</h3>
                <p>{isEnglish ? 'The geographic concentration of the available audience data.' : 'النطاق الجغرافي الأبرز ضمن بيانات الجمهور المتاحة.'}</p>
              </article>
              <article className="sp-audience-card reveal d3">
                <strong>47%</strong>
                <h3>{isEnglish ? 'Reach from non-followers' : 'وصول من غير المتابعين'}</h3>
                <p>{isEnglish ? 'Content extends beyond the account’s existing follower base (April 13 to July 13, 2026).' : 'المحتوى يصل إلى جمهور جديد خارج قاعدة متابعي الحساب (للفترة: 13 أبريل إلى 13 يوليو 2026).'}</p>
              </article>
              <article className="sp-audience-card sp-audience-interests reveal d4">
                <span>{isEnglish ? 'Top interests' : 'أبرز الاهتمامات'}</span>
                <div>
                  {(isEnglish
                    ? ['Saudi market', 'U.S. market', 'Earnings', 'Investing', 'Trading']
                    : ['السوق السعودي', 'السوق الأمريكي', 'نتائج الشركات', 'الاستثمار', 'التداول']
                  ).map((interest) => <em key={interest}>{interest}</em>)}
                </div>
              </article>
            </div>
            <div className="sp-projection-note reveal">
              <strong>{isEnglish ? 'Historical performance estimate' : 'تقدير مبني على الأداء التاريخي'}</strong>
              <p>{isEnglish ? `Based on the historical performance of similar coverage, total views may exceed ${isSaudiQ3 ? '4.2 million' : '2.5 million'}, with no guaranteed minimum number of views.` : isSaudiQ3 ? 'استناداً إلى الأداء التاريخي لتغطيات مماثلة، يمكن أن يتجاوز إجمالي المشاهدات 4.2 مليون، دون ضمان حد أدنى للمشاهدات.' : 'استناداً إلى الأداء التاريخي لتغطيات مماثلة، يمكن أن يتجاوز إجمالي المشاهدات 2.5 مليون، دون ضمان حد أدنى للمشاهدات.'}</p>
            </div>
            <p className="sp-audience-source">{isEnglish ? `Source: X analytics and available account audience data. Snapshot dated ${isSaudiQ3 ? 'August 20, 2026' : 'July 13, 2026'}.` : isSaudiQ3 ? 'المصدر: تحليلات منصة X وبيانات جمهور الحساب المتاحة، لقطة بتاريخ 20 أغسطس 2026.' : 'المصدر: تحليلات منصة X وبيانات جمهور الحساب المتاحة، لقطة بتاريخ 13 يوليو 2026.'}</p>
          </div>
        </section>
      )}
      </div>

      <section className="sp-section sp-why-section">
        <div className="wrap">
          <div className="sp-section-head reveal">
            <span>WHY SPONSOR · {isUsaSponsorship ? '03' : '02'}</span>
            <h2>{isEnglish ? 'Why sponsor this series?' : 'لماذا ترعى هذه السلسلة؟'}</h2>
            <p>{isEnglish ? 'Real performance from the previous season, repeated visibility inside serious financial content, and an audience that cares about markets and listed companies. Become the brand investors associate with earnings season.' : 'أداء حقيقي من الموسم السابق، وحضور متكرر داخل محتوى مالي جاد يتابعه جمهور مهتم بالسوق والشركات المدرجة. كن العلامة التي يربطها المستثمر بكل إعلان نتائج، ورسّخ حضورك في أكثر مواسم السوق متابعةً.'}</p>
            {isUsaSponsorship && !isEnglish && !isSaudiQ3 && (
              <strong className="sp-section-gold-line">
                {isSaudiQ3 ? 'الحساب الوحيد بـ X اللي يغطي مكالمات نتائج السوق السعودي' : 'الحساب الوحيد الذي ينشر مكالمات نتائج الشركات الأمريكية باللغة العربية'}
              </strong>
            )}
          </div>
          {isUsaSponsorship ? (
            <div className="sp-why-benefits">
              <div className="sp-reasons-grid sp-reasons-grid-primary">
                {reasons.map((item, idx) => (
                  <article className={'sp-reason reveal d' + (idx + 1)} key={item.n}>
                    <span>{item.n}</span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
              {!isSaudiQ3 && (
                <div className="sp-benefit-summary reveal">
                  <div className="sp-benefit-summary-head">
                    <span>{isEnglish ? 'VALUE THROUGHOUT THE SEASON' : 'قيمة ممتدة طوال الموسم'}</span>
                    <h3>{isEnglish ? 'A sponsorship designed to compound—not disappear after one post' : 'رعاية يتراكم أثرها مع كل تغطية'}</h3>
                  </div>
                  <div className="sp-benefit-summary-grid">
                    {sponsorBenefits.map((benefit) => (
                      <article className="sp-benefit-summary-card" key={benefit.title}>
                        <h3>{benefit.title}</h3>
                        <p>{benefit.text}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <React.Fragment>
              {statsEvidence}
              <div className="sp-proof-grid">
                {proofMediaCard}
                <div className="sp-reasons-grid">
                  {reasons.map((item, idx) => (
                    <article className={'sp-reason reveal d' + (idx + 1)} key={item.n}>
                      <span>{item.n}</span>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      </section>

      <section className="sp-section sp-placement-section">
        <div className="wrap">
          <div className="sp-section-head reveal">
            <span>BRAND PLACEMENT · {isUsaSponsorship ? '04' : '03'}</span>
            <h2>{isEnglish
              ? isSaudiQ3
                ? '91+ core brand placements minimum.'
                : '71+ core brand placements, plus one dedicated promotional post.'
              : isUsaSponsorship
                ? isSaudiQ3
                  ? <React.Fragment><bdi dir="ltr">91+</bdi> نقطة ظهور أساسية على الأقل للعلامة.</React.Fragment>
                  : <React.Fragment><bdi dir="ltr">71+</bdi> نقطة ظهور أساسية للعلامة، إضافة إلى منشور إعلاني مخصص.</React.Fragment>
                : 'أين يظهر شعارك؟'}</h2>
            {!isUsaSponsorship && <p>في ثلاثة أماكن دائمة أمام كل متابع للسلسلة: التغريدة الافتتاحية المثبتة، والبنر الأساسي للمكالمة، وأسفل كل مكالمة منشورة.</p>}
          </div>
          {isUsaSponsorship ? (
            <div className="sp-placement-overview reveal">
              {usaPlacementSteps.map((item) => (
                <article className="sp-placement-row" key={item.n}>
                  <div className="sp-placement-row-copy">
                    <span className="sp-placement-number">{item.n}</span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                      <strong className="sp-placement-badge is-exposure">{item.badge}</strong>
                    </div>
                  </div>
                  <figure className={'sp-placement-crop is-' + item.visual}>
                    {item.image ? (
                      <React.Fragment>
                        <img src={item.image} alt={item.alt} loading="lazy" decoding="async" />
                        <figcaption>{item.visual === 'inside' ? (isEnglish ? 'A real example from Argaam, sponsor of the Saudi earnings series (for illustration)' : 'صورة حقيقية لراعي سلسلة نتائج السوق السعودي أرقام (صورة للتوضيح)') : (isEnglish ? 'Sponsor logo here' : 'شعار الراعي هنا')}</figcaption>
                      </React.Fragment>
                    ) : (
                      <div className="sp-placement-inside-preview">
                        <div className="sp-inside-head">
                          <span>{isEnglish ? 'EARNINGS CALL' : 'مكالمة نتائج'}</span>
                          <strong>{isEnglish ? 'Sample company' : 'شركة المثال'}</strong>
                        </div>
                        <div className="sp-inside-lines" aria-hidden="true"><i></i><i></i><i></i></div>
                        <div className="sp-inside-sponsor">
                          <span>{isEnglish ? 'Sponsored by' : 'برعاية'}</span>
                          <strong>{isEnglish ? 'SPONSOR LOGO' : 'شعار الراعي'}</strong>
                        </div>
                      </div>
                    )}
                  </figure>
                </article>
              ))}
              <p className="sp-placement-inclusive">{isEnglish ? 'All three placements are included in the exclusive sponsorship package.' : 'جميع مواضع الظهور الثلاثة مشمولة ضمن باقة الرعاية الحصرية.'}</p>
            </div>
          ) : (
            <div className="sp-placement-grid">
              {placements.map((item, idx) => (
                <article className={'sp-placement reveal d' + (idx + 1) + (item.wide ? ' is-wide' : '')} key={item.code}>
                  <div className="sp-placement-code">{item.code}</div>
                  {item.image ? (
                    <figure className="sp-placement-example-image">
                      <span>{isEnglish ? 'Example' : 'مثال'}</span>
                      <img src={item.image} alt={item.alt} loading="lazy" decoding="async" />
                    </figure>
                  ) : (
                    <div className="sp-placement-mock" aria-hidden="true">
                      <div className="sp-placement-brand"><BrandMark size={22} /><span>{isEnglish ? 'Alsagri' : 'الصقري | Alsagri'}</span></div>
                      <div className="sp-placement-content"><strong>{isEnglish ? 'Earnings Call - Sample Company' : 'مكالمة المستثمرين - شركة المثال'}</strong><span></span><span></span><span></span></div>
                      <div className="sp-placement-logo">SPONSOR LOGO</div>
                    </div>
                  )}
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {isUsaSponsorship && (
        <section className="sp-section sp-performance-section">
          <div className="wrap">
            <div className="sp-section-head reveal">
              <span>PERFORMANCE · 05</span>
              <h2>{isEnglish ? 'Verified performance and real numbers' : 'أرقام وأداء موثّق'}</h2>
              <p>{isEnglish ? 'Actual data from the Alsagri account analytics and previous-season coverage, with a clearly defined measurement period and source.' : 'بيانات فعلية من تحليلات حساب الصقري وتغطيات الموسم السابق، مع تعريف واضح لفترة القياس ومصدر الأرقام.'}</p>
            </div>
            {statsEvidence}
            <div className="sp-performance-proof">
              {proofMediaCard}
            </div>
          </div>
        </section>
      )}

      <section className="sp-section sp-examples-section">
        <div className="wrap">
          <div className="sp-section-head reveal">
            <span>PREVIOUS EXAMPLES · {isUsaSponsorship ? '06' : '04'}</span>
            <h2 className={isUsaSponsorship ? 'sp-examples-title' : undefined}>
              {isEnglish ? 'Previous examples from Saudi market earnings calls' : isUsaSponsorship ? 'أمثلة سابقة (من مكالمات نتائج السوق السعودي)' : 'أمثلة سابقة'}
            </h2>
            <p>{isEnglish ? 'Samples from previously published earnings-call coverages on the Alsagri account, using the same series format where sponsor placement appears.' : isUsaSponsorship ? 'نماذج من تغطيات مكالمات نتائج الشركات المنشورة سابقاً في حساب الصقري، بنفس أسلوب السلسلة التي تظهر فيها رعاية العلامة.' : 'نماذج من مكالمات نتائج الشركات المنشورة سابقاً في حساب الصقري، بنفس أسلوب السلسلة التي تظهر فيها رعاية العلامة.'}</p>
          </div>
          {isUsaSponsorship && (
            <div className="sp-examples-context reveal">
              {isEnglish
                ? isSaudiQ3
                  ? 'Actual examples from previously published Saudi earnings-call coverage using the same visual identity.'
                  : 'Illustrative samples taken from the Saudi market series. A separate version will be produced for U.S. companies using the same visual identity.'
                : isSaudiQ3
                  ? 'نماذج فعلية من تغطيات مكالمات نتائج السوق السعودي المنشورة سابقاً بالهوية نفسها.'
                  : 'نموذج توضيحي مأخوذ من سلسلة السوق السعودي. ستنفذ نسخة مستقلة للشركات الأمريكية بالهوية نفسها.'}
            </div>
          )}
          {isSaudiQ3 ? (
            <React.Fragment>
              <EarningsFeatureBanner quarter={isEnglish ? 'Q1 2026' : 'الربع الأول 2026'} isEnglish={isEnglish} />
              <div className="examples-grid sp-examples-grid">
                {saudiQ1Examples.map((r) => (
                  <ReportCard
                    key={r.co + r.title}
                    r={r}
                    catLabel="EARNINGS CALL"
                    compact
                    viewsPlacement="ticker"
                    viewsLabel={isEnglish ? 'views' : 'مشاهدة'}
                    clickLabel={isEnglish ? 'View the call on X' : 'شاهد المكالمة على X'}
                    viewCount={saudiQ1ExampleViews[r.co]} />
                ))}
              </div>
              <div className="sp-example-quarter-block">
                <EarningsFeatureBanner
                  quarter={isEnglish ? 'Q2 2026' : 'الربع الثاني 2026'}
                  href="https://x.com/AlsagriCapital/status/2074617196144361564?s=20"
                  variant="secondary"
                  isEnglish={isEnglish}
                />
                <div className="examples-grid sp-examples-grid">
                  {saudiQ2Examples.map((r) => (
                    <ReportCard
                      key={r.co + r.title}
                      r={r}
                      catLabel="EARNINGS CALL"
                      compact
                      viewsPlacement="ticker"
                      viewsLabel={isEnglish ? 'views' : 'مشاهدة'}
                      clickLabel={isEnglish ? 'View the call on X' : 'شاهد المكالمة على X'}
                      viewCount={saudiQ2ExampleViews[r.co]} />
                  ))}
                </div>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <EarningsFeatureBanner quarter="الربع الأول 2026" />
              <div className="examples-grid sp-examples-grid">
                {previousExamples.map((r) => (
                  <ReportCard
                    key={r.co + r.title}
                    r={r}
                    catLabel="EARNINGS CALL"
                    compact
                    viewsPlacement="ticker"
                    clickLabel={isEnglish ? 'Click here' : 'شاهد المكالمة على X'}
                    viewCount={previousExampleViews[r.co]} />
                ))}
              </div>
            </React.Fragment>
          )}
        </div>
      </section>

      <section id="packages" className="sp-section sp-packages-section">
        <div className="wrap">
          <div className="sp-section-head reveal">
            <span>PACKAGES · {isUsaSponsorship ? '07' : '05'}</span>
            <h2>{isEnglish ? 'Exclusive sponsorship' : isUsaSponsorship ? 'الرعاية الحصرية' : 'باقات الرعاية'}</h2>
            <p>{isEnglish ? `One complete package for one exclusive partner. Sponsorship starts on the signing date, continues through ${sponsorshipEndDate}, and includes at least ${coverageCount} published coverages.` : isUsaSponsorship ? `باقة متكاملة لشريك حصري واحد. تبدأ الرعاية من تاريخ التوقيع وتستمر حتى ${sponsorshipEndDate}، وتشمل ${coverageCount} تغطية منشورة على الأقل.` : 'اختر مستوى الحضور الذي يناسب علامتك، واحجز مكانك قبل بداية الموسم — المساحة محدودة لراعٍ واحد فقط.'}</p>
          </div>
          <div className={'sp-packages-grid' + (packages.length === 1 ? ' is-single' : '')}>
            {packages.map((pkg, idx) => (
              <article className={'sp-package reveal d' + (idx + 1) + ' sp-tier-' + pkg.tier.toLowerCase() + (pkg.featured ? ' is-featured' : '')} key={pkg.tier}>
                <span className="sp-package-tier">{pkg.tier}</span>
                <h3>{pkg.title}</h3>
                <p>{pkg.period}</p>
                <ul>
                  {pkg.features.map((feature) => (
                    <li key={feature.text}><span className="sp-feat-check"></span><span className="sp-feat-text">{feature.amount && <strong className="sp-feat-amount"><span dir="ltr">{feature.amount}</span></strong>}{feature.text}{feature.code && <em className="sp-feat-code">{feature.code}</em>}</span></li>
                  ))}
                </ul>
                <div className="sp-package-price">
                  <strong className="sp-riyal-price">
                    <span className="sp-currency-text">{isEnglish ? 'SAR' : 'ر.س'}</span>
                    <span>{pkg.priceAmount}</span>
                  </strong>
                  <small>{pkg.priceLabel}</small>
                </div>
                {isUsaSponsorship && (
                  <p className="sp-package-tax-note">
                    {isEnglish
                      ? `Sponsorship consideration: SAR ${isSaudiQ3 ? '95,000' : '60,000'}. VAT is not charged because the service provider was not registered for VAT as of the date this proposal was issued.`
                      : `المقابل المالي للرعاية: ${isSaudiQ3 ? '95,000' : '60,000'} ريال سعودي. لا تُحتسب ضريبة القيمة المضافة على المبلغ لكون مقدم الخدمة غير مسجل في ضريبة القيمة المضافة بتاريخ إصدار هذا العرض.`}
                  </p>
                )}
                {isUsaSponsorship && (
                  <a className="btn sp-package-cta" href="#contact">
                    {isEnglish ? 'Discuss sponsorship via contact channels' : 'ناقش الرعاية عبر وسائل التواصل'}
                  </a>
                )}
              </article>
            ))}
          </div>
          {isUsaSponsorship && (
            <div className="sp-editorial-note reveal">
              <strong>{isEnglish ? 'Editorial independence' : 'الاستقلال التحريري'}</strong>
              <p>{isEnglish ? 'Alsagri retains full editorial independence in coverage and analysis, while the sponsor pre-approves the use of its brand identity and advertising message.' : 'يحتفظ الصقري بالاستقلال التحريري الكامل في التغطية والتحليل، بينما يعتمد الراعي مسبقاً استخدام الهوية والرسالة الإعلانية الخاصة به.'}</p>
            </div>
          )}
        </div>
      </section>

      <section id="contact" className="sp-final-section">
        <div className="wrap">
          <div className="sp-final-grid reveal">
            <div>
              <span>{isEnglish ? `EXCLUSIVE · FROM SIGNING THROUGH ${sponsorshipEndDate.toUpperCase()}` : isSaudiQ3 ? `من تاريخ التوقيع حتى ${sponsorshipEndDate}` : isUsaSponsorship ? `حصري · حتى ${sponsorshipEndDate}` : 'LIMITED · الربع الثاني 2026'}</span>
              <h2>{isEnglish ? 'Become the exclusive partner' : isUsaSponsorship ? 'كن الشريك الحصري' : 'كن راعي السلسلة'}</h2>
              <p>{isEnglish ? `Sponsorship starts on the signing date, continues through ${sponsorshipEndDate}, and includes at least ${coverageCount} published coverages.` : isUsaSponsorship ? `تبدأ الرعاية من تاريخ التوقيع وتستمر حتى ${sponsorshipEndDate}، وتشمل ${coverageCount} تغطية منشورة على الأقل.` : 'مساحة رعاية واحدة لكل ربع. لنحجز ظهور علامتك أمام جمهور مالي نوعي قبل بداية الموسم.'}</p>
            </div>
            <div className="sp-contact-actions">
              <a href="https://x.com/AlsagriCapital" target="_blank" rel="noreferrer">
                <small>{isEnglish ? 'On X' : 'على منصة X'}</small>
                <strong>@AlsagriCapital</strong>
              </a>
              <a href={sponsorshipWhatsappUrl} target="_blank" rel="noreferrer">
                <small>{isEnglish ? 'WhatsApp' : 'واتساب'}</small>
                <strong>+966 505713333</strong>
              </a>
              <a className="sp-contact-email" href="mailto:alsagricapital@gmail.com">
                <small>{isEnglish ? 'Email' : 'البريد الإلكتروني'}</small>
                <strong>alsagricapital@gmail.com</strong>
              </a>
            </div>
          </div>
        </div>
      </section>

    </React.Fragment>);
}

/* ── FOOTER ────────────────────────────────────────────────────── */
function Footer() {
  const isEnglishUsa = document.body.dataset.page === 'sponsorshipusa-en';
  const isEnglishSaudiQ3 = document.body.dataset.page === 'sponsorship-q3-saudi-en';
  const isEnglish = isEnglishUsa || isEnglishSaudiQ3;
  return (
    <footer className="foot">
      <div className="wrap foot-inner">
        <div className="foot-row">
          <div>{isEnglish ? 'Alsagri - All rights reserved - 2026' : 'الصقري - جميع الحقوق محفوظة - 2026'}</div>
          <div className="mono">{isEnglish ? 'Riyadh · KSA · Financial market analysis' : 'Riyadh · KSA · TASI Listed Equities'}</div>
        </div>
        <div className="foot-disclaimer">
          {isEnglish ? 'Content presented on this platform is for informational and analytical purposes only and does not constitute financial advice or investment recommendation.' : 'المحتوى المقدَّم على هذه المنصة لأغراضٍ معلوماتيةٍ وتحليليةٍ فقط، ولا يُعدُّ توصيةً ماليةً أو استشارةً استثمارية.'}
        </div>
      </div>
    </footer>);
}

/* ── TOOLS page (placeholders) ─────────────────────────────────── */
function Tools() {
  const tools = [
    {
      n: '01',
      id: 'position-switch',
      ar: 'حاسبة تبديل المراكز',
      en: 'Position Switching Calculator',
      href: 'tool-position-switch.html',
      ready: true,
    },
    {
      n: '02',
      id: 'cumulative-return',
      ar: 'حساب العائد التراكمي',
      en: 'Cumulative Return Calculator',
      href: 'tool-compound-return.html',
      ready: true,
    },
    {
      n: '03',
      id: 'annualised-return',
      ar: 'حساب العائد السنوي المركّب',
      en: 'Compound Annual Growth Rate',
      href: 'tool-cagr.html',
      ready: true,
    },
    {
      n: '04',
      id: 'portfolio-return',
      ar: 'حاسبة العائد السنوي للمحفظة',
      en: 'Portfolio Annualised Return (XIRR)',
      href: 'tool-portfolio-return.html',
      ready: true,
    },
    {
      n: '05',
      id: 'tool-5',
      ar: '',
      en: '',
      ready: false,
    },
    {
      n: '06',
      id: 'tool-6',
      ar: '',
      en: '',
      ready: false,
    },
  ];

  return (
    <React.Fragment>
      <PageBanner
        num="03"
        eyebrow="USEFUL TOOLS"
        title="أدوات مفيدة"
        sub="مجموعةٌ من الحاسبات والأدوات المعينة للمستثمر في السوق السعودي."
        variant="tools" />

      <section className="section first">
        <div className="wrap">
          <div className="tools-grid">
            {tools.map((tool, idx) => {
              const isPlaceholder = !tool.ar;
              if (isPlaceholder) {
                return (
                  <article className={'tool-card tool-card-placeholder reveal d' + (idx + 1)} key={tool.n}>
                    <div className="tool-num"><span>{tool.n}</span></div>
                    <div className="tool-placeholder-body">
                      <span className="tool-placeholder-badge">
                        <span className="tool-status-dot" aria-hidden="true"></span>
                        قريبًا
                      </span>
                    </div>
                  </article>
                );
              }
              const inner = (
                <React.Fragment>
                  <div className="tool-num"><span>{tool.n}</span></div>
                  <h3 className="tool-title">{tool.ar}</h3>
                  <div className="tool-en">{tool.en}</div>
                </React.Fragment>
              );
              return tool.ready ? (
                <a className={'tool-card tool-tint-' + tool.id + ' is-link reveal d' + (idx + 1)} key={tool.n} href={tool.href}>
                  {inner}
                </a>
              ) : (
                <article className={'tool-card tool-tint-' + tool.id + ' reveal d' + (idx + 1)} key={tool.n}>
                  {inner}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </React.Fragment>);
}

/* ── CFA Resources page ───────────────────────────────────────────────── */
function CFAResources() {
  const [cfaResourcesOpen, setCfaResourcesOpen] = useState(false);
  const levels = [
    {
      n: '01',
      title: 'CFA Level 1',
      desc: 'المدخل الأساسي لعالم التحليل المالي: أخلاقيات المهنة، الاقتصاد، القوائم المالية، أدوات الاستثمار، وبناء قاعدة مفاهيمية قوية.',
    },
    {
      n: '02',
      title: 'CFA Level 2',
      desc: 'مرحلة أعمق في التقييم والتحليل: قراءة الشركات، النماذج المالية، أدوات الدخل الثابت والمشتقات، وربط الأرقام بالسياق.',
    },
    {
      n: '03',
      title: 'CFA Level 3',
      desc: 'الانتقال من التحليل إلى إدارة المحافظ: بناء السياسات الاستثمارية، تخصيص الأصول، إدارة المخاطر، والتفكير كمستشار محترف.',
    },
  ];

  const cfaLevel1Resources = [
    {
      name: 'Mark Meldrum',
      mono: 'MM',
      logo: 'assets/cfa/mark-meldrum-logo-mark.png',
      color: '#2563EB',
      points: ['فيديوهات كاملة مرتّبة حسب الفصول', 'Notes كاملة لجميع الفصول'],
    },
    {
      name: 'Kaplan Schweser',
      mono: 'KS',
      logo: 'assets/cfa/kaplan-schweser-logo-mark.png',
      color: '#0EA5A4',
      points: ['ملخصات SchweserNotes لكل فصل', 'بنك أسئلة واختبارات محاكية'],
    },
    {
      name: 'IFT',
      mono: 'IFT',
      logo: 'assets/cfa/ift-logo-mark.png',
      color: '#7C3AED',
      points: ['فيديو لكل Reading', 'ملاحظات ومراجعات مركّزة'],
    },
    {
      name: 'Salt Solutions',
      mono: 'SS',
      logo: 'assets/cfa/salt-solutions-logo-mark.png',
      color: '#EA580C',
      points: ['بنك أسئلة عالي الجودة', 'اختبارات محاكية للاختبار الحقيقي'],
    },
    {
      name: 'UWorld',
      mono: 'UW',
      logo: 'assets/cfa/uworld-finance-logo-mark.png',
      color: '#DB2777',
      points: ['بنك أسئلة QBank بشروحات مفصّلة', 'تحليل الأداء وتتبّع التقدّم'],
    },
    {
      name: 'AnalystPrep',
      mono: 'AP',
      logo: 'assets/cfa/analystprep-logo-mark.png',
      color: '#16A34A',
      points: ['فيديوهات وملاحظات دراسية للمستوى الأول', 'QBank واختبارات Mock مع تحليلات أداء'],
    },
  ];

  return (
    <React.Fragment>
      <PageBanner
        num="04"
        eyebrow="CFA RESOURCES"
        title="مصادر CFA"
        sub="صفحة تُبنى لتكون رفيقاً منظماً في رحلة CFA: تجمع الطريق، المصادر، وخطط المذاكرة بلغة واضحة تساعدك على البدء بثقة والتقدم بهدوء." />

      <section className="section first cfa-section">
        <div className="wrap">
          <div className="cfa-intro reveal">
            <div className="cfa-intro-copy">
              <div className="cfa-kicker">CHARTERED FINANCIAL ANALYST</div>
              <h2>رحلتك المهنية مع اختبارات CFA</h2>
              <p>
                تُعد شهادة CFA من أعلى الشهادات المهنية موثوقية واحتراماً في أسواق المال ولدى الشركات المالية، لأنها لا تمنح معرفة نظرية فحسب، بل تبني طريقة تفكير استثمارية منضبطة؛ تقرأ الأرقام بعمق، تفهم ما وراءها، وتحوّل التحليل إلى قرار أكثر وعياً.
              </p>
              <p>
                هذه الصفحة ستكون بوابة مرتبة للاستعداد للاختبار: مصادر مختارة، خرائط للمنهج، ملاحظات مختصرة، وأدوات تساعدك على التعامل مع كل مستوى بخطة أوضح وهدوء أكبر.
              </p>
            </div>
            <div className="cfa-emblem" aria-hidden="true">
              <div className="cfa-emblem-halo"></div>
              <div className="cfa-emblem-card">
                <div className="cfa-emblem-top">
                  <span>CFA</span>
                  <span>01-03</span>
                </div>
                <div className="cfa-emblem-mark">
                  <span className="bar b1"></span>
                  <span className="bar b2"></span>
                  <span className="bar b3"></span>
                  <span className="trend"></span>
                </div>
                <div className="cfa-emblem-caption">
                  <span>Ethics</span>
                  <span>Analysis</span>
                  <span>Portfolio</span>
                </div>
              </div>
            </div>
          </div>

          <div className={'cfa-levels' + (cfaResourcesOpen ? ' resources-open' : '')}>
            {levels.map((level, idx) => {
              const isInteractive = idx === 0;
              return (
                <article
                  className={'cfa-level-card reveal d' + (idx + 1) + (idx === 0 ? ' in' : '') + (isInteractive ? ' cfa-level-interactive' + (cfaResourcesOpen ? ' is-open' : '') : '')}
                  key={level.title}
                  onClick={isInteractive ? () => setCfaResourcesOpen((v) => !v) : undefined}
                  role={isInteractive ? 'button' : undefined}
                  tabIndex={isInteractive ? 0 : undefined}
                  aria-expanded={isInteractive ? cfaResourcesOpen : undefined}
                  onKeyDown={isInteractive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCfaResourcesOpen((v) => !v); } } : undefined}>
                  <div className="cfa-level-num">{level.n}</div>
                  <div className="cfa-level-body">
                    <h3>{level.title}</h3>
                    <p>{level.desc}</p>
                  </div>
                  {idx === 0 ? (
                    <React.Fragment>
                      <div className="cfa-level-actions">
                        <div className="cfa-action-stack">
                          <div className="cfa-soon cfa-resources-toggle">
                            <span>{cfaResourcesOpen ? 'إخفاء المحتوى' : 'عرض المحتوى'}</span>
                            <span className="cfa-chevron" aria-hidden="true">↓</span>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  ) : (
                    <div className="cfa-soon">قريباً</div>
                  )}
                </article>
              );
            })}
          </div>

          {(
            <div className={'cfa-resources-wrap' + (cfaResourcesOpen ? ' is-open' : '')}>
              <div className="cfa-resources-inner">
                <div className="cfa-resources">
                  <button
                    type="button"
                    className="cfa-resources-close"
                    aria-label="إغلاق أبرز المصادر للاستعداد للاختبار"
                    onClick={() => {
                      setCfaResourcesOpen(false);
                      setTimeout(() => {
                        const target = document.querySelector('.cfa-level-interactive');
                        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 460);
                    }}>
                    <span aria-hidden="true">↑</span>
                  </button>
                  <div className="cfa-resources-head">
                    <div className="cfa-resources-kicker">CFA LEVEL 1 · المصادر</div>
                    <h3>أبرز المصادر للاستعداد للاختبار</h3>
                    <p>كل ما تحتاجه للاستعداد والتجهيز لاختبار CFA Level 1</p>
                  </div>
                  <div className="cfa-resources-grid">
                    {cfaLevel1Resources.map((res) => (
                      <article
                        className="cfa-resource-card"
                        key={res.name}
                        style={{ '--res-color': res.color }}>
                        <div className={'cfa-resource-badge' + (res.logo ? ' has-logo' : '')} aria-hidden="true">
                          {res.logo ? (
                            <img src={res.logo} alt="" loading="lazy" decoding="async" />
                          ) : (
                            <span>{res.mono}</span>
                          )}
                        </div>
                        <h4 className="cfa-resource-name">{res.name}</h4>
                        <ul className="cfa-resource-points">
                          {res.points.map((p) => (
                            <li key={p}>
                              <span className="cfa-resource-check" aria-hidden="true"></span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                  <div className="cfa-resources-cta">
                    <a
                      className="cfa-source-note"
                      href="https://t.me/cfalevel001"
                      target="_blank"
                      rel="noreferrer">
                      أفضل مصدر موثوق للملخصات والمراجع - تيلغرام
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </React.Fragment>);
}

/* ── Newsletter page ───────────────────────────────────────────────── */
function Newsletter() {
  const benefits = [
    'تقارير الشركات المالية والأسعار المستهدفة لأسهم الشركات السعودية أولاً بأول.',
    'تقارير حساب الصقري عن الشركات السعودية بشكل مفصّل ومنظّم.',
    'نشرة بريدية أسبوعية مفصلة عن السوق السعودي وأبرز ما يستحق المتابعة.',
    'مواضيع تحليلية وتوعوية وتعليمية عن الاستثمار وقراءة الشركات.',
    'مختارات لعدد من الأسهم الاستثمارية للأغراض التعليمية فقط.',
  ];

  return (
    <React.Fragment>
      <PageBanner
        num="05"
        eyebrow="NEWSLETTER"
        title="النشرة البريدية"
        sub="ملخصات مرتبة تصل إلى بريدك: تقارير، قراءات أسبوعية، ومختارات تحليلية تساعدك على متابعة السوق السعودي بهدوء ووضوح." />

      <section className="section first newsletter-section">
        <div className="wrap">
          <div className="newsletter-shell reveal">
            <a
              className="newsletter-art"
              href="https://alsagricapital.substack.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="الاشتراك في النشرة البريدية">
              <div className="newsletter-art-grid" aria-hidden="true"></div>
              <div className="newsletter-art-top">
                <div className="newsletter-brand">
                  <BrandMark size={42} />
                  <span>الصقري</span>
                </div>
                <span className="newsletter-badge">SUBSTACK</span>
              </div>
              <h2>النشرة البريدية</h2>
              <p>قراءة أسبوعية مركّزة للسوق السعودي، تصل إلى بريدك بدون ضجيج.</p>
              <div className="newsletter-handle">
                <XInlineIcon />
                <span>@alsagricapital</span>
              </div>
              <div className="newsletter-chart" aria-hidden="true">
                <svg viewBox="0 0 520 190" preserveAspectRatio="none">
                  <path className="nc-area" d="M10 158 C74 148 96 126 148 132 C204 138 224 96 278 102 C334 108 350 56 410 66 C456 74 476 38 514 26 L514 190 L10 190 Z" />
                  <path className="nc-shadow" d="M10 158 C74 148 96 126 148 132 C204 138 224 96 278 102 C334 108 350 56 410 66 C456 74 476 38 514 26" />
                  <path className="nc-line" d="M10 158 C74 148 96 126 148 132 C204 138 224 96 278 102 C334 108 350 56 410 66 C456 74 476 38 514 26" />
                  <path className="nc-thin" d="M96 112 L154 82 L216 118 L282 72 L350 130 L424 72 L498 104" />
                  <path className="nc-arrow" d="M470 28 L514 26 L499 66" />
                </svg>
              </div>
            </a>

            <div className="newsletter-copy">
              <span className="newsletter-kicker">دعوة اشتراك</span>
              <h2>أدعوك للاشتراك بالنشرة البريدية</h2>
              <p>
                مساحة بريدية مختصرة وواضحة تجمع ما يستحق القراءة عن الشركات السعودية والسوق، مع ترتيب يساعدك على المتابعة واتخاذ صورة أعمق قبل القرار.
              </p>
              <ul className="newsletter-benefits">
                {benefits.map((item) => (
                  <li key={item}>
                    <span className="newsletter-check" aria-hidden="true"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="newsletter-actions">
                <a className="newsletter-cta" href="https://alsagricapital.substack.com/" target="_blank" rel="noreferrer">
                  الاشتراك في النشرة
                  <span>←</span>
                </a>
                <span className="newsletter-note">المحتوى تعليمي وتحليلي، وليس توصية مالية.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>);
}

Object.assign(window, { Nav, Hero, About, Services, ServiceDetail, Disclaimer, Contact, Tools, CFAResources, Newsletter, SponsorshipQ22026, Footer, useReveal, BrandMark, PageBanner, ReportCard });
