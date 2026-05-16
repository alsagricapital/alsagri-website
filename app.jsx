// app.jsx — wires sections together + scroll progress + tweaks

const { useState: useStateApp, useEffect: useEffectApp, useRef: useRefApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#0A1A33", "#FAFAF7", "#6B8FB5"],
  "mode": "light",
  "density": "regular",
  "heroVariant": "split"
}/*EDITMODE-END*/;

const PALETTES = {
  // [ink/navy, paper, accent ]
  navy:    ["#0A1A33", "#FAFAF7", "#6B8FB5"],
  midnight:["#06112A", "#F3F1E8", "#C9A96A"],
  slate:   ["#1A2233", "#FFFFFF", "#4A6B8A"],
  ink:     ["#111111", "#F7F6F1", "#8FA8C2"],
};

function applyPalette(p, mode) {
  const root = document.documentElement;
  const [navy, paper, accent] = p;
  // dark mode swaps ink/bg
  if (mode === 'dark') {
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-2', accent);
  } else {
    root.style.setProperty('--ink', navy);
    root.style.setProperty('--navy', navy);
    root.style.setProperty('--paper', paper);
    root.style.setProperty('--bg', paper);
    root.style.setProperty('--accent', accent);
    // derive accent-2 darker
    root.style.setProperty('--accent-2', accent);
  }
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = useStateApp('top');
  const [drawer, setDrawer] = useStateApp(false);
  const [progress, setProgress] = useStateApp(0);

  // theme tokens on root
  useEffectApp(() => {
    document.documentElement.setAttribute('data-mode', t.mode);
    document.documentElement.setAttribute('data-density', t.density);
    applyPalette(t.palette, t.mode);
  }, [t.palette, t.mode, t.density]);

  // run scroll reveals; re-run when DOM might shift
  useReveal([t.density, t.heroVariant, t.mode]);

  // scroll tracking: progress + active section
  useEffectApp(() => {
    const sectionIds = ['top', 'about', 'services', 'examples', 'contact'];
    const onScroll = () => {
      const sc = window.scrollY;
      const dh = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(dh > 0 ? Math.min(100, (sc / dh) * 100) : 0);
      // active section: pick the one whose top is just above viewport center
      const mid = sc + window.innerHeight * 0.35;
      let cur = 'top';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= mid) cur = id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close drawer on resize-to-desktop
  useEffectApp(() => {
    const onResize = () => { if (window.innerWidth > 860) setDrawer(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <React.Fragment>
      <Nav activeSection={active} drawerOpen={drawer} setDrawerOpen={setDrawer} progress={progress} />
      <main>
        <Hero variant={t.heroVariant} />
        <About />
        <Services />
        <Examples />
        <Disclaimer />
        <Contact />
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
        <TweakRadio
          label="Hero"
          value={t.heroVariant}
          options={['split', 'centered']}
          onChange={(v) => setTweak('heroVariant', v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
