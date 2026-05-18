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

/* ── Brand mark SVG (chart line + arrow + dots) ─────────────────── */
function BrandMark({ size = 28, color = 'currentColor' }) {
  return (
    <span className="brand-mark-svg" style={{ width: size, height: size, color }}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 36 L14 22 L22 28 L34 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28 12 L34 12 L34 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="4" cy="36" r="2.5" fill="currentColor" />
        <circle cx="14" cy="22" r="2.5" fill="currentColor" />
        <circle cx="22" cy="28" r="2.5" fill="currentColor" />
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

/* ── Candlestick chart background SVG ──────────────────────────── */
function ChartLineBackground({ variant = 'hero' }) {
  // Each candle: [x, openY, closeY, highY, lowY, dir]  (dir: 'up' or 'down')
  // ViewBox is 1200×360, baseline ~340.
  const sets = {
    hero: [
      [40,  290, 250, 230, 305, 'up'],
      [120, 270, 235, 215, 285, 'up'],
      [200, 250, 270, 235, 285, 'down'],
      [280, 260, 215, 195, 275, 'up'],
      [360, 220, 195, 175, 240, 'up'],
      [440, 200, 215, 185, 235, 'down'],
      [520, 210, 165, 145, 225, 'up'],
      [600, 170, 145, 125, 185, 'up'],
      [680, 150, 165, 135, 185, 'down'],
      [760, 160, 115, 95,  175, 'up'],
      [840, 120, 90,  70,  140, 'up'],
      [920, 95,  75,  55,  110, 'up'],
    ],
    about: [
      [40,  285, 260, 245, 300, 'up'],
      [120, 270, 245, 230, 285, 'up'],
      [200, 255, 270, 240, 280, 'down'],
      [280, 265, 230, 215, 280, 'up'],
      [360, 240, 215, 200, 255, 'up'],
      [440, 220, 240, 210, 250, 'down'],
      [520, 235, 195, 180, 250, 'up'],
      [600, 200, 175, 160, 215, 'up'],
      [680, 180, 195, 170, 210, 'down'],
      [760, 190, 155, 140, 205, 'up'],
      [840, 160, 135, 120, 175, 'up'],
      [920, 140, 115, 100, 150, 'up'],
    ],
    services: [
      [40,  280, 245, 230, 295, 'up'],
      [120, 260, 280, 245, 290, 'down'],
      [200, 270, 230, 215, 285, 'up'],
      [280, 235, 210, 195, 250, 'up'],
      [360, 215, 235, 205, 245, 'down'],
      [440, 230, 195, 180, 240, 'up'],
      [520, 200, 175, 160, 215, 'up'],
      [600, 180, 195, 170, 210, 'down'],
      [680, 190, 155, 140, 205, 'up'],
      [760, 160, 135, 120, 175, 'up'],
      [840, 140, 115, 100, 150, 'up'],
      [920, 120, 95,  80,  130, 'up'],
    ],
    examples: [
      [40,  290, 265, 250, 305, 'up'],
      [120, 275, 295, 260, 305, 'down'],
      [200, 285, 245, 230, 295, 'up'],
      [280, 250, 270, 240, 280, 'down'],
      [360, 260, 215, 200, 275, 'up'],
      [440, 220, 195, 180, 235, 'up'],
      [520, 205, 175, 160, 220, 'up'],
      [600, 180, 200, 170, 215, 'down'],
      [680, 195, 155, 140, 210, 'up'],
      [760, 160, 135, 120, 175, 'up'],
      [840, 145, 165, 135, 180, 'down'],
      [920, 155, 115, 100, 170, 'up'],
    ],
    contact: [
      [40,  280, 255, 240, 295, 'up'],
      [120, 265, 240, 225, 280, 'up'],
      [200, 250, 270, 235, 280, 'down'],
      [280, 260, 220, 205, 275, 'up'],
      [360, 230, 205, 190, 245, 'up'],
      [440, 210, 230, 200, 240, 'down'],
      [520, 225, 185, 170, 240, 'up'],
      [600, 190, 165, 150, 205, 'up'],
      [680, 170, 190, 160, 205, 'down'],
      [760, 180, 145, 130, 195, 'up'],
      [840, 150, 125, 110, 165, 'up'],
      [920, 130, 105, 90,  140, 'up'],
    ],
  };
  const candles = sets[variant] || sets.hero;
  const W = 1200, H = 360;
  const candleW = 22;
  const BASELINE = 348;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id={`fade-${variant}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines (chart axes) */}
      {[80, 160, 240, 320].map((y, i) => (
        <line key={i} x1="0" y1={y} x2={W} y2={y}
              stroke="#0A1628" strokeOpacity="0.07" strokeWidth="1"
              strokeDasharray="2 8" />
      ))}

      {/* Baseline */}
      <line x1="0" y1={BASELINE} x2={W} y2={BASELINE}
            stroke="#3B82F6" strokeOpacity="0.35" strokeWidth="1" />

      {/* Candles */}
      {candles.map((c, i) => {
        const [x, openY, closeY, highY, lowY, dir] = c;
        const isUp = dir === 'up';
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 4);
        const fade = (i + 1) / candles.length;
        const opacity = 0.35 + fade * 0.55;
        const color = isUp ? '#3B82F6' : '#0A1628';
        return (
          <g key={i} opacity={opacity}>
            {/* Wick */}
            <line x1={x + candleW / 2} y1={highY} x2={x + candleW / 2} y2={lowY}
                  stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            {/* Body */}
            {isUp ? (
              <rect x={x} y={bodyTop} width={candleW} height={bodyHeight}
                    fill={color} rx="1.5" />
            ) : (
              <rect x={x} y={bodyTop} width={candleW} height={bodyHeight}
                    fill="none" stroke={color} strokeWidth="1.5" rx="1.5" />
            )}
          </g>
        );
      })}
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
    { id: 'about',     label: 'عن المنصة', n: '01', href: 'about.html' },
    { id: 'services',  label: 'الخدمات',   n: '02', href: 'services.html' },
    { id: 'contact',   label: 'التواصل',   n: '03', href: 'contact.html' },
  ];

  return (
    <React.Fragment>
    <header className={'nav ' + (scrolled ? 'scrolled' : '')}>
      <div className="wrap nav-inner">
        <a className="brand" href="index.html">
          <BrandMark size={26} />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.01em' }}>الصقري</span>
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
              <span className="n">{it.n}</span>
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
      <span className="x-logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </span>
      <span className="tb-text">جميع خدمات المنصة متاحة في قسم الاشتراك بـ <strong>X</strong></span>
      <span className="tb-meta">(تويتر سابقاً)</span>
      <span className="tb-arr">←</span>
    </a>);
}

/* ── PAGE BANNER (interior pages) ──────────────────────────────── */
function PageBanner({ num, eyebrow, title, sub, variant = 'about' }) {
  return (
    <section className="page-banner">
      <div className="wrap">
        <div className="pb-eyebrow">/{num} — {eyebrow}</div>
        <h1 className="pb-title">{title}</h1>
        {sub && <p className="pb-sub">{sub}</p>}
        <div style={{ marginTop: 24 }}>
          <XSubBanner />
        </div>
      </div>
    </section>);
}

/* ── HERO (homepage — DARK BANNER) ─────────────────────────────── */
function Hero() {
  return (
    <section id="top" className="hero-dark">
      <div className="hero-glow" aria-hidden="true"></div>
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
          <span className="hqc-attr-name">وارن بافت</span>
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
                استعراض الخدمات
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
        variant="about" />

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
          <img src={r.cover} alt={r.co + ' — ' + r.title} loading="lazy" />
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
        variant="services" />

      <section id="services" className="section first">
        <div className="wrap">
          <div className="services-grid">
            {window.SERVICES.map((s, idx) => (
              <a
                className={'svc reveal d' + (idx + 1)}
                key={s.id}
                href={'service-' + s.id + '.html'}
                style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="svc-num">
                  <span>{s.num}</span>
                </div>
                <h3>{s.ar}</h3>
                <div className="svc-en">{s.en}</div>
                <p className="svc-desc">{s.desc}</p>
                <div className="svc-tags">
                  {s.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                </div>
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

Object.assign(window, { Nav, Hero, About, Services, ServiceDetail, Disclaimer, Contact, Footer, useReveal, BrandMark, PageBanner, ReportCard });
