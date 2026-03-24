# muz — AI Skills Workspace

## Latest Changes

### Scroll Fix
Fixed the persistent scroll bug. The root cause was duplicate CSS rules for `.main-content` and `.sidebar` that conflicted with the proper layout. Added `min-height: 0` and `overflow: hidden` to `.main` to constrain the flex container height.

### Multi-Model Support
Replaced the Claude-only API integration with a provider-agnostic system:

| Provider | Model | API Key Format |
|----------|-------|----------------|
| **Claude (Anthropic)** | claude-sonnet-4 | `sk-ant-api03-...` |
| **OpenAI** | gpt-4o-mini | `sk-proj-...` |
| **Google (Gemini)** | gemini-2.0-flash | `AIza...` |

Users can switch providers in **Settings → AI Provider** and only need one API key.

![Multi-Model Settings](file:///Users/canerden/.gemini/antigravity/brain/d1c85ebb-f1e7-422b-b413-4f4a231a59e9/multi_model_settings_1770975667026.png)

### Scroll Fix Verified
![Scroll Fix](file:///Users/canerden/.gemini/antigravity/brain/d1c85ebb-f1e7-422b-b413-4f4a231a59e9/scroll_fix_verified_1770974514524.png)

### Theme Support
Three themes: **Dark** (default), **Light** (Claude-inspired), and **Solar** (Solarized).

---

## Files Changed

| File | What Changed |
|------|-------------|
| `index.css` | Removed duplicate CSS rules, added `min-height: 0` to `.main` and `.main-content` |
| `Settings.jsx` | Added AI Provider selector (Claude/OpenAI/Google) |
| `App.jsx` | Multi-provider API routing in browser mode |
| `electron/main.cjs` | Multi-provider API routing in Electron mode |
