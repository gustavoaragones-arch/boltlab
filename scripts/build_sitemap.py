#!/usr/bin/env python3
"""Build sitemap.xml from on-disk HTML. Priorities: home 1.0, /es/ 0.9, /sizes/ EN 0.8, else 0.75."""
from __future__ import annotations

import datetime as dt
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://boltlab.io"


def to_loc(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel == "index.html":
        return BASE + "/"
    if rel.endswith("/index.html"):
        base_path = rel[: -len("index.html")].rstrip("/")
        return BASE + "/" + base_path + "/" if base_path else BASE + "/"
    return BASE + "/" + rel


def lastmod_for(path: Path) -> str:
    try:
        return dt.datetime.fromtimestamp(path.stat().st_mtime, tz=dt.timezone.utc).date().isoformat()
    except OSError:
        return dt.date.today().isoformat()


def priority_for(loc: str) -> str:
    if loc.rstrip("/") == BASE or loc == BASE + "/":
        return "1.0"
    if "/es/" in loc:
        return "0.9"
    if "/sizes/" in loc:
        return "0.8"
    return "0.75"


def collect_urls() -> dict[str, tuple[str, str]]:
    """loc -> (priority, lastmod)"""
    out: dict[str, tuple[str, str]] = {}

    def add(path: Path, force_lm: str | None = None):
        if not path.is_file():
            return
        loc = to_loc(path)
        lm = force_lm or lastmod_for(path)
        pr = priority_for(loc)
        if loc not in out or float(pr) > float(out[loc][0]):
            out[loc] = (pr, lm)

    # Root index
    add(ROOT / "index.html")

    # Section index pages (about/contact/privacy use about/index.html, etc.)
    for sub in ("about", "contact", "privacy"):
        p = ROOT / sub / "index.html"
        if p.exists():
            add(p)

    # Trees
    for pattern in (
        "es/**/*.html",
        "sizes/**/*.html",
        "tools/**/*.html",
        "guides/**/*.html",
        "charts/**/*.html",
        "reference/**/*.html",
    ):
        for p in sorted(ROOT.glob(pattern)):
            add(p)

    return out


def main():
    urls = collect_urls()
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for loc in sorted(urls.keys()):
        pr, lm = urls[loc]
        lines.append("  <url>")
        lines.append(f"    <loc>{loc}</loc>")
        lines.append(f"    <lastmod>{lm}</lastmod>")
        lines.append(f"    <priority>{pr}</priority>")
        lines.append("  </url>")
    lines.append("</urlset>")
    out = ROOT / "sitemap.xml"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {out} ({len(urls)} urls)")


if __name__ == "__main__":
    main()
