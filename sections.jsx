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
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
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
              fill="#3B82F6" opacity={opacity} />
      ))}

      <path d={areaPath} fill={`url(#trend-area-${variant})`} />
      {variant === 'hero' && (
        <path d={chart.path} fill="none" stroke="#8A97A8" strokeOpacity="0.26"
              strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      )}
      <path d={chart.path} fill="none" stroke={`url(#trend-line-${variant})`}
            strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
            filter={`url(#trend-shadow-${variant})`} opacity="0.92"
            pathLength={variant === 'hero' ? 1 : undefined}
            strokeDasharray={variant === 'hero' ? '0.66 1' : undefined} />
      <path d={chart.path} fill="none" stroke="#FFFFFF" strokeOpacity="0.32"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            pathLength={variant === 'hero' ? 1 : undefined}
            strokeDasharray={variant === 'hero' ? '0.66 1' : undefined} />

      {chart.nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="12" fill={variant === 'hero' && i > 3 ? '#8A97A8' : '#3B82F6'} opacity={variant === 'hero' && i > 3 ? '0.06' : '0.1'} />
          <circle cx={x} cy={y} r="4.5" fill="#FAFAF7" stroke={variant === 'hero' && i > 3 ? '#8A97A8' : '#3B82F6'} strokeOpacity={variant === 'hero' && i > 3 ? '0.45' : '1'} strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

/* ── NAV ───────────────────────────────────────────────────────── */
function Nav({ currentPage, drawerOpen, setDrawerOpen }) {
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
    { id: 'about',     label: 'عن المنصة',   n: '01', href: 'about.html' },
    { id: 'services',  label: 'الخدمات',     n: '02', href: 'services.html' },
    { id: 'tools',     label: 'أدوات مفيدة', n: '03', href: 'tools.html' },
    { id: 'cfa',       label: 'مصادر CFA',   n: '04', href: 'cfa.html' },
    { id: 'newsletter', label: 'النشرة البريدية', n: '05', href: 'newsletter.html' },
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
        <a className="nav-cta" href="contact.html">
          <span className="dot"></span>
          تواصل معي
        </a>
        <button
          className={'nav-burger ' + (drawerOpen ? 'open' : '')}
          aria-label="القائمة"
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
      <a className="drawer-cta" href="contact.html" onClick={() => setDrawerOpen(false)}>تواصل معي ←</a>
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
function ReportCard({ r, catLabel, viewCount, compact = false, viewsPlacement = 'body' }) {
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
      <span>مشاهدات</span>
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
function EarningsFeatureBanner() {
  return (
    <a
      className="earnings-feature-banner reveal"
      href="https://x.com/AlsagriCapital/status/2054659950194942119?s=20"
      target="_blank"
      rel="noreferrer">
      <span className="efb-bg" aria-hidden="true"></span>
      <span className="efb-copy">
        <span className="efb-kicker">ملف مجمّع · الربع الأول 2026</span>
        <strong>مكالمات المستثمرين / مكالمات عرض نتائج الربع الأول 2026</strong>
        <span>تجميع مرتب لمكالمات النتائج وروابطها في مكان واحد للرجوع السريع.</span>
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
        عرض التجميع
        <span>←</span>
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
            <a className="contact-row" href="https://wa.me/966550734332" target="_blank" rel="noreferrer">
              <span className="k">WHATSAPP</span>
              <span className="v">0550734332</span>
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
  const stats = [
    { value: '~12M', label: 'مرات الظهور', note: 'Impressions' },
    { value: '~51K', label: 'متابع', note: 'Followers', badge: '80% متابع نشط' },
    { value: '~55K', label: 'مشاهدة لكل مكالمة', note: 'متوسط مشاهدات المحتوى' },
    { value: '~166K', label: 'مشاهدة لافتتاحية الموسم السابق', note: 'تغريدة مثبتة' },
  ];

  const flow = [
    { n: '01', title: 'إعلان النتائج', text: 'الشركة تعلن نتائجها رسمياً' },
    { n: '02', title: 'نشر المكالمة', text: 'نشر المكالمة في تويتر خلال ساعات', metric: 'متوسط مشاهدات 55 ألف للمكالمات' },
    { n: '03', title: 'ظهور شعارك', text: 'أسفل المكالمة وفي التغريدة الافتتاحية المثبتة' },
    { n: '04', title: 'حضور العلامة التجارية طوال الربع', text: 'يتكرر ظهور العلامة التجارية مع نتائج كل شركة يتم تغطيتها' },
  ];

  const reasons = [
    { n: '01', title: 'جمهور مالي نوعي', text: 'مستثمرون ومتداولون، لا جمهور عام. كل مشاهدة لها قيمة.' },
    { n: '02', title: 'محتوى دائم ومثبت', text: 'الافتتاحية مثبتة طوال الربع، وحضورك لا ينتهي بانتهاء منشور واحد.' },
    { n: '03', title: 'ظهور متكرر للشعار', text: 'في الافتتاحية وأسفل كل مكالمة، مع أكثر من 25 ظهور خلال الربع.' },
  ];

  const placements = [
    {
      code: 'A',
      title: 'غلاف التغريدة الافتتاحية المثبتة',
      text: 'مثبتة أعلى الحساب طوال الربع، وهي أول ما يراه زائر السلسلة.',
      image: 'assets/sponsorship/q2-2026-example-tweet-enhanced.png?v=q2e',
      alt: 'مثال توضيحي لغلاف التغريدة الافتتاحية المثبتة مع ظهور شعار الراعي',
    },
    {
      code: 'B',
      title: 'أسفل كل مكالمة نتائج',
      text: 'شعارك أسفل المقال في كل مكالمة، مع أكثر من 25 مرة في الربع.',
    },
    {
      code: 'C',
      title: 'شعار العلامة التجارية في البنر الأساسي للمكالمة',
      text: 'شعار الراعي داخل البنر الأساسي للمكالمة، يظهر مع كل مكالمة منشورة طوال الموسم.',
      image: 'assets/sponsorship/q2-2026-banner-go-telecom.png?v=q2e',
      alt: 'مثال توضيحي لظهور شعار الراعي في البنر الأساسي لمكالمة عرض النتائج',
      wide: true,
    },
  ];

  const packages = [
    {
      tier: 'SILVER',
      title: 'الباقة الفضية',
      period: 'رعاية مكالمات النتائج للربع الثاني من عام 2026',
      priceAmount: '10,000',
      priceLabel: 'للفترة',
      features: [
        { text: 'شعار الشركة الراعية يظهر في التغريدة المثبتة', code: 'A' },
        { text: 'إشارة شكر وشعار الشركة الراعية يظهران في 5 مكالمات', code: 'B' },
      ],
    },
    {
      tier: 'GOLD',
      title: 'الباقة الذهبية',
      period: 'رعاية مكالمات النتائج للربع الثاني من عام 2026',
      priceAmount: '30,000',
      priceLabel: 'للفترة',
      features: [
        { text: 'شعار الشركة الراعية يظهر في التغريدة المثبتة', code: 'A' },
        { text: 'إشارة شكر وشعار الشركة الراعية يظهران في جميع المكالمات، +25 مكالمة', code: 'B' },
        { text: 'إعلان للشركة الراعية في أي وقت حسب رغبتهم خلال الفترة' },
      ],
    },
    {
      tier: 'DIAMOND',
      title: 'الباقة الألماسية',
      period: 'رعاية مكالمات النتائج للربع الثاني من عام 2026',
      priceAmount: '50,000',
      priceLabel: 'للفترة',
      featured: true,
      features: [
        { text: 'شعار الشركة الراعية يظهر في التغريدة المثبتة', code: 'A' },
        { text: 'إشارة شكر وشعار الشركة الراعية يظهران في جميع المكالمات، +25 مكالمة', code: 'B' },
        { text: 'إضافة شعار الشركة الراعية في البنر الأساسي لكل مكالمة', code: 'C' },
        { text: 'إعلان للشركة الراعية في أي وقت حسب رغبتهم خلال الفترة' },
        { text: '15,000 ريال مخصصة للترويج المدفوع في تويتر للتغريدة، مما يدعم انتشار العلامة التجارية' },
      ],
    },
  ];
  const hiddenPreviousExamples = ['لوسيد', 'الأمار', 'المراعي'];
  const previousExampleViews = {
    'لوبريف': '194K',
    'أرامكو السعودية': '25K',
    'أفالون فارما': '35K',
    'وقت اللياقة': '52K',
    'رسن': '96K',
    'سال': '146K',
  };
  const previousExamples = window.REPORTS.filter((r) => r.cat === 'earnings' && !hiddenPreviousExamples.includes(r.co));

  return (
    <React.Fragment>
      <section className="sponsorship-hero">
        <div className="sp-hero-chart" aria-hidden="true">
          <ChartLineBackground variant="sponsorship" />
        </div>
        <div className="wrap">
          <div className="sp-hero-grid">
            <div className="sp-hero-copy reveal">
              <div className="sp-kicker">SPONSORSHIP 2026 · Q2 EARNINGS CALLS SERIES</div>
              <h1>رعاية سلسلة مكالمات النتائج للربع الثاني 2026</h1>
              <p>
                فرصة رعاية كاملة أمام جمهور مالي نوعي لسلسلة متخصصة تلخص وتحلل مكالمات عرض النتائج للشركات المدرجة خلال الفترة من <strong>15 يونيو - 15 سبتمبر</strong>.
              </p>
              <div className="sp-hero-actions">
                <a className="btn btn-primary" href="https://wa.me/966550734332" target="_blank" rel="noreferrer">
                  احجز الرعاية
                  <span className="arrow">←</span>
                </a>
                <a className="btn btn-ghost" href="#packages">
                  استعرض الباقات
                </a>
              </div>
            </div>

            <div className="sp-hero-visual reveal d2" aria-label="معاينة ظهور الراعي">
              <figure className="sp-hero-example-card">
                <figcaption>
                  <span>مثال توضيحي</span>
                  <small>نموذج ظهور الراعي في التغريدة المثبتة</small>
                </figcaption>
                <img
                  src="assets/sponsorship/q2-2026-example-tweet-enhanced.png?v=q2e"
                  alt="مثال توضيحي لتغريدة مكالمات المستثمرين مع ظهور شعار الراعي"
                  loading="eager"
                  decoding="async" />
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className="sp-section sp-product-section">
        <div className="wrap">
          <div className="sp-section-head reveal">
            <span>THE PRODUCT · 01</span>
            <h2>ما هي مكالمات المستثمرين؟</h2>
            <p>
              مكالمات النتائج لقاءات يحضرها الفريق التنفيذي للشركة مع محللي الشركات المالية، وتمتد عادة لنحو ساعة. نعمل على تفريغها كاملة ونشرها للمتابعين والمهتمين في تويتر.
            </p>
          </div>
          <div className="sp-product-cards">
            <div className="sp-product-card reveal d1">
              <strong>+25 مكالمة منشورة في الربع</strong>
              <p>تغطية لأبرز الشركات بعد كل إعلان نتائج خلال الموسم.</p>
            </div>
            <div className="sp-product-card reveal d2">
              <strong>تغريدة افتتاحية مثبتة 3 أشهر</strong>
              <p>رأس السلسلة مثبت أعلى الحساب ومرجع دائم لكل المكالمات.</p>
              <span className="sp-product-metric">متوقع مشاهدات <span className="sp-pm-num">&gt; 150K</span></span>
            </div>
          </div>
          <div className="sp-flow reveal d3">
            <h3>كيف تعمل السلسلة؟</h3>
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

      <section className="sp-section sp-why-section">
        <div className="wrap">
          <div className="sp-section-head reveal">
            <span>WHY SPONSOR · 02</span>
            <h2>لماذا ترعى هذه السلسلة؟</h2>
            <p>أداء حقيقي من الموسم السابق، وحضور متكرر داخل محتوى مالي جاد يتابعه جمهور مهتم بالسوق والشركات المدرجة. كن العلامة التي يربطها المستثمر بكل إعلان نتائج، ورسّخ حضورك في أكثر مواسم السوق متابعةً.</p>
          </div>
          <div className="sp-stats-grid">
            {stats.map((stat, idx) => (
              <div className={'sp-stat reveal d' + (idx + 1)} key={stat.value}>
                <div className="sp-stat-value">
                  <strong>{stat.value}</strong>
                  {stat.badge && <em className="sp-stat-badge">{stat.badge}</em>}
                </div>
                <span>{stat.label}</span>
                <small>{stat.note}</small>
              </div>
            ))}
          </div>
          <div className="sp-proof-grid">
            <div className="sp-proof-card sp-proof-media reveal">
              <span className="sp-proof-label">أداء موثق</span>
              <strong>~166K مشاهدة للافتتاحية السابقة</strong>
              <p>لقطة فعلية من منصة X للتغريدة الافتتاحية في الموسم السابق، وتوضح حجم المشاهدات والتفاعل على السلسلة.</p>
              <div className="sp-proof-window sp-proof-window-image">
                <img
                  src="assets/sponsorship/q2-2026-proof-tweet.png"
                  alt="لقطة من تغريدة مكالمات المستثمرين تظهر 166.5 ألف مشاهدة وتفاعل المتابعين"
                  loading="lazy"
                  decoding="async" />
              </div>
            </div>
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
        </div>
      </section>

      <section className="sp-section sp-placement-section">
        <div className="wrap">
          <div className="sp-section-head reveal">
            <span>BRAND PLACEMENT · 03</span>
            <h2>أين يظهر شعارك؟</h2>
            <p>في ثلاثة أماكن دائمة أمام كل متابع للسلسلة: التغريدة الافتتاحية المثبتة، والبنر الأساسي للمكالمة، وأسفل كل مكالمة منشورة.</p>
          </div>
          <div className="sp-placement-grid">
            {placements.map((item, idx) => (
              <article className={'sp-placement reveal d' + (idx + 1) + (item.wide ? ' is-wide' : '')} key={item.code}>
                <div className="sp-placement-code">{item.code}</div>
                {item.image ? (
                  <figure className="sp-placement-example-image">
                    <span>مثال</span>
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading="lazy"
                      decoding="async" />
                  </figure>
                ) : (
                  <div className="sp-placement-mock" aria-hidden="true">
                    <div className="sp-placement-brand">
                      <BrandMark size={22} />
                      <span>الصقري | Alsagri</span>
                    </div>
                    <div className="sp-placement-content">
                      <strong>مكالمة المستثمرين - شركة المثال</strong>
                      <span></span><span></span><span></span>
                    </div>
                    <div className="sp-placement-logo">SPONSOR LOGO</div>
                  </div>
                )}
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-section sp-examples-section">
        <div className="wrap">
          <div className="sp-section-head reveal">
            <span>PREVIOUS EXAMPLES · 04</span>
            <h2>أمثلة سابقة</h2>
            <p>نماذج من مكالمات نتائج الشركات المنشورة سابقاً في حساب الصقري، بنفس أسلوب السلسلة التي تظهر فيها رعاية العلامة.</p>
          </div>
          <EarningsFeatureBanner />
          <div className="examples-grid sp-examples-grid">
            {previousExamples.map((r) => (
              <ReportCard
                key={r.co + r.title}
                r={r}
                catLabel="EARNINGS CALL"
                compact
                viewsPlacement="ticker"
                viewCount={previousExampleViews[r.co]} />
            ))}
          </div>
        </div>
      </section>

      <section id="packages" className="sp-section sp-packages-section">
        <div className="wrap">
          <div className="sp-section-head reveal">
            <span>PACKAGES · 05</span>
            <h2>باقات الرعاية</h2>
            <p>اختر مستوى الحضور الذي يناسب علامتك، واحجز مكانك قبل بداية الموسم — المساحة محدودة لراعٍ واحد فقط.</p>
          </div>
          <div className="sp-packages-grid">
            {packages.map((pkg, idx) => (
              <article className={'sp-package reveal d' + (idx + 1) + ' sp-tier-' + pkg.tier.toLowerCase() + (pkg.featured ? ' is-featured' : '')} key={pkg.tier}>
                <span className="sp-package-tier">{pkg.tier}</span>
                <h3>{pkg.title}</h3>
                <p>{pkg.period}</p>
                <ul>
                  {pkg.features.map((feature) => (
                    <li key={feature.text}><span className="sp-feat-check"></span><span className="sp-feat-text">{feature.text}{feature.code && <em className="sp-feat-code">{feature.code}</em>}</span></li>
                  ))}
                </ul>
                <div className="sp-package-price">
                  <strong className="sp-riyal-price">
                    <img src="assets/sponsorship/saudi-riyal-symbol.svg" alt="" loading="lazy" decoding="async" />
                    <span>{pkg.priceAmount}</span>
                  </strong>
                  <small>{pkg.priceLabel}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-final-section">
        <div className="wrap">
          <div className="sp-final-grid reveal">
            <div>
              <span>LIMITED · الربع الثاني 2026</span>
              <h2>كن راعي السلسلة</h2>
              <p>مساحة رعاية واحدة لكل ربع. لنحجز ظهور علامتك أمام جمهور مالي نوعي قبل بداية الموسم.</p>
            </div>
            <div className="sp-contact-actions">
              <a href="https://x.com/AlsagriCapital" target="_blank" rel="noreferrer">
                <small>على منصة X</small>
                <strong>@AlsagriCapital</strong>
              </a>
              <a href="https://wa.me/966550734332" target="_blank" rel="noreferrer">
                <small>واتساب</small>
                <strong>0550734332</strong>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Disclaimer />
    </React.Fragment>);
}

/* ── FOOTER ────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-inner">
        <div className="foot-row">
          <div>الصقري - جميع الحقوق محفوظة - 2026</div>
          <div className="mono">Riyadh · KSA · TASI Listed Equities</div>
        </div>
        <div className="foot-disclaimer">
          المحتوى المقدَّم على هذه المنصة لأغراضٍ معلوماتيةٍ وتحليليةٍ فقط، ولا يُعدُّ توصيةً ماليةً أو استشارةً استثمارية.
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
