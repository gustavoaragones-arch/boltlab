(function () {
  "use strict";

  /** Bump with /data/context-anchors.json when patterns change. */
  var CONTEXT_ANCHOR_VERSION = "1";
  var DATA_URL = "/data/context-anchors.json?v=" + encodeURIComponent(CONTEXT_ANCHOR_VERSION);
  var MAX_REPLACEMENTS = 5;
  var MIN_ANCHOR_CHARS = 11;
  var MAX_COVER_CHARS = 220;

  function normalizePath(pathname) {
    if (!pathname || pathname === "/") return "/";
    var p = pathname.split("?")[0];
    p = p.replace(/\/index\.html$/i, "");
    if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1);
    if (!p.startsWith("/")) p = "/" + p;
    return p === "" ? "/" : p;
  }

  function skipSelf(href, pathname) {
    return normalizePath(href) === normalizePath(pathname);
  }

  function escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function findTokenSpan(sentence, token) {
    var t = token.trim();
    if (!t) return null;
    if (/^m\d+$/i.test(t)) {
      var re = new RegExp("\\b" + escapeRegex(t) + "\\b", "i");
      var m = re.exec(sentence);
      return m ? { start: m.index, end: m.index + m[0].length } : null;
    }
    if (/^tpi$/i.test(t)) {
      var reT = /\bTPI\b/i;
      var mt = reT.exec(sentence);
      return mt ? { start: mt.index, end: mt.index + mt[0].length } : null;
    }
    var lowerS = sentence.toLowerCase();
    var lowerT = t.toLowerCase();
    var idx = lowerS.indexOf(lowerT);
    if (idx === -1) return null;
    return { start: idx, end: idx + t.length };
  }

  function sentenceHasAllTokens(sentence, tokens) {
    for (var i = 0; i < tokens.length; i++) {
      if (!findTokenSpan(sentence, tokens[i])) return false;
    }
    return true;
  }

  function coverSpan(sentence, tokens) {
    var lo = sentence.length;
    var hi = 0;
    for (var i = 0; i < tokens.length; i++) {
      var span = findTokenSpan(sentence, tokens[i]);
      if (!span) return null;
      lo = Math.min(lo, span.start);
      hi = Math.max(hi, span.end);
    }
    if (hi - lo > MAX_COVER_CHARS) return null;
    return { start: lo, end: hi };
  }

  function splitSentences(text) {
    var out = [];
    if (!text) return out;
    var re = /[^.!?]+[.!?]*/g;
    var m;
    while ((m = re.exec(text))) {
      var chunk = m[0];
      if (chunk.trim().length) {
        out.push({ text: chunk, start: m.index, end: m.index + chunk.length });
      }
    }
    if (!out.length && text.trim()) {
      out.push({ text: text, start: 0, end: text.length });
    }
    return out;
  }

  function textNodeAllowed(tn) {
    var p = tn.parentNode;
    while (p && p.nodeType === 1) {
      var tag = p.tagName;
      if (tag === "A" || tag === "CODE" || tag === "PRE" || tag === "SCRIPT" || tag === "STYLE" || tag === "KBD" || tag === "SAMP") {
        return false;
      }
      if (tag === "H1" || tag === "H2" || tag === "H3") return false;
      p = p.parentNode;
    }
    return true;
  }

  function tryPatternOnTextNode(tn, pattern, pathname) {
    var anchorText = pattern.anchor || "";
    if (anchorText.length < MIN_ANCHOR_CHARS) return false;
    if (skipSelf(pattern.url, pathname)) return false;

    var tokens = pattern.match;
    if (!tokens || !tokens.length) return false;

    var full = tn.nodeValue;
    if (!full || !full.trim()) return false;

    var sentences = splitSentences(full);
    for (var s = 0; s < sentences.length; s++) {
      var sent = sentences[s];
      var st = sent.text;
      if (!sentenceHasAllTokens(st, tokens)) continue;

      var cover = coverSpan(st, tokens);
      if (!cover) continue;

      var absLo = sent.start + cover.start;
      var absHi = sent.start + cover.end;
      if (absLo < 0 || absHi > full.length || absLo >= absHi) continue;

      var before = full.slice(0, absLo);
      var after = full.slice(absHi);
      var parent = tn.parentNode;
      if (!parent) return false;

      var a = document.createElement("a");
      a.href = pattern.url;
      a.className = "anchor-context-injected";
      a.setAttribute("data-context-anchor", "true");
      a.textContent = anchorText;

      if (before) parent.insertBefore(document.createTextNode(before), tn);
      parent.insertBefore(a, tn);
      if (after) parent.insertBefore(document.createTextNode(after), tn);
      parent.removeChild(tn);
      return true;
    }
    return false;
  }

  function run(data) {
    var patterns = data.patterns;
    if (!patterns || !patterns.length) return;

    var main = document.getElementById("content") || document.querySelector("main");
    if (!main) return;

    var pathname = window.location.pathname;
    var total = 0;

    for (var pi = 0; pi < patterns.length; pi++) {
      if (total >= MAX_REPLACEMENTS) return;
      var pattern = patterns[pi];
      if (!pattern || !pattern.url || !pattern.match) continue;

      var walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          if (!textNodeAllowed(node)) return NodeFilter.FILTER_REJECT;
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });

      var applied = false;
      while (walker.nextNode()) {
        var tn = walker.currentNode;
        if (tryPatternOnTextNode(tn, pattern, pathname)) {
          total++;
          applied = true;
          break;
        }
      }
      if (applied) continue;
    }
  }

  window.__boltLabContextAnchorDone = new Promise(function (resolve) {
    function init() {
      fetch(DATA_URL)
        .then(function (r) {
          if (!r.ok) throw new Error("context-anchors load failed");
          return r.json();
        })
        .then(run)
        .catch(function () {})
        .finally(resolve);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  });
})();
