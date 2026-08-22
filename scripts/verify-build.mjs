#!/usr/bin/env node
// SITE-06: the standing dist-vs-contract assertion. Zero-dependency ESM.
//
// Dimensions:
//   V2 — built page set (dist/**/*.html, excluding 404.html) SET-EQUALS the
//        committed URL contract. A vanished page and an unexpected extra
//        page both fail — this is the leak guard (Pitfall 5) and the
//        no-link-rot mechanism (SITE-06) in one assertion.
//   V3 — every href/src in the built landing (dist/index.html) and docs home
//        (dist/docs/index.html) resolves to a real dist file. This is the
//        pre-deploy twin of the 01-01 live asset-404 bug.
//   V4 — zero fonts.googleapis/fonts.gstatic references in built HTML/CSS,
//        at least one woff2 present under dist (self-hosted fonts, SITE-04).
//        Scans every built HTML/CSS file, including dist/brand-logo.html.
//   V5 — the Pagefind search index is present under dist/pagefind/ (verified
//        directly against this project's build: base-relative, NOT nested
//        under dist/docs/ as 01-RESEARCH.md assumed — see 01-04-SUMMARY.md).
//   V9 — every <loc> in every dist/sitemap*.xml resolves to a real dist file
//        (regression guard for the pre-01-01 sitemap-rot bug).
//   V10 — dist/llms.txt exists, opens with an H1 then an early blockquote
//        summary (llmstxt.org shape), and every markdown link target is on
//        the contract origin AND its origin-stripped path is a member of
//        the contract's urls (DOCS-11 link-poisoning guard).
//
// Usage: node scripts/verify-build.mjs [distDir] [contractPath]
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'

const distDir = process.argv[2] ?? 'dist'
const contractPath = process.argv[3] ?? 'design/url-contract.json'

// Must match astro.config.mjs's BASE constant — the same duplication the
// deploy-pages.yml smoke-probe step already accepts (Pattern 1: one origin
// constant in config; assertion scripts are allowed to know it for stripping).
const BASE = '/jarvis-index'

let failed = false
function fail(dimension, detail) {
  console.error(`${dimension}: ${detail}`)
  failed = true
}

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

if (!existsSync(distDir)) {
  console.error(`fatal: dist dir not found: ${distDir}`)
  process.exit(1)
}

const allFiles = walk(distDir)
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'))

// ─────────────────────────────────────────────────────────────────────────
// V2 — URL contract equality
// ─────────────────────────────────────────────────────────────────────────
function fileToUrl(distRelPath) {
  const posixPath = distRelPath.split(sep).join('/')
  if (posixPath === 'index.html') return '/'
  if (posixPath.endsWith('/index.html')) return '/' + posixPath.slice(0, -'index.html'.length)
  return '/' + posixPath
}

const contract = JSON.parse(readFileSync(contractPath, 'utf8'))
const contractUrls = new Set(contract.urls)

const builtUrls = new Set(
  htmlFiles
    .map((f) => relative(distDir, f))
    .filter((rel) => rel.split(sep).join('/') !== '404.html')
    .map(fileToUrl)
)

for (const url of contractUrls) {
  if (!builtUrls.has(url)) fail('V2', `missing page: ${url}`)
}
for (const url of builtUrls) {
  if (!contractUrls.has(url)) fail('V2', `extra page not in contract: ${url}`)
}

// ─────────────────────────────────────────────────────────────────────────
// V3 — asset resolution on the landing + docs home HTML
// ─────────────────────────────────────────────────────────────────────────
function extractRefs(html) {
  const refs = []
  const re = /\b(?:href|src)="([^"]*)"/g
  let m
  while ((m = re.exec(html))) refs.push(m[1])
  return refs
}

function isExternal(ref) {
  return (
    ref.startsWith('http://') ||
    ref.startsWith('https://') ||
    ref.startsWith('//') ||
    ref.startsWith('mailto:') ||
    ref.startsWith('tel:') ||
    ref.startsWith('javascript:') ||
    ref.startsWith('data:')
  )
}

function stripQueryAndFragment(ref) {
  return ref.split('#')[0].split('?')[0]
}

function resolveAgainstDist(pathFromDistRoot) {
  // pathFromDistRoot has no leading dist/ prefix; may or may not start with '/'.
  const clean = pathFromDistRoot.replace(/^\/+/, '')
  const candidates = [join(distDir, clean), join(distDir, `${clean}.html`), join(distDir, clean, 'index.html')]
  return candidates.some((p) => existsSync(p) && statSync(p).isFile())
}

