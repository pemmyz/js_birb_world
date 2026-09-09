// --- Map 12: Giant Forest (Expanded Titan Canopies) ---
export const giantforestMap = {
  id: '12_giantforest',
  number: '12/16',
  name: 'GIANT FOREST',
  icon: '🌳',
  biome: 'TITAN',
  desc: 'Weave beneath titan redwoods dwarfed by massive 280m forested ridges.',
  difficulty: 'HARD',
  totalGates: 12,

  skyColor: 0x4f755e,
  fogColor: 0x769984,
  fogDensity: 0.0018,
  lighting: {
    ambient: { color: 0xb5d9c0, intensity: 0.75 },
    sun: { color: 0xfff4d6, intensity: 1.1, pos: [280, 560, 240] },
    fill: { color: 0x2e4f3a, intensity: 0.45, pos: [-240, -50, -240] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #375945 0%, #769984 100%)',
    mountainColor: '#0b2611',
    clipPath: 'polygon(0% 100%, 20% 70%, 40% 50%, 70% 65%, 100% 100%)',
    waterColor: '#1c3d2e',
    altDisplay: '280M'
  },

  spawns: {
    p1: { pos: [0, 170, 720], yaw: 0.0 },
    p2Race: { pos: [12, 170, 720], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 135, 520),       // 1. Forest gate
    new THREE.Vector3(-190, 70, 320),     // 2. 100m dive under giant boughs
    new THREE.Vector3(-320, 60, 100),     // 3. Deep hollow root run
    new THREE.Vector3(-240, 190, -110),   // 4. Steep ridge climb
    new THREE.Vector3(0, 280, -210),      // 5. Titan tree ridge summit
    new THREE.Vector3(230, 175, -110),    // 6. Canopy descent
    new THREE.Vector3(330, 80, 100),      // 7. Ravine stream run
    new THREE.Vector3(210, 85, 330),      // 8. Low clearing
    new THREE.Vector3(70, 115, 480),      // 9. Forest slope
    new THREE.Vector3(-60, 140, 590),     // 10. Low slope glide
    new THREE.Vector3(-100, 155, 660),    // 11. Final approach
    new THREE.Vector3(-10, 170, 720)      // 12. Finish loop
  ],

  terrain: {
    size: 2200,
    segments: 90,
    getHeightAt(x, z) {
      const ridges = (Math.sin(x * 0.01) * Math.cos(z * 0.01) * 95) + 30;
      const hollow = -Math.exp(-Math.hypot(x + 320, z - 100) / 120) * 65;
      const peaks = Math.exp(-Math.hypot(x, z + 210) / 160) * 160;
      return Math.max(14, ridges + hollow + peaks);
    },
    palette: {
      sand: 0x363321,
      lushGreen: 0x16421e,
      forestGreen: 0x09240e,
      rocks: [0x292e2a, 0x3d453f, 0x545e56]
    }
  },

  ocean: { size: 4000, segments: 35, color: 0x133024, opacity: 0.92, hasWaves: false },
  props: { type: 'pines', count: 180, minRadius: 40, maxRadius: 650 },
  clouds: { count: 35, baseAlt: 220 }
};
