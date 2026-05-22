// data.jsx — mock report content for the examples gallery.
// Real Tadawul-listed company names used descriptively; metrics are mock/illustrative.

const SERVICES = [
  {
    id: 'earnings',
    num: '01',
    ar: 'مكالمات نتائج الشركات',
    en: 'Earnings Call Reports',
    desc: 'مكالمات نتائج الشركات السعودية المدرجة، تشمل تعليقات الإدارة، أبرز المؤشرات المالية، ورؤى موجَّهة للمستثمرين وتوجيهات الشركة للإيرادات والأرباح والإجابة على أسئلة المحللين.',
    tags: [],
  },
  {
    id: 'brokerage',
    num: '02',
    ar: 'تقارير بيوت الخبرة والأبحاث',
    en: 'Brokerage & Research House Reports',
    desc: 'ملخصات لأبرز تقارير الأبحاث الصادرة عن بيوت الوساطة وبنوك الاستثمار، مع التركيز على السعر المستهدف، التوصية، الفرضيات، ومضاعفات التقييم.',
    tags: [],
  },
  {
    id: 'qualitative',
    num: '03',
    ar: 'تقارير نوعية وتحليلات خاصة',
    en: 'Special Qualitative Reports',
    desc: 'تقارير معمَّقة عن الشركات السعودية المدرجة تتناول نموذج الأعمال، محركات النمو، المنافسة، اتجاهات القطاع، والنظرة المستقبلية.',
    tags: [],
  },
];