function checkAssetResolution(htmlPath) {
  if (!existsSync(htmlPath)) return
  const html = readFileSync(htmlPath, 'utf8')
  const pageDir = relative(distDir, join(htmlPath, '..')).split(sep).join('/')
  for (const rawRef of extractRefs(html)) {
    if (rawRef.startsWith('#')) continue
    if (isExternal(rawRef)) continue
    const ref = stripQueryAndFragment(rawRef)
    if (ref === '') continue

    let fromDistRoot
    if (ref.startsWith(BASE + '/') || ref === BASE) {
      fromDistRoot = ref.slice(BASE.length)
    } else if (ref.startsWith('/')) {
      // Absolute but missing the base prefix — the exact origin-prefix bug
      // class this dimension exists to catch (RESEARCH Pattern 1).
      fromDistRoot = ref
    } else {
      // Relative to the directory containing this HTML file.
      fromDistRoot = pageDir === '.' ? ref : `${pageDir}/${ref}`
    }

    if (!resolveAgainstDist(fromDistRoot)) {
      fail('V3', `unresolvable reference "${rawRef}" in ${relative(distDir, htmlPath)}`)
    }
  }
}

checkAssetResolution(join(distDir, 'index.html'))
checkAssetResolution(join(distDir, 'docs', 'index.html'))

// ─────────────────────────────────────────────────────────────────────────
// V4 — font origin
// ─────────────────────────────────────────────────────────────────────────
const FONT_CDN_PATTERN = /fonts\.googleapis\.com|fonts\.gstatic\.com/

const scannableForFonts = allFiles.filter((f) => f.endsWith('.html') || f.endsWith('.css'))
for (const f of scannableForFonts) {
  const content = readFileSync(f, 'utf8')
  if (FONT_CDN_PATTERN.test(content)) {
    fail('V4', `third-party font CDN reference in ${relative(distDir, f)}`)
  }
}
const hasWoff2 = allFiles.some((f) => f.endsWith('.woff2'))
if (!hasWoff2) fail('V4', 'no woff2 font file found anywhere under dist (self-hosted fonts missing)')

// ─────────────────────────────────────────────────────────────────────────
// V5 — Pagefind presence
// ─────────────────────────────────────────────────────────────────────────
const pagefindDir = join(distDir, 'pagefind')
if (!existsSync(pagefindDir)) {
  fail('V5', `pagefind directory not found at ${pagefindDir}`)
} else {
  const pagefindFiles = walk(pagefindDir)
  const hasJs = pagefindFiles.some((f) => f.endsWith('.js'))
  const hasJson = pagefindFiles.some((f) => f.endsWith('.json'))
  if (!hasJs) fail('V5', `no .js file found under ${pagefindDir}`)
  if (!hasJson) fail('V5', `no .json file found under ${pagefindDir}`)
}

// ─────────────────────────────────────────────────────────────────────────
// V9 — sitemap correctness
// ─────────────────────────────────────────────────────────────────────────
const sitemapFiles = allFiles.filter((f) => /sitemap.*\.xml$/i.test(f) && dirname(f) === distDir)
for (const sitemapFile of sitemapFiles) {
  const xml = readFileSync(sitemapFile, 'utf8')
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  for (const loc of locs) {
    let path
    try {
      path = new URL(loc).pathname
    } catch {
      fail('V9', `unparseable <loc> "${loc}" in ${relative(distDir, sitemapFile)}`)
      continue
    }
    const fromDistRoot = path.startsWith(BASE) ? path.slice(BASE.length) : path
    if (!resolveAgainstDist(fromDistRoot)) {
      fail('V9', `sitemap URL does not resolve to a dist file: ${loc} (in ${relative(distDir, sitemapFile)})`)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
// V10 — llms.txt shape and link-origin/path guard (DOCS-11)
// ─────────────────────────────────────────────────────────────────────────
const llmsTxtPath = join(distDir, 'llms.txt')
if (!existsSync(llmsTxtPath)) {
  fail('V10', 'dist/llms.txt not found')
} else {
  const llmsTxt = readFileSync(llmsTxtPath, 'utf8')
  const lines = llmsTxt.split('\n')
  if (!lines[0]?.startsWith('# ')) fail('V10', 'first line is not an H1')
  if (!lines.slice(0, 4).some((l) => l.startsWith('> '))) {
    fail('V10', 'no blockquote summary in the first 4 lines')
  }
  const linkRe = /\[([^\]]*)\]\(([^)]+)\)/g
  let m
  while ((m = linkRe.exec(llmsTxt))) {
    const url = m[2]
    if (!url.startsWith(contract.origin)) {
      fail('V10', `link off-origin: ${url}`)
      continue
    }
    const path = url.slice(contract.origin.length)
    if (!contractUrls.has(path)) fail('V10', `link path not in contract: ${path}`)
  }
}

if (failed) {
  process.exit(1)
}

console.log(
  `ok: V2 (${builtUrls.size} pages = contract), V3 (landing+docs-home assets), V4 (fonts), V5 (pagefind), V9 (sitemap), V10 (llms.txt) all green`
)
