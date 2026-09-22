# hermes-config

Community look-and-feel configuration for [Hermes](https://hermes-agent.nousresearch.com/docs) Desktop.
**No fork, no source edits, no update-blocking** — everything here lives in the
sanctioned plugin slot (`%LOCALAPPDATA%\hermes\desktop-plugins\`) plus native app
settings, so Hermes auto-updates keep working normally.

## What it does

| # | Change | How | Revert |
|---|--------|-----|--------|
| 1 | Hide the 3 top-right titlebar buttons (layout editor, HUD mode, swap sidebar) | `plugins/hermes-look` (CSS) | delete the plugin folder |
| 2 | Arrows everywhere instead of pointer hands; I-beam kept inside text fields; grab hand on native sliders & drag handles | `plugins/hermes-look` (CSS) | delete the plugin folder |
| 3 | Your messages render as wide, right-pinned, centered border-less bubbles, matching the assistant column width for a clean Codex-style look | `plugins/hermes-look` (CSS) | delete the plugin folder |

All three are one plugin (the `hermes-look` folder).

## Install

```powershell
# 1. copy the plugin into the desktop-plugins slot (folder name matters: it must be "hermes-look")
Copy-Item -Recurse .\plugins\hermes-look $env:LOCALAPPDATA\hermes\desktop-plugins\hermes-look

# 2. restart the Hermes desktop app (or let it hot-load the plugin)
```

That's it. No config file, no `src/` edits, nothing outside:

- `%LOCALAPPDATA%\hermes\desktop-plugins\hermes-look\plugin.js`

## Uninstall / revert

```powershell
Remove-Item -Recurse -Force $env:LOCALAPPDATA\hermes\desktop-plugins\hermes-look
```

The app reverts to stock appearance. Native settings (tabs strip "Never",
theme) are yours to change in Settings anytime.

## Why the plugin, not source edits

Hermes Desktop is an Electron app whose entire surface palette is driven by a
handful of inline CSS seed tokens (`--theme-*` on `<html>`) plus a small set of
`--dt-*` palette variables. The plugin:

- hides the three titlebar icon buttons by their codicon classes
  (`.titlebar-icon-button:has(.codicon-…)`),
- normalizes the cursor (arrow app-wide, I-beam in text, grab on slider/drag),
- shrink-wraps user messages to their content and pins them right
  (`.composer-human-message`), for Codex-style bubbles.

It never touches app files and it never overrides your chosen theme — theme
switching stays exactly as native. Updates to Hermes Desktop replace `src/` and
its bundled CSS; this plugin just injects its stylesheet at load, so it
survives updates by design. If an update does change a selector, the worst
case is that rule matching nothing — everything else keeps working.

## Files

```
hermes-config/
├── README.md
└── plugins/
    └── hermes-look/
        └── plugin.js      # the whole thing (single-file, ESM, ~90 lines)
```

## License

MIT — do what you want with it. See [LICENSE](LICENSE).
