// hermes-look — user appearance plugin (stock Hermes extension point).
// Delete this folder to revert. Never touches app source; survives updates.
//
// Contents (each block independently removable):
//   A. Titlebar buttons — hide: Layout editor, HUD mode, Swap sidebar
//   B. Cursor — arrow everywhere; I-beam in text fields; keep grab on drag
//   C. GitHub Copilot look — seed-token re-skin (auto dark/light) + crisp radii
//   D. Tooltips — high-contrast chip (fixes white-on-white in either theme)
//
// Loader contract (verified, contrib/runtime-loader.ts):
//   blob import() → mod.default = { id, register() } ; defaultEnabled ⇒ true

const STYLE_ID = 'hermes-…tyle'

// ─────────────────────────────────────────────────────────────────────────
// A. TITLEBAR BUTTONS
//   Verified vs titlebar-controls.tsx + button.tsx: titlebar tools render as
//     <button class="titlebar-icon-button …"><i class="codicon codicon-…">
//   icons (codicon.tsx): layout / comment-discussion / arrow-swap.
//   `titlebar-icon-button` class is unique to titlebar buttons → the same
//   icons elsewhere in the app stay visible.
// ─────────────────────────────────────────────────────────────────────────
const CSS_TITLEBAR = `
button.titlebar-icon-button:has(.codicon-layout) { display: none !important; }
button.titlebar-icon-button:has(.codicon-comment-discussion) { display: none !important; }
button.titlebar-icon-button:has(.codicon-arrow-swap) { display: none !important; }
`

// ─────────────────────────────────────────────────────────────────────────
// B. CURSOR — the app slaps `cursor: pointer` (~800 utility classes) and drag
//   handles set it inline. A universal !important arrow rule beats both; then
//   re-allow I-beam over editable text and the grab hand on drag handles.
// ─────────────────────────────────────────────────────────────────────────
const CSS_CURSOR = `
* { cursor: auto !important; }
input,
textarea,
select,
[contenteditable='true'],
[contenteditable=''],
[role='textbox'] { cursor: text !important; }
[style*="cursor:grab"],
[style*="cursor: grab"],
[style*="cursor:grabbing"],
[style*="cursor: grabbing"],
[data-window-drag-handle] { cursor: grab !important; }
/* Native sliders: grab hand (overrides the I-beam the blanket input rule gives) */
input[type='range'] { cursor: grab !important; }
input[type='range']:active { cursor: grabbing !important; }
`

// ─────────────────────────────────────────────────────────────────────────
// C. GITHUB COPILOT LOOK (auto dark/light)
//   How Hermes paints: themes/context.tsx applyTheme() writes INLINE custom
//   properties on <html> (the --theme-* seeds + a few --dt-* palette vars).
//   Inline styles beat plain CSS, so a stylesheet alone can't reseed. A
//   MutationObserver on <html> re-applies the GitHub values right after each
//   theme paint (applyTheme is synchronous → observer fires post-batch). No
//   loop: re-applying identical values raises no mutation record.
//
//   Every surface derives from these seeds via color-mix() in styles.css
//   (--ui-bg-chrome/sidebar/card/elevated, --ui-stroke-*, muted…), plus the
//   --theme-mix-* knobs. Forcing the mixes to 100% makes surfaces EXACTLY the
//   GitHub values instead of a tinted blend. User-bubble + accent-soft are
//   left to the app's own derivation so message bubbles stay distinguishable.
// ─────────────────────────────────────────────────────────────────────────
const GH = {
  dark: {
    foreground: '#e6edf3',
    primary: '#1f6feb',
    secondary: '#21262d',
    accent: '#21262d',
    midground: '#484f58',
    background: '#15191e',
    sidebar: '#101418',
    card: '#1c2128',
    popover: '#22272e',
    border: '#30363d',
    input: '#484f58',
    ring: '#1f6feb',
    muted: '#262c33'
  },
  light: {
    foreground: '#1f2328',
    primary: '#0969da',
    secondary: '#f6f8fa',
    accent: '#f6f8fa',
    midground: '#6e7781',
    background: '#ffffff',
    sidebar: '#f6f8fa',
    card: '#ffffff',
    popover: '#ffffff',
    border: '#d1d9e0',
    input: '#d1d9e0',
    ring: '#0969da',
    muted: '#f6f8fa'
  }
}

