#!/usr/bin/env python3
"""Assemble a page mockup: inline base.css and the mascot data URI.

Usage: python3 build.py pageN.src.html  ->  writes pageN-mockup.html
Pages are written with __BASE_CSS__ and __MASCOT_B64__ tokens so the shared
identity lives in one file instead of being copy-pasted per page.
"""
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
BASE = (HERE / "base.css").read_text()
B64 = (HERE / "kapibara.b64").read_text().strip()

src = pathlib.Path(sys.argv[1])
html = src.read_text()

if "__BASE_CSS__" not in html:
    sys.exit(f"{src.name}: missing __BASE_CSS__ token")

html = html.replace("__BASE_CSS__", BASE)
n = html.count("__MASCOT_B64__")
html = html.replace("__MASCOT_B64__", B64)

out = HERE / (src.name.replace(".src.html", "") + "-mockup.html")
out.write_text(html)
print(f"{out.name}: {out.stat().st_size:,} bytes ({n} mascot embed(s))")
