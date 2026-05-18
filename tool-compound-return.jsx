// tool-compound-return.jsx — Compound Interest Calculator (yearly compounding)
// Future value of initial investment + monthly contributions, compounded annually.

const { useState: useStateCR } = React;

function ToolCompoundReturn() {
  const initialInputs = { initial: '', monthly: '', years: '', rate: '' };
  const [inputs, setInputs] = useStateCR(initialInputs);
  const [result, setResult] = useStateCR(null);
  const [error, setError] = useStateCR(null);

  const update = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    if (result) setResult(null);
    if (error) setError(null);
  };

  const handleReset = () => {
    setInputs(initialInputs);
    setResult(null);
    setError(null);
  };

  const handleCalculate = () => {
    const P = Number(inputs.initial || 0);
    const M = Number(inputs.monthly || 0);
    const n = Number(inputs.years || 0);
    const r = Number(inputs.rate || 0) / 100;

    if (!isFinite(P) || P < 0) { setError('قيمة الاستثمار الابتدائي غير صحيحة.'); return; }
    if (!isFinite(M) || M < 0) { setError('قيمة المساهمة الشهرية غير صحيحة.'); return; }
    if (!isFinite(n) || n <= 0) { setError('عدد السنوات يجب أن يكون أكبر من صفر.'); return; }
    if (!isFinite(r)) { setError('نسبة العائد غير صحيحة.'); return; }
    if (n > 80) { setError('عدد السنوات كبير جداً — حد أقصى 80 سنة.'); return; }

    const annualContribution = M * 12;
    const yearByYear = [{
      year: 0,
      balance: P,
      contributions: P,
      interest: 0,
    }];
    let balance = P;
    let totalContributions = P;

    for (let y = 1; y <= n; y++) {
      balance = balance * (1 + r) + annualContribution;
      totalContributions += annualContribution;
      yearByYear.push({
        year: y,
        balance,
        contributions: totalContributions,
        interest: balance - totalContributions,
      });
    }

    setResult({
      years: n,
      finalValue: balance,
      totalContributions,
      totalInterest: balance - totalContributions,
      yearByYear,
      initial: P,
      monthly: M,
      rate: r * 100,
    });

    setTimeout(() => {
      const el = document.querySelector('.cr-result');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const fmtSAR = (n) => {
    if (!isFinite(n)) return '—';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };

  return (
    <React.Fragment>
      <PageBanner
        num="03·02"
        eyebrow="COMPOUND INTEREST CALCULATOR"
        title="حساب العائد التراكمي"
        sub="قدِّر القيمة المستقبلية لاستثمارك بناءً على رأس المال الابتدائي والمساهمات الشهرية ونسبة العائد، مع مضاعفة سنوية."
        variant="tools" />

      <section className="section first">
        <div className="wrap">
          <div className="calc">

            {/* HOW IT WORKS */}
            <div className="calc-help">
              <div className="calc-help-title">كيف تعمل الحاسبة؟</div>
              <ol className="calc-help-list">
                <li><span className="calc-help-n">١</span><span>أدخل رأس المال الابتدائي (المبلغ الذي تبدأ به اليوم).</span></li>
                <li><span className="calc-help-n">٢</span><span>أدخل المساهمة الشهرية التي ستضيفها بانتظام.</span></li>
                <li><span className="calc-help-n">٣</span><span>حدّد مدة الاستثمار بالسنوات ونسبة العائد السنوي المتوقع.</span></li>
                <li><span className="calc-help-n">٤</span><span>تظهر النتيجة مع رسم بياني يقارن <em>إجمالي مساهماتك</em> بالقيمة النهائية للاستثمار سنةً بسنة.</span></li>
              </ol>
            </div>

            {/* INPUTS */}
            <div className="calc-section">
              <div className="calc-head">
                <div className="calc-head-num">/01</div>
                <h2 className="calc-head-title">بيانات الاستثمار</h2>
                <p className="calc-head-desc">المضاعفة السنوية ثابتة — تُحتسب الفائدة مرة واحدة في نهاية كل سنة على رصيد بداية السنة.</p>
              </div>

              <div className="cr-grid">
                <CalcField
                  label="رأس المال الابتدائي"
                  type="number"
                  value={inputs.initial}
                  onChange={(v) => update('initial', v)}
                  placeholder="0.00"
                  suffixNode={<SAR className="sar suffix-sar" />}
                  hint="المبلغ الذي تبدأ به الاستثمار اليوم." />
                <CalcField
                  label="المساهمة الشهرية"
                  type="number"
                  value={inputs.monthly}
                  onChange={(v) => update('monthly', v)}
                  placeholder="0.00"
                  suffixNode={<SAR className="sar suffix-sar" />}
                  hint="المبلغ الذي ستضيفه كل شهر بانتظام." />
                <CalcField
                  label="مدة الاستثمار"
                  type="number"
                  value={inputs.years}
                  onChange={(v) => update('years', v)}
                  placeholder="10"
                  suffix="سنة" />
                <CalcField
                  label="نسبة العائد السنوي المتوقع"
                  type="number"
                  value={inputs.rate}
                  onChange={(v) => update('rate', v)}
                  placeholder="8.0"
                  suffix="%" />
              </div>

              <div className="cr-fixed">
                <span className="cr-fixed-label">تردد المضاعفة</span>
                <span className="cr-fixed-val">سنوي · Yearly</span>
              </div>
            </div>

            {/* ACTION */}
            <div className="calc-action cr-action">
              {error && <div className="calc-error">{error}</div>}
              <div className="cr-btn-row">
                <button className="calc-btn" onClick={handleCalculate}>
                  احسب النتيجة
                  <span className="arr" aria-hidden="true">←</span>
                </button>
                <button className="calc-btn-secondary" onClick={handleReset} type="button">
                  إعادة تعيين
                </button>
              </div>
            </div>

            {/* RESULT */}
            {result && (
              <div className="cr-result calc-result is-profit">
                <div className="cr-verdict">
                  <div className="cr-verdict-label">النتيجة جاهزة</div>
                  <h3 className="cr-verdict-title">
                    خلال <strong>{result.years}</strong> {result.years === 1 ? 'سنة' : result.years === 2 ? 'سنتين' : (result.years >= 3 && result.years <= 10) ? 'سنوات' : 'سنة'} سيصبح رصيدك
                  </h3>
                  <div className="cr-verdict-amount">
                    {fmtSAR(result.finalValue)}
                    <SAR className="sar cr-amount-sar" />
                  </div>
                  <p className="cr-verdict-desc">
                    باستثمارٍ ابتدائي قدره <strong>{fmtSAR(result.initial)}</strong> ر.س ومساهمةٍ شهريةٍ قدرها <strong>{fmtSAR(result.monthly)}</strong> ر.س بنسبة عائدٍ سنويٍّ متوقَّع <strong>{result.rate.toFixed(2)}%</strong>، ستكون قد ساهمت بـ <strong>{fmtSAR(result.totalContributions)}</strong> ر.س، وحصلت على عائدٍ تراكميٍّ قدره <strong>{fmtSAR(result.totalInterest)}</strong> ر.س.
                  </p>
                </div>

                {/* Stats */}
                <div className="cr-stats">
                  <div className="cr-stat">
                    <div className="cr-stat-label">إجمالي المساهمات</div>
                    <div className="cr-stat-val">
                      {fmtSAR(result.totalContributions)}
                      <SAR className="sar cr-stat-sar" />
                    </div>
                  </div>
                  <div className="cr-stat">
                    <div className="cr-stat-label">العائد التراكمي</div>
                    <div className="cr-stat-val">
                      {fmtSAR(result.totalInterest)}
                      <SAR className="sar cr-stat-sar" />
                    </div>
                  </div>
                  <div className="cr-stat cr-stat-hero">
                    <div className="cr-stat-label">القيمة النهائية</div>
                    <div className="cr-stat-val">
                      {fmtSAR(result.finalValue)}
                      <SAR className="sar cr-stat-sar" />
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <CompoundChart data={result.yearByYear} fmt={fmtSAR} />

                {/* Year-by-year table */}
                <details className="cr-table-wrap">
                  <summary>عرض الجدول السنوي</summary>
                  <div className="cr-table-scroll">
                    <table className="cr-table">
                      <thead>
                        <tr>
                          <th>السنة</th>
                          <th>إجمالي المساهمات</th>
                          <th>العائد التراكمي</th>
                          <th>الرصيد</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.yearByYear.map((y) => (
                          <tr key={y.year}>
                            <td className="cr-table-year">{y.year}</td>
                            <td>{fmtSAR(y.contributions)} <SAR className="sar cr-table-sar" /></td>
                            <td>{fmtSAR(y.interest)} <SAR className="sar cr-table-sar" /></td>
                            <td className="cr-table-bal">{fmtSAR(y.balance)} <SAR className="sar cr-table-sar" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}

function CompoundChart({ data, fmt }) {
  // SVG dimensions
  const W = 800, H = 320;
  const padL = 60, padR = 20, padT = 30, padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxBalance = Math.max(...data.map((d) => d.balance), 1);
  const yTickCount = 5;
  const yTicks = [];
  for (let i = 0; i <= yTickCount; i++) {
    yTicks.push((maxBalance * i) / yTickCount);
  }
  // Round max up nicely
  const niceMax = niceCeil(maxBalance);
  const yScale = (v) => padT + innerH - (v / niceMax) * innerH;

  // X positions
  const n = data.length;
  const barW = Math.max(4, Math.min(40, innerW / n - 6));
  const xCenter = (i) => padL + (innerW * (i + 0.5)) / n;

  // Decide which year labels to show (avoid clutter)
  const labelEvery = n <= 12 ? 1 : n <= 25 ? 2 : n <= 50 ? 5 : 10;

  return (
    <div className="cr-chart-wrap">
      <div className="cr-chart-header">
        <div className="cr-chart-title">نمو الاستثمار سنةً بسنة</div>
        <div className="cr-chart-legend">
          <span className="cr-legend-item">
            <span className="cr-legend-swatch cr-swatch-contrib" aria-hidden="true"></span>
            إجمالي المساهمات
          </span>
          <span className="cr-legend-item">
            <span className="cr-legend-swatch cr-swatch-interest" aria-hidden="true"></span>
            العائد التراكمي
          </span>
        </div>
      </div>
      <div className="cr-chart-scroll">
        <svg className="cr-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="رسم بياني لنمو الاستثمار">
          {/* Y grid lines + labels */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const v = (niceMax * i) / 5;
            const y = yScale(v);
            return (
              <g key={'g' + i}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="var(--line)" strokeWidth="1" />
                <text x={padL - 10} y={y + 4} textAnchor="end" className="cr-chart-axis">
                  {abbrev(v)}
                </text>
              </g>
            );
          })}

          {/* Stacked bars: contributions (bottom) + interest (top) */}
          {data.map((d, i) => {
            const x = xCenter(i) - barW / 2;
            const yBalance = yScale(d.balance);
            const yContrib = yScale(d.contributions);
            const contribHeight = yScale(0) - yContrib;
            const interestHeight = yContrib - yBalance;
            return (
              <g key={'b' + i}>
                {/* Contributions */}
                <rect x={x} y={yContrib} width={barW} height={Math.max(0, contribHeight)}
                  fill="var(--cr-contrib)" rx="2" />
                {/* Interest stacked on top */}
                {interestHeight > 0 && (
                  <rect x={x} y={yBalance} width={barW} height={interestHeight}
                    fill="var(--cr-interest)" rx="2" />
                )}
                <title>{`السنة ${d.year}: ${fmt(d.balance)} ر.س`}</title>
              </g>
            );
          })}

          {/* X labels */}
          {data.map((d, i) => {
            if (d.year % labelEvery !== 0 && i !== data.length - 1) return null;
            return (
              <text key={'x' + i} x={xCenter(i)} y={H - padB + 22} textAnchor="middle" className="cr-chart-axis">
                {d.year}
              </text>
            );
          })}

          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="var(--line-2)" strokeWidth="1" />
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="var(--line-2)" strokeWidth="1" />

          {/* X axis title */}
          <text x={padL + innerW / 2} y={H - 4} textAnchor="middle" className="cr-chart-axis cr-chart-axis-title">السنوات</text>
        </svg>
      </div>
    </div>
  );
}

function niceCeil(v) {
  if (v <= 0) return 1;
  const exp = Math.floor(Math.log10(v));
  const f = v / Math.pow(10, exp);
  let nice;
  if (f <= 1) nice = 1;
  else if (f <= 2) nice = 2;
  else if (f <= 5) nice = 5;
  else nice = 10;
  return nice * Math.pow(10, exp);
}

function abbrev(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toFixed(0);
}

// Reuse the SAR component & CalcField from tool-position-switch.jsx if loaded;
// otherwise define minimal fallbacks here.
if (typeof window.SAR === 'undefined') {
  window.SAR = function SAR({ className = 'sar' }) {
    return (
      <svg className={className} viewBox="0 0 1124.14 1256.39" fill="currentColor" aria-label="ريال سعودي" role="img">
        <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" />
        <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.33-92.75,38.42-143.37l-330.69,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69L0,793.13c-3.43,15.42-5.21,31.66-5.21,48.31v195.85l435.45-92.74v140.06c-29.34,17.85-62.45,28.45-97.61,30.42l1.21-.06l132.25-28.11V940.34l435.45-92.74Z" />
      </svg>
    );
  };
}

if (typeof window.CalcField === 'undefined') {
  window.CalcField = function CalcField({ label, value, onChange, type = 'text', placeholder, suffix, suffixNode, hint, optional }) {
    return (
      <label className="calc-field">
        <span className="calc-field-label">
          {label}
          {optional && <span className="calc-field-optional">(اختياري)</span>}
        </span>
        <span className="calc-field-input">
          <input
            type={type}
            inputMode={type === 'number' ? 'decimal' : undefined}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            step="any" />
          {suffixNode ? (
            <span className="calc-field-suffix calc-field-suffix-icon">{suffixNode}</span>
          ) : suffix ? (
            <span className="calc-field-suffix">{suffix}</span>
          ) : null}
        </span>
        {hint && <span className="calc-field-hint">{hint}</span>}
      </label>
    );
  };
}

// Local references
const SAR = window.SAR;
const CalcField = window.CalcField;

Object.assign(window, { ToolCompoundReturn });
