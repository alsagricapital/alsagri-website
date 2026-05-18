// tool-portfolio-return.jsx — Portfolio Annualized Return (XIRR)
// Computes annualised return given starting value, optional deposits/withdrawals
// with dates, and ending value. Uses Newton-Raphson on XNPV.

const { useState: useStateXirr } = React;

function ToolPortfolioReturn() {
  const currentYear = new Date().getFullYear();
  const initStart = { amount: '', date: `${currentYear}-01-01` };
  const initEnd   = { amount: '', date: `${currentYear}-12-31` };
  const [start, setStart] = useStateXirr(initStart);
  const [end, setEnd] = useStateXirr(initEnd);
  const [deposits, setDeposits] = useStateXirr([]);
  const [withdrawals, setWithdrawals] = useStateXirr([]);
  const [result, setResult] = useStateXirr(null);
  const [error, setError] = useStateXirr(null);

  const reset = () => {
    setStart(initStart);
    setEnd(initEnd);
    setDeposits([]);
    setWithdrawals([]);
    setResult(null);
    setError(null);
  };

  const clearResult = () => { if (result) setResult(null); if (error) setError(null); };

  const updateStart = (field, value) => { setStart((s) => ({ ...s, [field]: value })); clearResult(); };
  const updateEnd   = (field, value) => { setEnd((s) => ({ ...s, [field]: value })); clearResult(); };

  const addDeposit = () => {
    setDeposits([...deposits, { amount: '', date: `${currentYear}-06-01` }]);
    clearResult();
  };
  const updateDeposit = (i, field, value) => {
    setDeposits(deposits.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
    clearResult();
  };
  const removeDeposit = (i) => {
    setDeposits(deposits.filter((_, idx) => idx !== i));
    clearResult();
  };

  const addWithdrawal = () => {
    setWithdrawals([...withdrawals, { amount: '', date: `${currentYear}-06-01` }]);
    clearResult();
  };
  const updateWithdrawal = (i, field, value) => {
    setWithdrawals(withdrawals.map((w, idx) => idx === i ? { ...w, [field]: value } : w));
    clearResult();
  };
  const removeWithdrawal = (i) => {
    setWithdrawals(withdrawals.filter((_, idx) => idx !== i));
    clearResult();
  };

  const handleCalculate = () => {
    const PV = Number(start.amount);
    const EV = Number(end.amount);
    if (!isFinite(PV) || PV <= 0) { setError('قيمة المحفظة في بداية السنة يجب أن تكون أكبر من صفر.'); return; }
    if (!isFinite(EV) || EV <= 0) { setError('قيمة المحفظة في نهاية السنة يجب أن تكون أكبر من صفر.'); return; }
    if (!start.date || !end.date) { setError('يجب إدخال تاريخ البداية والنهاية.'); return; }
    const dStart = new Date(start.date);
    const dEnd = new Date(end.date);
    if (isNaN(dStart) || isNaN(dEnd)) { setError('التواريخ غير صحيحة.'); return; }
    if (dEnd <= dStart) { setError('تاريخ النهاية يجب أن يكون بعد تاريخ البداية.'); return; }

    // Build cashflows
    const flows = [];
    flows.push({ amount: -PV, date: dStart, label: 'بداية السنة' });

    for (const d of deposits) {
      const amt = Number(d.amount);
      if (!d.date || !isFinite(amt) || amt <= 0) {
        setError('بعض الإضافات تحتوي على بيانات غير مكتملة. تأكد من المبلغ والتاريخ.'); return;
      }
      const dt = new Date(d.date);
      if (isNaN(dt)) { setError('تاريخ إضافة غير صحيح.'); return; }
      if (dt < dStart || dt > dEnd) { setError('تواريخ الإضافات يجب أن تكون بين تاريخ البداية والنهاية.'); return; }
      flows.push({ amount: -amt, date: dt, label: 'إضافة' });
    }
    for (const w of withdrawals) {
      const amt = Number(w.amount);
      if (!w.date || !isFinite(amt) || amt <= 0) {
        setError('بعض السحوبات تحتوي على بيانات غير مكتملة. تأكد من المبلغ والتاريخ.'); return;
      }
      const dt = new Date(w.date);
      if (isNaN(dt)) { setError('تاريخ سحب غير صحيح.'); return; }
      if (dt < dStart || dt > dEnd) { setError('تواريخ السحوبات يجب أن تكون بين تاريخ البداية والنهاية.'); return; }
      flows.push({ amount: amt, date: dt, label: 'سحب' });
    }
    flows.push({ amount: EV, date: dEnd, label: 'نهاية السنة' });

    flows.sort((a, b) => a.date - b.date);

    const rate = xirr(flows);
    if (!isFinite(rate)) {
      setError('تعذّر حساب العائد — تحقّق من القيم.');
      return;
    }

    const totalDeposits = deposits.reduce((s, d) => s + (Number(d.amount) || 0), 0);
    const totalWithdrawals = withdrawals.reduce((s, w) => s + (Number(w.amount) || 0), 0);
    const netInvested = PV + totalDeposits - totalWithdrawals;
    const totalGain = EV - netInvested;
    const days = Math.round((dEnd - dStart) / (1000 * 60 * 60 * 24));

    setResult({
      xirr: rate * 100,
      isPositive: rate >= 0,
      startValue: PV,
      endValue: EV,
      totalDeposits,
      totalWithdrawals,
      netInvested,
      totalGain,
      days,
      depositCount: deposits.length,
      withdrawalCount: withdrawals.length,
      flows,
    });

    setTimeout(() => {
      const el = document.querySelector('.xirr-result');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const fmtSAR = (n) => {
    if (!isFinite(n)) return '—';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };
  const fmtPct = (n) => isFinite(n) ? n.toFixed(2) : '—';
  const fmtDate = (d) => {
    if (!(d instanceof Date) || isNaN(d)) return '';
    return new Intl.DateTimeFormat('en-CA').format(d); // YYYY-MM-DD
  };

  return (
    <React.Fragment>
      <PageBanner
        num="03·04"
        eyebrow="PORTFOLIO ANNUALISED RETURN"
        title={<React.Fragment>حاسبة العائد السنوي للمحفظة <span className="pb-title-acronym">XIRR</span></React.Fragment>}
        sub="احسب العائد السنوي الفعلي لمحفظتك مع مراعاة توقيت الإضافات والسحوبات خلال السنة."
        variant="tools" />

      <section className="section first">
        <div className="wrap">
          <div className="calc">

            {/* HOW IT WORKS */}
            <div className="calc-help">
              <div className="calc-help-title">كيف تعمل الحاسبة؟</div>
              <ol className="calc-help-list">
                <li><span className="calc-help-n">١</span><span>أدخل <strong>قيمة المحفظة في بداية السنة</strong> وتاريخها.</span></li>
                <li><span className="calc-help-n">٢</span><span>أضف أي <strong>إيداعات</strong> أضفتها للمحفظة خلال السنة (المبلغ والتاريخ) — اختياري.</span></li>
                <li><span className="calc-help-n">٣</span><span>أضف أي <strong>سحوبات</strong> أخرجتها من المحفظة خلال السنة — اختياري.</span></li>
                <li><span className="calc-help-n">٤</span><span>أدخل <strong>قيمة المحفظة في نهاية السنة</strong> وتاريخها.</span></li>
                <li><span className="calc-help-n">٥</span><span>تظهر النتيجة كنسبة عائدٍ سنويٍّ تأخذ في الاعتبار <em>توقيت كل تدفق نقدي</em>.</span></li>
              </ol>
            </div>

            {/* START VALUE */}
            <div className="calc-section">
              <div className="calc-head">
                <div className="calc-head-num">/01</div>
                <h2 className="calc-head-title">قيمة المحفظة في بداية السنة</h2>
              </div>
              <div className="xirr-row">
                <CalcField
                  label="القيمة"
                  type="number"
                  value={start.amount}
                  onChange={(v) => updateStart('amount', v)}
                  placeholder="0.00"
                  suffixNode={<SAR className="sar suffix-sar" />} />
                <div className="calc-field">
                  <span className="calc-field-label">التاريخ</span>
                  <span className="calc-field-input">
                    <input type="date" value={start.date} onChange={(e) => updateStart('date', e.target.value)} />
                  </span>
                </div>
              </div>
            </div>

            {/* DEPOSITS */}
            <div className="calc-section">
              <div className="calc-head">
                <div className="calc-head-num">/02</div>
                <h2 className="calc-head-title">الإيداعات خلال السنة <span className="xirr-head-tag">اختياري</span></h2>
                <p className="calc-head-desc">المبالغ التي <strong>أضفتها</strong> إلى المحفظة بتواريخها.</p>
              </div>
              {deposits.length === 0 ? (
                <button type="button" className="calc-add-btn xirr-add-btn" onClick={addDeposit}>
                  <span className="calc-add-icon" aria-hidden="true">+</span>
                  <span>إضافة إيداع</span>
                </button>
              ) : (
                <div className="xirr-flow-list">
                  {deposits.map((d, i) => (
                    <FlowRow
                      key={'d' + i}
                      idx={i + 1}
                      amount={d.amount}
                      date={d.date}
                      onChange={(field, v) => updateDeposit(i, field, v)}
                      onRemove={() => removeDeposit(i)}
                      kind="deposit" />
                  ))}
                  <button type="button" className="xirr-add-row" onClick={addDeposit}>
                    <span className="xirr-add-row-icon" aria-hidden="true">+</span>
                    <span>إضافة إيداع آخر</span>
                  </button>
                </div>
              )}
            </div>

            {/* WITHDRAWALS */}
            <div className="calc-section">
              <div className="calc-head">
                <div className="calc-head-num">/03</div>
                <h2 className="calc-head-title">السحوبات خلال السنة <span className="xirr-head-tag">اختياري</span></h2>
                <p className="calc-head-desc">المبالغ التي <strong>سحبتها</strong> من المحفظة بتواريخها.</p>
              </div>
              {withdrawals.length === 0 ? (
                <button type="button" className="calc-add-btn xirr-add-btn" onClick={addWithdrawal}>
                  <span className="calc-add-icon" aria-hidden="true">+</span>
                  <span>إضافة سحب</span>
                </button>
              ) : (
                <div className="xirr-flow-list">
                  {withdrawals.map((w, i) => (
                    <FlowRow
                      key={'w' + i}
                      idx={i + 1}
                      amount={w.amount}
                      date={w.date}
                      onChange={(field, v) => updateWithdrawal(i, field, v)}
                      onRemove={() => removeWithdrawal(i)}
                      kind="withdrawal" />
                  ))}
                  <button type="button" className="xirr-add-row" onClick={addWithdrawal}>
                    <span className="xirr-add-row-icon" aria-hidden="true">+</span>
                    <span>إضافة سحب آخر</span>
                  </button>
                </div>
              )}
            </div>

            {/* END VALUE */}
            <div className="calc-section">
              <div className="calc-head">
                <div className="calc-head-num">/04</div>
                <h2 className="calc-head-title">قيمة المحفظة في نهاية السنة</h2>
              </div>
              <div className="xirr-row">
                <CalcField
                  label="القيمة"
                  type="number"
                  value={end.amount}
                  onChange={(v) => updateEnd('amount', v)}
                  placeholder="0.00"
                  suffixNode={<SAR className="sar suffix-sar" />} />
                <div className="calc-field">
                  <span className="calc-field-label">التاريخ</span>
                  <span className="calc-field-input">
                    <input type="date" value={end.date} onChange={(e) => updateEnd('date', e.target.value)} />
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION */}
            <div className="calc-action cr-action">
              {error && <div className="calc-error">{error}</div>}
              <div className="cr-btn-row">
                <button className="calc-btn" onClick={handleCalculate}>
                  احسب العائد
                  <span className="arr" aria-hidden="true">←</span>
                </button>
                <button className="calc-btn-secondary" onClick={reset} type="button">
                  إعادة تعيين
                </button>
              </div>
            </div>

            {/* RESULT */}
            {result && (
              <div className={'xirr-result calc-result ' + (result.isPositive ? 'is-profit' : 'is-loss')}>
                <div className="cagr-verdict">
                  <div className="cagr-verdict-label">العائد السنوي للمحفظة (XIRR)</div>
                  <div className="cagr-verdict-amount">
                    {result.isPositive ? '+' : ''}{fmtPct(result.xirr)}
                    <span className="cagr-pct-unit">%</span>
                  </div>
                  <p className="cagr-verdict-desc">
                    خلال <strong>{result.days}</strong> يوماً ({(result.days / 365).toFixed(2)} سنة)، حقّقت محفظتك عائداً سنوياً معدّلاً قدره <strong>{fmtPct(result.xirr)}%</strong>، بإجمالي أرباحٍ {result.isPositive ? 'محقَّقة' : 'صافيها'} قدره <strong>{fmtSAR(result.totalGain)}</strong> ر.س على رأس مالٍ صافٍ مستثمر قدره <strong>{fmtSAR(result.netInvested)}</strong> ر.س.
                  </p>
                </div>

                {/* Summary stats */}
                <div className="xirr-stats">
                  <div className="cr-stat">
                    <div className="cr-stat-label">القيمة في البداية</div>
                    <div className="cr-stat-val">{fmtSAR(result.startValue)} <SAR className="sar cr-stat-sar" /></div>
                  </div>
                  <div className="cr-stat">
                    <div className="cr-stat-label">القيمة في النهاية</div>
                    <div className="cr-stat-val">{fmtSAR(result.endValue)} <SAR className="sar cr-stat-sar" /></div>
                  </div>
                  <div className="cr-stat">
                    <div className="cr-stat-label">إجمالي الإيداعات ({result.depositCount})</div>
                    <div className="cr-stat-val">{fmtSAR(result.totalDeposits)} <SAR className="sar cr-stat-sar" /></div>
                  </div>
                  <div className="cr-stat">
                    <div className="cr-stat-label">إجمالي السحوبات ({result.withdrawalCount})</div>
                    <div className="cr-stat-val">{fmtSAR(result.totalWithdrawals)} <SAR className="sar cr-stat-sar" /></div>
                  </div>
                </div>

                {/* Cash flow timeline */}
                <div className="xirr-timeline">
                  <div className="xirr-timeline-title">جدول التدفقات النقدية</div>
                  <div className="cr-table-scroll">
                    <table className="cr-table xirr-table">
                      <thead>
                        <tr>
                          <th>التاريخ</th>
                          <th>النوع</th>
                          <th>المبلغ</th>
                          <th>التدفق</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.flows.map((f, idx) => {
                          const isIn = f.amount < 0;
                          return (
                            <tr key={idx}>
                              <td className="cr-table-year">{fmtDate(f.date)}</td>
                              <td>{f.label}</td>
                              <td>{fmtSAR(Math.abs(f.amount))} <SAR className="sar cr-table-sar" /></td>
                              <td className={'xirr-flow-cell ' + (isIn ? 'is-in' : 'is-out')}>
                                {isIn ? '↓ داخل' : '↑ خارج'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}

function FlowRow({ idx, amount, date, onChange, onRemove, kind }) {
  return (
    <div className={'xirr-flow-row ' + (kind === 'deposit' ? 'is-deposit' : 'is-withdrawal')}>
      <div className="xirr-flow-num">#{idx}</div>
      <div className="xirr-flow-fields">
        <div className="calc-field">
          <span className="calc-field-label">{kind === 'deposit' ? 'مبلغ الإيداع' : 'مبلغ السحب'}</span>
          <span className="calc-field-input">
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => onChange('amount', e.target.value)}
              placeholder="0.00"
              step="any" />
            <span className="calc-field-suffix calc-field-suffix-icon">
              <SAR className="sar suffix-sar" />
            </span>
          </span>
        </div>
        <div className="calc-field">
          <span className="calc-field-label">التاريخ</span>
          <span className="calc-field-input">
            <input type="date" value={date} onChange={(e) => onChange('date', e.target.value)} />
          </span>
        </div>
      </div>
      <button type="button" className="xirr-flow-remove" aria-label="حذف" onClick={onRemove}>×</button>
    </div>
  );
}

// ── XIRR math ──────────────────────────────────────
function xnpv(rate, flows) {
  const d0 = flows[0].date.getTime();
  const ms = 365 * 24 * 3600 * 1000;
  let sum = 0;
  for (const cf of flows) {
    const years = (cf.date.getTime() - d0) / ms;
    sum += cf.amount / Math.pow(1 + rate, years);
  }
  return sum;
}
function xirr(flows) {
  if (!flows || flows.length < 2) return NaN;
  let rate = 0.1;
  const tol = 1e-7;
  const maxIter = 200;
  for (let i = 0; i < maxIter; i++) {
    const f = xnpv(rate, flows);
    const h = 1e-6;
    const df = (xnpv(rate + h, flows) - f) / h;
    if (!isFinite(df) || Math.abs(df) < 1e-15) break;
    let step = f / df;
    // Dampen
    if (step > 1) step = 1;
    if (step < -1) step = -1;
    const newRate = rate - step;
    if (Math.abs(newRate - rate) < tol) return newRate;
    rate = newRate;
    if (rate < -0.9999) rate = -0.9999;
    if (rate > 1e6) return NaN;
  }
  return rate;
}

// SAR + CalcField fallbacks
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

Object.assign(window, { ToolPortfolioReturn });
