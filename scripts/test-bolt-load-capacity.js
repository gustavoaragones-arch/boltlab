#!/usr/bin/env node
/**
 * Fastener Load & Strength -- Public Implementation Phase: deterministic numeric test suite.
 *
 * Distinct from scripts/validators/validate-bolt-load-capacity.js (structural/content invariant
 * checks): this suite exercises the actual formula module and the actual
 * setupBoltLoadCapacityCalculator() interaction logic from js/converters.js against concrete
 * inputs and expected numeric outputs, using a minimal hand-built DOM stub (no jsdom is
 * available in this environment). Deterministic, read-only, no repository mutation.
 */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg || "assertion failed");
}

// -------------------------------------------------------------------------------------------
// Minimal DOM stub: just enough for setupBoltLoadCapacityCalculator() to run unmodified.
// -------------------------------------------------------------------------------------------

class FakeElement {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this._value = "";
    this._valueSet = false;
    this._innerHTML = "";
    this.textContent = "";
    this._listeners = {};
  }
  appendChild(child) {
    this.children.push(child);
  }
  addEventListener(evt, fn) {
    (this._listeners[evt] = this._listeners[evt] || []).push(fn);
  }
  fire(evt) {
    for (const fn of this._listeners[evt] || []) fn();
  }
  set value(v) {
    this._value = v;
    this._valueSet = true;
  }
  get value() {
    if (this._valueSet) return this._value;
    if (this.children.length) return this.children[0].value;
    return this._value;
  }
  set innerHTML(v) {
    this._innerHTML = v;
    if (v === "") this.children = [];
  }
  get innerHTML() {
    return this._innerHTML;
  }
}

function makeOption(value, text) {
  const o = new FakeElement("option");
  o.value = value;
  o.textContent = text || value;
  return o;
}

function buildSandbox(extraInchSizesForTesting) {
  const registry = {};
  function register(id, tag) {
    const el = new FakeElement(tag);
    el.id = id;
    registry[id] = el;
    return el;
  }

  const systemEl = register("blc-system", "select");
  systemEl.appendChild(makeOption("metric", "Metric (ISO)"));
  systemEl.appendChild(makeOption("inch", "Inch (SAE)"));
  register("blc-size", "select");
  register("blc-grade", "select");
  const sfEl = register("blc-safety-factor", "input");
  sfEl.value = "";
  register("blc-result", "div");

  const document = {
    createElement: (tag) => new FakeElement(tag),
    getElementById: (id) => registry[id] || null,
  };

  const window = {};
  const sandbox = { window, document, console };
  vm.createContext(sandbox);

  // Load the real, approved formula module and the real, generated data file exactly as the
  // production pages do.
  vm.runInContext(read("js/bolt-load-capacity-formulas.js"), sandbox);
  vm.runInContext(read("js/bolt-load-capacity-data.js"), sandbox);

  if (extraInchSizesForTesting) {
    // Test-only synthetic fixture appended to a *copy* of the real inch geometry array, to
    // exercise the "no supported property class for this diameter" rejection path. The
    // production data file on disk is never touched -- this mutates only the in-sandbox copy
    // used for this one test run.
    sandbox.window.BoltLabThreadGeometry = {
      metric: sandbox.window.BoltLabThreadGeometry.metric,
      inch: sandbox.window.BoltLabThreadGeometry.inch.concat(extraInchSizesForTesting),
    };
  }

  // Extract setupBoltLoadCapacityCalculator() verbatim from js/converters.js so this suite can
  // never silently drift from the real production interaction logic.
  const convertersSrc = read("js/converters.js");
  const match = convertersSrc.match(/function setupBoltLoadCapacityCalculator\(\)[\s\S]*?\n  \}\n/);
  assert(match, "could not extract setupBoltLoadCapacityCalculator() from js/converters.js -- has it moved or been renamed?");

  vm.runInContext(
    `
    var propertyClassData = window.BoltLabFastenerPropertyClasses || [];
    var threadGeometryData = window.BoltLabThreadGeometry || { metric: [], inch: [] };
    function byId(id) { return document.getElementById(id); }
    function round(value, decimals) {
      var factor = Math.pow(10, decimals);
      return Math.round(value * factor) / factor;
    }
    ${match[0]}
    setupBoltLoadCapacityCalculator();
    `,
    sandbox
  );

  return { sandbox, registry };
}

function resultText(registry) {
  return registry["blc-result"].innerHTML;
}

// -------------------------------------------------------------------------------------------
// Formula module: exact values against the Phase 2 manufacturer cross-check
// -------------------------------------------------------------------------------------------

test("metric tensile stress area: M10x1.5 matches quoted manufacturer table (58 mm^2)", () => {
  const { sandbox } = buildSandbox();
  const at = sandbox.window.BoltLabFastenerFormulas.metricStressArea(10, 1.5);
  assert(Math.abs(at - 57.99) < 0.01, `expected ~57.99, got ${at}`);
});

