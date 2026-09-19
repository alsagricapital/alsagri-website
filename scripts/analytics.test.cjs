const assert = require('node:assert/strict');
const { test } = require('node:test');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'analytics.js'), 'utf8');
const id = 'G-4L8P90SQCC';
const key = 'alsagri-analytics-consent-v1';

function environment({ url = 'https://alsagricapital.com/report-alujain-2026.html', preference, blockedStorage = false } = {}) {
  const nodes = [], stored = new Map(), windowListeners = {}, cookiesCleared = [];
  if (preference !== undefined) stored.set(key, typeof preference === 'string' ? preference : JSON.stringify(preference));
  function element(tag) {
    const selectors = new Map();
    return { tag, hidden: false, listeners: {}, children: [], dataset: {},
      appendChild(child) { this.children.push(child); return child; },
      setAttribute(name, value) { this[name] = value; },
      addEventListener(name, fn) { this.listeners[name] = fn; },
      querySelector(selector) {
        if (!selectors.has(selector)) selectors.set(selector, element(selector));
        return selectors.get(selector);
      },
      focus() {},
    };
  }
  const document = {
    documentElement: {lang:'ar'}, readyState:'complete', title:'اللجين — تقرير مالي وأساسي',
    referrer:'https://x.com/post?private=value', head:element('head'), body:element('body'),
    createElement(tag) { const node = element(tag); nodes.push(node); return node; },
    get cookie() { return '_ga=old; _ga_4L8P90SQCC=old; other=keep'; },
    set cookie(value) { cookiesCleared.push(value); }
  };
  const location = new URL(url);
  let reloads = 0;
  location.reload = () => { reloads++; };
  const window = {addEventListener(name, fn) { windowListeners[name] = fn; }};
  const localStorage = {
    getItem(k) { if (blockedStorage) throw new Error('Storage denied'); return stored.get(k) ?? null; },
    setItem(k,v) { if (blockedStorage) throw new Error('Storage denied'); stored.set(k,v); }
  };
  const context = vm.createContext({window, document, location, localStorage, URL, URLSearchParams});
  const run = () => vm.runInContext(source,context);
  run();
  const panel = () => nodes.find(node=>node.className==='ac-consent');
  const choose = value => panel().listeners.click({target:{closest:()=>({dataset:{choice:value}})}});
  const tags = () => document.head.children.filter(node=>node.tag==='script');
  const configs = () => (window.dataLayer || []).filter(args=>args[0]==='config');
  return {window, document, panel, choose, tags, configs, run, stored, windowListeners, cookiesCleared, reloads:()=>reloads};
}

test('No third-party script or measurement before explicit consent',()=>{
  const e=environment();
  assert.equal(e.tags().length,0);
  assert.equal(e.window.dataLayer,undefined);
  assert.equal(e.panel().hidden,false);
});
test('Declining persists the choice and does not start analytics',()=>{
  const e=environment(); e.choose('denied');
  assert.equal(e.tags().length,0); assert.equal(e.panel().hidden,true);
  assert.equal(JSON.parse(e.stored.get(key)).value,'denied');
  assert.ok(e.cookiesCleared.every(cookie=>cookie.startsWith('_ga')));
});
test('Consent sends exactly one pageview configuration, including after duplicate script execution',()=>{
  const e=environment(); e.choose('accepted'); e.choose('accepted'); e.run();
  assert.equal(e.tags().length,1); assert.equal(e.configs().length,1);
  assert.equal(e.configs()[0][1],id);
  assert.equal(e.tags()[0].async,true);
  assert.equal(e.configs()[0][2].allow_google_signals,false);
  assert.equal(e.configs()[0][2].allow_ad_personalization_signals,false);
});
test('Saved consent survives navigation while each page retains its own path',()=>{
  const preference={value:'accepted',savedAt:Date.now()};
  for(const page of ['services.html','report-alujain-2026.html']){
    const e=environment({url:'https://alsagricapital.com/'+page,preference});
    assert.equal(e.configs()[0][2].page_location,'https://alsagricapital.com/'+page);
    assert.equal(e.panel().hidden,true);
  }
});
test('Home aliases, www, clean URLs, queries, and fragments do not split page statistics',()=>{
  const preference={value:'accepted',savedAt:Date.now()};
  for(const url of ['https://alsagricapital.com/','https://www.alsagricapital.com/index.html?email=private#section-11']){
    const e=environment({url,preference});
    assert.equal(e.configs()[0][2].page_location,'https://alsagricapital.com/');
    assert.equal(e.configs()[0][2].page_referrer,'https://x.com/');
  }
  const e=environment({url:'https://alsagricapital.com/services?value=private#x',preference});
  assert.equal(e.configs()[0][2].page_location,'https://alsagricapital.com/services.html');
});
test('Local files, localhost, deploy previews, and unrelated hosts never collect',()=>{
  for(const url of ['file:///C:/report.html','http://127.0.0.1:8766/index.html','https://preview.netlify.app/','https://alsagricapital.com.evil.example/']){
    const e=environment({url,preference:{value:'accepted',savedAt:Date.now()}});
    assert.equal(e.tags().length,0); assert.equal(e.panel(),undefined);
  }
});
test('Local consent preview never loads Google, even after accepting',()=>{
  const e=environment({url:'http://127.0.0.1:8766/index.html?analytics-preview=1'});
  e.choose('accepted'); assert.equal(e.tags().length,0);
});
test('Expired, malformed, or inaccessible preferences fail closed',()=>{
  const cases=[{preference:'not json'},{preference:{value:'accepted',savedAt:0}},{blockedStorage:true}];
  for(const options of cases){ const e=environment(options); assert.equal(e.tags().length,0); assert.equal(e.panel().hidden,false); }
});
test('Withdrawal disables collection immediately, clears analytics cookies, then reloads',()=>{
  const e=environment(); e.choose('accepted'); e.choose('denied');
  assert.equal(e.window['ga-disable-'+id],true); assert.equal(e.reloads(),1);
  assert.ok(e.cookiesCleared.some(cookie=>cookie.startsWith('_ga_4L8P90SQCC=;')));
});
test('Withdrawal in another tab stops this tab too',()=>{
  const e=environment({preference:{value:'accepted',savedAt:Date.now()}});
  e.stored.set(key,JSON.stringify({value:'denied',savedAt:Date.now()}));
  e.windowListeners.storage({key});
  assert.equal(e.window['ga-disable-'+id],true); assert.equal(e.reloads(),1);
});
