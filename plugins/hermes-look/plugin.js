// hermes-look — user appearance plugin (stock Hermes extension point).
// Delete this folder to revert. Never touches app source; survives updates.
//
// Contents (each block independently removable):
//   A. Titlebar buttons — hide: Layout editor, HUD mode, Swap sidebar
//   B. Cursor — arrow everywhere; I-beam in text fields; keep grab on drag
//   C. Chat bubbles — user messages hug their content (≤70% wide), right-
//      pinned, left-aligned text, border-less, rounded (Codex-style)
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

const CSS = [CSS_TITLEBAR, CSS_CURSOR, CSS_BUBBLES].join('\n')

export default {
  id: 'hermes-look',
  name: 'Hermes Look',
  description:
    'Hides 3 titlebar buttons, normalizes the cursor (arrow app-wide, ' +
    'I-beam kept in text, grab kept on the drag handles), and renders user ' +
    'messages as right-pinned, content-hugging (up to 70% width) border-less ' +
    'bubbles with left-aligned text. ' +
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
