// sections.jsx — Page sections for Alsagri Capital website.

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

/* ── Sparkline (mini chart for report cards) ───────────────────── */
function Sparkline({ data }) {
  const w = 240,h = 36,pad = 2;
  const min = Math.min(...data),max = Math.max(...data);
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

/* ── NAV ───────────────────────────────────────────────────────── */
function Nav({ activeSection, drawerOpen, setDrawerOpen, progress }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const items = [
  { id: 'about', label: 'عن المنصة', n: '01' },
  { id: 'services', label: 'الخدمات', n: '02' },
  { id: 'examples', label: 'النماذج', n: '03' },
  { id: 'contact', label: 'التواصل', n: '04' }];

  return (
    <header className={'nav ' + (scrolled ? 'scrolled' : '')}>
      <div className="wrap nav-inner">
        <a className="brand" href="#top" onClick={(e) => {e.preventDefault();window.scrollTo({ top: 0, behavior: 'smooth' });}}>
          <span className="brand-mark">AC</span>
          <span>الصقري <span style={{ color: 'var(--ink-mute)' }}>كابيتال</span></span>
        </a>
        <nav>
          <ul className="nav-links">
            {items.map((it) =>
            <li key={it.id}>
                <a href={'#' + it.id}
              className={activeSection === it.id ? 'active' : ''}>
                  {it.label}
                </a>
              </li>
            )}
          </ul>
        </nav>
        <a className="nav-cta" href="#contact">
          <span className="dot"></span>
          تواصل معي
        </a>
        <button
          className={'nav-burger ' + (drawerOpen ? 'open' : '')}
          aria-label="القائمة"
          onClick={() => setDrawerOpen((v) => !v)}>
          <span></span><span></span>
        </button>
        <div className="nav-progress"><i style={{ width: progress + '%' }}></i></div>
      </div>
      <div className={'drawer ' + (drawerOpen ? 'open' : '')}>
        <ul>
          {items.map((it) =>
          <li key={it.id}>
              <a href={'#' + it.id} onClick={() => setDrawerOpen(false)}>
                <span>{it.label}</span>
                <span className="n">{it.n}</span>
              </a>
            </li>
          )}
        </ul>
        <a className="drawer-cta" href="#contact" onClick={() => setDrawerOpen(false)}>تواصل معي ←</a>
      </div>
    </header>);

}

/* ── HERO ──────────────────────────────────────────────────────── */
function Hero({ variant }) {
  return (
    <section id="top" className="hero">
      <div className="wrap">
        <div className="hero-grid" style={{ gridTemplateColumns: '1fr', textAlign: variant === 'centered' ? 'center' : 'start', justifyItems: variant === 'centered' ? 'center' : 'start', maxWidth: 980 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 32 }}>SAUDI · LISTED · EQUITIES</div>
            <h1>
              <span className="line">قراءةٌ مفصله</span>
              <span className="line">لـ الشركات بالسوق <span className="em">المملكة</span></span>
              <span className="line">السعودي.</span>
            </h1>
            <p className="hero-sub">الاشتراك بحساب الصقري بـ X (تويتر سابقا) يقدم لك عدد من الخدمات و التقارير و الملخصات والتحليات المكتوبة لمكالمات نتائج الشركات السعودية و تقارير بيوت الخبرة مثل (الراجحي المالية - الأهلي المالية - الجزيرة كابيتال - جولدمن ساكس - HSBC - جيفريز - سيتي بنك قروب - جي بي مورقان وغيرهم)، والتقارير النوعية حول نماذج الأعمال وقطاعات السوق .

            </p>
            <div className="hero-actions">
              <a href="#services" className="btn btn-primary">
                استعراض الخدمات
                <span className="arrow">←</span>
              </a>
              <a href="#examples" className="btn btn-ghost">
                نماذج التقارير
              </a>
            </div>
          </div>
        </div>

        <div className="ticker-strip">
          {window.TICKER_STATS.map((s) =>
          <div className="tk" key={s.k}>
              <div className="k">{s.k}</div>
              <div className="v">
                <span className="lat">{s.v}</span>
                <span className="unit">{s.unit}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}

/* ── ABOUT ─────────────────────────────────────────────────────── */
function About() {
  return (
    <section id="about" className="section">
      <div className="wrap">
        <div className="section-head">
          <div className="label">
            <span className="num">/01 — ABOUT</span>
            <span className="kicker">عن المنصة</span>
          </div>
          <h2 className="reveal">
            محتوىً معلوماتيٌّ موجَّهٌ للمستثمرين في السوق السعودي
            <span className="em"> منظَّمٌ، موجزٌ، ومُحايد.</span>
          </h2>
        </div>

        <div className="about-grid">
          <div className="about-text reveal d1">
            <p>
              تعرض هذه المنصة قراءاتٍ مكتوبةً لمحتوى السوق المالي السعودي: مكالمات النتائج، تقارير الأبحاث، والتحليلات النوعية للشركات المدرجة في تداول.
            </p>
            <p>
              المنهج تحريريٌّ بحت — <span className="em">دون توصياتٍ ودون استشاراتٍ مالية</span> — وإنّما تنظيمٌ للمعلومة المتاحة علناً، وعرضٌ لما تقوله الإدارات والمحلّلون بطريقةٍ يسهل قراءتها واستحضارها.
            </p>
          </div>

          <div className="about-pillars reveal d2">
            <div className="pillar">
              <div className="p-n">01</div>
              <div>
                <div className="p-ttl">وضوحُ العرض</div>
                <div className="p-desc">تقسيمٌ منهجيٌّ للمحتوى يفصل المؤشرات الرقمية عن الملاحظات النوعية وعن تعليقات الإدارة.</div>
              </div>
            </div>
            <div className="pillar">
              <div className="p-n">02</div>
              <div>
                <div className="p-ttl">عُمقُ القراءة</div>
                <div className="p-desc">قراءةٌ تتجاوز العناوين إلى الفرضيات الكامنة في النماذج المالية والقرارات الإدارية.</div>
              </div>
            </div>
            <div className="pillar">
              <div className="p-n">03</div>
              <div>
                <div className="p-ttl">حيادُ المضمون</div>
                <div className="p-desc">عرضٌ موضوعيٌّ لما هو منشورٌ علناً، دون رأيٍ توجيهيٍّ أو توصيةٍ بالشراء أو البيع.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}

/* ── SERVICES ──────────────────────────────────────────────────── */
function Services() {
  return (
    <section id="services" className="section">
      <div className="wrap">
        <div className="section-head">
          <div className="label">
            <span className="num">/02 — SERVICES</span>
            <span className="kicker">الخدمات</span>
          </div>
          <h2 className="reveal">
            ثلاثُ زوايا لقراءة الشركة السعودية المدرجة:
            <span className="em"> ما قالته الشركة، ما يُقال عنها، وما هي عليه.</span>
          </h2>
        </div>

        <div className="services-grid">
          {window.SERVICES.map((s, idx) =>
          <div className={'svc reveal d' + (idx + 1)} key={s.id}>
              <div className="svc-num">
                <span>{s.num}</span>
              </div>
              <h3>{s.ar}</h3>
              <div className="svc-en">{s.en}</div>
              <p className="svc-desc">{s.desc}</p>
              <div className="svc-tags">
                {s.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
              </div>
              <a className="svc-link" href="#examples">
                <span>اطّلع على النماذج</span>
                <span className="arr">←</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>);

}

/* ── EXAMPLES ──────────────────────────────────────────────────── */
function Examples() {
  const [tab, setTab] = useState('all');
  const tabs = [
  { id: 'all', label: 'الكل', n: '*' },
  { id: 'earnings', label: 'مكالمات النتائج', n: '01' },
  { id: 'brokerage', label: 'تقارير الأبحاث', n: '02' },
  { id: 'qualitative', label: 'تحليلات نوعية', n: '03' }];

  const reports = window.REPORTS.filter((r) => tab === 'all' || r.cat === tab);
  const catLabel = (c) => ({
    earnings: 'EARNINGS CALL',
    brokerage: 'RESEARCH',
    qualitative: 'QUALITATIVE'
  })[c];
  return (
    <section id="examples" className="section">
      <div className="wrap">
        <div className="section-head">
          <div className="label">
            <span className="num">/03 — EXAMPLES</span>
            <span className="kicker">نماذج التقارير</span>
          </div>
          <h2 className="reveal">
            نماذجُ توضيحيةٌ من كلِّ نوعٍ من المحتوى المعروض على المنصة.
          </h2>
        </div>

        <div className="examples-tabs reveal">
          {tabs.map((t) =>
          <button
            key={t.id}
            className={'tab ' + (tab === t.id ? 'active' : '')}
            onClick={() => setTab(t.id)}>
              <span className="n">{t.n}</span>
              <span>{t.label}</span>
            </button>
          )}
        </div>

        <div className="examples-grid">
          {reports.map((r, i) =>
          <article className={'rpt reveal d' + (i % 3 + 1)} key={r.co + r.title}>
              <div className="rpt-top">
                <span className="rpt-tag">{catLabel(r.cat)}</span>
                <span className="rpt-ticker">{r.ticker}</span>
              </div>
              <div className="rpt-co">{r.co}</div>
              <div className="rpt-title">{r.title}</div>
              <p className="rpt-desc">{r.desc}</p>
              <Sparkline data={r.spark} />
              <div className="rpt-metrics">
                {r.metrics.map((m) =>
              <span className="m" key={m}><span className="dot"></span>{m}</span>
              )}
              </div>
              <div className="rpt-foot">
                <span className="rpt-date">{r.date}</span>
                <span className="rpt-read">
                  قراءة الملخص
                  <span className="arr">←</span>
                </span>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>);

}

/* ── DISCLAIMER ────────────────────────────────────────────────── */
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

/* ── CONTACT ───────────────────────────────────────────────────── */
function Contact() {
  return (
    <section id="contact" className="section">
      <div className="wrap">
        <div className="contact-grid">
          <div className="reveal">
            <div className="eyebrow" style={{ marginBottom: 24 }}>/04 — CONTACT</div>
            <h2 className="contact-hed">
              للمراسلة <br />
              والاستفسار<span className="em">.</span>
            </h2>
            <p style={{ marginTop: 24, color: 'var(--ink-soft)', maxWidth: 460, lineHeight: 1.7 }}>
              يُسعدني تلقّي الملاحظات أو الاقتراحات على المحتوى. لا توجد نماذج تسجيلٍ ولا اشتراكاتٍ — مجرّد قنواتٍ مباشرة.
            </p>
          </div>

          <div className="contact-list reveal d2">
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
      </div>
    </section>);

}

/* ── FOOTER ────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-inner">
        <div>© ٢٠٢٥ الصاقري كابيتال — جميع الحقوق محفوظة.</div>
        <div className="mono">Riyadh · KSA · TASI Listed Equities</div>
      </div>
    </footer>);

}

Object.assign(window, { Nav, Hero, About, Services, Examples, Disclaimer, Contact, Footer, useReveal });