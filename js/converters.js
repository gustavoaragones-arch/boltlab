(function initBoltLabConverters() {
  "use strict";

  var data = window.BoltLabData || {};
  var threadData = window.BoltLabThreadData || [];
  var torqueData = window.BoltLabTorqueData || {};
  var weightData = window.BoltLabWeightData || {};
  var drillData = window.BoltLabDrillData || [];

  function byId(id) {
    return document.getElementById(id);
  }

  function round(value, decimals) {
    var factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  function toMmFromDiameter(value, unit) {
    return unit === "inches" ? value * 25.4 : value;
  }

  function toPitchMm(value, unit) {
    if (unit === "tpi") return 25.4 / value;
    return value;
  }

  function parseFractionToDecimal(value) {
    var clean = String(value).replace(/"/g, "").trim();
    if (clean.indexOf("/") === -1) return parseFloat(clean);
    var parts = clean.split("/");
    if (parts.length !== 2) return NaN;
    var numerator = parseFloat(parts[0]);
    var denominator = parseFloat(parts[1]);
    if (!denominator) return NaN;
    return numerator / denominator;
  }

  function findNearestByKey(entries, key, target) {
    if (!entries.length) return null;
    return entries.reduce(function (closest, current) {
      if (!closest) return current;
      var currentDelta = Math.abs(current[key] - target);
      var closestDelta = Math.abs(closest[key] - target);
      return currentDelta < closestDelta ? current : closest;
    }, null);
  }

  function setupMetricImperialConverter() {
    var directionEl = byId("conversion-direction");
    var sizeEl = byId("screw-size");
    var resultEl = byId("metric-imperial-result");
    if (!directionEl || !sizeEl || !resultEl) return;

    function updateSizeOptions() {
      var direction = directionEl.value;
      var sourceMap =
        direction === "metric-to-imperial"
          ? data.metricToImperial || {}
          : data.imperialToMetric || {};
      var keys = Object.keys(sourceMap);
      sizeEl.innerHTML = "";

      keys.forEach(function (key) {
        var opt = document.createElement("option");
        opt.value = key;
        opt.textContent = key;
        sizeEl.appendChild(opt);
      });
    }

    function updateResult() {
      var direction = directionEl.value;
      var input = sizeEl.value;
      if (!input) {
        resultEl.innerHTML = "<p>Select a screw size to begin.</p>";
        return;
      }

      if (direction === "metric-to-imperial") {
        var imperial = (data.metricToImperial || {})[input] || "N/A";
        resultEl.innerHTML =
          "<p><strong>" + input + "</strong> is closest to <strong>" + imperial + "</strong>.</p>";
      } else {
        var metric = (data.imperialToMetric || {})[input] || "N/A";
        resultEl.innerHTML =
          "<p><strong>" + input + "</strong> is closest to <strong>" + metric + "</strong>.</p>";
      }
    }

    directionEl.addEventListener("change", function () {
      updateSizeOptions();
      updateResult();
    });
    sizeEl.addEventListener("change", updateResult);

    updateSizeOptions();
    updateResult();
  }

  function setupPitchTpiConverter() {
    var modeEl = byId("pitch-mode");
    var inputEl = byId("pitch-value");
    var resultEl = byId("pitch-result");
    if (!modeEl || !inputEl || !resultEl) return;

    function updateResult() {
      var mode = modeEl.value;
      var value = parseFloat(inputEl.value);
      if (!inputEl.value || Number.isNaN(value) || value <= 0) {
        resultEl.innerHTML = "<p>Enter a positive value to convert.</p>";
        return;
      }

      if (mode === "pitch-to-tpi") {
        var tpi = round(25.4 / value, 2);
        resultEl.innerHTML =
          "<p><strong>" +
          value +
          " mm pitch</strong> is <strong>" +
          tpi +
          " TPI</strong>.</p>";
      } else {
        var pitch = round(25.4 / value, 3);
        resultEl.innerHTML =
          "<p><strong>" + value + " TPI</strong> is <strong>" + pitch + " mm pitch</strong>.</p>";
      }
    }

    modeEl.addEventListener("change", updateResult);
    inputEl.addEventListener("input", updateResult);
    updateResult();
  }

  function setupTapDrillCalculator() {
    var sizeEl = byId("tap-size");
    var pitchEl = byId("tap-pitch");
    var resultEl = byId("tap-result");
    if (!sizeEl || !pitchEl || !resultEl) return;

    var entries = data.tapDrill || {};

    function updateResult() {
      var size = sizeEl.value;
      var customPitch = parseFloat(pitchEl.value);
      var base = entries[size];
      if (!base) {
        resultEl.innerHTML = "<p>Select a thread size.</p>";
        return;
      }

      var pitch = Number.isFinite(customPitch) && customPitch > 0 ? customPitch : base.coarsePitchMm;
      var drill = round(parseFloat(size.replace("M", "")) - pitch, 2);
      resultEl.innerHTML =
        "<p>Recommended tap drill for <strong>" +
        size +
        " x " +
        pitch +
        "</strong> is <strong>" +
        drill +
        " mm</strong>.</p>" +
        "<p class='muted'>Formula: major diameter - pitch. Coarse reference: " +
        base.tapDrillMm +
        " mm.</p>";
    }

    sizeEl.addEventListener("change", updateResult);
    pitchEl.addEventListener("input", updateResult);
    updateResult();
  }

  function setupThreadIdentifier() {
    var diameterEl = byId("thread-diameter");
    var diameterUnitEl = byId("thread-diameter-unit");
    var pitchEl = byId("thread-pitch");
    var pitchUnitEl = byId("thread-pitch-unit");
    var resultEl = byId("thread-identifier-result");

    if (!diameterEl || !diameterUnitEl || !pitchEl || !pitchUnitEl || !resultEl) return;

    function buildMatchMarkup(match) {
      var pitchMm = round(match.pitchMm, 3);
      var tpi = round(25.4 / match.pitchMm, 2);
      var diameterMm = round(match.diameterMm, 3);
      var diameterIn = round(match.diameterMm / 25.4, 4);

      return (
        "<article class='card'>" +
        "<h3>" + match.name + "</h3>" +
        "<p><strong>Diameter:</strong> " + diameterMm + " mm (" + diameterIn + " in)</p>" +
        "<p><strong>Pitch:</strong> " + pitchMm + " mm (" + tpi + " TPI)</p>" +
        "</article>"
      );
    }

    function updateResult() {
      var diameter = parseFloat(diameterEl.value);
      var pitch = parseFloat(pitchEl.value);
      if (!diameterEl.value || !pitchEl.value || Number.isNaN(diameter) || Number.isNaN(pitch) || diameter <= 0 || pitch <= 0) {
        resultEl.innerHTML = "<p>Enter diameter and pitch values to identify likely thread standards.</p>";
        return;
      }

      var diameterMmInput = toMmFromDiameter(diameter, diameterUnitEl.value);
      var pitchMmInput = toPitchMm(pitch, pitchUnitEl.value);
      var diameterTolerance = 0.05;
      var pitchTolerance = 0.05;

      var matches = threadData.filter(function (thread) {
        var diameterDelta = Math.abs(diameterMmInput - thread.diameterMm) / thread.diameterMm;
        var pitchDelta = Math.abs(pitchMmInput - thread.pitchMm) / thread.pitchMm;
        return diameterDelta <= diameterTolerance && pitchDelta <= pitchTolerance;
      });

      if (matches.length === 0) {
        resultEl.innerHTML =
          "<p><strong>No direct match within ±5% tolerance.</strong></p>" +
          "<p class='muted'>Try re-checking caliper measurement, pitch gauge reading, or switching pitch unit between mm and TPI.</p>";
        return;
      }

      var items = matches.map(buildMatchMarkup).join("");
      resultEl.innerHTML =
        "<p><strong>Possible thread matches (" + matches.length + "):</strong></p>" +
        "<div class='grid'>" + items + "</div>";
    }

    diameterEl.addEventListener("input", updateResult);
    diameterUnitEl.addEventListener("change", updateResult);
    pitchEl.addEventListener("input", updateResult);
    pitchUnitEl.addEventListener("change", updateResult);
    updateResult();
  }

  function setupBoltTorqueCalculator() {
    var sizeEl = byId("torque-size");
    var gradeEl = byId("torque-grade");
    var lubricationEl = byId("torque-lubrication");
    var resultEl = byId("torque-result");

    if (!sizeEl || !gradeEl || !lubricationEl || !resultEl) return;

    function updateResult() {
      var size = sizeEl.value;
      var grade = gradeEl.value;
      var lubrication = lubricationEl.value;
      var sizeData = torqueData[size] || {};
      var row = sizeData[grade];

      if (!row) {
        resultEl.innerHTML =
          "<p><strong>No torque value for that combination.</strong></p>" +
          "<p class='muted'>Try a different bolt size or grade.</p>";
        return;
      }

      var nm = lubrication === "oiled" ? row.oiledNm : row.dryNm;
      var ftLb = round(nm * 0.737562, 2);

      resultEl.innerHTML =
        "<p><strong>Recommended torque:</strong></p>" +
        "<p><strong>Torque Nm:</strong> " + nm + " Nm</p>" +
        "<p><strong>Torque ft-lb:</strong> " + ftLb + " ft-lb</p>";
    }

    sizeEl.addEventListener("change", updateResult);
    gradeEl.addEventListener("change", updateResult);
    lubricationEl.addEventListener("change", updateResult);
    updateResult();
  }

  function setupFastenerWeightCalculator() {
    var sizeEl = byId("weight-size");
    var lengthEl = byId("weight-length");
    var quantityEl = byId("weight-quantity");
    var materialEl = byId("weight-material");
    var resultEl = byId("weight-result");

    if (!sizeEl || !lengthEl || !quantityEl || !materialEl || !resultEl) return;

    function updateResult() {
      var size = sizeEl.value;
      var lengthMm = parseFloat(lengthEl.value);
      var quantity = parseFloat(quantityEl.value);
      var material = materialEl.value;

      if (!lengthEl.value || !quantityEl.value || Number.isNaN(lengthMm) || Number.isNaN(quantity) || lengthMm <= 0 || quantity <= 0) {
        resultEl.innerHTML = "<p>Enter bolt length and quantity to estimate total weight.</p>";
        return;
      }

      var perMmBySize = weightData[size] || {};
      var gramsPerMm = perMmBySize[material];

      if (!gramsPerMm) {
        resultEl.innerHTML =
          "<p><strong>Weight data unavailable for that selection.</strong></p>" +
          "<p class='muted'>Try a different size or material.</p>";
        return;
      }

      var gramsPerBolt = gramsPerMm * lengthMm;
      var totalGrams = gramsPerBolt * quantity;
      var totalKg = totalGrams / 1000;
      var totalLbs = totalKg * 2.20462;

      resultEl.innerHTML =
        "<p><strong>Weight per bolt:</strong> " + round(gramsPerBolt, 2) + " g</p>" +
        "<p><strong>Total weight:</strong></p>" +
        "<p><strong>kg:</strong> " + round(totalKg, 3) + " kg</p>" +
        "<p><strong>lbs:</strong> " + round(totalLbs, 3) + " lbs</p>";
    }

    sizeEl.addEventListener("change", updateResult);
    lengthEl.addEventListener("input", updateResult);
    quantityEl.addEventListener("input", updateResult);
    materialEl.addEventListener("change", updateResult);
    updateResult();
  }

  function setupDrillBitConverter() {
    var inputEl = byId("drill-size-input");
    var typeEl = byId("drill-size-type");
    var resultEl = byId("drill-result");

    if (!inputEl || !typeEl || !resultEl) return;

    function formatCell(value) {
      return value ? value : "-";
    }

    function renderResult(match) {
      resultEl.innerHTML =
        "<div class='result-grid'>" +
        "<p><strong>Number:</strong> " + formatCell(match.number) + "</p>" +
        "<p><strong>Letter:</strong> " + formatCell(match.letter) + "</p>" +
        "<p><strong>Inches:</strong> " + round(match.inches, 3) + "</p>" +
        "<p><strong>Millimeters:</strong> " + round(match.mm, 2) + " mm</p>" +
        "</div>";
    }

    function updateResult() {
      var rawInput = String(inputEl.value || "").trim();
      var type = typeEl.value;
      var match = null;

      if (!rawInput) {
        resultEl.innerHTML = "<p>Enter a drill bit size to convert.</p>";
        return;
      }

      if (type === "number") {
        var normalizedNumber = rawInput.startsWith("#") ? rawInput.toUpperCase() : ("#" + rawInput.toUpperCase());
        match = drillData.find(function (entry) {
          return entry.number && entry.number.toUpperCase() === normalizedNumber;
        });
      } else if (type === "letter") {
        var normalizedLetter = rawInput.toUpperCase();
        match = drillData.find(function (entry) {
          return entry.letter && entry.letter.toUpperCase() === normalizedLetter;
        });
      } else if (type === "fractional-inch") {
        var normalizedFraction = rawInput.replace(/"/g, "").replace(/\s+/g, "");
        match = drillData.find(function (entry) {
          return entry.fractional && entry.fractional.replace(/\s+/g, "") === normalizedFraction;
        });

        if (!match) {
          var inchValue = parseFractionToDecimal(rawInput);
          if (Number.isFinite(inchValue) && inchValue > 0) {
            match = findNearestByKey(drillData, "inches", inchValue);
          }
        }
      } else if (type === "millimeter") {
        var mmValue = parseFloat(rawInput);
        if (Number.isFinite(mmValue) && mmValue > 0) {
          match = findNearestByKey(drillData, "mm", mmValue);
        }
      }

      if (!match) {
        resultEl.innerHTML =
          "<p><strong>No match found.</strong></p>" +
          "<p class='muted'>Try a valid number (#7), letter (F), fractional inch (13/64), or millimeter value.</p>";
        return;
      }

      renderResult(match);
    }

    inputEl.addEventListener("input", updateResult);
    typeEl.addEventListener("change", updateResult);
    updateResult();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMetricImperialConverter();
    setupPitchTpiConverter();
    setupTapDrillCalculator();
    setupThreadIdentifier();
    setupBoltTorqueCalculator();
    setupFastenerWeightCalculator();
    setupDrillBitConverter();
  });
})();
