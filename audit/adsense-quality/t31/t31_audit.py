#!/usr/bin/env python3
"""
T31 -- Residual Quality Risk Forensic Audit: AUDIT-ONLY analysis script.

This script performs read-only inspection of the BoltLab repository to gather
quantitative evidence for the T31 audit report. It does not modify any file.
Run from repo root: python3 audit/adsense-quality/t31/t31_audit.py
Output: audit/adsense-quality/t31/t31_raw_evidence.json (audit evidence only,
not a production artifact).
"""
from __future__ import annotations

import glob
import json
import re
import subprocess
from collections import Counter
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
import os
os.chdir(ROOT)

NUM_RE = re.compile(r"\d+([.,]\d+)?")


def read(p: str) -> str:
    return Path(p).read_text(encoding="utf-8")


def norm_digits(text: str) -> str:
    text = re.sub(r"<script[\s\S]*?</script>", "", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = NUM_RE.sub("#", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, norm_digits(a), norm_digits(b)).ratio()


def main_words(html: str) -> int:
    """Word count of the page's <main> content (nav/breadcrumb noise is small and
    consistent across pages, so left in rather than risk under-matching nested
    <article> structures used on some reference pages, e.g. thread-types.html's
    <article class="ref-card"> grid, which a naive first-</article> match would
    truncate). Ad-container/related-links/footer boilerplate is excluded."""
    html = re.sub(r"<script[\s\S]*?</script>", "", html)
    m = re.search(r"<main[^>]*>(.*?)</main>", html, re.S)
    frag = m.group(1) if m else html
    # cut at the first ad-container or related-links marker, whichever comes first
    for marker in ('<div class="ad-container">', '<div id="related-links"'):
        idx = frag.find(marker)
        if idx != -1:
            frag = frag[:idx]
    frag = re.sub(r"<[^>]+>", " ", frag)
    frag = re.sub(r"\s+", " ", frag).strip()
    return len(frag.split())


def all_html_files() -> list[str]:
    files = glob.glob("**/*.html", recursive=True)
    return sorted(f for f in files if not f.startswith("node_modules/"))


def links_out(html: str) -> list[str]:
    return re.findall(r'href="(/[^"#]*)"', html)


def has_faqpage(html: str) -> bool:
    return "FAQPage" in html


def has_breadcrumblist(html: str) -> bool:
    return "BreadcrumbList" in html


def canonical_of(html: str) -> str | None:
    m = re.search(r'<link rel="canonical" href="([^"]+)">', html)
    return m.group(1) if m else None


def is_noindex(html: str) -> bool:
    return bool(re.search(r'<meta[^>]*name="robots"[^>]*noindex', html, re.I))


def git_log_dates(path: str, n: int = 1) -> list[str]:
    r = subprocess.run(
        ["git", "log", f"-{n}", "--format=%ad", "--date=short", "--", path],
        capture_output=True, text=True,
    )
    return [l for l in r.stdout.splitlines() if l]


# ---------------------------------------------------------------------------
# Q1: Residual tap-drill audit
# ---------------------------------------------------------------------------

ATLAS_SIZES = {3, 4, 5, 6, 8, 10, 12, 16, 20}


def tap_drill_diameter_from_page(html: str) -> float | None:
    """Read the actual stated tap-drill diameter directly from the page's own
    Specifications table, rather than trusting a hand-maintained constant."""
    m = re.search(r"Typical tap drill \(coarse\)</td><td>([0-9.]+) mm", html)
    return float(m.group(1)) if m else None


metric_tapping_seed = json.loads(read("data/datasets/metric_tapping.seed.json"))
tapping_designations = json.dumps(metric_tapping_seed)


def dataset_covers(n: int) -> bool:
    return bool(re.search(rf'"M{n}x', tapping_designations))


sitemap = read("sitemap.xml")
tap_drill_pages = sorted(
    glob.glob("sizes/m*-tap-drill.html"),
    key=lambda p: int(re.search(r"m(\d+)-tap-drill", p).group(1)),
)

tap_drill_records = []
tap_drill_html = {}
for p in tap_drill_pages:
    n = int(re.search(r"m(\d+)-tap-drill", p).group(1))
    html = read(p)
    tap_drill_html[p] = html
    url = f"https://boltlab.io/sizes/m{n}-tap-drill"
    rec = {
        "path": p,
        "url": f"/sizes/m{n}-tap-drill",
        "metric_size": f"M{n}",
        "tap_drill_diameter_mm": tap_drill_diameter_from_page(html),
        "diameter_in_tapping_dataset": dataset_covers(n),
        "in_atlas_sizes_constant": n in ATLAS_SIZES,
        "links_to_tapping_atlas": '/reference/tapping-atlas"' in html,
        "links_to_tapping_evidence": '/reference/tapping-evidence"' in html,
        "links_to_data_methodology": '/reference/data-methodology"' in html,
        "links_to_tapping_workflow": '/tools/tapping-workflow"' in html,
        "links_to_tap_drill_calculator": '/tools/tap-drill-calculator"' in html,
        "word_count_article": main_words(html),
        "has_atlas_note_section": "Verified in BoltLab's Tapping Atlas" in html,
        "faqpage_schema": has_faqpage(html),
        "breadcrumblist_schema": has_breadcrumblist(html),
        "canonical": canonical_of(html),
        "canonical_self_referencing": canonical_of(html) == url,
        "noindex": is_noindex(html),
        "in_sitemap": f">{url}<" in sitemap,
    }
    tap_drill_records.append(rec)

# pairwise similarity matrix
pairs = []
paths = [r["path"] for r in tap_drill_records]
for i in range(len(paths)):
    for j in range(i + 1, len(paths)):
        s = similarity(tap_drill_html[paths[i]], tap_drill_html[paths[j]])
        pairs.append({"a": paths[i], "b": paths[j], "similarity": round(s, 4)})

sims = [p["similarity"] for p in pairs]
sims_sorted = sorted(sims)


def median(lst):
    n = len(lst)
    if n == 0:
        return None
    mid = n // 2
    if n % 2:
        return lst[mid]
    return (lst[mid - 1] + lst[mid]) / 2


top_pairs = sorted(pairs, key=lambda p: -p["similarity"])[:15]


def group_stats(group_paths):
    gsims = []
    for i in range(len(group_paths)):
        for j in range(i + 1, len(group_paths)):
            gsims.append(similarity(tap_drill_html[group_paths[i]], tap_drill_html[group_paths[j]]))
    if not gsims:
        return None
    gsims.sort()
    return {
        "pair_count": len(gsims),
        "min": round(min(gsims), 4),
        "max": round(max(gsims), 4),
        "mean": round(sum(gsims) / len(gsims), 4),
        "median": round(median(gsims), 4),
    }


atlas_paths = [r["path"] for r in tap_drill_records if r["in_atlas_sizes_constant"]]
non_atlas_paths = [r["path"] for r in tap_drill_records if not r["in_atlas_sizes_constant"]]
cross_sims = [
    similarity(tap_drill_html[a], tap_drill_html[b])
    for a in atlas_paths
    for b in non_atlas_paths
]
cross_sims_sorted = sorted(cross_sims)

q1_subgroup_similarity = {
    "within_atlas_covered_9_pages": group_stats(atlas_paths),
    "within_non_atlas_9_pages": group_stats(non_atlas_paths),
    "cross_group_atlas_vs_non_atlas": {
        "pair_count": len(cross_sims),
        "min": round(min(cross_sims_sorted), 4),
        "max": round(max(cross_sims_sorted), 4),
        "mean": round(sum(cross_sims_sorted) / len(cross_sims_sorted), 4),
        "median": round(median(cross_sims_sorted), 4),
    },
    "interpretation": (
        "The Atlas cross-link note added in T28 differentiates the atlas-covered subgroup "
        "from the non-atlas subgroup (cross-group mean ~0.91), but does NOT differentiate "
        "pages within either subgroup from each other (within-group means ~0.99-1.00). "
        "The non-atlas 9-page subgroup remains exactly as digit-normalized-uniform as the "
        "original pre-T28 90-page finding, just at 1/10th the scale."
    ),
}

q1_similarity = {
    "page_count": len(tap_drill_records),
    "pair_count": len(pairs),
    "min_similarity": round(min(sims), 4) if sims else None,
    "max_similarity": round(max(sims), 4) if sims else None,
    "mean_similarity": round(sum(sims) / len(sims), 4) if sims else None,
    "median_similarity": round(median(sims_sorted), 4) if sims else None,
    "pairs_above_0_90": sum(1 for s in sims if s > 0.90),
    "pairs_above_0_95": sum(1 for s in sims if s > 0.95),
    "pairs_above_0_98": sum(1 for s in sims if s > 0.98),
    "pairs_above_0_99": sum(1 for s in sims if s > 0.99),
    "pairs_at_or_above_0_999": sum(1 for s in sims if s >= 0.999),
    "top_15_highest_similarity_pairs": top_pairs,
}

# link mesh from tap-drill pages specifically, to first-party assets
tap_drill_outbound_to_assets = Counter()
for r in tap_drill_records:
    html = tap_drill_html[r["path"]]
    for target in [
        "/reference/tapping-atlas",
        "/reference/tap-type-guide",
        "/reference/tapping-evidence",
        "/reference/data-methodology",
        "/tools/tapping-workflow",
        "/tools/tap-drill-calculator",
    ]:
        if f'href="{target}"' in html:
            tap_drill_outbound_to_assets[target] += 1

q1 = {
    "per_page": tap_drill_records,
    "similarity": q1_similarity,
    "subgroup_similarity": q1_subgroup_similarity,
    "outbound_link_counts_to_first_party_assets": dict(tap_drill_outbound_to_assets),
    "atlas_covered_count": sum(1 for r in tap_drill_records if r["diameter_in_tapping_dataset"]),
    "non_atlas_covered_count": sum(1 for r in tap_drill_records if not r["diameter_in_tapping_dataset"]),
}

# ---------------------------------------------------------------------------
# Q2: 6g-vs-6h reciprocal pair
# ---------------------------------------------------------------------------

p_a, p_b = "reference/6g-vs-6h.html", "reference/6h-vs-6g.html"
exists_a, exists_b = Path(p_a).exists(), Path(p_b).exists()
html_a, html_b = (read(p_a) if exists_a else ""), (read(p_b) if exists_b else "")

q2 = {
    "url_a": "/reference/6g-vs-6h",
    "url_b": "/reference/6h-vs-6g",
    "both_exist": exists_a and exists_b,
    "noindex_a": is_noindex(html_a),
    "noindex_b": is_noindex(html_b),
    "in_sitemap_a": ">https://boltlab.io/reference/6g-vs-6h<" in sitemap,
    "in_sitemap_b": ">https://boltlab.io/reference/6h-vs-6g<" in sitemap,
    "canonical_a": canonical_of(html_a),
    "canonical_b": canonical_of(html_b),
    "canonical_a_self_referencing": canonical_of(html_a) == "https://boltlab.io/reference/6g-vs-6h",
    "canonical_b_self_referencing": canonical_of(html_b) == "https://boltlab.io/reference/6h-vs-6g",
    "digit_and_label_normalized_similarity": round(
        SequenceMatcher(
            None,
            re.sub(r"6[gGhH]\b", "X", norm_digits(html_a)),
            re.sub(r"6[gGhH]\b", "X", norm_digits(html_b)),
        ).ratio(), 4
    ) if exists_a and exists_b else None,
    "raw_digit_normalized_similarity": round(similarity(html_a, html_b), 4) if exists_a and exists_b else None,
    "word_count_a": main_words(html_a) if exists_a else None,
    "word_count_b": main_words(html_b) if exists_b else None,
    "linked_from_a_to_b": f'href="/reference/6h-vs-6g"' in html_a,
    "linked_from_b_to_a": f'href="/reference/6g-vs-6h"' in html_b,
    "inbound_internal_links_to_a": sum(
        1 for f in all_html_files() if f != p_a and f'href="/reference/6g-vs-6h"' in read(f)
    ),
    "inbound_internal_links_to_b": sum(
        1 for f in all_html_files() if f != p_b and f'href="/reference/6h-vs-6g"' in read(f)
    ),
}

# ---------------------------------------------------------------------------
# Q3: Guide / reference differentiation
# ---------------------------------------------------------------------------

guide_files = sorted(glob.glob("guides/*.html"))
guide_files = [f for f in guide_files if not f.endswith("index.html")]
ref_files = sorted(glob.glob("reference/*.html"))
ref_concept_files = [
    f for f in ref_files
    if f
    not in (
        "reference/index.html",
        "reference/tapping-atlas.html",
        "reference/tap-type-guide.html",
        "reference/tapping-evidence.html",
        "reference/data-methodology.html",
    )
]

all_files = all_html_files()


def inbound_count(target_url_path: str) -> int:
    n = 0
    for f in all_files:
        html = read(f)
        if f'href="{target_url_path}"' in html:
            n += 1
    return n


def last_reviewed_present(html: str) -> bool:
    return bool(re.search(r"last\s*(reviewed|updated)", html, re.I))


def page_record(f: str, category: str) -> dict:
    html = read(f)
    url = "/" + f[:-5]
    outbound = links_out(html)
    internal_outbound = [l for l in outbound if not l.startswith("//")]
    return {
        "path": f,
        "category": category,
        "word_count_article": main_words(html),
        "outbound_internal_links": len(internal_outbound),
        "inbound_internal_links": inbound_count(url),
        "faqpage_schema": has_faqpage(html),
        "breadcrumblist_schema": has_breadcrumblist(html),
        "canonical": canonical_of(html),
        "canonical_self_referencing": canonical_of(html) == f"https://boltlab.io{url}",
        "in_sitemap": f">https://boltlab.io{url}<" in sitemap,
        "last_reviewed_visible": last_reviewed_present(html),
        "links_to_tapping_domain": any(
            f'href="{t}"' in html
            for t in (
                "/reference/tapping-atlas",
                "/reference/tap-type-guide",
                "/reference/tapping-evidence",
                "/tools/tapping-workflow",
            )
        ),
    }


guide_records = [page_record(f, "guide") for f in guide_files]
ref_records = [page_record(f, "reference-concept") for f in ref_concept_files]

guide_word_counts = sorted(r["word_count_article"] for r in guide_records)
ref_word_counts = sorted(r["word_count_article"] for r in ref_records)

q3 = {
    "guide_count": len(guide_records),
    "reference_concept_count": len(ref_records),
    "guide_median_words": median(guide_word_counts),
    "reference_median_words": median(ref_word_counts),
    "guide_min_words": min(guide_word_counts) if guide_word_counts else None,
    "guide_max_words": max(guide_word_counts) if guide_word_counts else None,
    "reference_min_words": min(ref_word_counts) if ref_word_counts else None,
    "reference_max_words": max(ref_word_counts) if ref_word_counts else None,
    "guides_with_last_reviewed": sum(1 for r in guide_records if r["last_reviewed_visible"]),
    "reference_with_last_reviewed": sum(1 for r in ref_records if r["last_reviewed_visible"]),
    "guides_linking_to_tapping_domain": sum(1 for r in guide_records if r["links_to_tapping_domain"]),
    "reference_linking_to_tapping_domain": sum(1 for r in ref_records if r["links_to_tapping_domain"]),
    "weakest_5_guides_by_words": sorted(guide_records, key=lambda r: r["word_count_article"])[:5],
    "weakest_5_reference_by_words": sorted(ref_records, key=lambda r: r["word_count_article"])[:5],
    "guide_records": guide_records,
    "reference_records": ref_records,
}

# ---------------------------------------------------------------------------
# Q4: corpus-level materiality (recompute from scratch)
# ---------------------------------------------------------------------------

all_html = all_html_files()
noindex_files = [f for f in all_html if is_noindex(read(f))]
sitemap_count = len(re.findall(r"<loc>", sitemap))

total_pages = len(all_html)
indexable_pages = total_pages - len(noindex_files)

tap_drill_share = len(tap_drill_records) / indexable_pages
six_g_h_share = 2 / indexable_pages
weak_guide_ref_share = (len(guide_records) + len(ref_records)) / indexable_pages

q4 = {
    "total_public_pages": total_pages,
    "indexable_pages": indexable_pages,
    "noindex_pages": len(noindex_files),
    "noindex_file_list": noindex_files,
    "sitemap_url_count": sitemap_count,
    "sitemap_indexable_match": sitemap_count == indexable_pages,
    "residual_tap_drill_pages": len(tap_drill_records),
    "residual_tap_drill_share_of_indexable_pct": round(100 * tap_drill_share, 2),
    "six_g_h_pair_share_of_indexable_pct": round(100 * six_g_h_share, 2),
    "guide_reference_pages": len(guide_records) + len(ref_records),
    "guide_reference_share_of_indexable_pct": round(100 * weak_guide_ref_share, 2),
    "combined_residual_share_of_indexable_pct": round(
        100 * (tap_drill_share + six_g_h_share + weak_guide_ref_share), 2
    ),
}

# ---------------------------------------------------------------------------
# Q5: first-party value / link mesh quantification
# ---------------------------------------------------------------------------

assets = {
    "tapping_atlas": "/reference/tapping-atlas",
    "tap_type_guide": "/reference/tap-type-guide",
    "tapping_evidence": "/reference/tapping-evidence",
    "data_methodology": "/reference/data-methodology",
    "tapping_workflow": "/tools/tapping-workflow",
    "tap_drill_calculator": "/tools/tap-drill-calculator",
}

link_mesh = {}
for name, path in assets.items():
    inbound_files = [f for f in all_html if f'href="{path}"' in read(f)]
    by_dir = Counter(f.split("/")[0] for f in inbound_files)
    link_mesh[name] = {
        "path": path,
        "total_inbound_internal_links": len(inbound_files),
        "inbound_by_top_level_dir": dict(by_dir),
    }

homepage = read("index.html")
homepage_links_to_assets = {
    name: (f'href="{path}"' in homepage) for name, path in assets.items()
}

q5 = {
    "link_mesh_to_first_party_assets": link_mesh,
    "homepage_direct_links_to_assets": homepage_links_to_assets,
    "click_depth_from_homepage": {
        "tapping_atlas": "1 (linked directly from /reference/ hub, which is linked from homepage nav -- 2 clicks via nav; not directly on homepage body)"
        if not homepage_links_to_assets["tapping_atlas"] else "1 (direct homepage link)",
    },
}

# ---------------------------------------------------------------------------
# Q6: freshness / last-reviewed
# ---------------------------------------------------------------------------

last_reviewed_files = [f for f in all_html if last_reviewed_present(read(f))]

lastmod_dates = re.findall(r"<lastmod>([^<]+)</lastmod>", sitemap)
lastmod_dist = Counter(lastmod_dates)

t28_t29_strengthened = (
    [f"sizes/m{n}-bolt-size.html" for n in range(3, 21)]
    + [f"sizes/m{n}-tap-drill.html" for n in ATLAS_SIZES]
    + [f"es/sizes/perno-m{n}.html" for n in range(3, 21)]
    + [
        "charts/tap-drill-chart.html",
        "charts/screw-size-chart.html",
        "tools/fastener-weight-calculator.html",
        "tools/drill-bit-converter.html",
    ]
)

# find each strengthened page's sitemap lastmod vs its actual git last-commit date
strengthened_freshness = []
for f in t28_t29_strengthened:
    url = "/" + f[:-5]
    m = re.search(
        rf'<loc>https://boltlab\.io{re.escape(url)}</loc>\s*<lastmod>([^<]+)</lastmod>', sitemap
    )
    sitemap_lastmod = m.group(1) if m else None
    git_dates = git_log_dates(f, 1)
    strengthened_freshness.append({
        "path": f,
        "sitemap_lastmod": sitemap_lastmod,
        "git_last_commit_date": git_dates[0] if git_dates else None,
        "metadata_reflects_recent_edit": (sitemap_lastmod or "") >= "2026-09",
    })

q6 = {
    "indexable_pages_with_visible_last_reviewed": len(
        [f for f in last_reviewed_files if not is_noindex(read(f))]
    ),
    "total_pages_with_visible_last_reviewed": len(last_reviewed_files),
    "total_indexable_pages": indexable_pages,
    "last_reviewed_file_list": last_reviewed_files,
    "sitemap_lastmod_distribution": dict(lastmod_dist),
    "strengthened_pages_checked": len(strengthened_freshness),
    "strengthened_pages_with_stale_sitemap_lastmod": sum(
        1 for r in strengthened_freshness if not r["metadata_reflects_recent_edit"]
    ),
    "strengthened_pages_detail": strengthened_freshness,
}

# ---------------------------------------------------------------------------
# Q8: advertising state
# ---------------------------------------------------------------------------

ads_txt = read("ads.txt") if Path("ads.txt").exists() else None
robots_txt = read("robots.txt")

adsbygoogle_hits = [f for f in all_html if "adsbygoogle" in read(f)]
googlesyndication_hits = [f for f in all_html if "googlesyndication" in read(f)]
data_ad_client_hits = [f for f in all_html if "data-ad-client" in read(f)]
sponsored_label_hits = [f for f in all_html if "Sponsored" in read(f)]
ad_container_hits = [f for f in all_html if "ad-container" in read(f)]

q8 = {
    "ads_txt_present": ads_txt is not None,
    "ads_txt_content": ads_txt.strip() if ads_txt else None,
    "robots_txt_content": robots_txt.strip(),
    "adsbygoogle_script_hits": len(adsbygoogle_hits),
    "googlesyndication_hits": len(googlesyndication_hits),
    "data_ad_client_hits": len(data_ad_client_hits),
    "sponsored_label_pages": len(sponsored_label_hits),
    "ad_container_pages": len(ad_container_hits),
    "conclusion": "no active ad-network script found" if not (adsbygoogle_hits or googlesyndication_hits or data_ad_client_hits) else "ACTIVE AD SCRIPT FOUND -- INVESTIGATE",
}

# ---------------------------------------------------------------------------
# Q9: regression audit -- dangling links to retired T28 URLs, broken internal links (sample)
# ---------------------------------------------------------------------------

retired_slug_pattern = re.compile(r'href="/(es/)?sizes/m\d+-(clearance-hole|thread-pitch|to-inch)"')
dangling = []
for f in all_html:
    html = read(f)
    if retired_slug_pattern.search(html) or 'href="/sizes/m20-vs-m18"' in html:
        dangling.append(f)

# broken internal link check: every local href (not #, not external, not mailto) should resolve
broken_links = []
checked = 0
for f in all_html:
    html = read(f)
    for href in re.findall(r'href="(/[a-zA-Z0-9\-_/.]+)"', html):
        if href.startswith("//") or href.startswith("/downloads/") or "." in href.rsplit("/", 1)[-1] and not href.endswith((".html", ".css", ".js", ".csv", ".svg", ".xml", ".txt")):
            continue
        checked += 1
        target = href.rstrip("/")
        if target == "":
            continue
        candidates = [target + ".html", target + "/index.html", target]
        if not any(Path(c.lstrip("/")).exists() for c in candidates):
            broken_links.append((f, href))

q9 = {
    "dangling_links_to_retired_t28_urls": dangling,
    "internal_hrefs_checked": checked,
    "broken_internal_links_found": len(broken_links),
    "broken_internal_links_sample": broken_links[:30],
}

# ---------------------------------------------------------------------------
# Assemble
# ---------------------------------------------------------------------------

evidence = {
    "q1_tap_drill_residual": q1,
    "q2_six_g_six_h": q2,
    "q3_guide_reference": {k: v for k, v in q3.items() if k not in ("guide_records", "reference_records")},
    "q3_guide_reference_full_records": {
        "guide_records": q3["guide_records"],
        "reference_records": q3["reference_records"],
    },
    "q4_corpus_materiality": q4,
    "q5_link_mesh": q5,
    "q6_freshness": q6,
    "q8_advertising": q8,
    "q9_regression": q9,
}

out_path = ROOT / "audit/adsense-quality/t31/t31_raw_evidence.json"
out_path.write_text(json.dumps(evidence, indent=2), encoding="utf-8")
print(f"Wrote {out_path}")
print(json.dumps({
    "q1_similarity_summary": q1_similarity,
    "q1_atlas_covered": q1["atlas_covered_count"],
    "q1_non_atlas_covered": q1["non_atlas_covered_count"],
    "q2_summary": {k: v for k, v in q2.items() if k not in ()},
    "q4_summary": q4,
    "q6_summary": {k: v for k, v in q6.items() if k != "strengthened_pages_detail" and k != "last_reviewed_file_list"},
    "q8_summary": q8,
    "q9_summary": {k: v for k, v in q9.items() if k != "broken_internal_links_sample"},
}, indent=2))