const REPORTS = [
  // ── Earnings calls ─────────────────────────────────────────────
  {
    cat: 'earnings',
    co: 'أرامكو السعودية',
    ticker: '2222.SR',
    title: 'مكالمة نتائج الربع الأول 2026',
    desc: 'استعراض أبرز ملاحظات الإدارة حول مستويات الإنتاج، التدفقات النقدية الحرة، وسياسة التوزيعات النقدية.',
    date: '2026·05·11',
    cover: 'banners/aramco-q1-2026.png',
    link: 'https://x.com/AlsagriCapital/status/2054657346824249766',
  },
  {
    cat: 'earnings',
    co: 'أفالون فارما',
    ticker: '4017.SR',
    title: 'مكالمة نتائج الربع الأول 2026',
    desc: 'استعراض نتائج الشركة، نمو خط الإنتاج الدوائي، والتوسع التشغيلي.',
    date: '2026·05·13',
    cover: 'banners/avalon-pharma-q1-2026.png',
    link: 'https://x.com/AlsagriCapital/status/2055553928171868648',
  },
  {
    cat: 'earnings',
    co: 'المراعي',
    ticker: '2280.SR',
    title: 'مكالمة نتائج الربع الأول 2026',
    desc: 'مناقشة هوامش الربحية، تكاليف الأعلاف، وأداء قطاعَي الألبان والمخبوزات في السوق المحلية والتصدير.',
    date: '2026·05·10',
    cover: 'banners/almarai-q1-2026.png',
    link: 'https://x.com/AlsagriCapital/status/2054465152372646322',
  },
  {
    cat: 'earnings',
    co: 'وقت اللياقة',
    ticker: '1830.SR',
    title: 'مكالمة نتائج الربع الأول 2026',
    desc: 'استعراض نمو الإيرادات، إضافة الفروع الجديدة، وحركة الاشتراكات والاحتفاظ بالعملاء.',
    date: '2026·04·30',
    cover: 'banners/fitness-time-q1-2026.png',
    link: 'https://x.com/AlsagriCapital/status/2053427767115464956',
  },
  {
    cat: 'earnings',
    co: 'رسن',
    ticker: '9558.SR',
    title: 'مكالمة نتائج الربع الأول 2026',
    desc: 'نمو محفظة المنتجات الرقمية، توسع قاعدة العملاء، وآفاق قطاع التأمين والتمويل.',
    date: '2026·05·06',
    cover: 'banners/rasan-q1-2026.png',
    link: 'https://x.com/AlsagriCapital/status/2052330335812157755',
  },
  {
    cat: 'earnings',
    co: 'سال',
    ticker: '4263.SR',
    title: 'مكالمة نتائج الربع الأول 2026',
    desc: 'استعراض نمو أعمال المناولة الجوية والبرية، الاستثمارات الرأسمالية، وحركة التجارة الدولية.',
    date: '2026·05·06',
    cover: 'banners/sal-q1-2026.png',
    link: 'https://x.com/AlsagriCapital/status/2052042595316928522',
  },
  // ── Brokerage / research ───────────────────────────────────────
  {
    cat: 'brokerage',
    co: 'سابك',
    ticker: '2010.SR',
    title: 'نظرة قطاع البتروكيماويات — تحديث فرضيات التقييم',
    desc: 'مراجعة لفرضيات أسعار المنتجات، هوامش الإيثيلين والميثانول، وأثرها على النموذج المالي والتوصية.',
    metrics: ['Target Price', 'Rating', 'EV/EBITDA'],
    date: '2025·10·22',
    spark: [40,38,36,34,33,32,31,33,35,34,33,32],
  },
  {
    cat: 'brokerage',
    co: 'الاتصالات السعودية',
    ticker: '7010.SR',
    title: 'ملخص تقرير — الفصل القطاعي وتقييم الأذرع',
    desc: 'تفكيك تقييم الشركة الأم وفقاً لمنهجية مجموع الأجزاء (SOTP) مع تحديث الفرضيات التشغيلية للأذرع التابعة.',
    metrics: ['SOTP', 'EPS', 'P/E'],
    date: '2025·09·18',
    spark: [25,26,27,28,30,29,31,32,34,33,35,36],
  },
  {
    cat: 'brokerage',
    co: 'الراجحي',
    ticker: '1120.SR',
    title: 'تحديث نموذج — حساسية الأرباح لأسعار الفائدة',
    desc: 'تحليل حساسية صافي هامش الفائدة وأرباح السهم تحت سيناريوهات مختلفة لمسار أسعار الفائدة محلياً.',
    metrics: ['Sensitivity', 'EPS', 'ROE'],
    date: '2025·09·02',
    spark: [20,22,24,23,26,28,27,29,31,30,32,34],
  },
  // ── Qualitative ────────────────────────────────────────────────
  {
    cat: 'qualitative',
    co: 'لجام للرياضة',
    ticker: '1830.SR',
    title: 'لجام في 2026: سنة انتقالية تحت اختبار الهوامش والتوسع',
    desc: 'قراءة تربط توصيات بيوت الخبرة مع مكالمة المستثمرين بعد نتائج الربع الأول 2026.',
    date: '2026·05·22',
    cover: 'banners/lejam-2026-transition.jpg',
    link: 'https://x.com/AlsagriCapital/status/2057801221088424005',
  },
  {
    cat: 'qualitative',
    co: 'سلوشنز',
    ticker: '7202.SR',
    title: 'تقرير شامل عن سلوشنز: أسباب الهبوط وهل السعر مغري؟',
    desc: 'تحليل لأسباب الهبوط وقراءة جاذبية السعر الحالي في ضوء أساسيات الشركة.',
    date: '2026·02·24',
    cover: 'banners/solutions-special-report.jpg',
    link: 'https://x.com/AlsagriCapital/status/2026386566118011283',
  },
  {
    cat: 'qualitative',
    co: 'علم',
    ticker: '7203.SR',
    title: 'شركة علم في 2025: تقرير مالي وأساسي',
    desc: 'تقرير مالي وأساسي يستعرض أداء الشركة ومحركات النمو والعوامل المؤثرة في التقييم.',
    date: '2026·05·19',
    cover: 'banners/elm-2025-financial-fundamental.jpg',
    link: 'https://x.com/AlsagriCapital/status/2056658937374466556',
  },
];

const TICKER_STATS = [
  { k: 'REPORTS PUBLISHED',  ar: 'عدد التقارير المنشورة', v: '120', unit: '+' },
  { k: 'COMPANIES COVERED',  ar: 'عدد الشركات المغطاة',  v: '40',  unit: '+' },
];

window.SERVICES = SERVICES;
window.REPORTS = REPORTS;
window.TICKER_STATS = TICKER_STATS;
