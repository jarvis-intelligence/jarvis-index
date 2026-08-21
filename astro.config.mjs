import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// ONE origin constant — every absolute URL in the build derives from these two lines.
const SITE = 'https://jarvis-intelligence.github.io'
const BASE = '/jarvis-index'

/**
 * Rebase root-relative markdown links onto the docs mount.
 *
 * The migrated pages carry VitePress-era links like `[Quickstart](/quickstart)`
 * that were resolved against the docs base (`/jarvis-index/docs/`) by VitePress.
 * Astro emits content hrefs verbatim, so without this plugin those links would
 * point at the domain root and 404. Rewrites `/<path>` → `${BASE}/docs/<path>`
 * — reproducing exactly what VitePress emitted, with zero content edits.
 * Content rewrite (Phase 2, DOCS-09) can retire this plugin.
 */
function rebaseDocsLinks() {
  const rebased = `${BASE}/docs`
  const walk = (node) => {
    if (node.tagName === 'a' && typeof node.properties?.href === 'string') {
      const href = node.properties.href
      if (href.startsWith('/') && !href.startsWith('//')) {
        node.properties.href = rebased + href
      }
    }
    for (const child of node.children ?? []) walk(child)
  }
  return (tree) => walk(tree)
}

export default defineConfig({
  site: SITE,
  base: BASE,
  // 'directory' (Astro default): index pages keep their live trailing-slash URLs
  // (/docs/, /docs/tools/ — 200 live today); deep pages move from extensionless to
  // trailing-slash, with slashless forms 301ing (verified live on this Pages host:
  // /jarvis-index/docs/tools → 301 → /docs/tools/). 'file' would 404 the five live
  // index URLs, including the smoke probe's /docs/ target.
  build: { format: 'directory' },
  markdown: {
    rehypePlugins: [rebaseDocsLinks],
  },
  integrations: [
    starlight({
      title: 'jarvis',
      description: 'Local-first code intelligence for coding agents',
      sidebar: [
        { label: 'Docs', items: [{ label: 'Docs Home', link: 'docs/' }] },
      ],
    }),
  ],
  redirects: {
    // SITE-06 mechanism; entries arrive with Phase 2's restructure.
    // Static output emits <meta http-equiv="refresh"> stubs (verified in astro dist).
  },
})
