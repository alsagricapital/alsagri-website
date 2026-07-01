// app.jsx — multi-page wiring. Renders the section matching <body data-page="...">.

const { useState: useStateApp, useEffect: useEffectApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#0A1A33", "#FAFAF7", "#6B8FB5"],
  "mode": "light",
  "density": "regular"
}/*EDITMODE-END*/;

const PALETTES = {
  navy:    ["#0A1A33", "#FAFAF7", "#6B8FB5"],
  midnight:["#06112A", "#F3F1E8", "#C9A96A"],
  slate:   ["#1A2233", "#FFFFFF", "#4A6B8A"],
  ink:     ["#111111", "#F7F6F1", "#8FA8C2"],
};

function applyPalette(p, mode) {
  const root = document.documentElement;
  const [navy, paper, accent] = p;
  if (mode === 'dark') {
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-2', accent);
  } else {
    root.style.setProperty('--ink', navy);
    root.style.setProperty('--navy', navy);
    root.style.setProperty('--paper', paper);
    root.style.setProperty('--bg', paper);
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-2', accent);
  }
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [drawer, setDrawer] = useStateApp(false);

  // Determine which page to render from body[data-page]
  const page = (document.body.dataset.page || 'home');

  // theme tokens on root
  useEffectApp(() => {
    document.documentElement.setAttribute('data-mode', t.mode);
    document.documentElement.setAttribute('data-density', t.density);
    applyPalette(t.palette, t.mode);
  }, [t.palette, t.mode, t.density]);

  // run scroll reveals
  useReveal([t.density, t.mode, page]);

  // close drawer on resize-to-desktop
  useEffectApp(() => {
    const onResize = () => { if (window.innerWidth > 860) setDrawer(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // close drawer on Esc
  useEffectApp(() => {
    const onKey = (e) => { if (e.key === 'Escape') setDrawer(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const PageBody = {
    home:     Hero,
    about:    About,
    services: Services,
    tools:    Tools,
    cfa:      CFAResources,
    newsletter: Newsletter,
    contact:  Contact,
    sponsorship: SponsorshipQ22026,
    sponsorshipusa: SponsorshipQ22026,
    'sponsorship-threads': SponsorshipQ22026,
    'sponsorship-motion': SponsorshipQ22026,
    'service-detail': ServiceDetail,
    'tool-position-switch': window.ToolPositionSwitch,
    'tool-compound-return': window.ToolCompoundReturn,
    'tool-cagr': window.ToolCagr,
    'tool-portfolio-return': window.ToolPortfolioReturn,
  }[page] || Hero;

  return (
    <React.Fragment>
      <Nav currentPage={page} drawerOpen={drawer} setDrawerOpen={setDrawer} />
      <main>
        <PageBody />
      </main>
      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection label="الهوية البصرية · Palette" />
        <TweakColor
          label="Palette"
          value={t.palette}
          options={[PALETTES.navy, PALETTES.midnight, PALETTES.slate, PALETTES.ink]}
          onChange={(v) => setTweak('palette', v)}
        />
        <TweakRadio
          label="Mode"
          value={t.mode}
          options={['light', 'dark']}
          onChange={(v) => setTweak('mode', v)}
        />

        <TweakSection label="التخطيط · Layout" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={['compact', 'regular', 'comfy']}
          onChange={(v) => setTweak('density', v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
