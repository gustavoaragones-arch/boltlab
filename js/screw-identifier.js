(function () {
  "use strict";

  var HEAD = {
    hex: { label: "Hex", img: "/images/screw-head-types/hex-head.svg", alt: "External hex bolt head" },
    pan: { label: "Pan", img: "/images/screw-head-types/pan-head.svg", alt: "Pan head screw" },
    truss: { label: "Truss", img: "/images/screw-head-types/truss-head.svg", alt: "Truss head screw" },
    countersunk: { label: "Countersunk", img: "/images/screw-head-types/countersunk-head.svg", alt: "Countersunk flat head" },
    oval: { label: "Oval", img: "/images/screw-head-types/oval-head.svg", alt: "Oval head screw" },
    round: { label: "Round", img: "/images/screw-head-types/round-head.svg", alt: "Round dome head screw" },
  };

  var DRIVE = {
    phillips: { label: "Phillips", img: "/images/screw-drive-types/philips.png", alt: "Phillips cross drive" },
    pozidriv: { label: "Pozidriv", img: "/images/screw-drive-types/pozidriv.png", alt: "Pozidriv drive" },
    torx: { label: "Torx", img: "/images/screw-drive-types/torx.png", alt: "Torx six-lobe drive" },
    hex: { label: "Hex (Allen)", img: "/images/screw-drive-types/hex.png", alt: "Internal hex socket drive" },
    slotted: { label: "Slotted", img: "/images/screw-drive-types/slotted.png", alt: "Slotted drive" },
    robertson: { label: "Robertson", img: "/images/screw-drive-types/robertson.png", alt: "Square Robertson drive" },
    "triple-square": { label: "Triple-square (XZN)", img: "/images/screw-drive-types/triple-square.png", alt: "Triple-square XZN drive" },
    "double-hex": { label: "12-point (double hex)", img: "/images/screw-drive-types/double-hex.png", alt: "12-point double hex drive" },
    bristol: { label: "Bristol spline", img: "/images/screw-drive-types/bristol.png", alt: "Bristol spline drive" },
    polydrive: { label: "Polydrive", img: "/images/screw-drive-types/polydrive.png", alt: "Polydrive recess" },
    spline: { label: "Spline drive", img: "/images/screw-drive-types/spline-drive.png", alt: "Spline multi-tooth drive" },
    triangle: { label: "Triangle", img: "/images/screw-drive-types/triangle.png", alt: "Triangle security drive" },
  };

  /**
   * Curated rows: likely names, description, typical uses, size hints by thread system.
   * Missing keys fall back to buildGeneric().
   */
  var COMBOS = {
    "pan|phillips": {
      likely: ["Pan head Phillips machine screw", "ISO 7045-style pan (typical)"],
      desc:
        "Very common in machinery, appliances, and sheet-metal assemblies. Head sits above the surface with a flat bearing ring.",
      uses: "Enclosures, brackets, hinges (non-flush side), general hardware.",
      sizes: { metric: ["M2–M8 common", "M3 / M4 / M6 very frequent"], imperial: ["#4–#14", "#8 and #10 common in consumer goods"] },
      pitch: "Match ISO metric coarse or UNC/UNF per application; measure if unknown.",
    },
    "pan|pozidriv": {
      likely: ["Pan head Pozidriv machine screw", "Cross recess type Z pan head"],
      desc: "Similar envelope to Phillips pan heads but with Pozidriv recess for reduced cam-out when paired with the correct bit.",
      uses: "EU appliance hardware, automotive trim, anywhere Pozidriv is specified.",
      sizes: { metric: ["M3–M8"], imperial: ["#6–#12"] },
      pitch: "Often coarse metric or inch series matching the mating tapped hole.",
    },
    "pan|torx": {
      likely: ["Pan head Torx machine screw", "Six-lobe pan head (high torque)"],
      desc: "Pan head with Torx (hexalobular) recess for high torque transfer and reduced cam-out versus Phillips.",
      uses: "Automotive, appliances, electronics chassis where driver engagement matters.",
      sizes: { metric: ["M3–M10"], imperial: ["#6–¼\""] },
      pitch: "Torx drive size (e.g. T10–T30) scales with screw diameter—check fastener marking.",
    },
    "pan|slotted": {
      likely: ["Pan head slotted machine screw", "Slotted pan head"],
      desc: "Older or simple assemblies; lower torque capacity and more slip risk than internal drives.",
      uses: "Light-duty brackets, vintage equipment, applications where only a flat-blade tool is available.",
      sizes: { metric: ["M2–M6"], imperial: ["#4–#10"] },
      pitch: "Any standard thread family; confirm by measurement.",
    },
    "pan|robertson": {
      likely: ["Pan head Robertson (square drive)", "Common in wood/sheet markets using square recess"],
      desc: "Pan head with square recess—strong engagement; very common in Canadian woodworking and some metal screws.",
      uses: "Cabinets, decking connectors (where specified), general construction using Robertson.",
      sizes: { metric: ["M4–M8"], imperial: ["#6–#14"] },
      pitch: "Wood-thread and machine-thread variants exist—check shank and point style.",
    },
    "pan|hex": {
      likely: ["Low head cap screw with hex socket (often mistaken for pan)", "Socket button / pan-like profiles"],
      desc: "True **external hex pan** is uncommon; internal hex usually appears on **cylindrical socket heads**. If you see a rounded top with hex socket, see socket-head families in reference.",
      uses: "If internal hex: machinery, tooling, flush-side assembly with Allen key access.",
      sizes: { metric: ["M3–M12"], imperial: ["#5–½\""] },
      pitch: "Socket products span coarse and fine—measure major Ø and pitch.",
    },
    "truss|phillips": {
      likely: ["Truss head Phillips screw", "Wide low-profile head (sheet applications)"],
      desc: "Wide bearing area with low height—spreads clamp load on thin materials.",
      uses: "HVAC sheet metal, latches, thin panels, insulation washers.",
      sizes: { metric: ["M4–M8"], imperial: ["#8–#14"] },
      pitch: "Often self-tapping or sheet-metal threads in thin steel—verify with samples.",
    },
    "truss|torx": {
      likely: ["Truss head Torx screw", "Low-profile wide head + Torx"],
      desc: "Combines large bearing surface with high-torque drive—common in automotive and appliance sheet metal.",
      uses: "Body clips, brackets, modules mounted through thin steel.",
      sizes: { metric: ["M4–M8"], imperial: ["#8–#12"] },
      pitch: "Measure thread if replacing unknown parts.",
    },
    "truss|robertson": {
      likely: ["Truss head Robertson screw"],
      desc: "Wide head plus square drive—strong drive engagement on thin stock.",
      uses: "Wood and composite decking systems, cabinet builds (regional preference).",
      sizes: { metric: ["M4–M8"], imperial: ["#8–#14"] },
      pitch: "Often wood or type-17 sheet screws—confirm with catalog.",
    },
    "countersunk|phillips": {
      likely: ["Flat head Phillips machine screw", "Countersunk cross-recess (ISO 7046-style)"],
      desc: "Tapered head sits flush (or below) in a countersink; finished appearance on visible surfaces.",
      uses: "Door hardware, hinges, metal lids, anywhere flush finish is required.",
      sizes: { metric: ["M2–M8"], imperial: ["#4–#14"] },
      pitch: "Countersunk families exist in metric and unified—measure to match replacement.",
    },
    "countersunk|pozidriv": {
      likely: ["Flat head Pozidriv screw", "Countersunk Pozidriv"],
      desc: "Flush head with Pozidriv recess for better bit engagement than Phillips in hard joints.",
      uses: "EU equipment, automotive interior trim, metal housings.",
      sizes: { metric: ["M3–M8"], imperial: ["#6–#12"] },
      pitch: "Match pilot and countersink angle (often 82° or 90°) to the screw.",
    },
    "countersunk|torx": {
      likely: ["Flat head Torx screw", "Countersunk six-lobe"],
      desc: "High torque, low cam-out; common where flush finish and strong drive engagement both matter.",
      uses: "Automotive trim, machinery guards, premium hardware kits.",
      sizes: { metric: ["M3–M10"], imperial: ["#6–¼\""] },
      pitch: "Security Torx variants add a center pin—verify bit type.",
    },
    "countersunk|slotted": {
      likely: ["Flat head slotted screw", "Wood screw or machine countersunk (slotted)"],
      desc: "Classic flush fastener; torque limited by drive slip—fine for light seating loads.",
      uses: "Hinges, decorative trim, older equipment restoration.",
      sizes: { metric: ["M2–M6"], imperial: ["#4–#12"] },
      pitch: "Wood vs machine threads differ—check thread form and point.",
    },
    "countersunk|robertson": {
      likely: ["Flat head Robertson screw"],
      desc: "Flush seating with square drive—popular in woodworking and some metal applications.",
      uses: "Decking, stairs, cabinet face frames (where specified).",
      sizes: { metric: ["M4–M10"], imperial: ["#6–#14"] },
      pitch: "Often wood-thread; machine-thread versions exist.",
    },
    "countersunk|hex": {
      likely: ["Flat head with hex socket (specialty)", "Countersunk socket (less common than cylindrical socket heads)"],
      desc: "If the head is clearly **countersunk** with **internal hex**, you may have a flush socket fastener—confirm angle and diameter.",
      uses: "Flush machine assembly with side access for Allen key.",
      sizes: { metric: ["M3–M10"], imperial: ["#6–¼\""] },
      pitch: "Measure major Ø at threads and pitch/TPI for ordering.",
    },
    "oval|phillips": {
      likely: ["Oval head Phillips screw", "Raised decorative countersunk"],
      desc: "Combines countersunk seat with a rounded top—often slightly proud of flush for appearance.",
      uses: "Hinges, strike plates, visible trim hardware.",
      sizes: { metric: ["M3–M6"], imperial: ["#6–#12"] },
      pitch: "Typically machine threads in hardware kits.",
    },
    "oval|slotted": {
      likely: ["Oval head slotted screw", "Traditional hinge screw"],
      desc: "Common profile on residential hinges and decorative hardware.",
      uses: "Doors, cabinets, light fixtures.",
      sizes: { metric: ["M3–M5"], imperial: ["#6–#10"] },
      pitch: "Often inch-series in North American residential hardware.",
    },
    "round|slotted": {
      likely: ["Round head slotted machine screw", "Full dome head"],
      desc: "Domed head stands proud of the surface—older style; torque limited by slotted drive.",
      uses: "Vintage machinery, restoration, decorative covers.",
      sizes: { metric: ["M2–M6"], imperial: ["#4–#10"] },
      pitch: "Match by measurement; many legacy inch sizes.",
    },
    "round|phillips": {
      likely: ["Round head Phillips machine screw"],
      desc: "Domed head with cross drive—common in older consumer products.",
      uses: "Light covers, legacy equipment, some appliance internals.",
      sizes: { metric: ["M3–M6"], imperial: ["#6–#10"] },
      pitch: "Confirm standard vs specialty thread.",
    },
    "hex|slotted": {
      likely: ["Hex head slotted bolt or screw", "Hex with slotted top (backup drive)"],
      desc: "External hex for primary torque; slotted sometimes present for locking wire or backup turning.",
      uses: "Older automotive, machinery, adjustable stops.",
      sizes: { metric: ["M5–M20"], imperial: ["¼\"–¾\""] },
      pitch: "Usually coarse metric or UNC for structural sizes—verify grade marking on head.",
    },
    "hex|phillips": {
      likely: ["Uncommon: hex head + Phillips recess", "Verify: may be a flange or specialty screw"],
      desc: "Pure hex bolts rarely use Phillips; you may be seeing a **flange** or **washer** combo, or a misidentified head.",
      uses: "If confirmed, treat as machine screw or bolt per thread measurement.",
      sizes: { metric: ["M4–M12"], imperial: ["#8–½\""] },
      pitch: "Measure threads—do not guess load rating.",
    },
    "hex|hex": {
      likely: ["Clarification needed: external hex vs internal hex (Allen)"],
      desc: "**External hex** heads use a wrench on flats—there is usually **no recess**. **Internal hex** (Allen) is typical on **socket head cap screws** with a **cylindrical head**, not a hex flange. Re-check head shape against BoltLab reference diagrams.",
      uses: "Socket caps: precision machinery; hex bolts: structural and automotive.",
      sizes: { metric: ["M3–M24 (caps)", "M6–M20+ (bolts)"], imperial: ["#6–1\"+"] },
      pitch: "Use Thread Identifier after measuring major Ø and pitch/TPI.",
    },
    "hex|torx": {
      likely: ["Rare on true external hex heads", "Possible: tamper-resistant or mixed hardware"],
      desc: "Torx is uncommon on standard hex bolt heads; you might have a **screw with washer** or a **specialty fastener**. Compare to socket head cap (cylindrical) + Torx.",
      uses: "If cylindrical Torx head: automotive and industrial panels.",
      sizes: { metric: ["M4–M12"], imperial: ["#8–½\""] },
      pitch: "Confirm with thread gauge.",
    },
    "hex|pozidriv": {
      likely: ["Rare combination on hex heads", "Verify identification"],
      desc: "Treat as non-standard until thread and head are confirmed against a catalog.",
      uses: "Fallback: measure and use Thread Identifier.",
      sizes: { metric: ["M5–M12"], imperial: ["¼\"–½\""] },
      pitch: "Document major Ø, pitch, and head dimensions for sourcing.",
    },
    "hex|robertson": {
      likely: ["Rare on standard hex heads", "Check for combo drives or misread"],
      desc: "External hex plus square recess is uncommon; confirm you are not looking at a **truss** or **flange** screw.",
      uses: "If verified specialty, follow manufacturer documentation.",
      sizes: { metric: ["M6–M12"], imperial: ["¼\"–⅝\""] },
      pitch: "Measure threads before ordering.",
    },
  };

  /** Explicit confidence per curated combo (high = common / clear; low = ambiguous or rare). */
  var CONFIDENCE_MAP = {
    "pan|phillips": "high",
    "pan|pozidriv": "high",
    "pan|torx": "high",
    "pan|slotted": "medium",
    "pan|robertson": "high",
    "pan|hex": "low",
    "truss|phillips": "high",
    "truss|torx": "high",
    "truss|robertson": "high",
    "countersunk|phillips": "high",
    "countersunk|pozidriv": "high",
    "countersunk|torx": "high",
    "countersunk|slotted": "medium",
    "countersunk|robertson": "high",
    "countersunk|hex": "medium",
    "oval|phillips": "high",
    "oval|slotted": "high",
    "round|slotted": "medium",
    "round|phillips": "medium",
    "hex|slotted": "medium",
    "hex|phillips": "low",
    "hex|hex": "low",
    "hex|torx": "low",
    "hex|pozidriv": "low",
    "hex|robertson": "low",
  };

  function buildGeneric(headKey, driveKey) {
    var h = HEAD[headKey];
    var d = DRIVE[driveKey];
    if (!h || !d) return null;
    return {
      confidence: "medium",
      likely: [h.label + " head · " + d.label + " drive", "Less common catalog pairing—confirm with measurements"],
      desc:
        "This combination is not in the short list of typical stock pairings. Treat identification as **provisional** until you measure **major thread diameter**, **pitch or TPI**, and note **material and strength grade**.",
      uses: "General mechanical use possible—verify load rating and corrosion requirements for your application.",
      sizes: { metric: ["M3–M12 (measure to narrow)"], imperial: ["#4–½\" (measure to narrow)"] },
      pitch: "Use a pitch gauge or Thread Identifier after measuring.",
    };
  }

  function emStrong(s) {
    return String(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  function sizesForThread(thread, row) {
    if (thread === "metric") return row.sizes.metric;
    if (thread === "imperial") return row.sizes.imperial;
    return row.sizes.metric.concat(row.sizes.imperial);
  }

  function pitchLine(thread, base) {
    if (thread === "metric") return "Typical metric coarse pitches follow ISO tables (e.g. M6 × 1). " + base;
    if (thread === "imperial") return "Typical inch threads use UNC/UNF TPI series (e.g. ¼-20 UNC). " + base;
    return base + " For metric, think ISO coarse/fine; for inch, UNC/UNF—measure to be sure.";
  }

  function renderResult(root, state) {
    var head = state.head;
    var drive = state.drive;
    var thread = state.thread || "unknown";
    var inner = root.querySelector(".si-result-inner");
    if (!inner) return;

    inner.classList.remove("si-result-visible");
    void inner.offsetWidth;

    if (!head || !drive) {
      inner.innerHTML =
        '<p class="si-result-placeholder">' +
        (!head && !drive
          ? "Select a <strong>head type</strong> and <strong>drive type</strong> to generate likely matches."
          : !head
            ? "Choose a <strong>head type</strong> (step 1)."
            : "Choose a <strong>drive type</strong> (step 2).") +
        "</p>";
      inner.classList.add("si-result-visible");
      return;
    }

    var key = head + "|" + drive;
    var row = COMBOS[key] || buildGeneric(head, drive);
    if (!row) {
      inner.innerHTML = "<p class=\"si-result-placeholder\">Unable to build a result.</p>";
      inner.classList.add("si-result-visible");
      return;
    }

    var conf = row.confidence || CONFIDENCE_MAP[key] || "medium";
    var confLabel = conf.charAt(0).toUpperCase() + conf.slice(1);
    var confClass = "si-confidence-" + conf;

    var likely = row.likely || [];
    var sizes = sizesForThread(thread, row);
    var pitchText = pitchLine(thread, row.pitch || "");

    var headL = HEAD[head].label;
    var driveL = DRIVE[drive].label;

    var html = "";
    html += '<p class="si-result-kicker">Selection</p>';
    html += "<p class=\"si-result-selection\"><strong>" + headL + "</strong> head · <strong>" + driveL + "</strong> drive · <strong>" + (thread === "unknown" ? "Thread system: any / unknown" : thread === "metric" ? "Metric" : "Imperial") + "</strong></p>";

    html += '<p class="si-confidence-wrap"><span class="si-confidence-label">Confidence</span> <span class="si-confidence ' + confClass + '">' + confLabel + "</span></p>";

    html += '<p class="si-result-kicker">Most likely match</p>';
    html += '<ul class="si-result-matches">';
    for (var i = 0; i < likely.length; i++) {
      html += "<li>" + likely[i] + "</li>";
    }
    html += "</ul>";

    html += '<p class="si-result-desc">' + emStrong(row.desc) + "</p>";

    html += '<h3 class="si-result-sub">Typical specifications</h3>';
    html += '<ul class="si-result-sizes">';
    for (var j = 0; j < sizes.length; j++) {
      html += "<li>" + sizes[j] + "</li>";
    }
    html += "</ul>";

    html += '<h3 class="si-result-sub">Typical uses</h3>';
    html += '<p class="si-result-uses">' + emStrong(row.uses) + "</p>";

    html += '<h3 class="si-result-sub">Thread / pitch</h3>';
    html += '<p class="si-result-pitch">' + emStrong(pitchText) + "</p>";

    inner.innerHTML = html;
    inner.classList.add("si-result-visible");
  }

  function wireGroup(container, category, state, onChange) {
    var buttons = container.querySelectorAll(".si-choice");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        var val = this.getAttribute("data-value");
        var cur = state[category];
        if (cur === val) {
          state[category] = null;
          this.setAttribute("aria-pressed", "false");
          this.classList.remove("is-selected");
        } else {
          for (var j = 0; j < buttons.length; j++) {
            buttons[j].classList.remove("is-selected");
            buttons[j].setAttribute("aria-pressed", "false");
          }
          state[category] = val;
          this.classList.add("is-selected");
          this.setAttribute("aria-pressed", "true");
        }
        onChange();
      });
    }
  }

  function wireThread(container, state, onChange) {
    var buttons = container.querySelectorAll(".si-thread-btn");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        var val = this.getAttribute("data-value");
        for (var j = 0; j < buttons.length; j++) {
          buttons[j].classList.remove("is-selected");
          buttons[j].setAttribute("aria-pressed", "false");
        }
        state.thread = val;
        this.classList.add("is-selected");
        this.setAttribute("aria-pressed", "true");
        onChange();
      });
    }
  }

  function parseUrlState() {
    var p = new URLSearchParams(window.location.search);
    var head = p.get("head");
    var drive = p.get("drive");
    var thread = p.get("thread") || "unknown";
    if (!HEAD[head]) head = null;
    if (!DRIVE[drive]) drive = null;
    if (thread !== "metric" && thread !== "imperial" && thread !== "unknown") thread = "unknown";
    return { head: head, drive: drive, thread: thread };
  }

  function applyStateToUi(root, state) {
    var headG = root.querySelector("#si-group-head");
    var driveG = root.querySelector("#si-group-drive");
    var threadG = root.querySelector("#si-group-thread");
    var i;
    if (headG) {
      var hb = headG.querySelectorAll(".si-choice");
      for (i = 0; i < hb.length; i++) {
        hb[i].classList.remove("is-selected");
        hb[i].setAttribute("aria-pressed", "false");
        if (state.head && hb[i].getAttribute("data-value") === state.head) {
          hb[i].classList.add("is-selected");
          hb[i].setAttribute("aria-pressed", "true");
        }
      }
    }
    if (driveG) {
      var db = driveG.querySelectorAll(".si-choice");
      for (i = 0; i < db.length; i++) {
        db[i].classList.remove("is-selected");
        db[i].setAttribute("aria-pressed", "false");
        if (state.drive && db[i].getAttribute("data-value") === state.drive) {
          db[i].classList.add("is-selected");
          db[i].setAttribute("aria-pressed", "true");
        }
      }
    }
    if (threadG) {
      var tb = threadG.querySelectorAll(".si-thread-btn");
      for (i = 0; i < tb.length; i++) {
        tb[i].classList.remove("is-selected");
        tb[i].setAttribute("aria-pressed", "false");
        if (tb[i].getAttribute("data-value") === state.thread) {
          tb[i].classList.add("is-selected");
          tb[i].setAttribute("aria-pressed", "true");
        }
      }
    }
  }

  function syncUrl(state, mode) {
    var params = new URLSearchParams();
    if (state.head) params.set("head", state.head);
    if (state.drive) params.set("drive", state.drive);
    if (state.thread && state.thread !== "unknown") params.set("thread", state.thread);
    var qs = params.toString();
    var newUrl = window.location.pathname + (qs ? "?" + qs : "") + window.location.hash;
    var cur = window.location.pathname + window.location.search + window.location.hash;
    if (newUrl === cur) return;
    var fn = mode === "push" ? "pushState" : "replaceState";
    history[fn]({ screwIdentifier: true }, "", newUrl);
  }

  function init() {
    var root = document.getElementById("screw-identifier-app");
    if (!root) return;

    var parsed = parseUrlState();
    var state = { head: parsed.head, drive: parsed.drive, thread: parsed.thread };

    var suppressPush = true;

    function update() {
      renderResult(root, state);
      if (!suppressPush) syncUrl(state, "push");
    }

    var headG = document.getElementById("si-group-head");
    var driveG = document.getElementById("si-group-drive");
    var threadG = document.getElementById("si-group-thread");

    applyStateToUi(root, state);
    renderResult(root, state);
    syncUrl(state, "replace");
    suppressPush = false;

    if (headG) wireGroup(headG, "head", state, update);
    if (driveG) wireGroup(driveG, "drive", state, update);
    if (threadG) wireThread(threadG, state, update);

    var resetBtn = document.getElementById("si-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        state.head = null;
        state.drive = null;
        state.thread = "unknown";
        suppressPush = true;
        applyStateToUi(root, state);
        renderResult(root, state);
        syncUrl(state, "replace");
        suppressPush = false;
      });
    }

    window.addEventListener("popstate", function () {
      var p = parseUrlState();
      state.head = p.head;
      state.drive = p.drive;
      state.thread = p.thread;
      suppressPush = true;
      applyStateToUi(root, state);
      renderResult(root, state);
      suppressPush = false;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
