/* Shared, hand-authored formula functions for the Bolt Load Capacity Calculator and every
 * static example shown on the Fastener Property Classes, Tensile Stress Area, Bolt Load
 * Capacity Basics, and M8/M10/M12 pages. Every page that shows a worked example loads this
 * file and calls these same functions, so a displayed example can never silently drift from
 * what the calculator itself would compute. See audit/fastener-load-strength/PHASE-2-SOURCING-DATASET.md
 * Sections 6-7 for the formulas' sourcing.
 */
window.BoltLabFastenerFormulas = {
  /** At = 0.7854 x (D - 0.938194 x P)^2, D and P in mm, result in mm^2. */
  metricStressArea: function (nominalDiameterMm, pitchMm) {
    return 0.7854 * Math.pow(nominalDiameterMm - 0.938194 * pitchMm, 2);
  },
  /** At = 0.7854 x (D - 0.9743 / n)^2, D in inches, n = threads per inch, result in in^2. */
  inchStressArea: function (nominalDiameterIn, threadsPerInch) {
    return 0.7854 * Math.pow(nominalDiameterIn - 0.9743 / threadsPerInch, 2);
  },
  nToLbf: function (n) {
    return n * 0.224809;
  },
  lbfToN: function (lbf) {
    return lbf / 0.224809;
  },
  nToKg: function (n) {
    return n / 9.80665;
  },
  kgToLb: function (kg) {
    return kg * 2.20462;
  },
};
