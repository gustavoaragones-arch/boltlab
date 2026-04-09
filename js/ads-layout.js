/**
 * BoltLab ads: in-view loading, slot cap, contextual labels, sticky mobile (dismiss + collapse),
 * secondary inline on long guides/reference.
 */
(function () {
  var STICKY_KEY = 'boltLabStickyAdDismissed';
  var STICKY_STATE_KEY = 'boltLabStickyAdState';
  var LOAD_DELAY_MS = 1200;
  var MAX_ADS = 3;
  var LONG_PAGE_MIN_PX = 1200;

  function countAdSlots() {
    return document.querySelectorAll('.ad-slot').length;
  }

  function canAddAdSlot() {
    return countAdSlots() < MAX_ADS;
  }

  function loadSingleAd(el) {
    if (!el) return;
    document.dispatchEvent(
      new CustomEvent('boltlab:ads-load', {
        detail: { slot: el },
      })
    );
  }

  function observeAd(el) {
    if (!el || el.dataset.adObserved === '1') return;
    el.dataset.adObserved = '1';
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            loadSingleAd(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
  }

  function loadAds() {
    document.querySelectorAll('.ad-slot').forEach(observeAd);
  }

  function isSpanishPage() {
    var lang = (document.documentElement.lang || '').toLowerCase();
    return lang.indexOf('es') === 0;
  }

  /** Contextual labels for .ad-label (subtle; small font in CSS). */
  function labelTextForPage() {
    var es = isSpanishPage();
    var path = window.location.pathname.toLowerCase();
    var mainEl = document.querySelector('main');
    var mainBlob = (mainEl ? mainEl.innerText : '').toLowerCase().slice(0, 14000);

    var tapHit =
      mainBlob.indexOf('tap drill') !== -1 ||
      path.indexOf('tap-drill') !== -1 ||
      path.indexOf('calculadora-broca') !== -1 ||
      path.indexOf('broca-para-roscar') !== -1;

    if (tapHit) {
      return es ? 'Herramientas y juegos de broca' : 'Tools & drill sets';
    }

    var threadHit =
      /\bthread\b/.test(mainBlob) ||
      /\brosca\b/.test(mainBlob) ||
      path.indexOf('thread-') !== -1 ||
      path.indexOf('roscas') !== -1 ||
      path.indexOf('paso-rosca') !== -1;

    if (threadHit) {
      return es ? 'Galgas y herramientas de rosca' : 'Thread gauges & tools';
    }

    return es ? 'Patrocinado' : 'Sponsored';
  }

  function applyContextualAdLabels() {
    var text = labelTextForPage();
    document.querySelectorAll('.ad-container .ad-label').forEach(function (node) {
      node.textContent = text;
    });
  }

  function maybeInjectSecondaryInline() {
    var p = window.location.pathname;
    if (
      p.indexOf('/guides/') === -1 &&
      p.indexOf('/reference/') === -1 &&
      p.indexOf('/es/guides/') === -1
    ) {
      return;
    }

    if (document.querySelectorAll('.ad-container').length >= 2) return;
    if (!canAddAdSlot()) return;

    var article = document.querySelector('#content article') || document.querySelector('main article');
    if (!article) return;
    if (article.scrollHeight <= LONG_PAGE_MIN_PX) return;

    var h2s = article.querySelectorAll('h2');
    if (h2s.length < 2) return;

    var second = h2s[1];
    var aria = isSpanishPage() ? 'Publicidad' : 'Advertisement';
    var wrap = document.createElement('div');
    wrap.className = 'ad-container';
    wrap.setAttribute('data-ad-secondary', 'true');
    wrap.innerHTML =
      '<div class="ad-label">Sponsored</div>' +
      '<aside class="ad-slot ad-slot--inline" aria-label="' +
      aria +
      '" data-ad-placeholder="true" data-ad-secondary-slot="true"></aside>';
    second.insertAdjacentElement('afterend', wrap);
  }

  /** High intent: tools + sizes (not guides/reference). Sticky is mobile-only via CSS. */
  function shouldInjectSticky() {
    var p = window.location.pathname;
    if (p.indexOf('/guides/') !== -1 || p.indexOf('/reference/') !== -1) return false;
    if (p.indexOf('/tools/') !== -1 || p.indexOf('/sizes/') !== -1) return true;
    return false;
  }

  function readStickyCollapsed() {
    try {
      return localStorage.getItem(STICKY_STATE_KEY) === 'collapsed';
    } catch (e) {
      return false;
    }
  }

  function persistStickyCollapsed(collapsed) {
    try {
      localStorage.setItem(STICKY_STATE_KEY, collapsed ? 'collapsed' : 'expanded');
    } catch (e) {
      /* ignore */
    }
  }

  function setStickyCollapsed(wrap, collapsed) {
    if (collapsed) {
      wrap.classList.add('ad-sticky-mobile--collapsed');
      document.body.classList.add('has-ad-sticky-mobile-collapsed');
    } else {
      wrap.classList.remove('ad-sticky-mobile--collapsed');
      document.body.classList.remove('has-ad-sticky-mobile-collapsed');
    }
    persistStickyCollapsed(collapsed);
  }

  function initSticky() {
    if (!shouldInjectSticky()) return;
    if (!canAddAdSlot()) return;
    try {
      if (localStorage.getItem(STICKY_KEY) === '1') return;
    } catch (e) {
      /* ignore */
    }

    var wrap = document.createElement('div');
    wrap.className = 'ad-sticky-mobile';
    if (readStickyCollapsed()) {
      wrap.classList.add('ad-sticky-mobile--collapsed');
      document.body.classList.add('has-ad-sticky-mobile-collapsed');
    }
    wrap.setAttribute('aria-label', 'Advertisement');
    wrap.innerHTML =
      '<button type="button" class="ad-close" aria-label="Close advertisement">\u00d7</button>' +
      '<div class="ad-slot" data-ad-placeholder="true" data-ad-sticky-slot="true"></div>';

    document.body.appendChild(wrap);
    document.body.classList.add('has-ad-sticky-mobile');

    wrap.addEventListener('click', function (e) {
      if (e.target.closest('.ad-close')) return;
      setStickyCollapsed(wrap, !wrap.classList.contains('ad-sticky-mobile--collapsed'));
    });

    var btn = wrap.querySelector('.ad-close');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        wrap.remove();
        document.body.classList.remove('has-ad-sticky-mobile');
        document.body.classList.remove('has-ad-sticky-mobile-collapsed');
        try {
          localStorage.setItem(STICKY_KEY, '1');
        } catch (err) {
          /* ignore */
        }
      });
    }
  }

  function boot() {
    maybeInjectSecondaryInline();
    initSticky();
    applyContextualAdLabels();

    setTimeout(function () {
      applyContextualAdLabels();
      loadAds();
    }, LOAD_DELAY_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