test("metric tensile stress area: M8x1.25 matches quoted manufacturer table (36.6 mm^2)", () => {
  const { sandbox } = buildSandbox();
  const at = sandbox.window.BoltLabFastenerFormulas.metricStressArea(8, 1.25);
  assert(Math.abs(at - 36.6) < 0.05, `expected ~36.6, got ${at}`);
});

test("inch tensile stress area: 1/4-20 UNC matches quoted reference table (0.03182 in^2)", () => {
  const { sandbox } = buildSandbox();
  const at = sandbox.window.BoltLabFastenerFormulas.inchStressArea(0.25, 20);
  assert(Math.abs(at - 0.03182) < 0.0001, `expected ~0.03182, got ${at}`);
});

test("inch tensile stress area: 3/8-16 UNC matches quoted reference table (0.07753 in^2)", () => {
  const { sandbox } = buildSandbox();
  const at = sandbox.window.BoltLabFastenerFormulas.inchStressArea(0.375, 16);
  assert(Math.abs(at - 0.07753) < 0.0001, `expected ~0.07753, got ${at}`);
});

test("N -> lbf conversion uses the standard 0.224809 factor", () => {
  const { sandbox } = buildSandbox();
  const lbf = sandbox.window.BoltLabFastenerFormulas.nToLbf(1000);
  assert(Math.abs(lbf - 224.809) < 0.001, `expected ~224.809, got ${lbf}`);
});

test("lbf -> N is the exact inverse of N -> lbf", () => {
  const { sandbox } = buildSandbox();
  const F = sandbox.window.BoltLabFastenerFormulas;
  const roundTrip = F.lbfToN(F.nToLbf(12345.6));
  assert(Math.abs(roundTrip - 12345.6) < 1e-6, `round trip drifted: ${roundTrip}`);
});

test("N -> kg mass-equivalent conversion uses standard gravity (9.80665)", () => {
  const { sandbox } = buildSandbox();
  const kg = sandbox.window.BoltLabFastenerFormulas.nToKg(9.80665);
  assert(Math.abs(kg - 1) < 1e-9, `expected 1 kg for 9.80665 N, got ${kg}`);
});

test("kg -> lb conversion uses the standard 2.20462 factor", () => {
  const { sandbox } = buildSandbox();
  const lb = sandbox.window.BoltLabFastenerFormulas.kgToLb(10);
  assert(Math.abs(lb - 22.0462) < 0.001, `expected ~22.0462, got ${lb}`);
});

// -------------------------------------------------------------------------------------------
// Calculator interaction logic (real setupBoltLoadCapacityCalculator, via DOM stub)
// -------------------------------------------------------------------------------------------

test("calculator: no safety factor entered -> does not calculate, shows validation message", () => {
  const { registry } = buildSandbox();
  const html = resultText(registry);
  assert(/enter a safety factor/i.test(html), `expected safety-factor validation message, got: ${html}`);
  assert(!/Allowable capacity/i.test(html), "calculator produced a result despite no safety factor being entered");
});

test("calculator: safety factor of zero is rejected, does not calculate", () => {
  const { sandbox, registry } = buildSandbox();
  registry["blc-safety-factor"].value = "0";
  registry["blc-safety-factor"].fire("input");
  const html = resultText(registry);
  assert(/enter a safety factor/i.test(html), `expected rejection for sf=0, got: ${html}`);
  assert(!/Allowable capacity/i.test(html), "calculator produced a result despite sf=0");
});

test("calculator: negative safety factor is rejected, does not calculate", () => {
  const { registry } = buildSandbox();
  registry["blc-safety-factor"].value = "-2";
  registry["blc-safety-factor"].fire("input");
  const html = resultText(registry);
  assert(/enter a safety factor/i.test(html), `expected rejection for sf=-2, got: ${html}`);
  assert(!/Allowable capacity/i.test(html), "calculator produced a result despite sf=-2");
});

test("calculator: non-numeric safety factor is rejected, does not calculate", () => {
  const { registry } = buildSandbox();
  registry["blc-safety-factor"].value = "abc";
  registry["blc-safety-factor"].fire("input");
  const html = resultText(registry);
  assert(/enter a safety factor/i.test(html), `expected rejection for sf="abc", got: ${html}`);
  assert(!/Allowable capacity/i.test(html), "calculator produced a result despite sf='abc'");
});

