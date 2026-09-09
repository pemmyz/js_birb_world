// --- Map 11: Northern Lights (Expanded Night Massif) ---
export const auroraMap = {
  id: '11_aurora',
  number: '11/16',
  name: 'NORTHERN LIGHTS',
  icon: '🌌',
  biome: 'AURORA',
  desc: 'Midnight flight along 350m dark razor peaks glowing under neon emerald auroras.',
  difficulty: 'NORMAL',
  totalGates: 12,

  skyColor: 0x06101c,
  fogColor: 0x0a1d29,
  fogDensity: 0.0012,
  lighting: {
    ambient: { color: 0x1a4e5c, intensity: 0.85 },
    sun: { color: 0x48e6a8, intensity: 0.9, pos: [0, 600, 0] },
    fill: { color: 0x142e3b, intensity: 0.45, pos: [-240, -50, -240] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #02060d 0%, #0d2f33 100%)',
    mountainColor: '#1d323b',
    clipPath: 'polygon(0% 100%, 25% 65%, 50% 30%, 75% 65%, 100% 100%)',
    waterColor: '#061d26',
    altDisplay: '350M'
  },

  spawns: {
    p1: { pos: [0, 180, 740], yaw: 0.0 },
    p2Race: { pos: [12, 180, 740], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 140, 520),       // 1. Midnight valley gate
    new THREE.Vector3(-190, 85, 320),     // 2. Low flight over black ice lake
    new THREE.Vector3(-320, 210, 90),     // 3. Climbing glowing peak
    new THREE.Vector3(-220, 340, -110),   // 4. Above neon aurora curtain!
    new THREE.Vector3(0, 360, -210),      // 5. Highest peak summit pass
    new THREE.Vector3(230, 240, -110),    // 6. Plunging into dark couloir
    new THREE.Vector3(330, 75, 90),       // 7. Skimming reflective fjord
    new THREE.Vector3(210, 95, 330),      // 8. Chalet village flyby
    new THREE.Vector3(70, 125, 480),      // 9. Rising ridge
    new THREE.Vector3(-60, 150, 590),     // 10. Low slope glide
    new THREE.Vector3(-100, 170, 665),    // 11. Pre-gate climb
    new THREE.Vector3(-10, 180, 740)      // 12. Finish loop
  ],

  terrain: {
    size: 2200,
    segments: 90,
    getHeightAt(x, z) {
      const peaks = (Math.sin(x * 0.012) * Math.cos(z * 0.012) * 110) +
                    (Math.exp(-Math.hypot(x, z + 210) / 160) * 235);
      const lake = -Math.exp(-Math.hypot(x + 190, z - 320) / 110) * 45;
      return Math.max(12, peaks + lake + 25);
    },
    palette: {
      sand: 0x162633,
      lushGreen: 0x0f2e36,
      forestGreen: 0x0a2226,
      rocks: [0x17262e, 0x304952, 0x47666e]
    }
  },

  ocean: { size: 4000, segments: 35, color: 0x04131a, opacity: 0.96, hasWaves: true },
  props: { type: 'pines', count: 95, minRadius: 140, maxRadius: 650 },
  clouds: { count: 24, baseAlt: 280 }
};
