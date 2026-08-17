# Tapping Atlas Validation Report

- Status: pass
- Errors: 0
- Warnings: 0

## Expected Values (derived from the T3 projection, not hard-coded)

```json
{
  "total": 29,
  "metric": 14,
  "unc": 8,
  "unf": 7,
  "tapDrillVerified": 9,
  "tapDrillSourceBound": 20,
  "recordStatusVerified": 0,
  "recordStatusSourceBound": 29,
  "isoAltCount": 15,
  "isoAltOnlyUncUnf": true,
  "tapTypeCount": 7,
  "designations": [
    "#10-24 UNC",
    "#10-32 UNF",
    "#4-40 UNC",
    "#6-32 UNC",
    "#6-40 UNF",
    "#8-32 UNC",
    "#8-36 UNF",
    "1/2-13 UNC",
    "1/2-20 UNF",
    "1/4-20 UNC",
    "1/4-28 UNF",
    "3/8-16 UNC",
    "3/8-24 UNF",
    "5/16-18 UNC",
    "5/16-24 UNF",
    "M10x1.25",
    "M10x1.5",
    "M12x1.25",
    "M12x1.75",
    "M16x1.5",
    "M16x2.0",
    "M20x2.0",
    "M20x2.5",
    "M3x0.5",
    "M4x0.7",
    "M5x0.8",
    "M6x1",
    "M8x1.0",
    "M8x1.25"
  ]
}
```

## Checks

### Data Quality Panel Matches Projection
- Status: pass

### Card-Level Verification States Match Projection
- Status: pass

### Field-Level vs Record-Level Status Distinction Present
- Status: pass

### No Unsupported Engagement Recommendation
- Status: pass

### CSV Matches Projection
- Status: pass

### HTML Cards Match Projection
- Status: pass

### FAQ Identity Match (JSON-LD vs Visible)
- Status: pass

### JSON-LD Parses and Required Types Present
- Status: pass

### No .html Internal Hrefs
- Status: pass

### Internal Links Resolve
- Status: pass

### Tap-Type Evidence Completeness (All 4 Classifications Rendered)
- Status: pass

### NASA-STD-5020A Verified Bottoming-Tap Fact Present
- Status: pass

### Inline Script Is Valid JavaScript (node --check)
- Status: pass

