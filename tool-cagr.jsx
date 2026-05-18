// tool-cagr.jsx — Annual Compound Growth Rate (CAGR) Calculator
// CAGR = (FV / PV)^(1 / n) - 1

const { useState: useStateCagr } = React;

function ToolCagr() {
  const initialInputs = { current: '', future: '', years: '5' };
  const [inputs, setInputs] = useStateCagr(initialInputs);
  const [result, setResult] = useStateCagr(null);
  const [error, setError] = useStateCagr(null);

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
    const PV = Number(inputs.current || 0);
    const FV = Number(inputs.future || 0);
    const n = Number(inputs.years || 0);

    if (!isFinite(PV) || PV <= 0) { setError('القيمة الحالية يجب أن تكون أكبر من صفر.'); return; }
    if (!isFinite(FV) || FV <= 0) { setError('القيمة المستقبلية يجب أن تكون أكبر من صفر.'); return; }
    if (!isFinite(n) || n <= 0) { setError('عدد السنوات يجب أن يكون أكبر من صفر.'); return; }
    if (n > 100) { setError('عدد السنوات كبير جداً — حد أقصى 100 سنة.'); return; }

    const cagr = Math.pow(FV / PV, 1 / n) - 1;
    const totalReturn = (FV - PV) / PV;
    const isPositive = cagr >= 0;

    // Year-by-year growth path
    const yearByYear = [];
    for (let y = 0; y <= n; y++) {
      yearByYear.push({
        year: y,
        value: PV * Math.pow(1 + cagr, y),
      });
    }

    setResult({
      cagr: cagr * 100,
      totalReturn: totalReturn * 100,
      multiple: FV / PV,
      finalValue: FV,
      initialValue: PV,
      years: n,
      isPositive,
      yearByYear,
    });

    setTimeout(() => {
      const el = document.querySelector('.cagr-result');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const fmtSAR = (n) => {
    if (!isFinite(n)) return '—';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };
  const fmtPct = (n) => {
    if (!isFinite(n)) return '—';
    return n.toFixed(2);
  };

  return (
    <React.Fragment>
      <PageBanner
        num="03·03"
        eyebrow="COMPOUND ANNUAL GROWTH RATE"
        title={<React.Fragment>حساب العائد السنوي المركّب <span className="pb-title-acronym">CAGR</span></React.Fragment>}
        sub="احسب معدّل النمو السنوي المركّب (CAGR) بين قيمتين عبر فترة زمنية محدّدة — لتقييم أداء استثمارٍ أو أصلٍ على المدى الطويل."
        variant="tools" />

      <section className="section first">
        <div className="wrap">
          <div className="calc">

            {/* HOW IT WORKS */}
            <div className="calc-help">
              <div className="calc-help-title">كيف تعمل الحاسبة؟</div>
              <ol className="calc-help-list">
                <li><span className="calc-help-n">١</span><span>أدخل <strong>القيمة الحالية</strong> (نقطة البداية).</span></li>
                <li><span className="calc-help-n">٢</span><span>أدخل <strong>القيمة المستقبلية</strong> (نقطة النهاية).</span></li>
                <li><span className="calc-help-n">٣</span><span>حدّد <strong>عدد السنوات</strong> بين القيمتين.</span></li>
                <li><span className="calc-help-n">٤</span><span>تُعرض النتيجة كنسبة مئوية تمثّل <em>متوسط نموٍ سنويٍ مركّب</em> يكافئ الزيادة الإجمالية.</span></li>
              </ol>
              <div className="cagr-formula">
                <span className="cagr-formula-label">المعادلة:</span>
                <span className="cagr-formula-eq">
                  CAGR = (FV / PV)<sup>1/n</sup> − 1
                </span>
              </div>
            </div>

            {/* INPUTS */}
            <div className="calc-section">
              <div className="calc-head">
                <div className="calc-head-num">/01</div>
                <h2 className="calc-head-title">بيانات الاحتساب</h2>
                <p className="calc-head-desc">القيم تُستخدم بأي عملةٍ أو وحدةٍ، فما يهم هو النسبة بينهما.</p>
              </div>

              <div className="cr-grid">
                <CalcField
                  label="القيمة الحالية"
                  type="number"
                  value={inputs.current}
                  onChange={(v) => update('current', v)}
                  placeholder="100.00"
                  suffixNode={<SAR className="sar suffix-sar" />}
                  hint="نقطة البداية — السعر أو القيمة الأولية." />
                <CalcField
                  label="القيمة المستقبلية"
                  type="number"
                  value={inputs.future}
                  onChange={(v) => update('future', v)}
                  placeholder="200.00"
                  suffixNode={<SAR className="sar suffix-sar" />}
                  hint="نقطة النهاية — السعر أو القيمة بعد المدة." />
                <CalcField
                  label="عدد السنوات"
                  type="number"
                  value={inputs.years}
                  onChange={(v) => update('years', v)}
                  placeholder="5"
                  suffix="سنة"
                  hint="المدة الزمنية بين القيمتين." />
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
              <div className={'cagr-result calc-result ' + (result.isPositive ? 'is-profit' : 'is-loss')}>
                <div className="cagr-verdict">
                  <div className="cagr-verdict-label">معدّل النمو السنوي المركّب</div>
                  <div className="cagr-verdict-amount">
                    {result.isPositive ? '+' : ''}{fmtPct(result.cagr)}
                    <span className="cagr-pct-unit">%</span>
                  </div>
                  <p className="cagr-verdict-desc">
                    على مدى <strong>{result.years}</strong> {result.years === 1 ? 'سنة' : (result.years >= 3 && result.years <= 10) ? 'سنوات' : 'سنة'}، نمت القيمة بمتوسطٍ سنويٍّ مركّبٍ قدره <strong>{fmtPct(result.cagr)}%</strong> سنوياً، أي ما يعادل <strong>{result.multiple.toFixed(2)}×</strong> من القيمة الأصلية، بنموٍّ تراكميٍّ إجمالي قدره <strong>{fmtPct(result.totalReturn)}%</strong>.
                  </p>
                </div>

                {/* Stats */}
                <div className="cagr-stats">
                  <div className="cagr-stat">
                    <div className="cagr-stat-label">القيمة الحالية</div>
                    <div className="cagr-stat-val">
                      {fmtSAR(result.initialValue)}
                      <SAR className="sar cr-stat-sar" />
                    </div>
                  </div>
                  <div className="cagr-stat cagr-stat-arrow" aria-hidden="true">
                    <span>←</span>
                  </div>
                  <div className="cagr-stat">
                    <div className="cagr-stat-label">القيمة المستقبلية</div>
                    <div className="cagr-stat-val">
                      {fmtSAR(result.finalValue)}
                      <SAR className="sar cr-stat-sar" />
                    </div>
                  </div>
                  <div className="cagr-stat cagr-stat-hero">
                    <div className="cagr-stat-label">المضاعف</div>
                    <div className="cagr-stat-val cagr-mult">{result.multiple.toFixed(2)}×</div>
                  </div>
                </div>

                {/* Growth chart */}
                <CagrChart data={result.yearByYear} fmt={fmtSAR} isPositive={result.isPositive} />
              </div>
            )}
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}

function CagrChart({ data, fmt, isPositive }) {
  const W = 800, H = 280;
  const padL = 60, padR = 20, padT = 20, padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const minV = Math.min(...data.map((d) => d.value));
  const maxV = Math.max(...data.map((d) => d.value));
  const range = maxV - minV || 1;
  const niceMaxV = niceCeilCagr(maxV);
  const niceMinV = minV >= 0 ? 0 : -niceCeilCagr(-minV);
  const span = niceMaxV - niceMinV || 1;
  const yScale = (v) => padT + innerH - ((v - niceMinV) / span) * innerH;

  const n = data.length;
  const xScale = (i) => padL + (innerW * i) / (n - 1 || 1);

  // Build line path
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`).join(' ');
  // Build area fill path (line + close to baseline)
  const areaPath = `${linePath} L ${xScale(n - 1)} ${yScale(niceMinV)} L ${xScale(0)} ${yScale(niceMinV)} Z`;

  const labelEvery = n <= 12 ? 1 : n <= 25 ? 2 : 5;

  return (
    <div className="cr-chart-wrap">
      <div className="cr-chart-header">
        <div className="cr-chart-title">مسار النمو سنةً بسنة</div>
        <div className="cr-chart-legend">
          <span className="cr-legend-item">
            <span className="cr-legend-swatch cagr-swatch-line" aria-hidden="true"></span>
            قيمة الاستثمار
          </span>
        </div>
      </div>
      <div className="cr-chart-scroll">
        <svg className="cr-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="رسم بياني لمسار النمو">
          {/* Y grid */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const v = niceMinV + (span * i) / 5;
            const y = yScale(v);
            return (
              <g key={'g' + i}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="var(--line)" strokeWidth="1" />
                <text x={padL - 10} y={y + 4} textAnchor="end" className="cr-chart-axis">{abbrevCagr(v)}</text>
              </g>
            );
          })}

          {/* Area + line */}
          <path d={areaPath} fill="url(#cagrGrad)" opacity="0.25" />
          <path d={linePath} fill="none" stroke={isPositive ? '#1F8A5B' : '#B91C1C'} strokeWidth="2.5"
            strokeLinejoin="round" strokeLinecap="round" />
          <defs>
            <linearGradient id="cagrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? '#1F8A5B' : '#B91C1C'} stopOpacity="0.7" />
              <stop offset="100%" stopColor={isPositive ? '#1F8A5B' : '#B91C1C'} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Points */}
          {data.map((d, i) => (
            <g key={'p' + i}>
              <circle cx={xScale(i)} cy={yScale(d.value)} r="4"
                fill="#fff" stroke={isPositive ? '#1F8A5B' : '#B91C1C'} strokeWidth="2" />
              <title>{`السنة ${d.year}: ${fmt(d.value)}`}</title>
            </g>
          ))}

          {/* X labels */}
          {data.map((d, i) => {
            if (d.year % labelEvery !== 0 && i !== data.length - 1) return null;
            return (
              <text key={'x' + i} x={xScale(i)} y={H - padB + 22} textAnchor="middle" className="cr-chart-axis">{d.year}</text>
            );
          })}

          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="var(--line-2)" strokeWidth="1" />
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="var(--line-2)" strokeWidth="1" />
          <text x={padL + innerW / 2} y={H - 4} textAnchor="middle" className="cr-chart-axis cr-chart-axis-title">السنوات</text>
        </svg>
      </div>
    </div>
  );
}

function niceCeilCagr(v) {
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

function abbrevCagr(n) {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (a >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toFixed(0);
}

// Reuse SAR + CalcField if available; otherwise define fallbacks.
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

const SAR = window.SAR;
const CalcField = window.CalcField;

Object.assign(window, { ToolCagr });
