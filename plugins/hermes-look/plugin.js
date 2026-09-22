// hermes-look — user appearance plugin (stock Hermes extension point).
// Delete this folder to revert. Never touches app source; survives updates.
//
// Contents (each block independently removable):
//   A. Titlebar buttons — hide: Layout editor, HUD mode, Swap sidebar
//   B. Cursor — arrow everywhere; I-beam in text fields; keep grab on drag
//   C. Chat bubbles — user messages hug their content, parked right (Codex-style)
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
//   they read as flat full-width rows. Shrink-wrap the bubble and pin it
//   right: exactly the Codex look, zero structural change.
//   Verified vs components/assistant-ui/thread/user-message.tsx + styles.css:
//     - USER_BUBBLE_BASE_CLASS: "composer-human-message … w-full …
//       rounded-xl border bg-(--dt-user-bubble)"
//     - StickyHumanMessageContainer: "self-end" (container already right-aligned)
//     - styles.css has no competing width rule on this element.
// ─────────────────────────────────────────────────────────────────────────
const CSS_BUBBLES = `
.composer-human-message {
  width: fit-content !important;
  max-width: 100% !important;
  margin-left: auto !important;
  margin-right: 0 !important;
}
`

const CSS = [CSS_TITLEBAR, CSS_CURSOR, CSS_BUBBLES].join('\n')

export default {
  id: 'hermes-look',
  name: 'Hermes Look',
  description:
    'Hides 3 titlebar buttons, normalizes the cursor (arrow app-wide, ' +
    'I-beam kept in text, grab kept on the drag handles), and parks user ' +
    'messages as right-aligned, content-hugging bubbles. Theme selection ' +
    'is fully Hermes\u2019 own. Delete this folder to revert.',
  register() {
    if (typeof document === 'undefined') return
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement('style')
      el.id = STYLE_ID
      el.textContent = CSS
      document.head.append(el)
    }
  }
}