// Seed + palette variables written inline by the app itself (same names it
// sets), mapped to a GitHub palette key.
const MAP = {
  // seeds (inline, from applyTheme `seeds`)
  '--theme-foreground': 'foreground',
  '--theme-primary': 'primary',
  '--theme-secondary': 'secondary',
  '--theme-accent-soft': 'accent',
  '--theme-midground': 'midground',
  '--theme-background-seed': 'background',
  '--theme-sidebar-seed': 'sidebar',
  '--theme-card-seed': 'card',
  '--theme-elevated-seed': 'popover',
  // palette (inline, from applyTheme `palette`)
  '--dt-border': 'border',
  '--dt-input': 'input',
  '--dt-ring': 'ring',
  '--dt-muted': 'muted',
  '--dt-sidebar-border': 'border',
  '--dt-primary-foreground': 'onPrimary',
  '--dt-primary-solid': 'primary',
  '--dt-primary-solid-foreground': 'onPrimary',
  '--dt-composer-ring': 'ring',
  // mix knobs — 100% seed ⇒ exact GitHub colors, no brand tint
  '--theme-mix-chrome': 'mix',
  '--theme-mix-card': 'mix',
  '--theme-mix-elevated': 'mix',
  '--theme-mix-bubble': 'mix'
}

function applyGhSeeds() {
  const root = document.documentElement
  const isDark = root.classList.contains('dark')
  const pal = isDark
    ? { ...GH.dark, onPrimary: '#ffffff' }
    : { ...GH.light, onPrimary: '#ffffff' }
  for (const [cssVar, key] of Object.entries(MAP)) {
    root.style.setProperty(cssVar, pal[key] === 'mix' ? '100%' : pal[key])
  }
  // Tooltip chip (block D): the app paints tooltips with an inverted pair
  // (bg-foreground / text-background) that resolves through the --ui-base
  // token chain; if those land on the same hue the tip goes white-on-white.
  // Pin a high-contrast pair inline (mode from the class the app itself uses)
  // so the CSS can use fixed, always-readable values.
  root.style.setProperty('--tl-tip-bg', isDark ? '#3d444d' : '#1f2328')
  root.style.setProperty('--tl-tip-fg', isDark ? '#f0f6fc' : '#ffffff')
}

function watchSeeds() {
  applyGhSeeds()
  const root = document.documentElement
  new MutationObserver(applyGhSeeds).observe(root, {
    attributes: true,
    attributeFilter: ['style', 'class']
  })
}

// Plain-CSS polish. `!important` everywhere: the app's own rules may sit
// later in the stylesheet order or be inline, and :root var re-definitions
// must win regardless of cascade position.
const CSS_LOOK = `
:root {
  /* GitHub's crisp radii (app default base 0.75rem / scalar 0.2 → smaller) */
  --radius: 8px !important;
  --radius-xs: 2px !important;
  --radius-sm: 6px !important;
  --radius-md: 6px !important;
  --radius-lg: 8px !important;
  --radius-xl: 8px !important;
  --radius-2xl: 10px !important;
  --radius-3xl: 12px !important;
  --radius-4xl: 12px !important;
  --radius-scalar: 0.5 !important;
  /* Flat GitHub: hairline hairline borders replace soft glow shadows */
  --shadow-sm: 0 !important;
  --shadow-md: 0 !important;
  --shadow-lg: 0 !important;
}
/* Transcript (Tailwind prose): GitHub code-chip look for inline code */
.prose code:not(pre code) {
  background: color-mix(in srgb, currentColor 10%, transparent) !important;
  border-radius: 4px !important;
  padding: 0.1em 0.35em !important;
  font: inherit !important;
}
/* D. TOOLTIPS — high-contrast chip. The app's own chip is an inverted
   pair (bg-foreground / text-background) which can collapse to the same
   hue (white-on-white). box-decoration-clone is used ONLY by the tooltip
   span, so this hits exactly that element in either dark or light mode. */
span.box-decoration-clone {
  background: var(--tl-tip-bg, #1f2328) !important;
  color: var(--tl-tip-fg, #ffffff) !important;
}
`

const CSS = [CSS_TITLEBAR, CSS_CURSOR, CSS_LOOK].join('\n')

export default {
  id: 'hermes-look',
  name: 'Hermes Look',
  description:
    'Hides 3 titlebar buttons, arrow cursor app-wide (I-beam kept in text, ' +
    'grab kept on drag handles), and restyles sidebar + chat to the GitHub ' +
    'Copilot look (auto dark/light). Delete this folder to revert.',
  register() {
    if (typeof document === 'undefined') return
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement('style')
      el.id = STYLE_ID
      el.textContent = CSS
      document.head.append(el)
    }
    watchSeeds()
  }
}
