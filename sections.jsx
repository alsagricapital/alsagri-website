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

/* ── Brand mark SVG (refined market wing) ───────────────────────── */
function BrandMark({ size = 28, color = 'currentColor' }) {
  const markStyle = color === 'currentColor' ? { width: size, height: size } : { width: size, height: size, color };
  return (
    <span className="brand-mark-svg" style={markStyle}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path className="bm-wing bm-wing-soft" d="M8 33.5L20.5 20.2L27.4 26.9L15 40.5H8Z" />
        <path className="bm-wing bm-wing-main" d="M18.7 31.2L33.3 13.6L41.4 17.4L27.7 35.6Z" />
        <path className="bm-wing bm-wing-accent" d="M32.4 13.4L43.2 8.6L41.4 17.4Z" />
        <path className="bm-wing bm-wing-rise" d="M27.7 35.6L41.4 17.4L43.4 27.4L33.4 39.4Z" />
        <path className="bm-baseline" d="M9.5 41.5H39.5" />
      </svg>
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
      <path d={chart.path} fill="none" stroke={`url(#trend-line-${variant})`}
            strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
            filter={`url(#trend-shadow-${variant})`} opacity="0.92" />
      <path d={chart.path} fill="none" stroke="#FFFFFF" strokeOpacity="0.32"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {chart.nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="12" fill="#3B82F6" opacity="0.1" />
          <circle cx={x} cy={y} r="4.5" fill="#FAFAF7" stroke="#3B82F6" strokeWidth="2" />
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
  ];

  return (
    <React.Fragment>
    <header className={'nav ' + (scrolled ? 'scrolled' : '')}>
      <div className="wrap nav-inner">
        <a className="brand" href="index.html">
          <BrandMark size={34} />
          <span className="brand-wordmark">
            <span className="brand-name">الصقري</span>
            <span className="brand-sub">ALSAGRI CAPITAL</span>
          </span>
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
function PageBanner({ num, eyebrow, title, sub, variant = 'about', showXSub = false }) {
  return (
    <section className="page-banner">
      <div className="wrap">
        <div className="pb-eyebrow">/{num} — {eyebrow}</div>
        <h1 className="pb-title">{title}</h1>
        {sub && <p className="pb-sub">{sub}</p>}
        {showXSub && (
          <div style={{ marginTop: 24 }}>
            <XSubBanner />
          </div>
        )}
      </div>
    </section>);
}

/* ── HERO (homepage — DARK BANNER) ─────────────────────────────── */
function Hero() {
  return (
    <React.Fragment>
    <section id="top" className="hero-dark">
      <div className="hero-glow" aria-hidden="true"></div>
      <div className="hero-chart" aria-hidden="true">
        <ChartLineBackground variant="hero" />
      </div>
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
          <div>
            <div className="eyebrow" style={{ marginBottom: 32 }}>SAUDI · LISTED · EQUITIES</div>
            <h1>
              <span className="line">قراءةٌ مُفصَّلة لشركات السوق <span className="em">السعودي</span></span>
            </h1>
            <p className="hero-sub">
              منصةٌ تعرض ملخصات وتحليلات مكتوبة لمكالمات نتائج الشركات السعودية المدرجة، تقارير بيوت الأبحاث، والتقارير النوعية حول نماذج الأعمال وقطاعات السوق.
            </p>
            <div style={{ marginTop: 28 }}>
              <XSubBanner />
            </div>
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

function HomeCalmBanner() {
  return (
    <section className="home-calm-band">
      <div className="wrap">
        <div className="home-calm-card reveal">
          <div className="home-calm-glow" aria-hidden="true"></div>
          <div className="home-calm-mark" aria-hidden="true">
            <BrandMark size={26} />
          </div>
          <div className="home-calm-copy">
            <span className="home-calm-kicker">قراءة هادئة للسوق</span>
            <p>تنظيم المعلومة قبل اتخاذ القرار: مكالمات نتائج، تقارير أبحاث، وأدوات مختصرة في مكان واحد.</p>
          </div>
          <div className="home-calm-tags" aria-label="محاور المنصة">
            <span>مكالمات النتائج</span>
            <span>تقارير الأبحاث</span>
            <span>أدوات مفيدة</span>
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
        showXSub={true} />

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

            <div className="about-pillars reveal d2">
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
function ReportCard({ r, catLabel }) {
  const arCat = ({
    earnings: 'مكالمة عرض النتائج',
    brokerage: 'تقرير بحثي',
    qualitative: 'تقرير نوعي',
  })[r.cat] || '';

  const Wrapper = r.link ? 'a' : 'article';
  const wrapperProps = r.link
    ? { href: r.link, target: '_blank', rel: 'noreferrer', className: 'rpt rpt-link' + (r.cover ? ' rpt-has-cover' : '') }
    : { className: 'rpt' + (r.cover ? ' rpt-has-cover' : '') };

  return (
    <Wrapper {...wrapperProps}>
      {r.cover && (
        <div className="rpt-cover">
          <img src={r.cover} alt={r.co + ' — ' + r.title} loading="eager" decoding="async" />
        </div>
      )}
      <div className="rpt-body">
        <div className="rpt-top">
          <div className="rpt-tag-group">
            <span className="rpt-tag-ar">{arCat}</span>
            <span className="rpt-tag">{catLabel}</span>
          </div>
          <span className="rpt-ticker">{r.ticker}</span>
        </div>
        <div className="rpt-co">{r.co}</div>
        <div className="rpt-title">{r.title}</div>
        {!r.cover && <Sparkline data={r.spark} />}
        {r.metrics && !r.cover && (
          <div className="rpt-metrics">
            {r.metrics.map((m) => (
              <span className="m" key={m}><span className="dot"></span>{m}</span>
            ))}
          </div>
        )}
        <div className="rpt-foot">
          <span className="rpt-date">{r.date}</span>
          {r.link && (
            <span className="rpt-read">
              <span className="arr">↗</span>
            </span>
          )}
        </div>
      </div>
    </Wrapper>);
}

/* ── SERVICES page ──────────────────────────────────── */
function Services() {
  return (
    <React.Fragment>
      <PageBanner
        num="02"
        eyebrow="SERVICES"
        title="الخدمات"
        sub="ثلاثُ زوايا لقراءة الشركة السعودية المدرجة: ما قالته الشركة، ما يُقال عنها، وما هي عليه. اضغط على أي خدمة لعرض نماذجها."
        variant="services"
        showXSub={true} />

      <section id="services" className="section first">
        <div className="wrap">
          <div className="services-grid">
            {window.SERVICES.map((s, idx) => (
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
function ServiceDetail() {
  const serviceId = document.body.dataset.serviceId;
  const service = window.SERVICES.find((s) => s.id === serviceId);
  if (!service) return <div className="wrap" style={{ padding: '80px 0' }}>الخدمة غير موجودة</div>;

  const reports = window.REPORTS.filter((r) => r.cat === serviceId);
  const catLabel = ({
    earnings: 'EARNINGS CALL',
    brokerage: 'RESEARCH',
    qualitative: 'QUALITATIVE',
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

          <div className="examples-grid">
            {reports.map((r) => <ReportCard key={r.co + r.title} r={r} catLabel={catLabel} />)}
          </div>
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
            <a className="contact-row" href="mailto:hello@alsagricapital.sa">
              <span className="k">EMAIL</span>
              <span className="v">hello@alsagricapital.sa</span>
              <span className="arr">↗</span>
            </a>
            <a className="contact-row" href="https://linkedin.com/in/alsagricapital" target="_blank" rel="noreferrer">
              <span className="k">LINKEDIN</span>
              <span className="v">/in/alsagricapital</span>
              <span className="arr">↗</span>
            </a>
            <a className="contact-row" href="https://t.me/alsagricapital" target="_blank" rel="noreferrer">
              <span className="k">TELEGRAM</span>
              <span className="v">@alsagricapital</span>
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

/* ── FOOTER ────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-inner">
        <div className="foot-row">
          <div>© ٢٠٢٦ الصقري — جميع الحقوق محفوظة.</div>
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

Object.assign(window, { Nav, Hero, About, Services, ServiceDetail, Disclaimer, Contact, Tools, Footer, useReveal, BrandMark, PageBanner, ReportCard });
