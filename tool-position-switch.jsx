// tool-position-switch.jsx — Position Switching Calculator
// Computes capital raised from selling 2 positions, redistributes to 2 new
// positions per allocation %, and compares old-vs-new current value.

const { useState: useStatePS } = React;

function ToolPositionSwitch() {
  const [sellSide, setSellSide] = useStatePS([
    { id: 1, name: '', shares: '', sellPrice: '', currentPrice: '' },
    { id: 2, name: '', shares: '', sellPrice: '', currentPrice: '' },
  ]);
  const [buySide, setBuySide] = useStatePS([
    { id: 1, name: '', buyPrice: '', allocationPercent: 50, currentPrice: '' },
    { id: 2, name: '', buyPrice: '', allocationPercent: 50, currentPrice: '' },
  ]);
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

            {/* SELL SIDE */}
            <div className="calc-section">
              <div className="calc-head">
                <div className="calc-head-num">/01</div>
                <h2 className="calc-head-title">بيانات البيع</h2>
                <p className="calc-head-desc">الشركات التي ستُباع لتوفير رأس المال.</p>
              </div>
              <div className="calc-grid-2">
                {sellSide.map((c, i) => (
                  <div className="calc-card" key={c.id}>
                    <div className="calc-card-tag">الشركة المباعة {c.id}</div>
                    <CalcField
                      label="اسم الشركة"
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
                        suffix="ر.س" />
                    </div>
                    <CalcField
                      label="السعر الحالي (للمقارنة)"
                      type="number"
                      value={c.currentPrice}
                      onChange={(v) => updateSell(i, 'currentPrice', v)}
                      placeholder="0.00"
                      suffix="ر.س"
                      hint="لتقييم لو احتفظت بالمركز." />
                  </div>
                ))}
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
                {buySide.map((c, i) => (
                  <div className="calc-card" key={c.id}>
                    <div className="calc-card-tag accent">الشركة المشتراة {c.id}</div>
                    <CalcField
                      label="اسم الشركة"
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
                        suffix="ر.س" />
                      <CalcField
                        label="نسبة التوزيع"
                        type="number"
                        value={c.allocationPercent}
                        onChange={(v) => updateBuy(i, 'allocationPercent', v)}
                        placeholder="50"
                        suffix="%" />
                    </div>
                    <CalcField
                      label="السعر الحالي (للمقارنة)"
                      type="number"
                      value={c.currentPrice}
                      onChange={(v) => updateBuy(i, 'currentPrice', v)}
                      placeholder="0.00"
                      suffix="ر.س"
                      hint="لتقييم أداء المركز الجديد." />
                  </div>
                ))}
              </div>
              <div className="calc-alloc-sum">
                مجموع نسب التوزيع:
                <span className={'val ' + ((Number(buySide[0].allocationPercent || 0) + Number(buySide[1].allocationPercent || 0)) === 100 ? 'ok' : 'warn')}>
                  {(Number(buySide[0].allocationPercent || 0) + Number(buySide[1].allocationPercent || 0))}%
                </span>
              </div>
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
              <div className="calc-result">
                <div className="calc-head">
                  <div className="calc-head-num">/03</div>
                  <h2 className="calc-head-title">النتيجة</h2>
                  <p className="calc-head-desc">مقارنة المحفظة القديمة (لو احتُفظ بها) مع المحفظة الجديدة بعد التبديل، بناءً على الأسعار الحالية.</p>
                </div>

                <div className="calc-summary">
                  <div className="calc-stat">
                    <div className="calc-stat-label">رأس المال المُحصَّل</div>
                    <div className="calc-stat-val">{fmtSAR(result.totalCapital)} <span className="u">ر.س</span></div>
                  </div>
                  <div className="calc-stat">
                    <div className="calc-stat-label">قيمة المحفظة القديمة الآن</div>
                    <div className="calc-stat-val">{fmtSAR(result.oldPortfolioValue)} <span className="u">ر.س</span></div>
                  </div>
                  <div className="calc-stat">
                    <div className="calc-stat-label">قيمة المحفظة الجديدة الآن</div>
                    <div className="calc-stat-val">{fmtSAR(result.newPortfolioValue)} <span className="u">ر.س</span></div>
                  </div>
                  <div className={'calc-stat hl ' + (result.isProfitable ? 'pos' : 'neg')}>
                    <div className="calc-stat-label">الفرق الصافي</div>
                    <div className="calc-stat-val">
                      {result.isProfitable ? '+' : ''}{fmtSAR(result.netDifference)} <span className="u">ر.س</span>
                    </div>
                    <div className="calc-stat-pct">
                      {result.isProfitable ? '+' : ''}{result.percentDifference.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="calc-breakdown">
                  <div className="calc-bd-col">
                    <div className="calc-bd-title">المحفظة القديمة (لو احتُفظ)</div>
                    {result.oldPortfolio.map((c, idx) => (
                      <div className="calc-bd-row" key={'o' + idx}>
                        <div className="calc-bd-name">{c.name}</div>
                        <div className="calc-bd-meta">
                          <span>{fmtShares(c.shares)} سهم</span>
                          <span className="dot">·</span>
                          <span>قيمة البيع {fmtSAR(c.originalValue)}</span>
                        </div>
                        <div className="calc-bd-val">{fmtSAR(c.currentValue)} <span className="u">ر.س</span></div>
                      </div>
                    ))}
                  </div>
                  <div className="calc-bd-col">
                    <div className="calc-bd-title">المحفظة الجديدة</div>
                    {result.newPortfolio.map((c, idx) => (
                      <div className="calc-bd-row" key={'n' + idx}>
                        <div className="calc-bd-name">{c.name}</div>
                        <div className="calc-bd-meta">
                          <span>{fmtShares(c.sharesAcquired)} سهم</span>
                          <span className="dot">·</span>
                          <span>المخصَّص {fmtSAR(c.allocationAmount)}</span>
                        </div>
                        <div className="calc-bd-val">{fmtSAR(c.currentValue)} <span className="u">ر.س</span></div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="calc-disclaimer">
                  هذه الحاسبة لأغراضٍ معلوماتية، ولا تُعدُّ توصيةً ماليةً أو استشارةً استثمارية.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}

function CalcField({ label, value, onChange, type = 'text', placeholder, suffix, hint }) {
  return (
    <label className="calc-field">
      <span className="calc-field-label">{label}</span>
      <span className="calc-field-input">
        <input
          type={type}
          inputMode={type === 'number' ? 'decimal' : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step="any" />
        {suffix && <span className="calc-field-suffix">{suffix}</span>}
      </span>
      {hint && <span className="calc-field-hint">{hint}</span>}
    </label>
  );
}

Object.assign(window, { ToolPositionSwitch });
