// hermes-look — user appearance plugin (stock Hermes extension point).
// Delete this folder to revert. Never touches app source; survives updates.
//
// Contents (each block independently removable):
//   A. Titlebar buttons — hide: Layout editor, HUD mode, Swap sidebar
//   B. Cursor — arrow everywhere; I-beam in text fields; keep grab on drag
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

const CSS = [CSS_TITLEBAR, CSS_CURSOR].join('\n')

export default {
  id: 'hermes-look',
  name: 'Hermes Look',
  description:
    'Hides 3 titlebar buttons and normalizes the cursor (arrow app-wide, ' +
    'I-beam kept in text, grab kept on the drag handles). Theme selection is ' +
    'fully Hermes\u2019 own. Delete this folder to revert.',
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
