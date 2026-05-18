// tool-position-switch.jsx — Position Switching Calculator
// Computes capital raised from selling 2 positions, redistributes to 2 new
// positions per allocation %, and compares old-vs-new current value.

const { useState: useStatePS } = React;

// Saudi Riyal symbol — official SAMA glyph
function SAR({ className = 'sar' }) {
  return (
    <svg className={className} viewBox="0 0 1124.14 1256.39" fill="currentColor" aria-label="ريال سعودي" role="img">
      <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" />
      <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.33-92.75,38.42-143.37l-330.69,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69L0,793.13c-3.43,15.42-5.21,31.66-5.21,48.31v195.85l435.45-92.74v140.06c-29.34,17.85-62.45,28.45-97.61,30.42l1.21-.06l132.25-28.11V940.34l435.45-92.74Z" />
    </svg>
  );
}

function ToolPositionSwitch() {
  const [sellSide, setSellSide] = useStatePS([
    { id: 1, name: '', shares: '', sellPrice: '', currentPrice: '' },
    { id: 2, name: '', shares: '', sellPrice: '', currentPrice: '' },
  ]);
  const [buySide, setBuySide] = useStatePS([
    { id: 1, name: '', buyPrice: '', allocationPercent: 100, currentPrice: '' },
    { id: 2, name: '', buyPrice: '', allocationPercent: 0, currentPrice: '' },
  ]);
  const [expandSell2, setExpandSell2] = useStatePS(false);
  const [expandBuy2, setExpandBuy2] = useStatePS(false);
  const [result, setResult] = useStatePS(null);
  const [error, setError] = useStatePS(null);

  const updateSell = (i, field, value) => {
    const next = sellSide.map((c, idx) => idx === i ? { ...c, [field]: value } : c);
    setSellSide(next);
    if (result) setResult(null);
    if (error) setError(null);
  };
  const updateBuy = (i, field, value) => {
    const next = buySide.map((c, idx) => idx === i ? { ...c, [field]: value } : c);
    setBuySide(next);
    if (result) setResult(null);
    if (error) setError(null);
  };

  const toggleSell2 = () => {
    if (expandSell2) {
      // collapsing — clear the 2nd company
      setSellSide([sellSide[0], { id: 2, name: '', shares: '', sellPrice: '', currentPrice: '' }]);
    }
    setExpandSell2(!expandSell2);
    if (result) setResult(null);
    if (error) setError(null);
  };

  const toggleBuy2 = () => {
    if (expandBuy2) {
      // collapsing — clear 2nd, set 1st to 100%
      setBuySide([
        { ...buySide[0], allocationPercent: 100 },
        { id: 2, name: '', buyPrice: '', allocationPercent: 0, currentPrice: '' },
      ]);
    } else {
      // expanding — split 50/50 as a sensible default
      setBuySide([
        { ...buySide[0], allocationPercent: 50 },
        { ...buySide[1], allocationPercent: 50 },
      ]);
    }
    setExpandBuy2(!expandBuy2);
    if (result) setResult(null);
    if (error) setError(null);
  };

  const handleCalculate = () => {
    let totalCapital = 0;
    let oldPortfolioValue = 0;
    let hasSellData = false;
    const oldPortfolio = [];

    for (const c of sellSide) {
      const shares = Number(c.shares || 0);
      const sellPrice = Number(c.sellPrice || 0);
      const currentPrice = Number(c.currentPrice || 0);
      if (shares > 0 && sellPrice > 0) {
        hasSellData = true;
        totalCapital += shares * sellPrice;
        oldPortfolioValue += shares * currentPrice;
        oldPortfolio.push({
          name: c.name || `الشركة المباعة ${c.id}`,
          shares,
          originalValue: shares * sellPrice,
          currentValue: shares * currentPrice,
        });
      }
    }

    if (!hasSellData) {
      setError('الرجاء إدخال بيانات شركة واحدة على الأقل في جانب البيع.');
      return;
    }

    const pctSum = Number(buySide[0].allocationPercent || 0) + Number(buySide[1].allocationPercent || 0);
    if (Math.abs(pctSum - 100) > 0.1 && totalCapital > 0) {
      setError(`مجموع نسب التوزيع (${pctSum}%) يجب أن يساوي 100%.`);
      return;
    }

    let newPortfolioValue = 0;
    const newPortfolio = [];
    let hasBuyData = false;

    for (const c of buySide) {
      const buyPrice = Number(c.buyPrice || 0);
      const pct = Number(c.allocationPercent || 0);
      const currentPrice = Number(c.currentPrice || 0);
      if (pct > 0) {
        if (buyPrice <= 0) {
          setError(`الرجاء إدخال سعر الشراء لـ ${c.name || `الشركة المشتراة ${c.id}`}`);
          return;
        }
        hasBuyData = true;
        const allocationAmount = totalCapital * (pct / 100);
        const sharesAcquired = allocationAmount / buyPrice;
        const currentValue = sharesAcquired * currentPrice;
        newPortfolioValue += currentValue;
        newPortfolio.push({
          name: c.name || `الشركة المشتراة ${c.id}`,
          sharesAcquired,
          allocationAmount,
          currentValue,
        });
      }
    }

    if (!hasBuyData) {
      setError('الرجاء إدخال بيانات الشراء وتوزيع النسب.');
      return;
    }

    const netDifference = newPortfolioValue - oldPortfolioValue;
    const percentDifference = oldPortfolioValue > 0 ? (netDifference / oldPortfolioValue) * 100 : 0;

    setResult({
      totalCapital,
      oldPortfolioValue,
      newPortfolioValue,
      netDifference,
      percentDifference,
      isProfitable: netDifference >= 0,
      oldPortfolio,
      newPortfolio,
    });

    setTimeout(() => {
      const el = document.querySelector('.calc-result');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const fmtSAR = (n) => {
    if (!isFinite(n)) return '—';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };
  const fmtShares = (n) => {
    if (!isFinite(n)) return '—';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
  };

  return (
    <React.Fragment>
      <PageBanner
        num="03·01"
        eyebrow="POSITION SWITCHING CALCULATOR"
        title="حاسبة تبديل المراكز"
        sub="احسب جدوى تبديل مركزين قائمين بمركزين جديدين: كم من رأس المال ستحصل، وكيف سيكون أداء المحفظة الجديدة مقارنةً بالقديمة وفق الأسعار الحالية."
        variant="tools" />

      <section className="section first">
        <div className="wrap">
          <div className="calc">

            {/* HOW IT WORKS — helps users understand the math */}
            <div className="calc-help">
              <div className="calc-help-title">كيف تعمل الحاسبة؟</div>
              <ol className="calc-help-list">
                <li><span className="calc-help-n">١</span><span>تدخل بيانات المراكز المباعة: عدد الأسهم وسعر البيع.</span></li>
                <li><span className="calc-help-n">٢</span><span>تدخل المراكز الجديدة: سعر الشراء ونسبة التوزيع من رأس المال.</span></li>
                <li><span className="calc-help-n">٣</span><span>تدخل <strong>السعر الحالي</strong> لكل شركة (المباعة والمشتراة) — هذا السعر يُستخدم لمقارنة قيمة المحفظة <em>لو احتفظت بها</em> مع قيمة المحفظة <em>بعد التبديل</em>.</span></li>
                <li><span className="calc-help-n">٤</span><span>الفرق الصافي يخبرك: هل كان قرار التبديل أفضل من الاحتفاظ بالمراكز القديمة؟</span></li>
              </ol>
            </div>

            {/* SELL SIDE */}
            <div className="calc-section">
              <div className="calc-head">
                <div className="calc-head-num">/01</div>
                <h2 className="calc-head-title">بيانات البيع</h2>
                <p className="calc-head-desc">الشركات التي ستُباع لتوفير رأس المال.</p>
              </div>
              <div className="calc-grid-2">
                {sellSide.map((c, i) => {
                  if (i === 1 && !expandSell2) return null;
                  return (
                  <div className="calc-card" key={c.id}>
                    {i === 1 && (
                      <button
                        type="button"
                        className="calc-card-close"
                        aria-label="إزالة الشركة المباعة الثانية"
                        onClick={toggleSell2}>
                        ×
                      </button>
                    )}
                    <div className="calc-card-tag">الشركة المباعة {c.id}</div>
                    <CalcField
                      label="اسم الشركة"
                      optional
                      value={c.name}
                      onChange={(v) => updateSell(i, 'name', v)}
                      placeholder={i === 0 ? 'مثال: أرامكو' : 'مثال: سابك'} />
                    <div className="calc-row-2">
                      <CalcField
                        label="عدد الأسهم"
                        type="number"
                        value={c.shares}
                        onChange={(v) => updateSell(i, 'shares', v)}
                        placeholder="0"
                        suffix="سهم" />
                      <CalcField
                        label="سعر البيع"
                        type="number"
                        value={c.sellPrice}
                        onChange={(v) => updateSell(i, 'sellPrice', v)}
                        placeholder="0.00"
                        suffixNode={<SAR className="sar suffix-sar" />} />
                    </div>
                    <CalcField
                      label="السعر الحالي في السوق"
                      type="number"
                      value={c.currentPrice}
                      onChange={(v) => updateSell(i, 'currentPrice', v)}
                      placeholder="0.00"
                      suffixNode={<SAR className="sar suffix-sar" />}
                      hint="السعر الراهن للسهم — يُستخدم لتقدير قيمة المركز لو احتفظت به." />
                  </div>
                  );
                })}
                {!expandSell2 && (
                  <button type="button" className="calc-add-btn" onClick={toggleSell2}>
                    <span className="calc-add-icon" aria-hidden="true">+</span>
                    <span>إضافة شركة مباعة أخرى</span>
                  </button>
                )}
              </div>
            </div>

            {/* BUY SIDE */}
            <div className="calc-section">
              <div className="calc-head">
                <div className="calc-head-num">/02</div>
                <h2 className="calc-head-title">بيانات الشراء</h2>
                <p className="calc-head-desc">الشركات الجديدة التي سيُوزَّع عليها رأس المال. يجب أن يساوي مجموع النسب 100%.</p>
              </div>
              <div className="calc-grid-2">
                {buySide.map((c, i) => {
                  if (i === 1 && !expandBuy2) return null;
                  return (
                  <div className="calc-card" key={c.id}>
                    {i === 1 && (
                      <button
                        type="button"
                        className="calc-card-close"
                        aria-label="إزالة الشركة المشتراة الثانية"
                        onClick={toggleBuy2}>
                        ×
                      </button>
                    )}
                    <div className="calc-card-tag accent">الشركة المشتراة {c.id}</div>
                    <CalcField
                      label="اسم الشركة"
                      optional
                      value={c.name}
                      onChange={(v) => updateBuy(i, 'name', v)}
                      placeholder={i === 0 ? 'مثال: الراجحي' : 'مثال: الإنماء'} />
                    <div className="calc-row-2">
                      <CalcField
                        label="سعر الشراء"
                        type="number"
                        value={c.buyPrice}
                        onChange={(v) => updateBuy(i, 'buyPrice', v)}
                        placeholder="0.00"
                        suffixNode={<SAR className="sar suffix-sar" />} />
                      <CalcField
                        label="نسبة التوزيع"
                        type="number"
                        value={c.allocationPercent}
                        onChange={(v) => updateBuy(i, 'allocationPercent', v)}
                        placeholder="50"
                        suffix="%" />
                    </div>
                    <CalcField
                      label="السعر الحالي في السوق"
                      type="number"
                      value={c.currentPrice}
                      onChange={(v) => updateBuy(i, 'currentPrice', v)}
                      placeholder="0.00"
                      suffixNode={<SAR className="sar suffix-sar" />}
                      hint="السعر الراهن للسهم — يُستخدم لتقييم أداء المركز الجديد." />
                  </div>
                  );
                })}
                {!expandBuy2 && (
                  <button type="button" className="calc-add-btn" onClick={toggleBuy2}>
                    <span className="calc-add-icon" aria-hidden="true">+</span>
                    <span>إضافة شركة مشتراة أخرى</span>
                  </button>
                )}
              </div>
              {expandBuy2 && (
                <div className="calc-alloc-sum">
                  مجموع نسب التوزيع:
                  <span className={'val ' + ((Number(buySide[0].allocationPercent || 0) + Number(buySide[1].allocationPercent || 0)) === 100 ? 'ok' : 'warn')}>
                    {(Number(buySide[0].allocationPercent || 0) + Number(buySide[1].allocationPercent || 0))}%
                  </span>
                </div>
              )}
            </div>

            {/* ACTION */}
            <div className="calc-action">
              {error && <div className="calc-error">{error}</div>}
              <button className="calc-btn" onClick={handleCalculate}>
                احسب النتيجة
                <span className="arr" aria-hidden="true">←</span>
              </button>
            </div>

            {/* RESULT */}
            {result && (
              <div className={'calc-result ' + (result.isProfitable ? 'is-profit' : 'is-loss')}>
                {/* Verdict header */}
                <div className="calc-verdict">
                  <div className="calc-verdict-label">قرار التبديل كان</div>
                  <div className="calc-verdict-title">
                    <span className="calc-verdict-word">{result.isProfitable ? 'ناجحاً' : 'خاسراً'}</span>
                    <span className="calc-verdict-icon" aria-hidden="true">{result.isProfitable ? '✓' : '✕'}</span>
                  </div>
                  <div className="calc-verdict-meta">
                    <span className="calc-verdict-net">
                      الفارق الصافي:
                      <strong>
                        {result.isProfitable ? '+' : ''}{fmtSAR(result.netDifference)}
                        <SAR className="sar verdict-sar" />
                      </strong>
                    </span>
                    <span className="calc-verdict-pct">
                      {result.isProfitable ? '+' : ''}{result.percentDifference.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Comparison cards */}
                <div className="calc-compare">
                  {/* Old portfolio */}
                  <div className="calc-compare-card">
                    <div className="calc-compare-title">لو بقيت في الشركات القديمة</div>
                    {result.oldPortfolio.map((c, idx) => (
                      <div className="calc-compare-row" key={'o' + idx}>
                        <div className="calc-compare-row-head">
                          <span className="calc-compare-name">{c.name}</span>
                          <span className="calc-compare-shares">{fmtShares(c.shares)} سهم</span>
                        </div>
                        <div className="calc-compare-row-val">
                          <span className="calc-compare-row-label">القيمة الحالية:</span>
                          <span className="calc-compare-row-amount">
                            {fmtSAR(c.currentValue)} <SAR className="sar amount-sar" />
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="calc-compare-total">
                      <span>إجمالي القيمة</span>
                      <span className="calc-compare-total-val">
                        {fmtSAR(result.oldPortfolioValue)} <SAR className="sar total-sar" />
                      </span>
                    </div>
                  </div>

                  {/* New portfolio */}
                  <div className="calc-compare-card is-new">
                    <div className="calc-compare-title">بعد الانتقال للمحفظة الجديدة</div>
                    <div className="calc-compare-capital">
                      <span>رأس المال المعاد استثماره</span>
                      <span className="calc-compare-capital-val">
                        {fmtSAR(result.totalCapital)} <SAR className="sar amount-sar" />
                      </span>
                    </div>
                    {result.newPortfolio.map((c, idx) => (
                      <div className="calc-compare-row" key={'n' + idx}>
                        <div className="calc-compare-row-head">
                          <span className="calc-compare-name">{c.name}</span>
                          <span className="calc-compare-shares">{fmtShares(c.sharesAcquired)} سهم</span>
                        </div>
                        <div className="calc-compare-row-val">
                          <span className="calc-compare-row-label">القيمة الحالية:</span>
                          <span className="calc-compare-row-amount">
                            {fmtSAR(c.currentValue)} <SAR className="sar amount-sar" />
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="calc-compare-total">
                      <span>إجمالي القيمة</span>
                      <span className="calc-compare-total-val">
                        {fmtSAR(result.newPortfolioValue)} <SAR className="sar total-sar" />
                      </span>
                    </div>
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

function CalcField({ label, value, onChange, type = 'text', placeholder, suffix, suffixNode, hint, optional }) {
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
}

Object.assign(window, { ToolPositionSwitch });
