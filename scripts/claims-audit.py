#!/usr/bin/env python3
"""Extract factual claims from landing/quickstart/requirements markdown.

Reads the given markdown files, extracts sentences likely containing factual
claims (heuristic: sentences with numbers, version references, tool names,
or capability statements), and emits a CSV with columns:

    surface_file, section, claim_excerpt, evidence_artifact, evidence_locator

This is a tool for the orchestrator — the human fills the evidence columns.
Usage: python3 scripts/claims-audit.py [file ...]
Output: CSV to stdout.
"""
from __future__ import annotations

import csv
import re
import sys
from pathlib import Path

# Heuristic patterns that signal a factual claim
CLAIM_PATTERNS = [
    r'\b\d+\b',                        # numbers (counts, versions, line refs)
    r'\b(?:v?\d+\.\d+(?:\.\d+)?)\b',  # version-like strings
    r'\b(?:go-to-definition|find-references|call.?hierarchy|type.?hierarchy|document.?symbols|get.?index.?status|search.?code|semantic.?search|blast.?radius)\b',
    r'\b(?:TypeScript|Python|Java|Kotlin|Swift|Go|Ruby|Rust|C\+\+|C#|PHP|Scala)\b',
    r'\b(?:macOS|Linux|Windows)\b',
    r'\b(?:npm|pip|uvx|uv |set:html|PyPI|MCP|SCIP|Zoekt)\b',
    r'\b(?:MIT|Apache-2?\.0|GPLv3)\b',
    r'\b(?:zero|no |nothing|never|all |every )\b',
    r'\b(?:local[- ]first|on.?your.?machine|uploaded|telemetry|cloud)\b',
    r'\b(?:installed|install|download|setup)\b',
]

# Sections we care about (markdown headings)
SECTION_RE = re.compile(r'^(#{1,4})\s+(.+)$', re.MULTILINE)

# Sentence splitter (simple: split on period/question/exclamation followed by space or end)
SENTENCE_RE = re.compile(r'(?<=[.!?])\s+(?=[A-Z"`\[]|\$)')


def extract_sections(text: str) -> list[tuple[str, str]]:
    """Return list of (section_title, section_body) pairs."""
    matches = list(SECTION_RE.finditer(text))
    sections: list[tuple[str, str]] = []
    for i, m in enumerate(matches):
        title = m.group(2).strip()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        sections.append((title, body))
    return sections


def is_claim(sentence: str) -> bool:
    """Heuristic: does this sentence look like a factual claim?"""
    # Skip very short fragments and frontmatter-like lines
    if len(sentence) < 20:
        return False
    # Skip code blocks, image alt text, link-only lines
    if sentence.startswith('```') or sentence.startswith('!['):
        return False
    # Skip pure navigation/CTA lines
    if sentence.startswith(('[', '- ', '* ', '|')):
        return False
    for pat in CLAIM_PATTERNS:
        if re.search(pat, sentence, re.IGNORECASE):
            return True
    return False


def extract_claims(filepath: str) -> list[dict[str, str]]:
    text = Path(filepath).read_text(encoding='utf-8')
    # Strip frontmatter
    if text.startswith('---'):
        fm_end = text.find('---', 3)
        if fm_end != -1:
            text = text[fm_end + 3:]
    sections = extract_sections(text)
    claims: list[dict[str, str]] = []
    for section_title, body in sections:
        # Split body into sentences
        sentences = SENTENCE_RE.split(body)
        for s in sentences:
            s = s.strip()
            if not s:
                continue
            if is_claim(s):
                # Truncate long excerpts for readability
                excerpt = s[:200] + ('...' if len(s) > 200 else '')
                claims.append({
                    'surface_file': filepath,
                    'section': section_title,
                    'claim_excerpt': excerpt.replace('"', '""'),
                    'evidence_artifact': '',
                    'evidence_locator': '',
                })
    return claims


def main() -> None:
    files = sys.argv[1:] if len(sys.argv) > 1 else [
        'src/pages/index.astro',
        'src/content/docs/docs/quickstart.mdx',
        'src/content/docs/docs/guide/requirements.md',
    ]
    all_claims: list[dict[str, str]] = []
    for f in files:
        if not Path(f).exists():
            print(f'WARNING: {f} not found, skipping', file=sys.stderr)
            continue
        all_claims.extend(extract_claims(f))
    writer = csv.DictWriter(sys.stdout, fieldnames=[
        'surface_file', 'section', 'claim_excerpt', 'evidence_artifact', 'evidence_locator',
    ])
    writer.writeheader()
    for c in all_claims:
        writer.writerow(c)
    print(f'\n# {len(all_claims)} claims extracted', file=sys.stderr)


if __name__ == '__main__':
    main()
