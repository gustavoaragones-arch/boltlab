#!/usr/bin/env python3
"""Strip .html from boltlab.io document URLs in SEO surfaces (one-time)."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# Document URL paths only — never strip directory index paths ending in /
ABS_BOLTLAB = re.compile(r"https://boltlab\.io(/[^\"'<>#\s?]*?)\.html\b")
REL_HREF = re.compile(r'(href=")(/[^"]+?)\.html(")')


def consolidate_text(text: str) -> tuple[str, int]:
    n = 0

    def abs_sub(m: re.Match) -> str:
        nonlocal n
        n += 1
        return f"https://boltlab.io{m.group(1)}"

    text = ABS_BOLTLAB.sub(abs_sub, text)

    def rel_sub(m: re.Match) -> str:
        nonlocal n
        path = m.group(2)
        if path.endswith("/"):
            return m.group(0)
        n += 1
        return f"{m.group(1)}{path}{m.group(3)}"

    text = REL_HREF.sub(rel_sub, text)
    return text, n


def process_file(path: Path) -> int:
    original = path.read_text(encoding="utf-8")
    updated, n = consolidate_text(original)
    if updated != original:
        path.write_text(updated, encoding="utf-8")
    return n


def main() -> None:
    total = 0
    files = 0
    for pattern in ("**/*.html", "sitemap.xml"):
        for path in ROOT.glob(pattern):
            if path.name.startswith("_"):
                continue
            if "node_modules" in path.parts:
                continue
            c = process_file(path)
            if c:
                files += 1
                total += c
    for name in (
        "data/link-map.json",
        "data/anchors.json",
        "data/anchors-es.json",
        "data/context-anchors.json",
        "data/context-anchors-es.json",
    ):
        p = ROOT / name
        if p.exists():
            c = process_file(p)
            if c:
                files += 1
                total += c
    print(f"files_changed={files} replacements={total}")


if __name__ == "__main__":
    main()
