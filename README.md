# js_birb_world

## Play it now: https://pemmyz.github.io/js_birb_world/

# PARABIRD '96 – World Tour Speedway

[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=flat&logo=three.js)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Birb World Version](https://img.shields.io/badge/Birb%20World-v2.4.96%20Retro%20Tour-00cec9)](https://pemmyz.github.io/js_birb_world/)

A browser-based 3D arcade paragliding speedway and exploration flight engine inspired by the visual style, physics, and aesthetics of late-90s PlayStation 1 classics.

Take flight as a low-poly tropical bird piloting an aerodynamically responsive paraglider canopy across **17 diverse procedural biomes**, navigate high-speed vortex checkpoint gates, compete in split-screen racing, or steer using real-world mobile device gyroscope tilt!

---

## 🌟 Features

### 🏁 Game Modes

- **1 Player (Solo Flight)**: Fullscreen free-roam and checkpoint speedway runs across any selected world.
- **2P Reverse Co-Op (Split-Screen)**: Player 1 (Emerald) flies forward (`Gate 1 ➔ 12`) while Player 2 (Sapphire) flies the reverse course (`Gate 12 ➔ 1`) to meet in the middle.
- **2P Speedway Race (Split-Screen)**: Head-to-head split-screen race through all checkpoint gates to the finish line with real-time timers and winner fanfares.

### 🗺️ World Tour Map Carousel

- **17 Unique Biomes & Courses**: Tropical Islands, Desert Dunes, Volcanic Ridges, Alpine Peaks, and more.
- **Interactive PS1 CRT Selector**: 3D scanline viewports, altitude tags, difficulty ratings, and dynamic sky/mountain previews.
- **Dynamic Terrain & Ocean Generation**: Vertex-colored procedural elevation, animated wave shaders, props (palms, pines), and high-altitude non-clipping cloud clusters.

### 🎮 Comprehensive Controller & Sensor Support

- **Dual Xbox / Gamepad Support**: Plug-and-play controller pairing via ABXY detection with independent axes for P1 and P2.
- **Hardware Diagnostic Test Lab**: Live input visualizer displaying Left/Right analog stick radars, button/trigger states, and dual-rumble haptic motor actuation tests.
- **Mobile Gyroscope Steering**:
  - Full iOS 13+ permission flow & Android sensor support.
  - **"Hold Mobile Device Still" Calibration**: 1.4-second resting posture sampler that locks your neutral holding angle.
  - **Anchored Virtual Joystick**: When Gyro is active, the virtual joystick anchors cleanly at the bottom-left corner (`135px` offset from screen edges), with the joystick thumb reflecting device tilt in real time.
- **Floating Virtual Joystick & D-Pad**: Dynamic touch controls for mobile screens.
- **Keyboard & Mouse**: Full WASD, Arrow Key, and mouse steering support.

### 🔊 Procedural Web Audio Engine

- **100% Procedural Synthesis**: Zero external audio files or downloads.
- **Dynamic Flight Wind System**: Continuous lowpass wind rush, resonant bandpass gusts, speed-scaled whistling overtones, and LFO breathing cycles.
- **Checkpoint "Plonk!"**: Punchy resonant pitch-drop chime on gate passage.
- **Audio Controls**: Real-time master volume slider in Quick Actions and auto-pause muting.

### ⚡ Quick Actions & Flight Utilities

- **Auto-Pause**: Freezes physics and mutes audio when switching tabs or losing focus (can be toggled ON/OFF).
- **Real-Time Water Altitude Slider**: Adjust sea level live from `-300m` (drain) to `+300m` (flood) with instant presets.
- **Force Reload Maps**: Hot-reloads map configurations and flushes geometry caches without refreshing the page.
- **Telemetry HUD**: Real-time `TIME`, `GATE`, `PTS`, `NEXT` distance, `ALT`, `SPD`, and a rolling **FPS Counter**.

---

## 🕹️ Controls

### Desktop Keyboard & Mouse

| Action | Player 1 (Solo) | Player 1 (Split-Screen) | Player 2 (Split-Screen) |
|---|---|---|---|
| **Turn Left / Right** | `A` / `D` or `◀` / `▶` | `◀` / `▶` | `A` / `D` |
| **Pitch Down / Up** | `W` / `S` or `▲` / `▼` | `▲` / `▼` | `W` / `S` |
| **Mouse Steer** | Move mouse across screen | Left half of screen | — |
| **Reset Match** | `Reset` on top bar / Quick Actions | `Reset` on top bar | `Reset` on top bar |
| **Invert Pitch** | Toggle in toolbar or Quick Actions (`↕ Invert: ON/OFF`) | Toggle in toolbar or Quick Actions | Toggle in toolbar or Quick Actions |

### Gamepads (Xbox / PlayStation / Generic)

- **Pairing**: Press `A`, `B`, `X`, or `Y` on any connected controller to assign to Player 1 or Player 2.
- **Steering**: Left Analog Stick or D-Pad.
- **Menu / Carousel**: Left Stick / D-Pad (`◀` / `▶` to browse, `A` / `Enter` to launch, `B` / `Esc` to return).
- **Diagnostics**: Open **Test Pad** in the pairing panel or Quick Actions to test stick deadzones and rumble vibration.

### Mobile & Tablet (Touch & Gyroscope)

- **Gyro Steering**: Tap **📱 Gyro: ON** or **🎯 Calibrate Still** in Quick Actions. Hold the device stationary for ~1.4s to set your neutral pitch and roll posture.
- **Virtual Joystick**:
  - *Standard mode*: Touch and drag anywhere on the screen to spawn a floating joystick.
  - *Gyro mode*: Anchors automatically to the bottom-left corner and moves in sync with device tilt.
- **Touch Buttons**: On-screen `◀` / `▶` (steer) and `▲` / `▼` (pitch) buttons.
- **Fullscreen**: Persistent **⛶ Fullscreen** button in the top-left corner.

---

## 📂 Project Architecture

The project is structured as modular ES6 modules:

```text
js_birb_parachute_island/
├── index.html              # HTML5 shell, HUDs, modals, and viewport containers
├── style.css               # Retro PS1 visual styling, responsive HUD, CRT effects
└── src/
    ├── main.js             # Main engine loop, game states, renderers & tab pause
    ├── world.js            # Three.js scene, terrain builder, ocean waves & lighting
    ├── flight.js           # Aerodynamics, kinematics, camera chase & checkpoint logic
    ├── glider.js           # Procedural low-poly paraglider, bird pilot & dynamic ropes
    ├── input.js             # Gamepad polling, Gyroscope calibration & touch joysticks
    ├── audio.js             # Procedural Web Audio API sound generator & wind synthesizer
    ├── ui.js                # HUD telemetry, carousel transitions & diagnostic modals
    └── maps/
        ├── mapRegistry.js  # Registry of all 17 worlds and procedural course configs
        └── ...             # Biome elevation, color palettes, and waypoint definitions
```

---

## 🪂 Flight Model & Aerodynamics

The flight model balances arcade accessibility with realistic glider behavior:

- **Default Speed**: 14.0 units/s, scaling dynamically between approximately 10 and 35+ km/h.
- **Pitch Influence**: Diving decreases altitude while accelerating forward speed; pulling back trades kinetic speed for glide lift.
- **Banking / Roll**: Horizontal steering interpolates realistic aerodynamic roll and visual banking.
- **Dynamic Suspension Ropes**: Four mathematical anchor cables continuously align the bird pilot harness to the paraglider canopy ribs.
- **Wayfinding Arrow**: A 3D directional arrow hovers above the canopy, actively pointing toward the next waypoint ring in the sky.

---

## 🚀 Running Locally

Because the project uses standard ES6 modules (`import` / `export`), it should be served via a local web server rather than opened directly as a `file://` URL.

### Using Python

```bash
python3 -m http.server 8000
```

Then navigate to:

**http://localhost:8000**

### Using Node.js

```bash
npx serve .
```

### Using VS Code

Install the **Live Server** extension, right-click `index.html`, and select **Open with Live Server**.

---

## ⚙️ Performance & Compatibility

- **Rendering Engine**: Three.js r128.
- **Target Framerate**: 60 FPS capped with dynamic timestep lerping.
- **Pixel Ratio**: Capped at 1.5 on high-DPI displays to maintain optimal mobile GPU performance.
- **Split-Screen Optimizations**: Hardware scissor testing (`renderer.setScissorTest(true)`) renders both players in a single WebGL context without unnecessary duplicate renderer overhead.
- **Supported Browsers**: Chrome, Edge, Firefox, and Safari.
- **Mobile**: iOS 13+ and Android devices with supported orientation/device-motion permissions.

---

## 📜 Credits & Inspiration

Created as a standalone retro-style 3D flight experiment.

### Inspirations

- PlayStation 1-era flight and racing aesthetics.
- **Pilotwings 64** and its arcade-style aerial challenges.
- **Spyro the Dragon** speedway levels.
- Low-poly procedural world building.
- Early console 3D flat-shading and aesthetic CRT scanlines.
- Late-90s arcade and console presentation.

---

## 🔗 Links

- **Play the game:** https://pemmyz.github.io/js_birb_world/
- **GitHub:** https://github.com/pemmyz
- **Three.js:** https://threejs.org/

---

## 📄 License

This project is licensed under the **MIT License** — free to use, modify, and redistribute.
