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
      // Mirrors the six VitePress sidebar groups (docs/.vitepress/config.ts:42-116,
      // since deleted) with docs/-prefixed links; order preserved.
      sidebar: [
        {
          label: 'Guide',
          items: [
            { label: 'Quickstart', link: 'docs/quickstart' },
            { label: 'Install', link: 'docs/guide/install' },
          ],
        },
        {
          label: 'Concepts',
          items: [
            { label: 'SCIP', link: 'docs/concepts/scip' },
            { label: 'Zoekt Search', link: 'docs/concepts/zoekt' },
            { label: 'Semantic Search', link: 'docs/concepts/semantic-search' },
            { label: 'Blast Radius', link: 'docs/concepts/blast-radius' },
            { label: 'Architecture', link: 'docs/concepts/architecture' },
          ],
        },
        {
          label: 'MCP Tools',
          items: [
            { label: 'Overview', link: 'docs/tools/' },
            { label: 'documentSymbols', link: 'docs/tools/document-symbols' },
            { label: 'goToDefinition', link: 'docs/tools/go-to-definition' },
            { label: 'findReferences', link: 'docs/tools/find-references' },
            { label: 'callHierarchy', link: 'docs/tools/call-hierarchy' },
            { label: 'typeHierarchy', link: 'docs/tools/type-hierarchy' },
            { label: 'getIndexStatus', link: 'docs/tools/get-index-status' },
            { label: 'searchCode', link: 'docs/tools/search-code' },
            { label: 'semanticSearch', link: 'docs/tools/semantic-search' },
            { label: 'blastRadius', link: 'docs/tools/blast-radius' },
          ],
        },
        {
          label: 'CLI',
          items: [
            { label: 'Overview', link: 'docs/cli/' },
            { label: 'jarvis index', link: 'docs/cli/index-cmd' },
            { label: 'jarvis list', link: 'docs/cli/list' },
            { label: 'jarvis status', link: 'docs/cli/status' },
            { label: 'jarvis reindex', link: 'docs/cli/reindex' },
            { label: 'jarvis forget', link: 'docs/cli/forget' },
            { label: 'jarvis watch', link: 'docs/cli/watch' },
          ],
        },
        {
          label: 'Integrations',
          items: [
            { label: 'Overview', link: 'docs/integrations/' },
            { label: 'Claude Code', link: 'docs/integrations/claude-code' },
            { label: 'Cursor', link: 'docs/integrations/cursor' },
            { label: 'Codex CLI', link: 'docs/integrations/codex-cli' },
          ],
        },
        {
          label: 'Troubleshooting',
          items: [
            { label: 'Decision Tree', link: 'docs/troubleshooting/' },
            { label: 'Upstream Issues', link: 'docs/troubleshooting/upstream-issues' },
            { label: 'Common Failures', link: 'docs/troubleshooting/common-failures' },
          ],
        },
      ],
    }),
  ],
  redirects: {
    // SITE-06 mechanism; entries arrive with Phase 2's restructure.
    // Static output emits <meta http-equiv="refresh"> stubs (verified in astro dist).
  },
})
