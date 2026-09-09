// --- Map 16: Fairy Realm (Expanded Whimsical Spires) ---
export const fairylandMap = {
  id: '16_fairyland',
  number: '16/16',
  name: 'FAIRY REALM',
  icon: '🏰',
  biome: 'FANTASY',
  desc: 'Loop around 340m floating stone spires, mythical castle towers, and pastel basins.',
  difficulty: 'NORMAL',
  totalGates: 12,

  skyColor: 0x8b6ebd,
  fogColor: 0xc4ade0,
  fogDensity: 0.0014,
  lighting: {
    ambient: { color: 0xf0e3ff, intensity: 0.8 },
    sun: { color: 0xfff0d0, intensity: 1.25, pos: [290, 580, 240] },
    fill: { color: 0x5a3d7d, intensity: 0.45, pos: [-240, -50, -240] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #6c4ca8 0%, #c4ade0 100%)',
    mountainColor: '#2f9c61',
    clipPath: 'polygon(0% 100%, 25% 65%, 45% 45%, 55% 20%, 65% 45%, 85% 65%, 100% 100%)',
    waterColor: '#4484ba',
    altDisplay: '340M'
  },

  spawns: {
    p1: { pos: [0, 180, 740], yaw: 0.0 },
    p2Race: { pos: [12, 180, 740], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 150, 520),       // 1. Fantasy gates entry
    new THREE.Vector3(-190, 75, 320),     // 2. 100m dive into crystal basin
    new THREE.Vector3(-320, 180, 90),     // 3. Spiral around floating rock
    new THREE.Vector3(-220, 310, -110),   // 4. Climb to castle spire
    new THREE.Vector3(0, 340, -220),      // 5. Mythical Castle Spire Apex!
    new THREE.Vector3(230, 220, -110),    // 6. Plunge through floating stone arch
    new THREE.Vector3(330, 85, 90),       // 7. Skimming glowing enchanted lake
    new THREE.Vector3(210, 110, 330),     // 8. Pastel knoll slalom
    new THREE.Vector3(70, 135, 480),      // 9. Floating island pass
    new THREE.Vector3(-60, 155, 590),     // 10. Low slope glide
    new THREE.Vector3(-100, 170, 665),    // 11. Final approach
    new THREE.Vector3(-10, 180, 740)      // 12. Finish loop
  ],

  terrain: {
    size: 2200,
    segments: 90,
    getHeightAt(x, z) {
      const hills = (Math.sin(x * 0.012) * Math.cos(z * 0.012) * 115) + 35;
      const spire = Math.exp(-Math.hypot(x, z + 220) / 90) * 260;
      const basin = -Math.exp(-Math.hypot(x + 190, z - 320) / 130) * 85;
      return Math.max(12, hills + spire + basin);
    },
    palette: {
      sand: 0x9f83b3,
      lushGreen: 0x2b965c,
      forestGreen: 0x166b3d,
      rocks: [0x543f66, 0x6e5585, 0x886e9e]
    }
  },

  ocean: { size: 4000, segments: 35, color: 0x3d74a3, opacity: 0.92, hasWaves: true },
  props: { type: 'palms', count: 90, minRadius: 100, maxRadius: 650 },
  clouds: { count: 38, baseAlt: 260 }
};
