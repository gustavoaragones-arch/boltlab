(function () {
  "use strict";

  /** Bump when /data/link-map.json changes (cache bust). Should match link-map.json "version" where practical. */
  var LINK_MAP_VERSION = "1";
  var MAP_URL = "/data/link-map.json?v=" + encodeURIComponent(LINK_MAP_VERSION);
  var MAX_PER_SECTION = 6;

  function normalizePath(pathname) {
    if (!pathname || pathname === "/") return "/";
    var p = pathname.split("?")[0];
    p = p.replace(/\/index\.html$/i, "");
    if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1);
    if (!p.startsWith("/")) p = "/" + p;
    return p === "" ? "/" : p;
  }

  function isCurrentPage(href, pathname) {
    return normalizePath(href) === normalizePath(pathname);
  }

  function textSample() {
    var main = document.getElementById("content") || document.querySelector("main");
    var el = main || document.body;
    if (!el) return "";
    return (el.innerText || "").slice(0, 14000).toLowerCase();
  }

  function neighborMetricSizes(pathname) {
    var m = pathname.match(/\/sizes\/m(\d+)-bolt-size\.html$/i);
    if (!m) return [];
    var n = parseInt(m[1], 10);
    var order = [3, 4, 5, 6, 8, 10, 12];
    var idx = order.indexOf(n);
    var out = [];
    if (idx > 0) {
      var prev = order[idx - 1];
      out.push({
        href: "/sizes/m" + prev + "-bolt-size.html",
        label: "M" + prev + " bolt size",
      });
    }
    if (idx >= 0 && idx < order.length - 1) {
      var next = order[idx + 1];
      out.push({
        href: "/sizes/m" + next + "-bolt-size.html",
        label: "M" + next + " bolt size",
      });
    }
    return out;
  }

  function neighborImperialSizes(pathname) {
    var map = [
      { re: /\/sizes\/1-4-20-bolt-size\.html$/i, prev: null, next: "/sizes/5-16-18-bolt-size.html", nextLabel: "5/16-18 bolt size" },
      { re: /\/sizes\/5-16-18-bolt-size\.html$/i, prev: "/sizes/1-4-20-bolt-size.html", prevLabel: "¼-20 bolt size", next: "/sizes/3-8-16-bolt-size.html", nextLabel: "⅜-16 bolt size" },
      { re: /\/sizes\/3-8-16-bolt-size\.html$/i, prev: "/sizes/5-16-18-bolt-size.html", prevLabel: "5/16-18 bolt size", next: null },
      { re: /\/sizes\/6-screw-size\.html$/i, prev: null, next: "/sizes/8-screw-size.html", nextLabel: "#8 screw size" },
      { re: /\/sizes\/8-screw-size\.html$/i, prev: "/sizes/6-screw-size.html", prevLabel: "#6 screw size", next: "/sizes/10-screw-size.html", nextLabel: "#10 screw size" },
      { re: /\/sizes\/10-screw-size\.html$/i, prev: "/sizes/8-screw-size.html", prevLabel: "#8 screw size", next: null },
    ];
    var out = [];
    for (var i = 0; i < map.length; i++) {
      var row = map[i];
      if (!row.re.test(pathname)) continue;
      if (row.prev) out.push({ href: row.prev, label: row.prevLabel });
      if (row.next) out.push({ href: row.next, label: row.nextLabel });
      break;
    }
    return out;
  }

  function resolveCategories(pathname, text) {
    var p = pathname.toLowerCase();
    var t = text || "";
    var keys = [];

    function add(k) {
      if (keys.indexOf(k) === -1) keys.push(k);
    }

    if (p === "/" || p === "/index.html") add("home");
    if (p.indexOf("/about") !== -1 && (p === "/about" || p.indexOf("/about/") !== -1)) add("about");

    if (
      /\/tools\/thread-identifier/.test(p) ||
      /\/tools\/screw-identifier/.test(p) ||
      /\/tools\/thread-pitch-to-tpi/.test(p) ||
      /\/es\/tools\/identificador-roscas/.test(p) ||
      /\/es\/tools\/identificador-tornillos/.test(p) ||
      /\/es\/tools\/paso-rosca-a-tpi/.test(p)
    ) {
      add("thread");
    }
    if (/\/tools\/metric-to-imperial/.test(p)) add("metric");
    if (/\/tools\/tap-drill-calculator/.test(p)) add("tap");
    if (/\/tools\/bolt-torque/.test(p)) add("bolt");
    if (/\/tools\/drill-bit-converter/.test(p)) add("drill");
    if (/\/tools\/fastener-weight/.test(p)) add("weight");

    if (p.indexOf("/charts") !== -1) add("charts_hub");
    if (p.indexOf("/guides") !== -1) add("guides_hub");

    if (p.indexOf("/reference/") !== -1) add("reference");

    if (/\/sizes\/m\d+-bolt-size\.html/.test(p)) add("size_metric");
    if (/\/sizes\/(1-4-20|5-16-18|3-8-16)-bolt-size\.html/.test(p) || /\/sizes\/(6|8|10)-screw-size\.html/.test(p)) add("size_imperial");

    if (/\/sizes\/?$/.test(p) || /\/sizes\/index\.html?$/.test(p)) add("sizes_hub");

    if (t.indexOf("stainless") !== -1 && t.indexOf("gall") !== -1) add("material");
    if (t.indexOf("tap drill") !== -1 || t.indexOf("tap-drill") !== -1) add("tap");
    if (t.indexOf("torque") !== -1 && t.indexOf("bolt") !== -1) add("bolt");
    if (t.indexOf("thread pitch") !== -1 && keys.indexOf("thread") === -1) add("thread");
    if (t.indexOf("metric thread") !== -1 && keys.indexOf("metric") === -1) add("metric");

    if (keys.indexOf("default") === -1) add("default");
    return keys;
  }

  function mergeCategory(map, keys) {
    var sections = { tools: [], guides: [], charts: [], sizes: [] };
    var seen = { tools: {}, guides: {}, charts: {}, sizes: {} };

    for (var pass = 0; pass < keys.length; pass++) {
      var cat = map.categories && map.categories[keys[pass]];
      if (!cat) continue;
      ["tools", "guides", "charts", "sizes"].forEach(function (sec) {
        var list = cat[sec];
        if (!list || !list.length) return;
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          if (!item || !item.href) continue;
          if (seen[sec][item.href]) continue;
          seen[sec][item.href] = true;
          sections[sec].push(item);
        }
      });
    }

    ["tools", "guides", "charts", "sizes"].forEach(function (sec) {
      if (sections[sec].length > MAX_PER_SECTION) sections[sec] = sections[sec].slice(0, MAX_PER_SECTION);
    });

    return sections;
  }

  function filterCurrent(sections, pathname) {
    var out = { tools: [], guides: [], charts: [], sizes: [] };
    ["tools", "guides", "charts", "sizes"].forEach(function (sec) {
      for (var i = 0; i < sections[sec].length; i++) {
        var item = sections[sec][i];
        if (!isCurrentPage(item.href, pathname)) out[sec].push(item);
      }
    });
    return out;
  }

  function prependNeighbors(sections, pathname) {
    var extra = neighborMetricSizes(pathname).concat(neighborImperialSizes(pathname));
    if (!extra.length) return sections;
    var seen = {};
    var merged = [];
    for (var i = 0; i < extra.length; i++) {
      if (seen[extra[i].href]) continue;
      seen[extra[i].href] = true;
      if (!isCurrentPage(extra[i].href, pathname)) merged.push(extra[i]);
    }
    sections.sizes = merged.concat(sections.sizes || []);
    var seen2 = {};
    var deduped = [];
    for (var j = 0; j < sections.sizes.length; j++) {
      var s = sections.sizes[j];
      if (seen2[s.href]) continue;
      seen2[s.href] = true;
      deduped.push(s);
    }
    sections.sizes = deduped.slice(0, MAX_PER_SECTION);
    return sections;
  }

  function render(container, sections) {
    var has =
      sections.tools.length +
      sections.guides.length +
      sections.charts.length +
      sections.sizes.length;
    if (!has) {
      container.innerHTML = "";
      container.setAttribute("hidden", "hidden");
      return;
    }
    container.removeAttribute("hidden");

    var html = '<div class="related-links-inner">';
    html += '<h2 class="related-links-heading">Related on BoltLab</h2>';

    function block(title, key) {
      var list = sections[key];
      if (!list || !list.length) return "";
      var h = '<section class="related-links-section" aria-label="' + title + '">';
      h += "<h3>" + title + "</h3><ul>";
      for (var i = 0; i < list.length; i++) {
        var it = list[i];
        h +=
          '<li><a href="' +
          escapeAttr(it.href) +
          '">' +
          escapeHtml(it.label || it.href) +
          "</a></li>";
      }
      h += "</ul></section>";
      return h;
    }

    html += block("Related tools", "tools");
    html += block("Related guides", "guides");
    html += block("Related charts", "charts");
    html += block("Related size pages", "sizes");
    html += "</div>";
    container.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  function run() {
    var container = document.getElementById("related-links");
    if (!container) return;

    var pathname = window.location.pathname;
    var text = textSample();
    var keys = resolveCategories(pathname, text);

    fetch(MAP_URL)
      .then(function (r) {
        if (!r.ok) throw new Error("link-map load failed");
        return r.json();
      })
      .then(function (map) {
        var merged = mergeCategory(map, keys);
        merged = filterCurrent(merged, pathname);
        merged = prependNeighbors(merged, pathname);
        merged = filterCurrent(merged, pathname);
        render(container, merged);
      })
      .catch(function () {
        container.innerHTML =
          '<p class="related-links-fallback muted">Related links unavailable offline. Use the site navigation for tools, charts, and guides.</p>';
        container.classList.add("related-links--error");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
