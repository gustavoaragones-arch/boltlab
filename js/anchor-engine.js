(function () {
  "use strict";

  /** Bump with /data/anchors.json when phrases change (cache bust). */
  var ANCHOR_DATA_VERSION = "1";
  var ANCHORS_URL = "/data/anchors.json?v=" + encodeURIComponent(ANCHOR_DATA_VERSION);
  /** Context engine adds up to 5; keep combined total ≤ ~8. */
  var MAX_INJECTED = 3;

  function normalizePath(pathname) {
    if (!pathname || pathname === "/") return "/";
    var p = pathname.split("?")[0];
    p = p.replace(/\/index\.html$/i, "");
    if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1);
    if (!p.startsWith("/")) p = "/" + p;
    return p === "" ? "/" : p;
  }

  function isSkippableHref(href, pathname) {
    return normalizePath(href) === normalizePath(pathname);
  }

  function escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function findMatchIndex(text, key) {
    if (!text || !key) return -1;
    var t = text;
    var k = key;
    if (/^M\d+$/i.test(k)) {
      var re = new RegExp("\\b" + escapeRegex(k) + "\\b", "i");
      var m = re.exec(t);
      return m ? m.index : -1;
    }
    if (/^TPI$/i.test(k)) {
      var reTpi = /\bTPI\b/i;
      var mt = reTpi.exec(t);
      return mt ? mt.index : -1;
    }
    var lower = t.toLowerCase();
    var kk = k.toLowerCase();
    return lower.indexOf(kk);
  }

  function matchedLength(text, key, idx) {
    if (idx < 0) return 0;
    if (/^M\d+$/i.test(key)) {
      var re = new RegExp("\\b" + escapeRegex(key) + "\\b", "i");
      var m = text.slice(idx).match(re);
      return m ? m[0].length : key.length;
    }
    if (/^TPI$/i.test(key)) {
      var m2 = text.slice(idx).match(/\bTPI\b/i);
      return m2 ? m2[0].length : 3;
    }
    return key.length;
  }

  function textNodeLinkable(tn) {
    var p = tn.parentNode;
    while (p && p.nodeType === 1) {
      var tag = p.tagName;
      if (tag === "A" || tag === "CODE" || tag === "PRE" || tag === "SCRIPT" || tag === "STYLE" || tag === "KBD" || tag === "SAMP") {
        return false;
      }
      p = p.parentNode;
    }
    return true;
  }

  function sortKeys(keys, pathname) {
    var p = pathname.toLowerCase();
    function priority(k) {
      var kk = k.toLowerCase();
      if (p.indexOf("thread") !== -1) {
        if (kk.indexOf("thread") !== -1 || kk === "tpi" || kk.indexOf("pitch") !== -1) return 0;
      }
      if (p.indexOf("sizes") !== -1 || /\/m\d+-bolt/.test(p) || /\/sizes\/(1-4|5-16|3-8|\d+-screw)/.test(p)) {
        if (/^m\d+$/i.test(k) || k.indexOf("/") !== -1 || /^\d/.test(k)) return 0;
      }
      if (p.indexOf("reference") !== -1) {
        if (["torx", "phillips", "pozidriv", "hex drive", "robertson", "slotted", "torx screw"].indexOf(kk) !== -1) return 0;
      }
      if (p.indexOf("charts") !== -1 || p.indexOf("bolt-grade") !== -1) {
        if (kk.indexOf("bolt grade") !== -1 || kk.indexOf("screw size chart") !== -1) return 0;
      }
      return 1;
    }
    keys.sort(function (a, b) {
      var pa = priority(a);
      var pb = priority(b);
      if (pa !== pb) return pa - pb;
      return b.length - a.length;
    });
    return keys;
  }

  function injectOnce(tn, key, href) {
    var text = tn.nodeValue;
    if (!text) return false;
    var idx = findMatchIndex(text, key);
    if (idx === -1) return false;
    var len = matchedLength(text, key, idx);
    if (len <= 0) return false;
    var matchedText = text.slice(idx, idx + len);
    var before = text.slice(0, idx);
    var after = text.slice(idx + len);
    var parent = tn.parentNode;
    if (!parent) return false;

    var a = document.createElement("a");
    a.href = href;
    a.className = "anchor-injected";
    a.setAttribute("data-anchor-injected", "true");
    a.textContent = matchedText;

    if (before) parent.insertBefore(document.createTextNode(before), tn);
    parent.insertBefore(a, tn);
    if (after) parent.insertBefore(document.createTextNode(after), tn);
    parent.removeChild(tn);
    return true;
  }

  function walkAndInject(keys, hrefMap, pathname) {
    var main = document.getElementById("content") || document.querySelector("main");
    if (!main) return;

    var injected = 0;

    for (var k = 0; k < keys.length; k++) {
      if (injected >= MAX_INJECTED) return;
      var key = keys[k];
      var href = hrefMap[key];
      if (!href || isSkippableHref(href, pathname)) continue;

      var walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          if (!textNodeLinkable(node)) return NodeFilter.FILTER_REJECT;
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (findMatchIndex(node.nodeValue, key) === -1) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });

      while (walker.nextNode()) {
        var tn = walker.currentNode;
        if (injectOnce(tn, key, href)) {
          injected++;
          break;
        }
      }
    }
  }

  function run(data) {
    var anchors = data.anchors;
    if (!anchors || typeof anchors !== "object") return;

    var pathname = window.location.pathname;
    var keys = Object.keys(anchors);
    keys = sortKeys(keys, pathname);

    walkAndInject(keys, anchors, pathname);
  }

  function loadAndRun() {
    fetch(ANCHORS_URL)
      .then(function (r) {
        if (!r.ok) throw new Error("anchors load failed");
        return r.json();
      })
      .then(run)
      .catch(function () {});
  }

  function init() {
    var wait = window.__boltLabContextAnchorDone;
    if (wait && typeof wait.then === "function") {
      wait.then(loadAndRun);
    } else {
      loadAndRun();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
