// hermes-look — user appearance plugin (stock Hermes extension point).
// Delete this folder to revert. Never touches app source; survives updates.
//
// Contents (each block independently removable):
//   A. Titlebar buttons — hide: Layout editor, HUD mode, Swap sidebar
//   B. Cursor — arrow everywhere; I-beam in text fields; keep grab on drag
//   C. Chat bubbles — user messages wide, right-pinned, text centered inside
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
//   inside a right-parked self-end container) — flat full-width rows with a
//   border line and lopsided hover padding. Make them read as deliberate,
//   wide, right-parked, centered bubbles: no structural change, CSS only.
//   Verified vs components/assistant-ui/thread/user-message.tsx + styles.css:
//     - USER_BUBBLE_BASE_CLASS: "composer-human-message … w-full …
//       rounded-xl border bg-(--dt-user-bubble)"
//     - StickyHumanMessageContainer: "self-end" (container already right-aligned)
//     - User row: "group/user-message … -mx-4 px-4 …" + data-role/data-slot
//   Look per user prefs: WIDE (same width as assistant text, feels natural),
//   hard-parked at the right edge, text centered inside, rounded corners,
//   NO border line.
// ─────────────────────────────────────────────────────────────────────────
const CSS_BUBBLES = `
.composer-human-message {
  width: 100% !important;          /* full column = as wide as assistant rows */
  margin: 0 !important;            /* flush to the column's right edge  */
  border: none !important;
  box-shadow: none !important;
  border-radius: 14px !important;
  padding-left: 16px !important;   /* symmetric, text truly centered   */
  padding-right: 16px !important;  /* was pr-9(36px) hover-button slot */
  text-align: center !important;
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
    'messages as wide, right-parked, centered border-less bubbles. Theme ' +
    'is fully Hermes\u2019 own. Delete this folder to revert.',
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
