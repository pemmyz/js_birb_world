// --- Map 15: Sea of Clouds (Expanded 520m Stratosphere Peaks) ---
export const cloudseaMap = {
  id: '15_cloudsea',
  number: '15/16',
  name: 'SEA OF CLOUDS',
  icon: '☁️',
  biome: 'STRATO',
  desc: 'High-altitude stratosphere flight over 520m jagged peaks piercing a solid cloud deck.',
  difficulty: 'HARD',
  totalGates: 12,

  skyColor: 0x2e7ec4,
  fogColor: 0x9bc7ed,
  fogDensity: 0.0009,
  lighting: {
    ambient: { color: 0xd4e9fa, intensity: 0.85 },
    sun: { color: 0xffffff, intensity: 1.35, pos: [280, 680, 240] },
    fill: { color: 0x2e5c82, intensity: 0.45, pos: [-240, -60, -240] }
  },

  preview: {
    skyGradient: 'linear-gradient(180deg, #1b5b99 0%, #bde0ff 100%)',
    mountainColor: '#ffffff',
    clipPath: 'polygon(0% 100%, 30% 75%, 50% 45%, 70% 75%, 100% 100%)',
    waterColor: '#cce4f7',
    altDisplay: '520M'
  },

  spawns: {
    p1: { pos: [0, 360, 780], yaw: 0.0 },
    p2Race: { pos: [12, 360, 780], yaw: 0.0 },
    p2CoopIndex: 11
  },

  waypoints: [
    new THREE.Vector3(0, 320, 540),       // 1. Stratosphere entry
    new THREE.Vector3(-220, 190, 320),    // 2. Dive into thick cloud blanket at 190m
    new THREE.Vector3(-360, 340, 90),     // 3. Rocket climb up western titan peak
    new THREE.Vector3(-240, 480, -120),   // 4. Above cloud sea ceiling
    new THREE.Vector3(0, 520, -240),      // 5. 520m Apex Summit Needle!
    new THREE.Vector3(260, 410, -110),    // 6. Plunge into cloud bank
    new THREE.Vector3(360, 180, 90),      // 7. Skimming top of cloud layer
    new THREE.Vector3(240, 260, 330),     // 8. Cloud ocean bay
    new THREE.Vector3(90, 290, 490),      // 9. Spire ridge pass
    new THREE.Vector3(-60, 325, 600),     // 10. Upper climb
    new THREE.Vector3(-100, 345, 690),    // 11. Summit approach
    new THREE.Vector3(-10, 360, 780)      // 12. Finish loop
  ],

  terrain: {
    size: 2400,
    segments: 90,
    getHeightAt(x, z) {
      const peaks = Math.exp(-Math.hypot(x, z + 240) / 220) * 515;
      const secondary = Math.exp(-Math.hypot(x + 360, z - 90) / 180) * 360;
      const ridges = (Math.sin(x * 0.009) * Math.cos(z * 0.009) * 110);
      return peaks + secondary + ridges;
    },
    palette: {
      sand: 0xffffff,
      lushGreen: 0xdeecf7,
      forestGreen: 0xffffff,
      rocks: [0x68859c, 0x87a1b5, 0xb8cede]
    }
  },

  ocean: { size: 4500, segments: 35, color: 0xb5d4ed, opacity: 0.96, hasWaves: true },
  props: { type: 'none', count: 0 },
  clouds: { count: 65, baseAlt: 180 }
};
