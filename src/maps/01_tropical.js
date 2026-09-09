// --- Map 01: Tropical Island '96 (Corrected Beach, Jungle & Mountain Biome) ---

// Natural earthy granite, basalt & cliff tones (free of any blue tint)
const rockPalette = [
  new THREE.Color(0x765f4f), // warm granite
  new THREE.Color(0x614e40), // weathered cliff brown
  new THREE.Color(0x524135), // dark volcanic basalt
  new THREE.Color(0x826c5b), // high mountain crag
  new THREE.Color(0x6d5545), // rugged canyon rock
  new THREE.Color(0x483a31)  // deep cliff shadow rock
];

const highPeakRock = new THREE.Color(0x8a7563);  // summit limestone/granite
const sandColor = new THREE.Color(0xe5c365);     // dry golden beach sand
const wetSandColor = new THREE.Color(0xbaa05d);  // wet shoreline sand
const lushGreen = new THREE.Color(0x2d8a3e);     // vibrant coastal grass
const forestGreen = new THREE.Color(0x1a5e28);   // dense tropical jungle canopy
const jungleDark = new THREE.Color(0x144a20);    // deep slope jungle foliage

export const tropicalMap = {
  id: '01_tropical',
  number: '01/16',
  name: 'TROPICAL ISLAND',
  icon: '🏝️',
  biome: 'TROPICAL',
  desc: 'Classic PS1 tropical speedway with flat sandy beaches, lush mountain jungle, and rocky crags.',
  difficulty: 'NORMAL',
  totalGates: 12,

  // Atmosphere & Lighting
  skyColor: 0x8cd3eb,
  fogColor: 0xa7e1f2,
  fogDensity: 0.0018,
  lighting: {
    ambient: { color: 0xe8f4f8, intensity: 0.72 },
    sun: { color: 0xfff4db, intensity: 1.15, pos: [200, 450, 250] },
    fill: { color: 0x8ab8cb, intensity: 0.35, pos: [-200, 80, -200] }
  },

  // UI Preview Styling
  preview: {
    skyGradient: 'linear-gradient(180deg, #8cd3eb 0%, #a7e1f2 100%)',
    mountainColor: '#6d5545',
    clipPath: 'polygon(0% 100%, 25% 45%, 45% 70%, 70% 20%, 100% 100%)',
    waterColor: '#1da2b4',
    altDisplay: '220M'
  },

  // Spawns
  spawns: {
    p1: { pos: [0, 185, 480], yaw: 0.0 },
    p2Race: { pos: [8, 185, 480], yaw: 0.0 },
    p2CoopIndex: 11 // Gate 12
  },

  // GTA Vortex Checkpoint Rings
  waypoints: [
    new THREE.Vector3(0, 180, 330),     // Gate 1
    new THREE.Vector3(-80, 160, 190),   // Gate 2
    new THREE.Vector3(-180, 145, 50),   // Gate 3
    new THREE.Vector3(-140, 175, -100), // Gate 4
    new THREE.Vector3(-45, 225, -75),   // Gate 5
    new THREE.Vector3(65, 190, -125),   // Gate 6
    new THREE.Vector3(180, 140, -40),   // Gate 7
    new THREE.Vector3(210, 95, 90),     // Gate 8
    new THREE.Vector3(130, 115, 235),   // Gate 9
    new THREE.Vector3(30, 150, 360),    // Gate 10
    new THREE.Vector3(-90, 180, 420),   // Gate 11
    new THREE.Vector3(-10, 190, 480)    // Gate 12
  ],

  // Procedural Terrain & Texturing Engine
  terrain: {
    size: 1400,
    segments: 85,
    palette: {
      sand: 0xe5c365,
      wetSand: 0xbaa05d,
      lushGreen: 0x2d8a3e,
      forestGreen: 0x1a5e28,
      rocks: [0x765f4f, 0x614e40, 0x524135, 0x826c5b, 0x6d5545, 0x483a31],
      summit: 0x8a7563
    },

    getHeightAt(x, z) {
      const distFromCenter = Math.hypot(x, z);
      const islandRadius = 380;
      let h = -12;

      if (distFromCenter < islandRadius) {
        const mask = Math.pow(Math.cos((distFromCenter / islandRadius) * (Math.PI / 2)), 1.25);
        const peak1 = Math.exp(-Math.hypot(x + 50, z - 30) / 95) * 220;
        const peak2 = Math.exp(-Math.hypot(x - 90, z + 70) / 110) * 190;
        const ridges = (Math.sin(x * 0.022) * Math.cos(z * 0.022) * 45) +
                       (Math.sin(x * 0.05 + 1.2) * Math.sin(z * 0.05) * 22);

        // Solid interior floor keeps inland valleys above sea level
        const interiorFloor = Math.max(0, 1.0 - (distFromCenter / 270)) * 15;
        const rawHeight = Math.max(interiorFloor, peak1 + peak2 + ridges + 16);
        h = rawHeight * mask;
      }
      h += (Math.sin(x * 0.15) * Math.cos(z * 0.15)) * 1.5;
      return h;
    },

    // Strict Biomes: Flat beach at sea level -> Jungle lowlands & slopes -> Mountain rock
    getColorAt(x, z, h, targetColor = new THREE.Color()) {
      // 1. Flat Beach (strictly at water line, never climbing the mountain)
      if (h <= 0.5) {
        targetColor.copy(wetSandColor);
      } else if (h <= 2.2) {
        targetColor.copy(sandColor);
      } else if (h <= 3.8) {
        // Quick boundary transition from flat sand into coastal turf
        const t = (h - 2.2) / 1.6;
        targetColor.copy(sandColor).lerp(lushGreen, t);
      } 
      // 2. Coastal Lowlands & Interior Jungle Valleys
      else if (h <= 25.0) {
        const t = (h - 3.8) / 21.2;
        targetColor.copy(lushGreen).lerp(forestGreen, t);
      } 
      // 3. Mid-Level Mountain Jungle (covers the slopes up to 60m)
      else if (h <= 60.0) {
        const t = (h - 25.0) / 35.0;
        const canopyNoise = Math.sin(x * 0.09) * Math.cos(z * 0.09);
        const foliage = canopyNoise > 0 ? forestGreen : jungleDark;
        targetColor.copy(foliage);
      } 
      // 4. Upper Slope Transition: Jungle gives way to rocky crags
      else if (h <= 85.0) {
        const t = (h - 60.0) / 25.0;
        const rockIndex = Math.floor(Math.abs(Math.sin(x * 12.3 + z * 7.7)) * rockPalette.length);
        const rockPick = rockPalette[rockIndex];
        targetColor.copy(forestGreen).lerp(rockPick, t);
      } 
      // 5. Mountain Peaks & Summits (100% warm rock faces)
      else {
        const rockIndex = Math.floor(Math.abs(Math.sin(x * 12.3 + z * 7.7)) * rockPalette.length);
        const rockPick = rockPalette[rockIndex];

        if (h > 125.0) {
          const summitFactor = Math.min(1.0, (h - 125.0) / 75.0);
          targetColor.copy(rockPick).lerp(highPeakRock, summitFactor * 0.65);
        } else {
          targetColor.copy(rockPick);
        }
      }

      return targetColor;
    }
  },

  // Ocean
  ocean: {
    size: 3000,
    segments: 30,
    color: 0x1da2b4,
    opacity: 0.88,
    hasWaves: true
  },

  // Props (Palm trees planted around the flat beach and low coastal jungle)
  props: {
    type: 'palms',
    count: 85,
    minRadius: 210,
    maxRadius: 330
  },

  // Procedural Non-Clipping Clouds
  clouds: {
    count: 34,
    baseAlt: 175
  }
};

export default tropicalMap;
