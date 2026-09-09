// --- Map 01: Tropical Island '96 (Original Island 1:1) ---

export const tropicalMap = {
  id: '01_tropical',
  number: '01/16',
  name: 'TROPICAL ISLAND',
  icon: '🏝️',
  biome: 'TROPICAL',
  desc: 'Classic PS1 tropical speedway with sandy beaches, palm trees, and ocean vortex gates.',
  difficulty: 'NORMAL',
  totalGates: 12,

  // Atmosphere & Lighting
  skyColor: 0x8cd3eb,
  fogColor: 0xa7e1f2,
  fogDensity: 0.0018,
  lighting: {
    ambient: { color: 0xdcf4ff, intensity: 0.75 },
    sun: { color: 0xfff6dd, intensity: 1.1, pos: [200, 450, 250] },
    fill: { color: 0x78b8d0, intensity: 0.4, pos: [-200, -50, -200] }
  },

  // UI Preview Styling
  preview: {
    skyGradient: 'linear-gradient(180deg, #8cd3eb 0%, #a7e1f2 100%)',
    mountainColor: '#2d8a3e',
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

  // The Exact 12 GTA Vortex Checkpoint Gates
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

  // Exact Procedural Terrain Engine
  terrain: {
    size: 1400,
    segments: 85,
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
        h = (peak1 + peak2 + ridges + 16) * mask;
      }
      h += (Math.sin(x * 0.15) * Math.cos(z * 0.15)) * 1.5;
      return h;
    },
    palette: {
      sand: 0xe5c365,
      lushGreen: 0x2d8a3e,
      forestGreen: 0x1e612b,
      rocks: [0x8a5229, 0x6e4321, 0x54361c, 0x82898f, 0x5c656d, 0x272b30]
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

  // Props (80 Palm Trees)
  props: {
    type: 'palms',
    count: 80,
    minRadius: 230,
    maxRadius: 325
  },

  // Procedural Non-Clipping Clouds
  clouds: {
    count: 34,
    baseAlt: 175
  }
};