test("calculator: valid metric M10x1.5 / class 8.8 / SF=4 produces correct N, lbf, and mass-equivalent", () => {
  const { sandbox, registry } = buildSandbox();
  const F = sandbox.window.BoltLabFastenerFormulas;
  const metricSizes = sandbox.window.BoltLabThreadGeometry.metric;
  const idx = metricSizes.findIndex((s) => s.designation === "M10x1.5");
  assert(idx >= 0, "M10x1.5 not found in generated thread geometry -- has the data layer changed?");

  registry["blc-size"].value = String(idx);
  registry["blc-size"].fire("change");

  const grade = sandbox.window.BoltLabFastenerPropertyClasses.find((c) => c.id === "iso_8_8_le16");
  assert(grade, "iso_8_8_le16 not present in generated data");
  registry["blc-grade"].value = "iso_8_8_le16";
  registry["blc-grade"].fire("change");

  registry["blc-safety-factor"].value = "4";
  registry["blc-safety-factor"].fire("input");

  const html = resultText(registry);
  const at = F.metricStressArea(10, 1.5);
  const proofN = grade.proofStrength * at;
  const allowableN = proofN / 4;
  const allowableLbf = F.nToLbf(allowableN);
  const massKg = F.nToKg(allowableN);
  const massLb = F.kgToLb(massKg);

  function round(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  assert(html.includes(`${round(allowableN, 1)} N`), `expected allowable capacity ${round(allowableN, 1)} N in result, got: ${html}`);
  assert(html.includes(`${round(allowableLbf, 1)} lbf`), `expected allowable capacity ${round(allowableLbf, 1)} lbf in result, got: ${html}`);
  assert(html.includes(`${round(massKg, 2)} kg`), `expected mass equivalent ${round(massKg, 2)} kg in result, got: ${html}`);
  assert(html.includes(`${round(massLb, 2)} lb`), `expected mass equivalent ${round(massLb, 2)} lb in result, got: ${html}`);
});

test("calculator: mass equivalent is explicitly labeled and distinguished from force, never presented as force", () => {
  const { registry } = buildSandbox();
  registry["blc-size"].value = "5"; // M10x1.5 by generation order
  registry["blc-size"].fire("change");
  registry["blc-grade"].value = "iso_8_8_le16";
  registry["blc-grade"].fire("change");
  registry["blc-safety-factor"].value = "4";
  registry["blc-safety-factor"].fire("input");

  const html = resultText(registry);
  assert(/Mass equivalent/i.test(html), "result does not contain a 'Mass equivalent' label");
  assert(/not a force/i.test(html), "mass equivalent is not explicitly distinguished from force");
});

test("calculator: unsupported property-class/diameter combination is rejected, does not calculate", () => {
  // Synthetic inch size at 5.0in -- outside every SAE grade's diameter range (max 1.5in) in the
  // publication-ready dataset. Exercises the real diameter-gating predicate with a real
  // out-of-range diameter, without altering any file on disk.
  const { registry, sandbox } = buildSandbox([{ designation: "5-TEST-SYNTHETIC", diameterIn: 5.0, threadsPerInch: 8, series: "UNC" }]);
  registry["blc-system"].value = "inch";
  registry["blc-system"].fire("change");

  const inchSizes = sandbox.window.BoltLabThreadGeometry.inch;
  const idx = inchSizes.findIndex((s) => s.designation === "5-TEST-SYNTHETIC");
  assert(idx >= 0, "synthetic test fixture not present after buildSandbox injection");
  registry["blc-size"].value = String(idx);
  registry["blc-size"].fire("change");

  const html = resultText(registry);
  assert(/No supported property class for this size/i.test(html), `expected unsupported-combination message, got: ${html}`);
  assert(!/Allowable capacity/i.test(html), "calculator produced a result for an out-of-range diameter");
});

test("calculator: N and lbf outputs are internally consistent (lbf = N x 0.224809) for the primary result", () => {
  const { registry } = buildSandbox();
  registry["blc-size"].value = "5";
  registry["blc-size"].fire("change");
  registry["blc-grade"].value = "iso_10_9";
  registry["blc-grade"].fire("change");
  registry["blc-safety-factor"].value = "3.5";
  registry["blc-safety-factor"].fire("input");

  const html = resultText(registry);
  const m = html.match(/Allowable capacity[^:]*:<\/strong>\s*([\d.]+)\s*N\s*\(\s*([\d.]+)\s*lbf\)/);
  assert(m, `could not locate allowable-capacity N/lbf pair in result: ${html}`);
  const n = parseFloat(m[1]);
  const lbf = parseFloat(m[2]);
  assert(Math.abs(lbf - n * 0.224809) < 1, `lbf value ${lbf} inconsistent with N value ${n} (expected ~${(n * 0.224809).toFixed(1)})`);
});

let failed = 0;
console.log("BOLT LOAD CAPACITY -- DETERMINISTIC NUMERIC TEST SUITE");
console.log("========================================================");
for (const t of tests) {
  try {
    t.fn();
    console.log(`[PASS] ${t.name}`);
  } catch (e) {
    failed++;
    console.log(`[FAIL] ${t.name} -- ${e.message}`);
  }
}
console.log("");
console.log(`${tests.length - failed}/${tests.length} tests passed.`);
if (failed) {
  process.exitCode = 1;
} else {
  console.log("BOLT LOAD CAPACITY TEST SUITE: ALL TESTS PASSED");
}
