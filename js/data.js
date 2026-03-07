/* Shared lookup tables for BoltLab tools */
window.BoltLabData = {
  metricToImperial: {
    M2: "#2-56",
    M3: "#4-40",
    M4: "#8-32",
    M5: "#10-24",
    M6: "1/4-20",
    M8: "5/16-18",
    M10: "3/8-16",
    M12: "1/2-13"
  },
  imperialToMetric: {
    "#2-56": "M2",
    "#4-40": "M3",
    "#8-32": "M4",
    "#10-24": "M5",
    "1/4-20": "M6",
    "5/16-18": "M8",
    "3/8-16": "M10",
    "1/2-13": "M12"
  },
  tapDrill: {
    M3: { coarsePitchMm: 0.5, tapDrillMm: 2.5 },
    M4: { coarsePitchMm: 0.7, tapDrillMm: 3.3 },
    M5: { coarsePitchMm: 0.8, tapDrillMm: 4.2 },
    M6: { coarsePitchMm: 1.0, tapDrillMm: 5.0 },
    M8: { coarsePitchMm: 1.25, tapDrillMm: 6.8 },
    M10: { coarsePitchMm: 1.5, tapDrillMm: 8.5 }
  }
};
