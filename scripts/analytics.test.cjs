const assert = require('node:assert/strict');
const { test } = require('node:test');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'analytics.js'), 'utf8');

function environment({ url='https://alsagricapital.com/report-bahri-2026.html', lang='ar', blockedCookies=false, loading=false }={}) {
  const nodes=[], cleared=[], listeners={};
  const element=tag=>({tag, children:[], appendChild(child){this.children.push(child);return child;}});
  const document={
    documentElement:{lang}, readyState:loading?'loading':'complete',
    head:element('head'), body:element('body'),
    createElement(tag){const node=element(tag);nodes.push(node);return node;},
    addEventListener(name,fn,options){listeners[name]={fn,options};},
    get cookie(){if(blockedCookies)throw new Error('blocked');return '_ga=old; _ga_4L8P90SQCC=old; other=keep';},
    set cookie(value){cleared.push(value);}
  };
  const window={};
  const localStorage=new Proxy({}, {get(){throw new Error('Analytics must not access localStorage');}});
  const fetch=()=>{throw new Error('No client-side measurement requests');};
  const navigator={sendBeacon:fetch};
  const context=vm.createContext({window,document,location:new URL(url),localStorage,fetch,navigator,URLSearchParams});
  const run=()=>vm.runInContext(source,context);
  run();
  return {window,document,nodes,cleared,listeners,run};
}
test('Production visits have no Google tag, popup, or tracking state',()=>{
  const e=environment();
  assert.equal(e.window['ga-disable-G-4L8P90SQCC'],true);
  assert.equal(e.window.gtag,undefined);
  assert.equal(e.window.dataLayer,undefined);
  assert.equal(e.nodes.some(n=>n.tag==='script'||n.tag==='button'||n.tag==='section'),false);
  assert.equal(e.document.body.children.length,1);
  assert.equal(e.document.body.children[0].children[0].href,'/privacy.html');
});
test('Only legacy GA cookies are expired, never replaced with tracking cookies',()=>{
  const e=environment();
  assert.ok(e.cleared.some(c=>c.startsWith('_ga=;')));
  assert.ok(e.cleared.some(c=>c.startsWith('_ga_4L8P90SQCC=;')));
  assert.ok(e.cleared.every(c=>c.startsWith('_ga')&&c.includes('Max-Age=0')));
  assert.ok(!e.cleared.some(c=>c.startsWith('other')));
});
test('Unavailable cookies do not break the page or privacy link',()=>{
  const e=environment({blockedCookies:true});
  assert.equal(e.document.body.children[0].children[0].textContent,'الخصوصية');
});
test('Duplicate execution does not duplicate the footer',()=>{
  const e=environment();e.run();
  assert.equal(e.document.body.children.length,1);
  assert.equal(e.document.head.children.length,1);
});
test('Footer supports Arabic and English',()=>{
  for(const lang of ['ar','en']){
    const e=environment({lang});
    assert.equal(e.document.body.children[0].dir,lang==='ar'?'rtl':'ltr');
    assert.equal(e.document.body.children[0].children[0].textContent,lang==='ar'?'الخصوصية':'Privacy');
  }
});
test('Local files, previews and unrelated hosts are not modified',()=>{
  for(const url of ['file:///C:/report.html','http://127.0.0.1:8867/index.html','https://preview.netlify.app/','https://alsagricapital.com.evil.example/']){
    const e=environment({url});
    assert.equal(e.nodes.length,0);
    assert.equal(e.cleared.length,0);
  }
});
test('Explicit local UI preview renders only a privacy link',()=>{
  const e=environment({url:'http://127.0.0.1:8867/?analytics-preview=1'});
  assert.equal(e.document.body.children.length,1);
  assert.equal(e.cleared.length,0);
});
test('Deferred initialization preserves the footer behavior',()=>{
  const e=environment({loading:true});
  assert.equal(e.document.body.children.length,0);
  assert.equal(e.listeners.DOMContentLoaded.options.once,true);
  e.listeners.DOMContentLoaded.fn();
  assert.equal(e.document.body.children.length,1);
});
