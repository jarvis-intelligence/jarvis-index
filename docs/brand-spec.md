# brand-spec — jarvis landing

Direction extracted from `https://opengsd.net/` (Tailwind v4 theme tokens read
from `/_next/static/chunks/0a2t96_~bm984.css`). Values below are the source's
own declarations, not approximations of a screenshot.

## Tokens

| Token | Light (source hex) | OKLch | Dark (source hex) |
|---|---|---|---|
| `--bg` | `#f3f7fa` | `oklch(97.3% 0.006 247)` | `#040506` |
| `--surface` | `#e9edf2` | `oklch(94.0% 0.008 248)` | `#0d0f12` |
| `--fg` | `#12181d` | `oklch(20.5% 0.014 251)` | `#dee2e5` |
| `--muted` | `#58626a` | `oklch(49.2% 0.017 249)` | `#8c9399` |
| `--border` | `#c3cad0` | `oklch(82.6% 0.011 249)` | `#282c30` |
| `--accent` | `#29527d` | `oklch(41.5% 0.077 254)` | `#5b86b7` |

Supporting: `--accent-strong` `#0a3966` / `#7cafe4`, `--accent-soft` `#cfe0f3` /
`#112031`, `--logo-blue-strong` `#3f6c9c` / `#6090c4`, accent shadow rgb
`33, 82, 148`.

Hex values are used verbatim in CSS because they were read from the source.
Derived state colours (hover shifts, tints) are generated with `oklch()` /
`color-mix()`.

## Type

- Display + body: `"Geist"`, then `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- Mono: `"Geist Mono"`, then `ui-monospace, SFMono-Regular, Menlo, monospace`
- Wordmark: `"Rajdhani"` 700, uppercase, `letter-spacing: .075em`, `transform: scaleX(1.12)`

## Observed rules

1. **Section frame is `min(100% - 3rem, 72rem)`; the hero alone widens to `88rem`.**
   Content stays narrow while the hero art bleeds to the viewport edge.
2. **Titles are heavy and tight, never large-and-loose.** Hero
   `font-weight: 760; line-height: .95`; section titles
   `clamp(2rem, 4vw, 3.75rem); font-weight: 740; line-height: 1; max-width: 48rem`.
3. **Cards carry no border property — they carry an inset ring.**
   `box-shadow: inset 0 0 0 1px var(--border), 0 18px 48px rgba(18,24,38,.08)`,
   radius `.5rem`. One variant swaps the ring to 36% accent.
4. **Commands live in dark terminal chips on the light page.** `.mono-box`:
   background `#0a0e11`, text `#e1e5e8`, radius `.9rem`, min-height `3.35rem`,
   inset top highlight. This is the page's single decisive flourish.
5. **Everything interactive shares one transition.**
   `.2s cubic-bezier(.2, 0, 0, 1)` across colour/border/shadow/transform, plus
   `:active { transform: scale(.96) }`. Minimum hit target `2.5rem`.
6. **The hero glow is radial and off-centre.**
   `radial-gradient(circle at 82% 18%, accent@12%, transparent 31rem)` over a
   top-down elevated-surface wash; hero art masked
   `linear-gradient(90deg, transparent 0, #000 14%)` at `opacity: .42`.

## Deviation from source

The source applies `hover:text-accent` to its dark mono chips, which in light
mode puts `#29527d` on `#0a0e11` (1.4:1). This build uses the dark-theme accent
`#7cafe4` inside chips in both themes (8.6:1).
