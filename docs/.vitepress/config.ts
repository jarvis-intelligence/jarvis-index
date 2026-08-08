// Build: npm run docs:build | Dev: npm run docs:dev | Preview: npm run docs:preview
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'jarvis',
  description: 'Local-first code intelligence for coding agents',
  lang: 'en-US',
  base: '/docs/',
  cleanUrls: true,
  ignoreDeadLinks: true,
  srcExclude: [
    'brand-spec.md',
    'code-standards.md',
    'codebase-summary.md',
    'deployment-guide.md',
    'project-overview-pdr.md',
    'project-roadmap.md',
    'system-architecture.md',
    'superpowers/**'
  ],
  lastUpdated: true,

  sitemap: {
    hostname: 'https://jarvis-intelligence.github.io/jarvis-index/docs'
  },

  head: [
    ['meta', { name: 'description', content: 'Local-first code intelligence for coding agents. SCIP navigation, Zoekt search, and semantic search over your own indexed repositories.' }]
  ],

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quickstart', link: '/quickstart' },
      { text: 'Tools', link: '/tools/' },
      { text: 'CLI', link: '/cli/' },
      { text: 'Concepts', link: '/concepts/scip' },
      { text: 'GitHub', link: 'https://github.com/jarvis-intelligence/jarvis-index' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Quickstart', link: '/quickstart' },
            { text: 'Install', link: '/guide/install' }
          ]
        }
      ],
      '/concepts/': [
        {
          text: 'Concepts',
          items: [
            { text: 'SCIP', link: '/concepts/scip' },
            { text: 'Zoekt Search', link: '/concepts/zoekt' },
            { text: 'Semantic Search', link: '/concepts/semantic-search' },
            { text: 'Blast Radius', link: '/concepts/blast-radius' },
            { text: 'Architecture', link: '/concepts/architecture' }
          ]
        }
      ],
      '/tools/': [
        {
          text: 'MCP Tools',
          items: [
            { text: 'Overview', link: '/tools/' },
            { text: 'documentSymbols', link: '/tools/document-symbols' },
            { text: 'goToDefinition', link: '/tools/go-to-definition' },
            { text: 'findReferences', link: '/tools/find-references' },
            { text: 'callHierarchy', link: '/tools/call-hierarchy' },
            { text: 'typeHierarchy', link: '/tools/type-hierarchy' },
            { text: 'getIndexStatus', link: '/tools/get-index-status' },
            { text: 'searchCode', link: '/tools/search-code' },
            { text: 'semanticSearch', link: '/tools/semantic-search' },
            { text: 'blastRadius', link: '/tools/blast-radius' }
          ]
        }
      ],
      '/cli/': [
        {
          text: 'CLI',
          items: [
            { text: 'Overview', link: '/cli/' },
            { text: 'jarvis index', link: '/cli/index-cmd' },
            { text: 'jarvis list', link: '/cli/list' },
            { text: 'jarvis status', link: '/cli/status' },
            { text: 'jarvis reindex', link: '/cli/reindex' },
            { text: 'jarvis forget', link: '/cli/forget' },
            { text: 'jarvis watch', link: '/cli/watch' }
          ]
        }
      ],
      '/integrations/': [
        {
          text: 'Integrations',
          items: [
            { text: 'Overview', link: '/integrations/' },
            { text: 'Claude Code', link: '/integrations/claude-code' },
            { text: 'Cursor', link: '/integrations/cursor' },
            { text: 'Codex CLI', link: '/integrations/codex-cli' }
          ]
        }
      ],
      '/troubleshooting/': [
        {
          text: 'Troubleshooting',
          items: [
            { text: 'Decision Tree', link: '/troubleshooting/' },
            { text: 'Upstream Issues', link: '/troubleshooting/upstream-issues' },
            { text: 'Common Failures', link: '/troubleshooting/common-failures' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jarvis-intelligence/jarvis-index' }
    ],

    editLink: {
      pattern: 'https://github.com/jarvis-intelligence/jarvis-index/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    outline: {
      level: [2, 3]
    },

    search: {
      provider: 'local'
    }
  }
})
