// --- Map 10: Lost Island (Expanded Karst Pillars) ---
export const lostislandMap = {
  id: '10_lostisland',
  number: '10/16',
  name: 'LOST ISLAND',
  icon: '🦖',
  biome: 'JURASSIC',
  desc: 'Slalom between 340m sheer karst pillars and dive 260m into sunken jungle lagoons.',
  difficulty: 'HARD',
  totalGates: 12,

  skyColor: 0x488276,
  fogColor: 0x76a89c,
  fogDensity: 0.0016,
  lighting: {
    ambient: { color: 0xc4ede2, intensity: 0.75 },
    sun: { color: 0xfff6dd, intensity: 1.2, pos: [290, 560, 260] },
    fill: { color: 0x315950, intensity: 0.45, pos: [-240, -60, -240] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #306157 0%, #76a89c 100%)',
    mountainColor: '#124220',
    clipPath: 'polygon(0% 100%, 20% 30%, 40% 75%, 70% 25%, 100% 100%)',
    waterColor: '#0e7068',
    altDisplay: '340M'
  },

  spawns: {
    p1: { pos: [0, 180, 740], yaw: 0.0 },
    p2Race: { pos: [12, 180, 740], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 150, 520),       // 1. Karst valley gate
    new THREE.Vector3(-190, 80, 320),     // 2. Deep 100m jungle plunge
    new THREE.Vector3(-330, 240, 90),     // 3. Rocketing up giant karst tower
    new THREE.Vector3(-220, 340, -120),   // 4. Titan karst spire peak
    new THREE.Vector3(0, 180, -220),      // 5. 160m dive to hidden cavern lagoon
    new THREE.Vector3(230, 310, -110),    // 6. Updraft to eastern rock needle
    new THREE.Vector3(330, 85, 100),      // 7. Dive to mangrove coast
    new THREE.Vector3(210, 110, 330),     // 8. Low jungle canopy skim
    new THREE.Vector3(70, 135, 480),      // 9. Karst gap slalom
    new THREE.Vector3(-60, 155, 590),     // 10. Rising pass
    new THREE.Vector3(-100, 170, 665),    // 11. Pre-gate approach
    new THREE.Vector3(-10, 180, 740)      // 12. Finish loop
  ],

  terrain: {
    size: 2200,
    segments: 90,
    getHeightAt(x, z) {
      const karsts = Math.pow(Math.abs(Math.sin(x * 0.012) * Math.cos(z * 0.012)), 4) * 335;
      const jungleBase = Math.sin(x * 0.006 + z * 0.006) * 45;
      return Math.max(12, karsts + jungleBase + 15);
    },
    palette: {
      sand: 0xb8a46a,
      lushGreen: 0x17612b,
      forestGreen: 0x0a3818,
      rocks: [0x3c4a41, 0x4d5e53, 0x617568]
    }
  },

  ocean: { size: 4000, segments: 35, color: 0x0c5c56, opacity: 0.92, hasWaves: true },
  props: { type: 'palms', count: 160, minRadius: 100, maxRadius: 650 },
  clouds: { count: 36, baseAlt: 280 }
};
