# PROJECT ZERO — VR Field Test

A browser-based 3D training-range game designed for GitHub Pages. It supports desktop play and WebXR headsets/browsers that support immersive VR.

## Publish with GitHub Pages

1. Create a new GitHub repository.
2. Upload **all four project files** (`index.html`, `style.css`, `game.js`, `README.md`) to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then save.
6. Wait for GitHub Pages to publish. Open the generated HTTPS address.

The game imports Three.js from jsDelivr, so the player needs an internet connection when loading it.

## Controls

### Desktop
- `W A S D` / arrow keys — move
- Mouse — look around (click the game to capture the mouse)
- Left click — fire energy pulse
- `E` — prime / safe the emitter
- `R` — recharge energy cell
- `I` — inspect device
- `1`, `2`, `3` — select attachment

### VR
- Enter VR using the button in the lower-right corner (when supported).
- Left controller thumbstick — move
- Left controller trigger — prime / safe the emitter
- Right controller trigger — fire
- Right controller grip — inspect toggle

## Current build

- 3D training range with terrain, cover structures, and collision.
- PX-01 fictional pulse emitter.
- Three fictional energy configurations.
- Energy-cell charge and recharge loop.
- Five floating targets and a clear-range objective.
- Desktop controls and WebXR controller input.

## Compatibility notes

WebXR immersive VR generally requires HTTPS and a compatible browser/headset. GitHub Pages provides HTTPS. Desktop mode is available in modern browsers with WebGL support. The game loads Three.js from a CDN.

This is an initial playable foundation. Physical headset/controller testing still needs to be done on the target device. The device is a fictional sci-fi training tool, not a real firearm simulation.
