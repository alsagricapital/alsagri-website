/* Netlify server logs provide analytics. This script only retires the old
   Google tag and adds a privacy link. It sends no measurement events. */
(function () {
  'use strict';
  var productionHosts = ['alsagricapital.com', 'www.alsagricapital.com'];
  var production = location.protocol === 'https:' && productionHosts.indexOf(location.hostname) !== -1;
  var preview = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') &&
    new URLSearchParams(location.search).get('analytics-preview') === '1';
  if ((!production && !preview) || window.__alsagriAnalyticsReady) return;
  window.__alsagriAnalyticsReady = true;
  window['ga-disable-G-4L8P90SQCC'] = true;

  // Expire accessible legacy cookies without changing unrelated site storage.
  if (production) {
    try {
      document.cookie.split(';').forEach(function (entry) {
        var name = entry.split('=')[0].trim();
        if (name !== '_ga' && name.indexOf('_ga_') !== 0) return;
        ['', location.hostname, 'alsagricapital.com', '.alsagricapital.com'].forEach(function (domain) {
          document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '') + '; SameSite=Lax';
        });
      });
    } catch (_) { /* No replacement identifier is created if cookies are unavailable. */ }
  }

  function init() {
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/analytics.css?v=20260921-server';
    document.head.appendChild(css);
    var english = document.documentElement.lang.indexOf('en') === 0;
    var controls = document.createElement('div');
    controls.className = 'ac-privacy-controls';
    controls.dir = english ? 'ltr' : 'rtl';
    var privacy = document.createElement('a');
    privacy.href = '/privacy.html';
    privacy.textContent = english ? 'Privacy' : 'الخصوصية';
    controls.appendChild(privacy);
    document.body.appendChild(controls);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
