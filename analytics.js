/* Shared, opt-in page analytics. Dashboard access stays in the owner's Google account. */
(function () {
  'use strict';
  var measurementId = 'G-4L8P90SQCC';
  var productionHosts = ['alsagricapital.com', 'www.alsagricapital.com'];
  var production = location.protocol === 'https:' && productionHosts.indexOf(location.hostname) !== -1;
  var preview = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') &&
    new URLSearchParams(location.search).get('analytics-preview') === '1';
  if ((!production && !preview) || window.__alsagriAnalyticsReady) return;
  window.__alsagriAnalyticsReady = true;

  var preferenceKey = 'alsagri-analytics-consent-v1';
  var preferenceLifetime = 180 * 24 * 60 * 60 * 1000;
  var started = false;
  var lastFocus;
  var english = document.documentElement.lang.indexOf('en') === 0;
  var copy = english ? {
    title: 'Visitor statistics',
    text: 'With your permission, we use Google Analytics to understand visits and improve our content. You can browse normally without allowing analytics.',
    accept: 'Allow analytics', reject: 'Decline', policy: 'Privacy', settings: 'Privacy & analytics settings'
  } : {
    title: 'إحصاءات الزيارة',
    text: 'نستخدم Google Analytics بموافقتك لفهم الزيارات وتحسين المحتوى. يمكنك تصفح الموقع بشكل طبيعي دون السماح بالإحصاءات.',
    accept: 'السماح بالإحصاءات', reject: 'رفض', policy: 'الخصوصية', settings: 'الخصوصية وإعدادات الإحصاءات'
  };

  function readPreference() {
    try {
      var saved = JSON.parse(localStorage.getItem(preferenceKey));
      if (saved && (saved.value === 'accepted' || saved.value === 'denied') &&
          Number.isFinite(saved.savedAt) && Date.now() - saved.savedAt >= 0 &&
          Date.now() - saved.savedAt < preferenceLifetime) return saved.value;
    } catch (_) { /* Storage may be unavailable; ask for this page only. */ }
    return null;
  }

  function canonicalPath() {
    var path = location.pathname;
    if (path === '/' || path === '/index.html' || path === '/index') return '/';
    if (!/\.[^/]+$/.test(path) && !path.endsWith('/')) path += '.html';
    return path;
  }

  function startAnalytics() {
    if (started || !production) return;
    started = true;
    window['ga-disable-' + measurementId] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    var referrer = '';
    try { referrer = document.referrer ? new URL(document.referrer).origin + '/' : ''; } catch (_) {}
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: 'https://alsagricapital.com' + canonicalPath(),
      page_referrer: referrer,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
  }

  function clearAnalyticsCookies() {
    document.cookie.split(';').forEach(function (entry) {
      var name = entry.split('=')[0].trim();
      if (name !== '_ga' && name.indexOf('_ga_') !== 0) return;
      ['', location.hostname, 'alsagricapital.com', '.alsagricapital.com'].forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '') + '; SameSite=Lax';
      });
    });
  }

  function stopAnalytics() {
    // Disable collection before clearing cookies; reloading removes the loaded tag.
    window['ga-disable-' + measurementId] = true;
    clearAnalyticsCookies();
  }

  function init() {
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/analytics.css?v=20260919';
    document.head.appendChild(css);

    var panel = document.createElement('section');
    panel.className = 'ac-consent';
    panel.hidden = true;
    panel.dir = english ? 'ltr' : 'rtl';
    panel.setAttribute('aria-labelledby', 'ac-consent-title');
    panel.innerHTML = '<div class="ac-consent-copy"><strong id="ac-consent-title"></strong><p></p></div>' +
      '<div class="ac-consent-actions"><button type="button" data-choice="accepted"></button>' +
      '<button type="button" data-choice="denied"></button><a href="/privacy.html"></a></div>';
    panel.querySelector('strong').textContent = copy.title;
    panel.querySelector('p').textContent = copy.text;
    panel.querySelector('[data-choice="accepted"]').textContent = copy.accept;
    panel.querySelector('[data-choice="denied"]').textContent = copy.reject;
    panel.querySelector('a').textContent = copy.policy;
    document.body.appendChild(panel);

    var controls = document.createElement('div');
    controls.className = 'ac-privacy-controls';
    controls.dir = panel.dir;
    var settings = document.createElement('button');
    settings.type = 'button';
    settings.textContent = copy.settings;
    settings.setAttribute('aria-controls', 'ac-consent-panel');
    panel.id = 'ac-consent-panel';
    controls.appendChild(settings);
    document.body.appendChild(controls);
    settings.addEventListener('click', function () {
      lastFocus = settings;
      panel.hidden = false;
      panel.querySelector('button').focus();
    });

    panel.addEventListener('click', function (event) {
      var button = event.target.closest('[data-choice]');
      if (!button) return;
      var choice = button.dataset.choice;
      try { localStorage.setItem(preferenceKey, JSON.stringify({value: choice, savedAt: Date.now()})); } catch (_) {}
      panel.hidden = true;
      if (lastFocus) lastFocus.focus();
      if (choice === 'accepted') {
        startAnalytics();
      } else {
        stopAnalytics();
        if (started) location.reload();
      }
    });

    window.addEventListener('storage', function (event) {
      if (event.key !== preferenceKey) return;
      var preference = readPreference();
      if (preference === 'accepted') { panel.hidden = true; startAnalytics(); }
      else { stopAnalytics(); panel.hidden = preference === 'denied'; if (started) location.reload(); }
    });

    var preference = readPreference();
    if (preference === 'accepted') startAnalytics();
    else { stopAnalytics(); panel.hidden = preference === 'denied'; }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
