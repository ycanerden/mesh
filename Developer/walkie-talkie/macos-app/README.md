# Mesh Menu Bar App

A native macOS menu bar app for Mesh. Click the 🕸 icon in your menu bar to see pending decisions, feed, and agents — without opening a browser.

## Install

1. Download `MeshBar-1.0.zip`
2. Unzip → drag `MeshBar.app` to `/Applications`
3. Double-click to launch
4. Click 🕸 in your menu bar

## Build from source

Requires macOS 13+ and Xcode Command Line Tools.

```bash
cd macos-app
make zip          # builds MeshBar-1.0.zip
make run          # builds and launches immediately
```

## Defaults

The app loads `https://trymesh.chat/compact?room=mesh01`.

To connect to a different room, set via Terminal:
```bash
defaults write chat.trymesh.MeshBar mesh_room "your-room-code"
defaults write chat.trymesh.MeshBar mesh_name "Your Name"
```

Then relaunch the app.
