// --- Map 09: Volcano Island (Expanded & Molten Pit) ---
export const volcanoMap = {
  id: '09_volcano',
  number: '09/16',
  name: 'VOLCANO ISLAND',
  icon: '🌋',
  biome: 'VOLCANIC',
  desc: 'Ascend a 430m smoking volcanic peak and dive straight into the molten caldera pit.',
  difficulty: 'EXPERT',
  totalGates: 12,

  skyColor: 0x6e3020,
  fogColor: 0x944a33,
  fogDensity: 0.0016,
  lighting: {
    ambient: { color: 0xffbfa8, intensity: 0.75 },
    sun: { color: 0xff8c59, intensity: 1.3, pos: [260, 560, 240] },
    fill: { color: 0xd13d17, intensity: 0.6, pos: [0, 80, 0] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #571a0b 0%, #b84c2e 100%)',
    mountainColor: '#1f130f',
    clipPath: 'polygon(0% 100%, 35% 45%, 45% 48%, 55% 48%, 65% 45%, 100% 100%)',
    waterColor: '#e03a00',
    altDisplay: '430M'
  },

  spawns: {
    p1: { pos: [0, 210, 750], yaw: 0.0 },
    p2Race: { pos: [12, 210, 750], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 190, 520),       // 1. Black sand ascent
    new THREE.Vector3(-190, 250, 310),    // 2. Basalt ridge climb
    new THREE.Vector3(-310, 330, 90),     // 3. Above sulfur vents
    new THREE.Vector3(-210, 410, -110),   // 4. High caldera rim
    new THREE.Vector3(0, 250, -190),      // 5. 160m DIVE INTO LAVA CRATER!
    new THREE.Vector3(190, 380, -90),     // 6. Rocketing out through fissure
    new THREE.Vector3(330, 270, 90),      // 7. Lava river plunge
    new THREE.Vector3(220, 170, 330),     // 8. Lower ash slope
    new THREE.Vector3(80, 150, 480),      // 9. Steam flat pass
    new THREE.Vector3(-60, 175, 590),     // 10. Rising pass
    new THREE.Vector3(-100, 195, 670),    // 11. Pre-gate climb
    new THREE.Vector3(-10, 210, 750)      // 12. Finish loop
  ],

  terrain: {
    size: 2200,
    segments: 90,
    getHeightAt(x, z) {
      const d = Math.hypot(x, z + 190);
      let cone = Math.exp(-d / 160) * 425;
      if (d < 65) cone -= 175; // Deep inner crater pit
      const lavaCouloirs = Math.sin(Math.atan2(z + 190, x) * 6) * 35;
      return Math.max(8, cone + lavaCouloirs);
    },
    palette: {
      sand: 0x1a1210,
      lushGreen: 0x2b1915,
      forestGreen: 0x17100e,
      rocks: [0x120c0b, 0x261612, 0xa62e0d]
    }
  },

  ocean: { size: 4000, segments: 35, color: 0x140a08, opacity: 0.98, hasWaves: true },
  props: { type: 'none', count: 0 },
  clouds: { count: 36, baseAlt: 320 }
};
