# PROJECT ZERO — V0.2

V0.2 is a rebuilt GitHub Pages-compatible Three.js/WebXR prototype addressing the first bug report.

## Publish
Upload `index.html`, `style.css`, `game.js`, and `README.md` to the root of a GitHub repository. In **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, and save. Open the HTTPS Pages URL after deployment.

Three.js and its WebXR helpers load from jsDelivr, so the game needs internet access.

## Desktop
- WASD / arrows: move
- Mouse: look (click game to capture)
- Left click: fire
- E: prime / safe
- R: insert a spare energy cell
- I: inspect
- 1 / 2 / 3: select module

## VR
- Use the visible **Enter VR** button in a WebXR-capable browser/headset.
- Left controller thumbstick: walk relative to head direction.
- Left trigger: prime/safe (or reload when the charge is empty).
- Right trigger: fire.
- Right grip: toggle inspection.
- Controller models plus stylized glove meshes are attached to the controller grips.
- The emitter is attached to the right controller grip rather than the tracked camera.

## V0.2 changes
- Locomotion moved to a player rig, preserving headset tracking.
- Collision resolution is horizontal and axis-separated against expanded obstacles.
- VR controller grip models and visible stylized hands.
- Smaller, more detailed PX-01 emitter with rails, sights, trigger guard, cell housing, indicator, and muzzle.
- Held emitter is hidden if a desktop obstacle blocks the view-to-muzzle segment.
- Four physical energy-cell pickups can be collected in the range; collected cells become spare inventory.
- Reload consumes a spare cell and refills the current module.
- Desktop HUD remains available; game status also updates in the HUD.

## Known limitations / test notes
- WebXR behavior varies by headset/browser and needs testing on the actual target device.
- Three.js is imported from a CDN.
- VR hands are stylized glove meshes over standard controller models, not articulated skeletal hand tracking.
- The VR version does not yet have a fully spatial, controller-operated menu; controls are available through controller inputs and game status is mirrored in the headset HUD where the browser supports the page overlay.
- This build has not been physically tested on a headset in this environment.
