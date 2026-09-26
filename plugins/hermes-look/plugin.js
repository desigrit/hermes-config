// hermes-look — user appearance plugin (stock Hermes extension point).
// Delete this folder to revert. Never touches app source; survives updates.
//
// Contents (each block independently removable):
//   A. Titlebar buttons — hide: Layout editor, HUD mode, Swap sidebar
//   B. Cursor — arrow everywhere; I-beam in text fields; keep grab on drag
//   C. Chat bubbles — user messages hug their content (≤70% wide), right-
//      parked, left-aligned text, border-less, rounded (Codex-style)
//   D. Sticky bubble — UNPINNED: not pinned to the top of the scroller,
//      no 2-line auto-clamp (full text always shown), no content clip
//   E. Composer — chat input rendered as a plain gray, fully rounded,
//      border-less well (no focus outline/ring either)
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
// C. CHAT BUBBLES (Codex-style user messages)
//   Upstream already renders user turns as glass bubbles (.composer-human-message,
//   inside a right-parked self-end container) — but stretches them w-full, so
//   they read as flat full-width rows. Match the user's reference: hug the
//   content up to a 70% cap (long text wraps cleanly), right-parked with
//   breathing room on the left, text left-aligned — no structural change.
//   Verified vs components/assistant-ui/thread/user-message.tsx + styles.css:
//     - USER_BUBBLE_BASE_CLASS: "composer-human-message … w-full …
//       rounded-xl border bg-(--dt-user-bubble)"
//     - StickyHumanMessageContainer: "self-end" (container already right-aligned)
//     - User row: "group/user-message … -mx-4 px-4 …" + data-role/data-slot
//   Look per user's reference image (2026-09-22): content-hugging bubble up to
//   ~2/3 of the column, wraps when long, right-pinned, open left gap,
//   rounded corners, NO border line, left-aligned text.
// ─────────────────────────────────────────────────────────────────────────
const CSS_BUBBLES = `
.composer-human-message {
  width: fit-content !important;     /* hug the content …            */
  max-width: 70% !important;        /* … up to ~70% of the column, then wrap */
  margin-left: auto !important;     /* right-parked, left gap clean   */
  border: none !important;
  box-shadow: none !important;
  border-radius: 14px !important;
  padding-left: 16px !important;
  padding-right: 16px !important;   /* was pr-9(36px) hover-button slot */
  text-align: left !important;
}
.composer-human-message:hover { border: none !important; }
`

// ─────────────────────────────────────────────────────────────────────────
// D. STICKY BUBBLE → UNPINNED
//   Two independent upstream mechanisms do what the user reported as "the
//   bubble stays pinned on top of the window while scrolling":
//     1. CSS  — [data-slot='aui_user-message-root'] { position: sticky;
//               top: ~4px }  (thread/user-message.tsx StickyHumanMessageContainer
//               class "sticky …" + styles.css:1695)
//     2. JS   — useStickyPromptClip.ts paints `--sticky-prompt-clip` inline on
//               SIBLING elements under the pinned bubble; the only consumer is
//               styles.css:1702 `[data-sticky-prompt-clip] { clip-path: inset(…) }`.
//               → killing that one rule fully disables the clip with no source
//               edit (hook re-paints a harmless var, nothing reads it).
//   And the "auto-compact to ~2 lines" the user wants gone:
//     3. CSS  — thread/user-message.tsx:397 adds class `sticky-human-clamp`
//               → styles.css:1724 max-height ≈ 4 line-boxes + overflow:hidden
//               (+ soft fade mask when clamped).
//   All three are lifted with !important below — reversible, survives updates.
// ─────────────────────────────────────────────────────────────────────────
const CSS_UNSTICK = `
[data-slot='aui_user-message-root'] {
  position: relative !important;   /* out: the top-pin   */
  top: auto !important;
}
.sticky-human-clamp {
  max-height: none !important;     /* out: the ~2-line clamp  */
  overflow: visible !important;
  -webkit-mask-image: none !important;   /* out: the fade hint    */
  mask-image: none !important;
}
[data-sticky-prompt-clip] {
  clip-path: none !important;      /* out: the JS sibling clip */
}
`

// ─────────────────────────────────────────────────────────────────────────
// E. COMPOSER (chat input) — gray, fully rounded, no outline
//   Verified vs app/chat/composer/index.tsx + styles.css:
//     - [data-slot='composer-surface'] — the visible box holding the rich
//       input: tailwind `rounded-[inherit] border …`, painted with
//       `--composer-fill` (color-mix of card over background, ~opaque),
//       border-color forced to --ui-stroke-secondary (styles.css:1918).
//     - rounded-[inherit] chains up to the root's `rounded-2xl` (16px).
//   The user asked: rounded corners + gray background + no outline. So we
//   bump the surface radius past the 16px inheritance, fill it with a solid
//   neutral gray (var(--user-gray), light/dark safe), and strip the border
//   in every state (rest/hover/focus all paint border-color + the focus
//   ring uses box-shadow). The `--dt-input:0`-style ring tokens are kept
//   because the app reads them via calc() — safer to zero their *effect*
//   than their *definition*.
// ─────────────────────────────────────────────────────────────────────────
const CSS_COMPOSER = `
/* Override the app's own fill TOKEN at every state level. The surface element
   paints background from var(--composer-fill) via an inline Tailwind style that
   property-level overrides cannot beat - but the token itself cascades, so
   overwriting it re-paints the whole composer (surface + docked popovers +
   the ? help) in one place, in rest / scrolled-up / HUD states alike. */
[data-slot='composer-root'] {
  --composer-fill: #4a4f57 !important;
  box-shadow: none !important;                /* kill dock glow / ring shadow */
}
[data-slot='composer-surface'] {
  border-radius: 22px !important;             /* fully rounded well           */
  background: #4a4f57 !important;             /* belt-and-braces on the token */
  border: none !important;                    /* no outline, any state        */
  box-shadow: none !important;
  outline: none !important;
}
[data-slot='composer-root'][data-thread-scrolled-up],
[data-slot='composer-root'][data-popped-out],
[data-hud-shell] [data-slot='composer-root'] {
  --composer-fill: #4a4f57 !important;        /* keep the token flat in every state */
}
/* Kill the app's own state-ladder + ring paints (box-shadow / border-color) */
[data-slot='composer-surface']:hover,
[data-slot='composer-surface']:focus,
[data-slot='composer-surface']:focus-within {
  border-color: transparent !important;
  box-shadow: none !important;
}
[data-slot='composer-root'] [class*='ring-'] {
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), none;
}
`

const CSS = [CSS_TITLEBAR, CSS_CURSOR, CSS_BUBBLES, CSS_UNSTICK, CSS_COMPOSER].join('\n')

export default {
  id: 'hermes-look',
  name: 'Hermes Look',
  description:
    'Hides 3 titlebar buttons, normalizes the cursor, renders user messages ' +
    'as right-parked, content-hugging border-less bubbles (full text, never ' +
    'clamped, never pinned to the top while scrolling), and paints the chat ' +
    'input as a plain gray, fully rounded, border-less well. ' +
    'Theme is fully Hermes\u2019 own. Delete this folder to revert.',
  register() {
    if (typeof document === 'undefined') return
    // Idempotent: update the living style tag instead of skipping it, so an
    // in-place hot-reload (loader re-invokes register without removing the
    // element) actually picks up the new CSS.
    let el = document.getElementById(STYLE_ID)
    if (!el) {
      el = document.createElement('style')
      el.id = STYLE_ID
      document.head.append(el)
    }
    el.textContent = CSS
  }
}
