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
| 3 | GitHub-Copilot-flavored sidebar + chat look, following your Light/Dark setting automatically | `plugins/hermes-look` (seed-token override) | delete the plugin folder |
| 4 | Readable tooltips (high-contrast chip in both themes) | `plugins/hermes-look` (CSS) | delete the plugin folder |
| 5 | Solid (non-translucent) window | **native setting** — Settings → Appearance → Translucency, set to *Clear 0%* (or off) | set it back |

Items 1–4 are one plugin (the `hermes-look` folder). Item 5 is done in the app's
own Settings — a CSS plugin can't change native window transparency, so that one
is a one-time click, not a file.

## Install

```powershell
# 1. copy the plugin into the desktop-plugins slot (folder name matters: it must be "hermes-look")
Copy-Item -Recurse .\plugins\hermes-look $env:LOCALAPPDATA\hermes\desktop-plugins\hermes-look

# 2. one-time app setting: Settings → Appearance → Translucency → clear / 0
#    (or leave translucency as default if you *want* the see-through window)

# 3. restart the Hermes desktop app (or let it hot-load the plugin)
```

That's it. No config file, no `src/` edits, nothing outside:

- `%LOCALAPPDATA%\hermes\desktop-plugins\hermes-look\plugin.js`
- your personal translucency setting (stored by the app itself)

## Uninstall / revert

```powershell
Remove-Item -Recurse -Force $env:LOCALAPPDATA\hermes\desktop-plugins\hermes-look
```

The app reverts to stock appearance. Native settings (tabs strip "Never",
translucency level, theme) are yours to change in Settings anytime.

## Why the plugin, not source edits

Hermes Desktop is an Electron app whose entire surface palette is driven by a
handful of inline CSS seed tokens (`--theme-*` on `<html>`) plus a small set of
`--dt-*` palette variables. The plugin:

- asserts a GitHub-derived palette inline on `<html>` after every theme
  paint (a `MutationObserver` re-applies it post-batch, both dark and light),
- sets crisp GitHub radii and flat borders,
- hides the three titlebar icon buttons by their codicon classes
  (`.titlebar-icon-button:has(.codicon-…)`),
- normalizes the cursor (arrow app-wide, I-beam in text, grab on slider/drag),
- fixes the tooltip chip contrast.

It never touches app files. Updates to Hermes Desktop replace `src/` and its
bundled CSS; this plugin just re-injects after each theme change, so it
survives updates by design. If an update does change a selector, the worst
case is that block no-matching nothing — everything else keeps working.

## Files

```
hermes-config/
├── README.md
└── plugins/
    └── hermes-look/
        └── plugin.js      # the whole thing (single-file, ESM, ~215 lines)
```

## License

MIT — do what you want with it. See [LICENSE](LICENSE).
